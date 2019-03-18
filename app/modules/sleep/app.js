var app = function(id) {
    SAMAC.Module.call(this, id);
};

app.prototype = Object.create(SAMAC.Module.prototype);
app.prototype.constructor = app;


app.prototype.init = function() {
    var _this = this;
    this.build();
    this.sleeping = false;
    this.messageSpeed = 6000;
    this.messages = [
        "Say 'Good Morning'", "Sweet Dreams", "Goodnight", "Say 'Wake up'","Sleep Well","Don't let the bedbugs bite","Have a good night"
    ]

    SAMAC.Voice.on(["Good Morning", "Wake up"], {
        ignoreSleeping: true,
        ignoreActivate:true
    }, function(i, wildcard) {
        if (_this.sleeping) {
            _this.sleeping = false
            SAMAC.Wakeup();
            SAMAC.Voice.speak("Good Morning!")
            SAMAC.Sounds.wakeup.play();
            _this.hide();
        }
    });

    SAMAC.Voice.on(["Good Night", "Goodnight"], {deactivate:true}, function(i, wildcard) {
        if (!_this.sleeping) {
            _this.sleeping = true
            SAMAC.Sleep();
            SAMAC.Voice.speak("Good Night!")
            SAMAC.Sounds.sleep.play();
            $(".modal").modal('close');
            _this.show();

        }
    });



};



app.prototype.fadeInMessage = function() {
    var _this = this;
    var curRand = $(".moon-phase .message").text() + "";
    var rand = curRand;

    while (rand == curRand) {
        rand = this.messages[Math.floor(Math.random() * this.messages.length - 1)]
    }
    $(".moon-phase .message").text(rand);

    $(".moon-phase .message").stop(true, true).fadeIn(_this.messageSpeed, function() {
        _this.fadeOutMessage()
    });
}

app.prototype.fadeOutMessage = function() {
    var _this = this;
    $(".moon-phase .message").stop(true, true).fadeOut(_this.messageSpeed, function() {
        _this.fadeInMessage()
    });
}

app.prototype.build = function() {
    var html = "";
    html += "<div class='moon-phase'><div class='center-container' style='height:100%'><div class='center' style='top:15%'>";
    html += "<a class='moon'>A</a><br><a class='message'>Say 'Good Morning'</a>"
    html += "</div></div></div>"
    $("body").append(html)
};

app.prototype.show = function() {

    var _this = this;
    var phaseN = SunCalc.getMoonIllumination(new Date()).phase;
    phaseN = Math.round(phaseN * 100) / 100;


    var phaseT = "";

    //Start out as new moon
    if (phaseN < 1 / 8) {
        phaseT = "a"
    } else if (phaseN < 2 / 8) {
        phaseT = "c"
    } else if (phaseN < 3 / 8) {
        phaseT = "h"
    } else if (phaseN < 4 / 8) {
        phaseT = "f"
    } else if (phaseN < 5 / 8) {
        phaseT = "b"
    } else if (phaseN < 6 / 8) {
        phaseT = "e"
    } else if (phaseN < 7 / 8) {
        phaseT = "g"
    } else {
        phaseT = "d"
    }
    $(".moon-phase .moon").text(phaseT);

    $(".moon-phase").fadeIn(1000, function() {
        $(".moon-phase .moon").fadeIn(3000, function() {
            $(".moon-phase .message").fadeIn(_this.messageSpeed, function() {
                _this.fadeOutMessage()
            });

        });
    });
};

app.prototype.hide = function(phase) {
    $(".moon-phase .message").stop(true, true).fadeOut(2000);
    $(".moon-phase .moon").fadeOut(2000, function() {
        $(".moon-phase").fadeOut(1000, function() {

        });

    });

};

SAMAC.ModuleManager.addModule("sleep", app);
