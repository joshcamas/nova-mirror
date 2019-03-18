var app = function(id) {
    SAMAC.Module.call(this, id);
};

app.prototype = Object.create(SAMAC.Module.prototype);
app.prototype.constructor = app;


app.prototype.init = function(div) {
    this.container = div;
    var _this = this;

    SAMAC.socket.on('define', function(data) {

      console.log(data)
      if(data.statusCode == 404) {
        SAMAC.Voice.speak("I don't know what " + data.word + " means");
        return;
      }

      if(data.definition.length == 0) {
        SAMAC.Voice.speak("I don't know what " + data.word + " means");
        return;
      }
      var definition = data.definition[0];
      SAMAC.Voice.speak(data.word + ". " + definition);
    });




    SAMAC.Voice.on(["Define *","What does * mean", "What is *", "What are *"], true, function(i,wildcard) {
      _this.getDefinition(wildcard)
    });



    //render


};

app.prototype.getDefinition = function(word) {
    SAMAC.socket.emit('define', word);
}

app.prototype.build = function() {
    var html = "";
    this.container.html(html)
};

app.prototype.render = function() {};

SAMAC.ModuleManager.addModule("define", app);
