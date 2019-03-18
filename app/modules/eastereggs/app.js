var app = function(id) {
    SAMAC.Module.call(this, id);
};

app.prototype = Object.create(SAMAC.Module.prototype);
app.prototype.constructor = app;

app.prototype.load = function() {

    var _this = this;

    SAMAC.Voice.on([
        "Mirror Mirror on the wall who's the fairest one of all",
        "Mirror Mirror on the wall who is the fairest one of all",
        "Magic mirror on the wall who is the fairest one of all",
        "Magic mirror on the wall who's the fairest one of all"
    ], false, function(i, wildcard) {
        SAMAC.Voice.speak("You, of course!")
        //    SAMAC.addTimedModal("eastergg_heart", "<div class='modal-content'><center><h1>:)</h1></center></div>", 3000,{transparent:true});
    });

    SAMAC.Voice.on(["Hello", "Greetings", "Hello there"], false, function() {
        SAMAC.Voice.speak(["Hello World", "Hello!", "Hi!"])
    })

    SAMAC.Voice.on(["Will you marry me"], false, function() {
        SAMAC.Voice.speak(["I'm sorry, I'm taken."])
    })

    SAMAC.Voice.on(["Tell a joke", "Tell me a joke"], false, function() {

        var len = jokes.length;
        var r = Math.floor(Math.random() * len);

        SAMAC.Voice.speak(jokes[r].joke)

    })

}

SAMAC.ModuleManager.addModule("eastereggs", app);
