var clock = function(id) {
    SAMAC.Module.call(this, id);
};

clock.prototype = Object.create(SAMAC.Module.prototype);
clock.prototype.constructor = clock;


clock.prototype.init = function(div) {

    var _this = this;


    this.container = div;
    this.time = "00:00";
    this.ampm = "";
    this.date = "";
    //render
    this.build();

    //Start time right away, infinite loop
    this.startTime()
    setInterval(function() {
        _this.startTime()
    }, 5000);


    SAMAC.Voice.on(["What time is it", "what's the time", "give me the time"], false, function(i) {

        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();

        if (!_this.appData.options.military) {

            if (h > 12) {
                h -= 12;
            }

            if (h == 0) {
                h = 12;
            }

            if (m == 0) {
                SAMAC.Voice.speak("It's " + h + "o' clock " + _this.ampm);
            } else {
                SAMAC.Voice.speak("It's " + h + " " + m + " " + _this.ampm);
            }
        } else {


            SAMAC.Voice.speak("It's " + h + " " + m);
        }
    });

    SAMAC.Voice.on(["What's the date", "what day is it", "what day is it today"], false, function(i) {

        var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

        var d = new Date();
        var date = d.getDate()

        var day = weekdays[d.getDay()]
        var fullyear = d.getFullYear()
        var month = months[d.getMonth()]

        SAMAC.Voice.speak("Today is " + day + ", " + month + " " + date + " " + fullyear);

    });
};

clock.prototype.build = function() {
    var html = "";
    html = "<a class='digital'></a><a class='ampm'></a><a class='date'></a>";
    this.container.html(html)
};

clock.prototype.render = function() {
    this.container.find(".digital").html(this.time)
    this.container.find(".ampm").html(this.ampm)
    this.container.find(".date").html(this.date)
};

clock.prototype.startTime = function() {
    //


/*    $.getJSON("http://api.timezonedb.com/v2/get-time-zone?key=CSXX5WSTJ220&format=json&by=zone&zone=America/Los_Angeles", function(data) {
        onGetTime(data)
    })*/

  //  onGetTime =
    var _this = this;

  //  function onGetTime(data) {

    //    var today = new Date((data.timestamp - data.gmtOffset)*1000);
        var today = new Date();

        var h = today.getHours();

        var m = today.getMinutes();
        var s = today.getSeconds();
        m = _this.checkTime(m);
        //  s = this.checkTime(s);

        if (!_this.appData.options.military) {

            if (h > 12) {
                h -= 12;
                _this.ampm = "pm";
            } else {
                _this.ampm = "am";
            }

            if (h == 0) {
                h = 12;
            }

        }

        if (_this.appData.options.date) {

            var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

          //  var d = new Date((data.timestamp - data.gmtOffset)*1000);
            d = new Date()
            var date = d.getDate()

            var day = weekdays[d.getDay()]
            var fullyear = d.getFullYear()
            var month = months[d.getMonth()]
            _this.date = _this.appData.options.dateStyle;
            _this.date = _this.date.replace("{date}", date);
            _this.date = _this.date.replace("{day}", day);
            _this.date = _this.date.replace("{fullyear}", fullyear);
            _this.date = _this.date.replace("{year}", ("" + fullyear).slice(-2));
            _this.date = _this.date.replace("{month}", month);

        }
        _this.time = h + ":" + m;
        _this.render();
  //  }


}

clock.prototype.checkTime = function(i) {
    if (i < 10) {
        i = "0" + i
    }; // add zero in front of numbers < 10
    return i;
}


SAMAC.ModuleManager.addModule("clock", clock);
