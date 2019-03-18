var SAMAC = SAMAC || {};

SAMAC.ArtyomManager = function() {};

SAMAC.ArtyomManager.options = {
    name: "Geoffrey",
    activateCode: "Hey Geoffrey",
    requireActivate: true
}

SAMAC.ArtyomManager.isActive = function() {

}
SAMAC.ArtyomManager.init = function() {

    var timer;

    artyom.initialize({
        lang: "en-GB",
        continuous: true,
        debug: false,
        listen: true,
        soundex:true,
        obeyKeyword: "please"
    }).then(() => {


        function endAndStartTimer(callback) {
            window.clearTimeout(timer);
            //var millisecBeforeRedirect = 10000;
            timer = window.setTimeout(callback, 1000);
        }

        //Enable the microphone
        artyom.when("TEXT_RECOGNIZED", () => {
            $("#navbar .listening").text("o");
            endAndStartTimer(() => {
                $("#navbar .listening").text("");
            });


            if(SAMAC.currUser.options.options.requireActivate && SAMAC.currUser.options.advancedOptions.wordsReactivate) {
              SAMAC.Voice.activateTimer()
            }
        });

        artyom.redirectRecognizedTextOutput(function(recognized, isFinal) {
            if (isFinal) {
                $(".listener .message-text").text("");

            } else {
                $(".listener .message-text").text(recognized);
            }
        });



    }).catch((err) => {
        console.error("Artyom couldn't be initialized: ", err);
    });


    SAMAC.socket.on('speak', function(msg) {});


}

function speak(text) {
    //SAMAC.socket.emit('speak', text);
    responsiveVoice.speak(text);
}


// Loads the JavaScript client library and invokes `start` afterwards.


SAMAC.Voice = function() {};


SAMAC.Voice.commands = [];
SAMAC.Voice.speaking = false;
SAMAC.Voice.activated = false;
SAMAC.Voice.tags = [];
SAMAC.Voice.focusedModule = false;
SAMAC.Voice.onFail = [];

SAMAC.Voice.options = {
    voice: "UK English Female",
    pitch: 1
}
SAMAC.Voice.speak = function(text, onStart, onComplete) {

    var _this = this;

    function _onStart() {
        _this.speaking = true;
        artyom.dontObey()
        if (onStart != null) {
            onStart()
        }
    }

    function _onComplete() {
        _this.speaking = false;
        artyom.obey()
        if (onComplete != null) {
            onComplete()
        }
    }

    if (typeof text != "string") {
        var len = text.length;
        var r = Math.floor(Math.random() * len);
        text = text[r]
    }
    console.warn("Speaking! " + text)
    responsiveVoice.speak(text, SAMAC.Voice.options.voice, {
        onstart: _onStart,
        onend: _onComplete,
        pitch: SAMAC.Voice.options.pitch
    })
}

SAMAC.Voice.activateFiltered = function(tags,onFail) {
  if(typeof tags == "string") {
    SAMAC.Voice.tags[0] = tags
  } else {
    SAMAC.Voice.tags = tags;
  }
  if(onFail) {
    SAMAC.Voice.onFail.push(onFail);
  }
  SAMAC.Voice.activate();
}

SAMAC.Voice.on = function(indexes, options, onTrigger) {

    var _this = this;
    var smart = false

    if (typeof options === 'object') {
        if (options.smart != null) {
            smart = options.smart;
        }
    } else {
        smart = options
        options = {
            ignoreSpeaking: false,
            ignoreSleeping: false,
            ignoreActivate: false,
            deactivate: false
        };

    }

    function trigger(i, wildcard) {

        if (_this.speaking && options.ignoreSpeaking != true) {
            return;
        }

        if (SAMAC.sleeping && options.ignoreSleeping != true) {
            console.warn("Not detecting voice, sleep mode activated")
            return;
        }

        if (SAMAC.ArtyomManager.requireActivate && options.ignoreActivate != true && !_this.activated) {
            console.warn("Not detecting voice, not activated")
            return;
        }


        if(SAMAC.Voice.tags.length > 0) {
          if(options.tags == null) {
            console.log("No tags!")
            return;
          }
          var found = false;
          console.log(options.tags);
          console.log(SAMAC.Voice.tags);

          for(i=0;i<options.tags.length;i++) {
            for(v=0;v<SAMAC.Voice.tags.length;v++) {
              if(options.tags[i] == SAMAC.Voice.tags[v]) {
                found = true;
              }
            }
          }
          if(!found) {

            return;
          }
        } else if(options.tagOnly == true) {
          console.log("Tag only, and no tags enabled")
          return;
        }

        console.log("Passed tago!")

        if (SAMAC.ArtyomManager.requireActivate) {

            if (options.deactivate) {
                SAMAC.Voice.deactivate(true);
            } else {
                SAMAC.Voice.activateTimer(true);
            }
        }

        onTrigger(i, wildcard);

    }

    var command = artyom.on(indexes, smart).then(trigger);
    this.commands.push(command);
    return (command)
}


SAMAC.Voice.addModuleCommand = function(indexes, smart) {

    var command = artyom.on(indexes, smart);
    this.commands.push(command);
    return (command)
}

SAMAC.Voice.activate = function() {
    this.activated = true;
    $(".listener").find(".message-title").text("Listening");
    $(".listener").fadeIn(100)
    SAMAC.Sounds.listen.play();
    SAMAC.Voice.activateTimer();
}

SAMAC.Voice.activateTimer = function(reactivate) {
    if(!this.activated ) {
      return;
    }
    if (this.activateTimer != null) {
        window.clearTimeout(this.deactivateTimer);
    }

    var time =  SAMAC.currUser.options.advancedOptions.activateTimer
    var answered = false
    if(reactivate) {
       time = SAMAC.currUser.options.advancedOptions.reactivateTimer
       answered = true
    }
    this.deactivateTimer = setTimeout(function() {
        SAMAC.Voice.deactivate(false,answered)
    },time);
    console.log("Updating visual")
    $(".listener").css("opacity",1);
    $(".listener").show();
    this.MicFade = $(".listener").stop( true,false ).fadeOut(time,"linear");


}

SAMAC.Voice.deactivate = function(silent,answered) {

    if (this.activateTimer != null) {
        window.clearTimeout(this.deactivateTimer);
    }

    if(SAMAC.Voice.onFail.length > 0) {
      for(i=0;i<SAMAC.Voice.onFail.length;i++) {
        SAMAC.Voice.onFail[i]()
      }
      SAMAC.Voice.onFail = [];
    }
    if (this.activated) {

        SAMAC.Voice.tags = [];
        this.activated = false;
        $(".listener").stop( true,false ).fadeOut(100)
        if (!silent) {
          if(answered == true) {
            SAMAC.Sounds.answer.play();
          } else {
            SAMAC.Sounds.fail.play();
          }
        }
    }
}

SAMAC.Voice.onActivateWords = function(indexes) {

    var _this = this;
    function trigger(i, wildcard) {
        if (_this.activated) {
            return;
        }

        if (SAMAC.sleeping) {
            console.warn("Not detecting voice, sleep mode activated")
            return;
        }

        //Activate stream!
        _this.activate()
    }

    var command = artyom.on(indexes).then(trigger);
    this.commands.push(command);
    return (command)
}



SAMAC.Voice.onDeactivateWords = function(indexes) {

    var _this = this;
    function trigger(i, wildcard) {
        if (!_this.activated) {
            return;
        }

        if (SAMAC.sleeping) {
            console.warn("Not detecting voice, sleep mode activated")
            return;
        }

        //Activate stream!
        _this.deactivate()
    }

    var command = artyom.on(indexes).then(trigger);
    this.commands.push(command);
    return (command)
}
