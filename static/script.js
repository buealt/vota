const MAX_SELECTED = 3;
const MIN_SELECTED = 3;

function select_image (e) {
    let selectedList = load("selectedList", []);
    let element = e.currentTarget.parentElement.parentElement;
    let nextButton = document.querySelector("#nextButton");

    // if element is already selected
    if (element.classList.contains("selected")) {
        // deselect it
        element.classList.remove("selected");
        // and remove it from the list
        remove(selectedList, element.id);

        // disable button when last image has been deselected
        if (selectedList.length < MIN_SELECTED) {
            nextButton.classList.add("disabled");
        }

        // toggle modal button text to select
        document.querySelector("#modal-"+element.id+" .modal__btn-primary").textContent = "Select";

        // update progress indicator
        update_progress(selectedList.length, -1);
    } else {
        if (selectedList.length < MAX_SELECTED) {
            // select it
            element.classList.add("selected");
            // and add it to the list
            selectedList.push(element.id);

            // enable button if it isn't
            if (nextButton.classList.contains("disabled") && selectedList.length >= MIN_SELECTED) {
                nextButton.classList.remove("disabled");
            }

            // toggle modal button text to deselect
            document.querySelector("#modal-"+element.id+" .modal__btn-primary").textContent = "Deselect";

            // update progress indicator
            update_progress(selectedList.length, 1);
        } else {
            MicroModal.show('modal-tms-error');
        }
    }

    // store updated counter and list
    store("selectedList", selectedList);
}

function next (e) {
    // assert that button is clickable
    if (load("selectedList",[]).length < 1) {
        return null;
    }

    // construct hidden form
    let form = document.createElement("form");
    form.action = "/thank-you";
    form.method = "POST";
    let input = document.createElement("input");
    input.type = "hidden";
    input.name = "selected_list";
    input.value = JSON.stringify(load("selectedList"));
    form.appendChild(input);
    document.querySelector("#hiddenForm").appendChild(form);
    form.submit();
}

// remove element from array (removes inplace, due to pass by reference)
function remove (array, el) {
    i = array.indexOf(el);
    array.splice(i, 1);
    return array;
}

// load from localStorage with default and as JSON
function load (key, _default) {
    let value = window.localStorage.getItem(key);
    if (value !== null) {
        return JSON.parse(value);
    }
    return _default;
}

// alias for localStorage.setItem with array support
function store (key, value) {
    value = JSON.stringify(value);
    return window.localStorage.setItem(key, value);
}

function create_indicator(n) {
    let indicator = document.createElement("div");
    indicator.id = "progress-indicator-"+n.toString();
    indicator.classList.add("indicator");
    let span = document.createElement("span");
    span.textContent = n.toString();
    indicator.appendChild(span);
    return indicator;
}

function update_progress(n, o) {
    let old = n-o;
    if (old !== 0 && old <= MAX_SELECTED) {
        document.querySelector("#progress-indicator-"+old).classList.remove("active");
    }
    if (n !== 0 && n <= MAX_SELECTED) {
        document.querySelector("#progress-indicator-"+n).classList.add("active");
    }
}

// execute the following code only after the page has loaded
document.addEventListener("DOMContentLoaded", () => {

    // make images selectable
    document.querySelectorAll("#gallery .main-image").forEach(e => {
        e.onclick = select_image;
    });

    // make next button clickable
    document.querySelector("#nextButton").onclick = next;

    // load image status
    let selectedList = load("selectedList",[]);
    for (img_id of selectedList) {
        document.getElementById(img_id).classList.add("selected");
        // toggle modal button text to deselect
        document.querySelector("#modal-"+img_id+" .modal__btn-primary").textContent = "Deselect";
    }

    // determine button status
    if (selectedList.length >= MIN_SELECTED) {
        nextButton.classList.remove("disabled");
    }

    // add progress indicators
    let progress_bar = document.querySelector("#progress");
    for (let i = 0; i < MAX_SELECTED; i++) {
        progress_bar.appendChild(create_indicator(i+1));
    }
    update_progress(selectedList.length, 0);

    // initialize modals
    MicroModal.init({
        disableScroll: true,
        awaitOpenAnimation: true,
        awaitCloseAnimation: true,
        disableFocus: true
    });
});

