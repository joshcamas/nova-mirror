var weather = function(id) {
    SAMAC.Module.call(this, id);

};

weather.prototype = Object.create(SAMAC.Module.prototype);
weather.prototype.constructor = weather;


weather.prototype.init = function(div) {
    this.container = div;
    this.weatherData = {};

    this.modal = new SAMAC.Modal("weather", "weather");
    this.modal.init("", ["modal-fixed-footer"], {
        infoTop: true
    })

    //render
    this.build();

    this.checkWeather(this.appData.options.city, function(weather) {
        _this.weatherData = weather;
        _this.render();
    });

    var _this = this;

    SAMAC.Voice.on(["What's the weather like today", "What is the weather", "What's the weather", "Tell me the weather"], false, function(i) {
        var temp = _this.weatherData.temp
        var unit = "fahrenheit"
        if (_this.weatherData.units.temp == "c") {
            unit = "celcius"
        }
        var currently = _this.weatherData.currently
        SAMAC.Voice.speak("It's " + currently + ", and " + temp + " degrees " + unit);

    });


    SAMAC.Voice.on(["What's the weather like in * ", "What is the weather in *", "What's the weather in *", "Tell me the weather in *"], true, function(i, wildcard) {

        _this.checkWeather(wildcard, function(weather) {
            
            var temp = weather.temp
            var unit = "fahrenheit"
            if (weather.units.temp == "c") {
                unit = "celcius"
            }
            var currently = weather.currently
            SAMAC.Voice.speak("It's " + currently + ", and " + temp + " degrees " + unit + " in " + wildcard);

        });


        var temp = _this.weatherData.temp
        var unit = "fahrenheit"
        if (_this.weatherData.units.temp == "c") {
            unit = "celcius"
        }
        var currently = _this.weatherData.currently
        SAMAC.Voice.speak("It's " + currently + ", and " + temp + " degrees " + unit);

    });

    SAMAC.Voice.on(["what's the forecast", "show me the forecast","show me the 5-day forecast", "show forecast", "show 5-day forecast"], false, function(i, wildcard) {
        SAMAC.Voice.speak("Showing the 5 day forecast");
        _this.modal.open(_this.renderForcast(6));
    });

    SAMAC.Voice.on(["what's the forecast in *", "show me the forecast in *",  "show me the 5-day forecast in *", "show forecast in *", "show 5-day forecast in *"], true, function(i, wildcard) {
        _this.checkWeather(wildcard, function(weather) {
            if (weather != null) {
                SAMAC.Voice.speak("Showing the 5 day forecast in " + wildcard);
                _this.modal.open(_this.renderForcast(6, weather));
            } else {
                SAMAC.Voice.speak("Could not find weather for " + wildcard);
            }

        });

    });
}
weather.prototype.build = function() {};

weather.prototype.render = function() {
    var html = "<div class='app'>";
    html += this.renderWeatherStamp(this.weatherData);
    html += "</div>"
    this.container.html(html);
};

weather.prototype.renderForcast = function(days, data) {
    if (data == null) {
        data = this.weatherData
    }
    var html = "<div class='grid_weather modal-weather'>";
    for (var i = 0; i < days; i++) {
        html += '<div class="row"><div class="col s3"><div class="day">'
        html += data.forecast[i].day
        html += "</div></div>"
        html += '<div class="col s9">'
        html += this.renderWeatherStampForecast(data, i);
        html += "</div></div>"
    }
    html += "</div>"
    return (html);
}

weather.prototype.renderWeatherStamp = function(data) {
    var html = "";

    html += '<i class="icon-' + data.code + '"></i><a class="deg"> ' + data.temp + '&deg;' + data.units.temp + '</a>';
    html += '<ul><li>' + data.city + ', ' + data.region + '</li>';
    html += '<li class="currently">' + data.currently + '</li>';
    html += '<li>' + data.alt.temp + '&deg;C</li></ul>';
    return (html);
}

weather.prototype.renderWeatherStampForecast = function(weatherData, index) {
    var html = "";

    var day = weatherData.forecast[index];

    html += '<i class="icon-' + day.code + '"></i><a class="deg"> ' + day.high + '&deg;' + weatherData.units.temp + '</a>';
    html += '<li class="currently">' + day.text + '</li>';
    html += '<li>' + day.alt.high + '&deg;C</li></ul><br>';
    return (html);
}

weather.prototype.checkWeather = function(city, onComplete) {
    var _this = this;
    $.simpleWeather({
        location: city,
        woeid: '',
        unit: _this.appData.options.unit,
        success: function(weather) {
            if (onComplete) {
                onComplete(weather)
            }
        },
        error: function(error) {
            //  $("#weather").html('<p>'+error+'</p>');
        }
    });
}

SAMAC.ModuleManager.addModule("weather", weather);
