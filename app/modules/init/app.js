var app = function(id) {
    SAMAC.Module.call(this, id);
};

app.prototype = Object.create(SAMAC.Module.prototype);
app.prototype.constructor = app;


app.prototype.load = function() {
    /*  function updateOnlineStatus() {
          document.getElementById("status").innerHTML = "User is online";
      }

      function updateOfflineStatus() {
          document.getElementById("status").innerHTML = "User is offline";
      }

      window.addEventListener('online', updateOnlineStatus);
      window.addEventListener('offline', updateOfflineStatus);


      SAMAC.addModal("connection_message",":)",{transparent:true})
      SAMAC.openModal("connection_message")*/

    var _this = this;

    SAMAC.addModal("wifiList_Select", "", {
        transparent: true,
        options: {dismissible:false,opacity: 0.8}
    })


    SAMAC.socket.on('getWifiList', function(data) {
        _this.generateWifiListHTML(data)
        SAMAC.openModal("wifiList_Select")
        console.log(data)
    });


    this.requestWifiList()

}

app.prototype.requestWifiList = function() {
    SAMAC.socket.emit('getWifiList');
}

app.prototype.generateWifiListHTML = function(connections) {

  connections[1] = connections[0]
  connections[2] = connections[0]
    var html = "<div class='modal-content'>"

    html += "<center><h3>CONNECTION</h3><br>Please connect a keyboard to select wifi connection and press enter</center>"
    //html+="<div class='collection'>"

    html += "<table id='table_wifi-list'><thead><tr><th data-field='ssid'>Name</th><th data-field='security'>Security</th><th data-field='strength'>Strength</th></tr></thead><tbody>"


    for (i = 0; i < connections.length; i++) {

        html += "<a href='#!' class='collection-item'>"

        if(i == 0) {
          html += "<tr class='highlight'>"
        } else {
          html += "<tr>"
        }

        html += "<td>" + connections[i].ssid + "</td>"
        html += "<td>" + connections[i].security + "</td>"
        html += "<td>" + connections[i].signal_level + "</td>"

        html += "</tr>"
        html += "</a>"

    }
    html += "</tbody>"
    html += "</table>"
    html += "</div>"

    SAMAC.updateModal("wifiList_Select", html)

    //Now update key scrolling
    $(document).keydown(onWifiListKeyDown);


}

function onWifiListKeyDown(e) {

    switch (e.which) {
        case 38:
            highlight($('#table_wifi-list tbody tr.highlight').index() - 1);
            break;
        case 40:
            highlight($('#table_wifi-list tbody tr.highlight').index() + 1);
            break;
    }

}

function highlight(tableIndex) {
    // Just a simple check. If .highlight has reached the last, start again
    if ((tableIndex + 1) > $('#table_wifi-list tbody tr').length)
        tableIndex = 0;

    // Element exists?
    if ($('#table_wifi-list tbody tr:eq(' + tableIndex + ')').length > 0) {
        // Remove other highlights
        $('#table_wifi-list tbody tr').removeClass('highlight');

        // Highlight your target
        $('#table_wifi-list tbody tr:eq(' + tableIndex + ')').addClass('highlight');
    }
}


app.prototype.render = function() {

};

SAMAC.ModuleManager.addModule("init", app);
