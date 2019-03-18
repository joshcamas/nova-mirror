var SAMAC = SAMAC || {};

SAMAC.Module = function(id) {
    this.id = id;
};
SAMAC.Module.prototype.init = function() {


};
SAMAC.Module.prototype.render = function(div) {};

//Saves user data to data file
SAMAC.Module.prototype.saveUserOptions = function() {};
//Loads user data from data file
SAMAC.Module.prototype.getAppData = function(onComplete) {
    var _this = this;

    function onLoad(data) {
        _this.appData = data;
        if (onComplete != null) {
            onComplete();
        }
    }
    //Checks if user data (data different from the default) has been set. If so, load user data. if not, load default
    $.get("user/modules/" + this.id + "/app.json")
        .done(function() {
            // exists
            _this.loadUserAppData(onLoad);
        }).fail(function() {
            // not exists code
            _this.loadDefaultAppData(onLoad);
        });
};


SAMAC.Module.prototype.loadUserAppData = function(onComplete) {

    $.getJSON("user/modules/" + this.id + "/app.json", function(data) {
        if (onComplete != null) {
            onComplete(data);
        }
    });

};


SAMAC.Module.prototype.loadDefaultAppData = function(onComplete) {

    $.getJSON("modules/" + this.id + "/app.json", function(data) {
        if (onComplete != null) {
            onComplete(data);
        }
    });

};


SAMAC.Module.prototype.setModuleOption = function(module,option,value,onComplete) {

    if(SAMAC.currUser.options.module_options[module] == null) {
      SAMAC.currUser.options.module_options[module] = {}
    }
    SAMAC.currUser.options.module_options[module][option] = value;

    var data = {}
    data.name = SAMAC.currUser.name
    data.options = JSON.stringify(SAMAC.currUser.options)
    SAMAC.socket.emit('saveUserOptions', data);



};


SAMAC.ModuleManager = function() {};

SAMAC.ModuleManager.loadedModules = [];
SAMAC.ModuleManager.runningModules = {};
SAMAC.ModuleManager.moduleList = {};

SAMAC.ModuleManager.loadModules = function(modules, onComplete) {

    var loadedModules = 0;
    for (i = 0; i < modules.length; i++) {


        function onModuleLoad() {
            loadedModules++;
            if (onComplete != null && loadedModules >= modules.length) {
                onComplete()
            }
        }
        this.loadModule(modules[i],onModuleLoad)

    }

}

SAMAC.ModuleManager.loadModule = function(id, onComplete) {
    //First load appdata. This is used to figure out what scripts
    var tempModule = new SAMAC.Module(id);



    function loadDependancies() {
        var totalDeps = tempModule.appData.dependencies.length;
        var loadedDeps = 0;

        if(totalDeps == 0) {
          loadScripts();
        }
        for (i = 0; i < tempModule.appData.dependencies.length; i++) {
            var dep = tempModule.appData.dependencies[i];
            $.getScript("modules/" + id + "/dependencies/" + dep)
                .done(function(script, textStatus) {
                    loadedDeps++
                    if (loadedDeps >= totalDeps) {
                        loadScripts();
                    }
                })
                .fail(function(jqxhr, settings, exception) {
                    console.log("Dependancy loading failed: " + exception)
                    loadedDeps++
                    if (loadedDeps >= totalDeps) {
                        loadScripts();
                    }

                });
        };

    }

    function loadScripts() {
        var totalScripts = tempModule.appData.scripts.length;
        var loadedScripts = 0;

        if(totalScripts == 0) {
          loadCSS();
        }

        for (i = 0; i < tempModule.appData.scripts.length; i++) {
            var script = tempModule.appData.scripts[i];

            $.getScript("modules/" + id + "/" + script)
                .done(function(script, textStatus) {

                    loadedScripts++
                    if (loadedScripts >= totalScripts) {
                        loadCSS();
                    }
                })
                .fail(function(jqxhr, settings, exception) {
                    console.log("FAIL " + exception)
                    loadedDeps++
                    if (loadedScripts >= totalScripts) {
                        loadCSS();
                    }

                });
        };

    }

    function loadCSS() {
        for (i = 0; i < tempModule.appData.css.length; i++) {
            var css = tempModule.appData.css[i];
            $('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', "modules/" +id + "/" + css));
        }

        if (onComplete != null) {
            SAMAC.ModuleManager.loadedModules.push(tempModule)
            console.log(">Module Loaded: " + id)
            onComplete();
        }

    }
    tempModule.getAppData(loadDependancies)
}



SAMAC.ModuleManager.getCommandList = function() {
    var list = [];


    for (i=0;i<SAMAC.ModuleManager.loadedModules.length;i++) {
      var mod = SAMAC.ModuleManager.loadedModules[i]
      if(mod.appData.commands != null) {
        for(c=0;c<mod.appData.commands.length;c++) {
          var command = mod.appData.commands[c];
          command.module = mod.id;
          list.push(command);
        }
      }

    }

    return(list)
}


SAMAC.ModuleManager.addModule = function(id, module) {
    SAMAC.ModuleManager.moduleList[id] = module;
}
