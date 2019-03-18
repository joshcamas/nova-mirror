var express = require('express');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var sys = require('sys')
var exec = require('child_process').exec;

var uuidV1 = require('uuid/v1');
var wifi = require('node-wifi');

var fs = require('fs');
var jsonfile = require('jsonfile')

var wifiConnected = false;

var webdict = require('webdict');

wifi.init({
    iface: null // network interface, choose a random wifi interface if set to null
});

//Try to connect to the internet. If
/*
isOnline().then(online => {


  if (online) {
      console.log("Online connection detected");
      wifiConnected = true;
  } else {
      console.log("Online connection not detected, will try connecting with saved connections")

      function connectNetwork(data,onComplete) {
        wifi.connect({
            ssid: data.ssid,
            password: data.password
        }, function(err) {
            if (err) {
                onComplete(false,err)
            }
            onComplete(true)
        });
      }

      var file = 'networks.json'
      jsonfile.readFile(file, function(err, obj) {

          if(err) {
            io.sockets.emit('error', {code:"network-json-failed",level:1,data:err});
            return;
          }

          console.log("Read " + obj.networks.length + " saved connections")

          //Data loaded, now go through each list and try to connect
          if(obj.networks.length == 0) {
            console.log("No connections found! Internet Connection failed, enabling wifi interface");
            return;
          }
          i = 0;
          connectNetwork(obj.networks[0],connectLoop)
          function connectLoop(success) {
            if(success) {
              console.log("Connection Complete!");
              return;
            } else {
              i++;
              if(i >= oj.networks.length) {
                console.log("Failed to find any connections")
              }
              connectNetwork(obj.networks[i])
            }
          }

      })

  }

});
*/

app.use(express.static(path.join(__dirname, 'app')));

// Define the port to run on
app.set('port', 3000);


// Listen for requests
http.listen(3000, function() {
    console.log('listening on *:3000');
});

function puts(error, stdout, stderr) {
    sys.puts(stdout)
}




io.on('connection', function(socket) {
    console.log('a user connected');
    var socketID = uuidV1();

    socket.on('command', function(msg) {
        if (msg == "reboot") {
            exec("sudo reboot", puts);
        } else if (msg == "update node") {
            //exec("cd NovaMirror && git pull origin master && reboot", puts);
            exec("cd NovaMirror && git fetch --all && git reset --hard origin/master && sudo reboot", puts);

        }
    });

    socket.on('define', function(word) {

      webdict('dictionary', word)
          .then(function(resp) {
              resp.word = word;
              socket.emit("define", resp)

          });

        /*webdict('dictionary', word)
            .then(resp => {
                resp.word = word;
                socket.emit("define", resp)

            });*/

    })
    socket.on('getWifiList', function(msg) {

        wifi.scan(function(err, networks) {
            if (err) {
                console.log(err);
            } else {
                console.log(networks);
                socket.emit("getWifiList", networks)

            }
        });
    });

    socket.on('connectWifi', function(data) {
        console.log("Got Connection")
        console.log(data)
        wifi.connect({
            ssid: data.ssid,
            password: data.password
        }, function(err) {
            if (err) {
                socket.emit("wifiError", err)
                console.log("Hit error")
            }
            socket.emit("wifiSuccess", err)
            console.log("Success")
        });
    });

    socket.on('getCurrentWifi', function(data) {
        wifi.getCurrentConnections(function(err, currentConnections) {
          socket.emit("getCurrentWifi", currentConnections);
        });

    });


    socket.on('saveUserOptions', function(data) {
        var username = data.name;
        var options = data.options
        fs.writeFile("app/user/" + username + "/options.json", options, function(err) {
            if (err) {
                return console.log(err);
            }

        });
        console.log("The file was saved!");
    });







});
