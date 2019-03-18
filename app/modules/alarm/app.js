SAMAC.Alarm = function() {
    this.enabled = true;
    this.timestamp = 0;
    this.repeat = false;
    this.ringing = false;
    this.sleeping = false;
    this.volume = 0.8;
    this.sleepEnabled = false;
    this.sound = null;
    this.timer = null;
    this.sleepTimer = null;
    this.app = null;
    this.repeat = {
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0
    }
    this.repeat_days = {
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false
    }
    this.alarm_sound = "assets/music/Filtered Moonlight.mp3"

    this.delete = function() {
        if (this.ringing) {
            this.sound.pause();
            this.sound.currentTime = 0;
        }
        if (this.enabled) {
            window.clearTimeout(this.timer);
        }
        if (this.sleeping) {
            window.clearTimeout(this.sleepTimer);
        }
        if (this.app != null) {
            this.app.build();
        }
    }

    this.disable = function() {
        if (this.enabled) {
            window.clearTimeout(this.timer);
        }
        if (this.ringing) {
            this.sound.pause();
            this.sound.currentTime = 0;
        }
        this.enabled = false;
        if (this.app != null) {
            this.app.build();
        }
    }

    this.enable = function() {
      this.startTimer();
      this.enabled = true;
      if (this.app != null) {
          this.app.build();
      }
    }

    this.startTimer = function() {
        var now = Date.now();
        var time = this.timestamp - now;
        var _this = this;
        this.timer = window.setTimeout(function() {
            _this.onTimer()
        }, time);
    }

    this.onTimer = function() {
        var sound = false;
        for (var x = 0; x < SAMAC.Sounds.alarms.length; x++) {
            if (SAMAC.Sounds.alarms[x].url == this.alarm_sound) {
                sound = SAMAC.Sounds.alarms[x];
            }
        }
        if (sound) {
            console.log("PLAYING ALARm")
            this.sound = sound;
            this.sound.play();
            this.ringing = true;
        }

    }


}


var app = function(id) {
    SAMAC.Module.call(this, id);
};

app.prototype = Object.create(SAMAC.Module.prototype);
app.prototype.constructor = app;


app.prototype.init = function(div) {
    this.container = div;
    this.alarms = [];
    this.ringing = false;

    var _this = this;
    //render
    this.currentAction=0;

    this.deleteModal = new SAMAC.Modal("alarm", "delete");
    this.deleteModal.init("", ["outline"])
    this.deleteModal.generate();

    this.loadAlarmSounds()
    this.loadSavedAlarms();
    this.startAlarmTimers();
    this.build();


    SAMAC.Voice.on(["stop alarm"], {
        ignoreActivate: true,
        ignoreSleeping: true
    }, function() {
        console.log("STOPPING")

        for (i = 0; i < _this.alarms.length; i++) {
            console.log("FOUND?")
            if (_this.alarms[i].ringing) {
                console.log("FOUND!@!!!")
                _this.alarms[i].disable();
            }
        }

    })

    function onDeleteFail() {
        this.deleteModal.close();
    }

    var numberList = ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "to"]

    SAMAC.Voice.on(["delete alarm *","remove alarm *","disable alarm *","enable alarm *"], true, function(action, wildcard) {
        if (_this.alarms.length == 0) {
            SAMAC.Voice.speak("There are no alarms to delete");
            //  return;
        }
        console.log("SSSSSSSSSSSSSS" + wildcard)
        index = null;
        for (i = 0; i < numberList.length; i++) {
            if (wildcard == numberList[i]) {
                index = i;
            }
        }

        if (index == null) {
            index = parseInt(wildcard)
            index--;
            console.log(index)
        }
        if (index != null) {
            if (index == 10) {
                index = 1
            }
            //Here's our index!
            if (index > _this.alarms.length) {
                SAMAC.Voice.speak("There is no alarm numbered" + (index + 1));
                return;
            } else {
              //Deleting alarm!
              if(action == 0 || action == 1) {
                SAMAC.Voice.speak("Deleted alarm number" + (index + 1));
                _this.removeAlarm(_this.alarms[index])
                return;
              } else if(action == 2) {
                //Disabling alarm!
                SAMAC.Voice.speak("Disabled alarm number" + (index + 1));
                _this.alarms[index].disable();
                return;
              } else  {
                //Enabling alarm!
                SAMAC.Voice.speak("Enabled alarm number" + (index + 1));
                _this.alarms[index].enable();
                return;
              }

            }
        }

    })

    SAMAC.Voice.on(["delete alarm","remove alarm","disable alarm","enable alarm"], false, function(action, wildcard) {

        if (_this.alarms.length == 0) {
            SAMAC.Voice.speak("There are no alarms to delete");
            return;
        }
        var length = _this.alarms.length;


        if (length > 1) {
            SAMAC.Voice.speak("Speak a number, 1 to " + length);
        } else {
          if(action == 0 || action == 1) {
            SAMAC.Voice.speak("Deleting alarm");
            _this.removeAlarm(_this.alarms[0])
            return;
          } else if(action == 2) {
            SAMAC.Voice.speak("Disabling alarm");
            _this.alarms[0].disable();
            return;
          } else {
            SAMAC.Voice.speak("Enabling alarm");
            _this.alarms[0].enable();
            return;
          }

        }
        _this.currentAction = action;
        //_this.showDeleteList()
        SAMAC.Voice.activateFiltered("delete_alarm");
    });

    //Build speech array
    SAMAC.Voice.on(numberList, {
        tagOnly: true,
        tags: ["delete_alarm"]
    }, function(i) {

        var number = false;
        //"to" becomes 2
        i++;
        console.log("ARLARM: " + i)
        if (i == 11) {
            console.log("YES")
            i = 2
        }

        if (i > _this.alarms.length) {
            SAMAC.Voice.speak("There is no alarm numbered" + i);
            return;
        }

        i--;

        if(_this.currentAction == 0 || _this.currentAction == 1) {
          SAMAC.Voice.speak("Deleted alarm number" + (i + 1));
          _this.removeAlarm(_this.alarms[i]);
        } else if(_this.currentAction == 2) {
          SAMAC.Voice.speak("Disabled alarm number" + (i + 1));
          _this.alarms[i].disable();
        } else {
          SAMAC.Voice.speak("Enabled alarm number" + (i + 1));
          _this.alarms[i].enable();
        }


    })

    SAMAC.Voice.on(["delete all alarms","remove all alarms"], false, function(i, wildcard) {
      if (_this.alarms.length == 0) {
          SAMAC.Voice.speak("There are no alarms to delete");
          return;
      }

      SAMAC.Voice.speak("Deleted " + _this.alarms.length + "alarms");
      for(i=0;i<_this.alarms.length;i++) {
        _this.removeAlarm(_this.alarms[i]);
      }

    });


    SAMAC.Voice.on(["stop alarm","disable alarm"], {
        ignoreActivate: true,
        ignoreSleeping: true
    }, function() {
        console.log("STOPPING")

        for (i = 0; i < _this.alarms.length; i++) {
            console.log("FOUND?")
            if (_this.alarms[i].ringing) {
                console.log("FOUND!@!!!")
                _this.alarms[i].disable();
            }
        }

    })



    SAMAC.Voice.on(["set an alarm for *", "add an alarm for *", "set alarm for *", "add alarm for *"], true, function(i, wildcard) {
        wildcard = wildcard.replace(" o'clock", ":00")
        wildcard = wildcard.replace("a.m.", "am")
        wildcard = wildcard.replace("p.m.", "pm")

        var parse = ""
        var pass = true;
        var time = false;
        var ampm = "";
        var period = false;

        var input = wildcard.split(" ")
        for (i = 0; i < input.length; i++) {
            if (Number(input[i])) {
                time = input[i] + ":00";
            } else if (input[i].includes(":")) {
                time = input[i];
            } else if (input[i] == "am" || input[i] == "pm") {
                ampm = input[i];
            } else {
                period = input[i]
            }
        }

        var date = null;
        var speakDate = ""
        var dates = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        var now = moment();
        //now guess period
        if (period) {
            if (period == "today") {
                date = moment().format("L")
            } else if (period == "tomorrow") {
                date = moment().add(1, 'days').format("L")
                speakDate = "tomorrow"
            } else if (dates.contains(period)) {
                console.log("AAAAA")
            }
        }

        //If no period specified, just pin on the next time this time will happen.
        if (date == null) {
            if (!ampm == "") {
                var today = moment(moment()).unix()
                var testVal = time + " " + ampm + " " + moment().format("L")
                var checkTimeToday = moment(testVal).unix()
                //check if it's already passed for today
                if (today >= checkTimeToday) {
                    date = moment().add(1, 'days').format("L")
                    speakDate = "tomorrow"
                    console.log("APPLES")
                } else {
                    date = moment().format("L")

                }
            } else {
                console.log("boop!" + time)
                //first check am, then pm. pick the cloest

                var today = moment().unix()
                console.log(time + " pm " + moment().format("L"))
                console.log("ss")
                var checkTimePM = moment((time + " pm " + moment().format("L")), "hh:mm a MM-DD-YYYY").unix()
                console.log("ds")
                var checkTimeAM = moment(time + " am " + moment().format("L"), "hh:mm a MM-DD-YYYY").unix()
                console.log("fs")
                //pass today if need be
                var timePMTomorrow = false;
                if (today >= checkTimePM) {
                    var checkTimePM = moment(time + " pm " + moment().add(1, 'days').format("L")).unix()
                    timePMTomorrow = true;
                    console.log("CHICLEN")
                }

                var timeAMTomorrow = false;
                if (today >= checkTimeAM) {
                    var checkTimeAM = moment(time + " am " + moment().add(1, 'days').format("L")).unix()

                    timeAMTomorrow = true;
                    console.log("COW")
                }

                //now find nearest time

                if (checkTimePM > checkTimeAM) {
                    date = moment.unix(checkTimeAM).format("L")
                    ampm = "am"
                    if (timeAMTomorrow) {
                        speakDate = "tomorrow"
                    }
                } else {
                    console.log("PM!!")
                    date = moment.unix(checkTimePM).format("L")
                    ampm = "pm"
                    if (timePMTomorrow) {
                        speakDate = "tomorrow"
                    }
                }

            }

        }

        parse = time + " " + ampm + " " + date

        var stamp = Date.parse(parse);

        if (!stamp) {
            SAMAC.Voice.speak("I do not know how to add an alarm for" + wildcard);
            return;
        }

        //get am pm from date cause of auto am pm
        if (ampm == "") {
            ampm = moment(stamp).format("a")
        }

        var speakAmPm = ""
        if (ampm == "am") {
            speakAmPm = "a.m."
        } else if (ampm == "pm") {
            speakAmPm = "p.m."
        }
        SAMAC.Voice.speak("Adding an alarm for " + time + " " + speakAmPm + " " + speakDate);

        var alarm = _this.addAlarm(stamp);
        alarm.startTimer()
        _this.loadAlarmSounds()
        _this.build();
    });



};



app.prototype.loadSavedAlarms = function() {
    this.setModuleOption("alarm", "alarms", "BALLL")

    console.log(SAMAC.currUser.options.module_options.alarm.alarms);
}

app.prototype.startAlarmTimers = function() {
    for (var i = 0; i < this.alarms.length; i++) {
        this.alarms[i].startTimer()
    }
}

app.prototype.loadAlarmSounds = function() {
    if (SAMAC.Sounds.alarms == null) {
        SAMAC.Sounds.alarms = [];
    }

    for (var i = 0; i < this.alarms.length; i++) {
        var duplicate = false;
        for (var x = 0; x < SAMAC.Sounds.alarms.length; x++) {
            if (SAMAC.Sounds.alarms[x].url == this.alarms[i].alarm_sound) {
                duplicate = true;
            }
        }
        if (!duplicate) {
            var url = this.alarms[i].alarm_sound;
            var alarm = new Audio(url);
            alarm.url = url;
            alarm.volume = this.alarms[i].volume;
            alarm.load();
            SAMAC.Sounds.alarms.push(alarm)
        }
    }
}

app.prototype.build = function() {
    var html = "";

    for (var i = 0; i < this.alarms.length; i++) {
        var fulldate = new Date(this.alarms[i].timestamp);
        var converted_date = moment(fulldate).calendar();

        if (!this.alarms[i].enabled) {
            html += "<div class='alarm disabled'>";
        } else {
            html += "<div class='alarm'>"
        }
        html += converted_date + "</div>";
    }

    this.container.html(html)
};



app.prototype.showDeleteList = function() {
    var html = "";
    //  html += "<div class='modal-content'>"


    for (var i = 0; i < this.alarms.length; i++) {
        var fulldate = new Date(this.alarms[i].timestamp);
        var converted_date = moment(fulldate).calendar();

        if (!this.alarms[i].enabled) {
            html += "<div class='alarm disabled'>";
        } else {
            html += "<div class='alarm'>"
        }
        html += converted_date + "</div>";
    }

    this.deleteModal.setContent(html);
    this.deleteModal.open();
}



app.prototype.removeAlarm = function(alarm) {
    for (var i = 0; i < this.alarms.length; i++) {
        if (this.alarms[i] == alarm) {
            this.alarms[i].delete();
            this.alarms.splice(i, 1)
        }
    }
    this.build();
}

app.prototype.addAlarm = function(timestamp) {
    var alarm = new SAMAC.Alarm();
    alarm.timestamp = timestamp;
    alarm.app = this;
    this.alarms.push(alarm)
    this.build();
    console.log("ADDED:")
    console.log(this.alarms)
    return (alarm)

}

SAMAC.ModuleManager.addModule("alarm", app);
