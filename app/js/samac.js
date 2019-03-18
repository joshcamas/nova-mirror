var SAMAC = SAMAC || {};
SAMAC.Sounds = {};

SAMAC.isOnline = function(onComplete) {

    var newImg = new Image;
    newImg.onload = function() {
        onComplete(true)
    }
    newImg.onerror = function() {
        onComplete(false)
    }

    newImg.src = 'http://samacstudios.com/favicon.ico';

}

SAMAC.hideLoadingScreen = function(onComplete) {
    window.setTimeout(function() {
        $("#loader").fadeOut(1000)
    }, 0)
}

SAMAC.showLoadingScreen = function(message) {
    window.setTimeout(function() {
        $("#loader").fadeIn(1000)
        if (message) {
            $("#loader").find(".message").text(message)
        }
    }, 2000)
}

SAMAC.showSetupMessage = function(onComplete) {
    window.setTimeout(function() {
        $("#setupMessage").fadeIn(1000)
    }, 0)
}


SAMAC.moonLoop = function(div) {

    var phases = ["a", "c", "h", "f", "b", "e", "g", "d"];
    var phase = 0;

    window.setInterval(function() {
        div.text(phases[phase])
        phase++;
        if (phase > phases.length) {
            phase = 0;
        }

    }, 400)

}

SAMAC.loadUserOptions = function(index, onComplete) {
    var userId = SAMAC.configData.users[index];
    SAMAC.currUser.name = userId;
    $.getJSON("user/" + userId + "/options.json", function(data) {
        if (onComplete != null) {
            onComplete(data);
        }
    });
}

SAMAC.loadSounds = function(onComplete) {

    var sounds = [];

    var url = "assets/sfx/ring_startup.mp3"
    SAMAC.Sounds.startup = new Audio(url);
    sounds.push(SAMAC.Sounds.startup);
    //SAMAC.Sounds.startup.load();

    var url = "assets/sfx/ring_listen.mp3"
    SAMAC.Sounds.listen = new Audio(url);
    sounds.push(SAMAC.Sounds.listen);
    //SAMAC.Sounds.listen.load();

    var url = "assets/sfx/ring_thinking.mp3"
    SAMAC.Sounds.thinking = new Audio(url);
    sounds.push(SAMAC.Sounds.thinking);
    //SAMAC.Sounds.thinking.load();


    var url = "assets/sfx/ring_fail.mp3"
    SAMAC.Sounds.fail = new Audio(url);
    SAMAC.Sounds.fail.volume = 0.8;
    sounds.push(SAMAC.Sounds.fail);
    //SAMAC.Sounds.fail.load();


    var url = "assets/sfx/ring_answer.mp3"
    SAMAC.Sounds.answer = new Audio(url);
    SAMAC.Sounds.answer.volume = 0.8;
    sounds.push(SAMAC.Sounds.answer);
    //SAMAC.Sounds.answer.load();


    var url = "assets/sfx/ring_closemodal.mp3"
    SAMAC.Sounds.closemodal = new Audio(url);
    sounds.push(SAMAC.Sounds.closemodal);
    //SAMAC.Sounds.closemodal.load();

    var url = "assets/sfx/ring_openmodal.mp3"
    SAMAC.Sounds.openmodal = new Audio(url);
    sounds.push(SAMAC.Sounds.openmodal);
    //SAMAC.Sounds.openmodal.load();

    var url = "assets/sfx/ring_sleep.mp3"
    SAMAC.Sounds.sleep = new Audio(url);
    SAMAC.Sounds.sleep.volume = 0.5;
    sounds.push(SAMAC.Sounds.sleep);
    //SAMAC.Sounds.sleep.load();


    var url = "assets/sfx/ring_wakeup.mp3"
    SAMAC.Sounds.wakeup = new Audio(url);
    SAMAC.Sounds.wakeup.volume = 0.5;
    sounds.push(SAMAC.Sounds.wakeup);
    //SAMAC.Sounds.wakeup.load();

    function loadSound(index) {
      console.log(index);
      sounds[index].addEventListener('loadeddata', function(){onSoundLoad(index)}, false);
      sounds[index].load();
    }

    function onSoundLoad(index) {
      if(index >= sounds.length-1) {
        onComplete();
      } else {
        loadSound(index+1);
      }
    }
    loadSound(0);

}
//BEGIN!
SAMAC.Initiate = function() {
    console.log("Initiating Samac Mirror");


    SAMAC.socket = io();
    SAMAC.ArtyomManager.init();

    this.currUser = new SAMAC.User();
    var _this = this;

    function onLoadSounds() {
      SAMAC.isOnline(onGetInternet)
    }
    function onGetInternet(connected) {

        if (connected) {
            //Now load config
            $.getJSON("config.json", function(data) {
                SAMAC.configData = data;
                onConfigLoad()
            });
        } else {
          //Not connected! Show wifi login system
          console.log("No wifi")
        }
    }

    function onConfigLoad() {
        if (SAMAC.configData.users.length > 0) {
            SAMAC.loadUserOptions(0, onOptionsLoad);
        } else {
            console.warn("No user detected, switching to welcome screen!");
            SAMAC.showSetupMessage();
        }
    }

    function onOptionsLoad(options) {
        SAMAC.currUser.options = options;

        if (SAMAC.currUser.options.options.requireActivate) {
            SAMAC.ArtyomManager.requireActivate = true;

            //Build a list of activate words
            var activateWords = [];
            var pre =SAMAC.currUser.options.options.activatePreWords;
            var post = SAMAC.currUser.options.options.activatePostWords;

            for(x=0;x<pre.length;x++) {
              for(y=0;y<post.length;y++) {
                activateWords.push(pre[x] + " " + post[y]);
              }
            }

            if(!SAMAC.currUser.options.options.requirePreWord) {
              for(y=0;y<post.length;y++) {
                activateWords.push(post[y]);
              }
            }

            SAMAC.Voice.onActivateWords(activateWords)
            SAMAC.Voice.onDeactivateWords(SAMAC.currUser.options.options.deactivateWords)
        }

        SAMAC.ModuleManager.loadModules(SAMAC.currUser.options.modules, onModulesLoad)
    }

    function onModulesLoad() {
        console.log("Completed Initiation!")
        SAMAC.UserInterface.generateGrid(onGridGenerate);
    }

    function onGridGenerate() {
        console.log("Initing Grid Modules")
        SAMAC.UserInterface.initModules();

        sound = SAMAC.Sounds.startup;
        sound.play();
        setTimeout(onInitComplete, 500)
    }

    function onStartupSoundComplete() {
      SAMAC.hideLoadingScreen();

    }
    function onInitComplete() {
        SAMAC.hideLoadingScreen();

    }

    SAMAC.loadSounds(onLoadSounds);





}

SAMAC.UserInterface = function() {};
SAMAC.UserInterface.generateGrid = function(onComplete) {

    //    var width = SAMAC.currUser.options.interface.width;

    function genModuleList(list, div) {
        var gridHTML = "";
        for (y = 0; y < list.length; y++) {
            gridHTML += "<div class='row'>";

            if (list[y].length != null) {
                var width = list[y].length;
            } else {
                width = 1
            }
            for (x = 0; x < width; x++) {
                var module = list[y][x];
                if (module == {} || module == null) {
                    continue;
                }
                if (module.id == null) {
                    module.id = "empty"
                }
                //get width and height. This will be used to determine sizes
                if (module.width == null) {
                    module.width = 1
                }
                var colSize = (12 / width) * module.width

                gridHTML += "<div class='col s" + colSize + " " + "grid_" + module.id + "'></div>"

            }
            gridHTML += "</div>";
        }

        $(div).html(gridHTML)
    }

    genModuleList(SAMAC.currUser.options.interface.modules, "#grid");
    genModuleList(SAMAC.currUser.options.interface.modules_bottom, "#grid-bottom");


    if (onComplete != null) {
        onComplete();
    }
}

SAMAC.UserInterface.initModules = function(onComplete) {

    var totalMods = SAMAC.currUser.options.modules.length;
    var loadedMods = 0;

    for (i = 0; i < totalMods; i++) {

        initModule(i, onComplete)

    }

    for (i = 0; i < totalMods; i++) {
        var mod = SAMAC.ModuleManager.runningModules[SAMAC.currUser.options.modules[i]]
        if (mod.load != null) {
            mod.load()
        }
    }

    function initModule(i, onInitComplete) {
        var id = SAMAC.currUser.options.modules[i]
        var curMod = new SAMAC.ModuleManager.moduleList[id](id);
        var div = $(".grid_" + id);

        SAMAC.ModuleManager.runningModules[id] = curMod;

        function onComplete() {
            curMod.init(div, id)
            if (onInitComplete != null) {
                onInitComplete()
            }
        }

        curMod.getAppData(onComplete)
    }
}


SAMAC.Sleep = function() {
    this.sleeping = true;
}


SAMAC.Wakeup = function() {
    this.sleeping = false;
}
