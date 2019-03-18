var app = function(id) {
  SAMAC.Module.call(this,id);
};

app.prototype = Object.create(SAMAC.Module.prototype);
app.prototype.constructor = app;


app.prototype.init = function(div) {
    this.container = div;
    //render
    this.build();

};

app.prototype.build = function() {
    var html = "";
    this.container.html(html)
};

app.prototype.render = function() {
};

SAMAC.ModuleManager.addModule("default", app);
