import os
import psycopg2
import time
import json
import html
from flask import Flask, send_file, render_template, request, jsonify, make_response
from flask_gzip import Gzip

app = Flask(__name__)
gzip = Gzip(app)

# connect to database
if 'DATABASE_URL' in os.environ:
	DATABASE_URL = os.environ['DATABASE_URL']
	conn = psycopg2.connect(DATABASE_URL, sslmode='require')
else:
	conn = psycopg2.connect("host=localhost dbname=printerest")

# setup database
create_chosen_images = (
	'CREATE TABLE IF NOT EXISTS chosen_images '
	'('
	'  id SERIAL PRIMARY KEY,'
	'  images TEXT NOT NULL,'
	'  timestamp bigint NOT NULL'
	')'
)
with conn, conn.cursor() as cur:
	cur.execute(create_chosen_images)



@app.route("/favicon.ico")
def favicon():
	return send_file("favicon.ico")

@app.route('/')
def main():
	# get all images
	images = dict()
	for subdirectory in os.listdir(os.path.join("static","images")):
		images[subdirectory] = []
		# list all files in the subdirectory and add them to the dictionary
		subdir_images = [x for x in os.listdir(os.path.join("static", "images", subdirectory))
							# check if filename is an acceptable image format
							# Fails if files without a "." are present in the directory TODO
							if x.rsplit(".",1)[1].lower() in ["jpg", "jpeg", "png", "gif"]]
		for subdir_image in subdir_images:
			images[subdirectory].append({
				"image": subdir_image,
				"description": get_description(os.path.join("static", "images", subdirectory, subdir_image))
			})

	return render_template("index.html", images=images)

def get_description(path):
	desc_path = path.rsplit(".",1)[0] + ".txt"
	if not os.path.exists(desc_path):
		return None
	with open(desc_path) as f:
		lines = f.readlines()
		if not lines:
			# file is empty
			return None
		title = lines[0]
		content = "".join(["<p>"+html.escape(x)+"</p>" for x in lines[2:]])

	return {"title": title, "content": content}

@app.route('/thank-you', methods=["GET", "POST"])
def thank_you():
	already_submitted = not (request.cookies.get('printerest_submitted') is None)
	resp = make_response(render_template("thank-you.html", already_submitted=already_submitted))

	formdata = request.form
	if "selected_list" in formdata and not already_submitted:
		selected_list = formdata["selected_list"]
		with conn, conn.cursor() as cur:
			cur.execute("INSERT INTO chosen_images (images, timestamp) VALUES (%s, %s	)", (selected_list, int(time.time()*1000)))
		resp.set_cookie('printerest_submitted','True')
	return resp

@app.route('/api')
def printer_api():
	if not "timestamp" in request.args:
		return ""
	timestamp = int(request.args["timestamp"])
	with conn, conn.cursor() as cur:
		cur.execute("SELECT * FROM chosen_images WHERE timestamp > %s", (timestamp,))
		existing = cur.fetchall()
	existing = [[id, json.loads(images), timestamp] for id, images, timestamp in existing]
	return jsonify(existing)

if __name__ == "__main__":
	# Start Server
	app.run(host='0.0.0.0', port=8080, threaded=True, debug=True)
	pass