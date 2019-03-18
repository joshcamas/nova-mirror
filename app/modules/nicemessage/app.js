var app = function(id) {
    SAMAC.Module.call(this, id);
};

app.prototype = Object.create(SAMAC.Module.prototype);
app.prototype.constructor = app;


app.prototype.init = function(div) {
    this.container = div;
    //render
    var _this = this;

    this.generate();
    setInterval(function() {
        _this.generate()
    }, 3600000);


};

app.prototype.generate = function() {
    var r = Math.floor(Math.random() * 4);

    switch (r) {
        case 0:

            var today = new Date();
            var h = today.getHours();

            if (h < 12) {
                this.message = "Good Morning!"
            } else if (h < 17) {
                this.message = "Good Afternoon!"
            } else {
                this.message = "Good Evening!"
            }

            break;

        case 1:
            this.message ="Hello Beautiful"
            break;

        case 2:
            this.message = "You look great!"
            break;

        case 3:
            this.message = "You look wonderful!"
            break;
    }

    this.build();

}
app.prototype.build = function() {

    var html = "<center><h4>" + this.message + "</h4></center>";
    this.container.html(html)
};

app.prototype.render = function() {};

SAMAC.ModuleManager.addModule("nicemessage", app);
