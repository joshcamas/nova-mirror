var SAMAC = SAMAC || {};

SAMAC.ModalManager = function() {};
SAMAC.ModalManager.modals = [];
SAMAC.ModalManager.openModals = [];

SAMAC.ModalManager.closeAll = function() {
    for (i = 0; i < this.openModals.length; i++) {
        if (this.openModals[i].isOpen) {
            this.openModals[i].close();
        }
    }
}
SAMAC.Modal = function(module, id) {
    this.module = module;
    this.id = id;
    this.isOpen = false;
};

SAMAC.Modal.prototype.init = function(content, classes, options, disableWrapper) {
    if (content == null) {
        content = "";
    }
    if (classes == null) {
        classes = []
    }
    if (options == null) {
        options = {}
    }
    if (disableWrapper == null) {
        disableWrapper = false
    }

    this.content = content;
    this.classes = classes;
    this.options = options;
    this.disableWrapper = disableWrapper;

    //Default value
    if(this.options.info == null) {
      this.options.info = "To close, say 'Close'";
    }
}
/* Generates HTML Code for modal. Run destroy() to remove HTML */
SAMAC.Modal.prototype.generate = function() {

    //html div id is modal_moduleID_id_index
    var divClass = "modal " + this.module + "_" + this.id;
    var html = ""
    var classes = "";

    for (i = 0; i < this.classes.length; i++) {
        classes += this.classes[i] + " "
    }

    html += "<div class='" + divClass + " " + classes + "'>";

    if (!this.disableWrapper) {
        html += "<div class='modal-content'>";
    }


    if (this.options.info != null && this.options.infoTop == true) {
        html += "<span class='modal-help top'>" + this.options.info + "</span>"
    }

    html += this.content


    if (this.options.info != null && (this.options.infoTop == null || this.options.infoTop == false)) {
        html += "<span class='modal-help'>" + this.options.info + "</span>"
    }

    if (!this.disableWrapper) {
        html += "</div";
    }


    html += "</div";

    //Add to html
    $("body").append(html);

    $(this.getDiv()).modal(this.options);
    SAMAC.ModalManager.modals.push(this)
}


SAMAC.Modal.prototype.getDiv = function() {
    var div = ".modal" + "." + this.module + "_" + this.id;
    return (div)
};

SAMAC.Modal.prototype.destroy = function() {
    $(this.getDiv()).remove();
}

SAMAC.Modal.prototype.open = function(content) {

    SAMAC.ModalManager.closeAll()
    if (content) {
        this.setContent(content);
    }
    $(this.getDiv()).modal('open');
    SAMAC.Sounds.openmodal.play();
    SAMAC.ModalManager.openModals.push(this)
    this.isOpen = true;


}

SAMAC.Modal.prototype.close = function() {
    $(this.getDiv()).modal('close');
    if (this.isOpen) {
        $(".modal-overlay").remove();
        SAMAC.Sounds.closemodal.play();
        this.isOpen = false
        for (i = 0; i < SAMAC.ModalManager.openModals.length; i++) {
            if (SAMAC.ModalManager.openModals[i] == this) {
                SAMAC.ModalManager.openModals.splice(i, 1);
            }
        }
    }
}

SAMAC.Modal.prototype.setContent = function(content) {
    this.content = content
    this.destroy();
    this.generate();
}


/* MODAL COMPONENT */


// quick way to add self-rendered components to modals
SAMAC.Modal.Component = function(module, modal, id) {
    this.module = module;
    this.modal = modal;
    this.id = id;
};


SAMAC.Modal.Component.prototype.getDiv = function() {
    var div = ".modal ." + "." + this.module + "." + this.modal;
    return ($(div).find(".component ." + this.id))

};

// generates html
SAMAC.Modal.Component.prototype.generate = function() {};


//Used to select input through keyboard only :(
SAMAC.Modal.Select = function(modal, id) {

};

SAMAC.Modal.Select.prototype = Object.create(SAMAC.Modal.Component);
SAMAC.Modal.Select.prototype.constructor = SAMAC.Modal.Select;


//Generates HTML and returns it for use in modals
SAMAC.Modal.Select.prototype.generate = function() {

};
