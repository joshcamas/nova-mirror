var directions = function(id) {
    SAMAC.Module.call(this, id);
};

directions.prototype = Object.create(SAMAC.Module.prototype);
directions.prototype.constructor = directions;


directions.prototype.init = function(div) {
    this.container = div;
    this.apikey = "AIzaSyB7ttwRpJsLHpIBja10PPRHvxQbDWG4vb8"

    this.modal = new SAMAC.Modal("directions","map");
    this.modal.init("",["modal-fixed-footer","outline"])
    this.modal.generate();



  //  this.mapModal = SAMAC.addModal("directions_map", "",{fixedFooter:true});
    var _this = this;

    //render

    this.position = {};
    this.geolocation = false;
    this.locationQuery = ""

    var geo_options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            _this.position = pos;
            _this.geolocation = true;

        }, function() {
            _this.geolocation = false
        }, geo_options);
    } else {
        // Browser doesn't support Geolocation
        _this.geolocation = false
    }

    SAMAC.Voice.on(["Show me a map of *", "Show a map of *", "Show map of *"], true, function(i, wildcard) {

        SAMAC.Voice.speak("Showing a map of " + wildcard)

        var query = wildcard;
        query = query.replace(" ", "+")

        _this.showMap("search?key=" + _this.apikey + "&q=" + query);
    });

    SAMAC.Voice.on(["Show me directions to *", "Show directions to *"], true, function(i, wildcard) {

        //IF we have an addres, perfect! Otherwise, load it with a requests

        function gotAddress(address) {

            SAMAC.Voice.speak("Showing directions to " + wildcard);

            var origin = address;

            var destination = wildcard;

            _this.showMap("directions?key=" + _this.apikey + "&origin=" + origin + "&destination=" + destination);

        }

        if (_this.appData.options.address == false) {

          if (!_this.geolocation) {
              SAMAC.Voice.speak("Geolocation position is disabled, and no address is set in options.");
              return;
          }
            $.getJSON("http://maps.googleapis.com/maps/api/geocode/json?latlng=" + _this.position.lat + "," + _this.position.lng, function(data) {
                gotAddress(data.results[0].formatted_address)
            })
        } else {
            gotAddress(_this.appData.options.address)
        }


    });

    SAMAC.Voice.on(["Close map", "hide map"], {ignoreActivate:true}, function(i) {
        _this.modal.close()
    });


};

directions.prototype.showMap = function(data) {
    var html = "";
  //  html += "<div class='modal-content'>"


    html += "<iframe width='100%' height='100%' frameborder='0' style='border:0 padding:0' src='https://www.google.com/maps/embed/v1/" + data + "'> </iframe>"
  //  html += "</div>"

    this.modal.setContent(html);
    this.modal.open();

  //  SAMAC.updateModal("directions_map", html)
  //  SAMAC.openModal("directions_map")
    //this.container.html(html)
};


directions.prototype.render = function() {};

SAMAC.ModuleManager.addModule("directions", directions);
