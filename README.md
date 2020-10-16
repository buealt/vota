# printerest

### Deploying
For generating a new Heroku app, use:
```$ heroku create```

For an already existing Heroku app `%APPNAME`, add a remote to the local repository `printerest` with:
```$ heroku git:remote -a %APPNAME```

On Ubuntu, if heroku was installed with snap, you might need to replace `heroku` with `/snap/bin/heroku` on the preceeding commands.

Deploy the code to heroku site with:
```$ git push heroku master```


### Changing the content
The app watches the directory `/static/images/`. 
To add a new category simply add a new folder in there.
However if you decide to add an image to more than one category it will be displayed multiple times!

Supported image formats are the following: `.jpg, .jpeg, .png, .gif`

If you place an image in a category folder, it is strongly recommended to also place a corresponding `.txt` file in there.
For `kletterpark.jpg` this would be `kletterpark.txt`.
Otherwise there won't be an option for the user to get more information.

Inside this textfile place the following content:
```
Title

Description with as 
many lines
as you
wish
```

Please keep the description brief as it has to be quickly readable on a phone.
Less than 50 words is recommended as more leads to scrolling.

**Attention:** Don't add multiple images with the same name but a different fileextension.
Adding e.g. `kletterpark.jpg` and `kletterpark.png` to the same category folder *will* lead to an error.

To maximize performance please compress the images using e.g. https://squoosh.app/ and the MozJPEG algorithm with a quality of 70-80.

