var app = function(id) {
  SAMAC.Module.call(this,id);
};

app.prototype = Object.create(SAMAC.Module.prototype);
app.prototype.constructor = app;


app.prototype.load = function(div) {
    var _this = this;
    this.container = div;

    this.modal = new SAMAC.Modal("help", "help");
    this.modal.init("", ["bottom-sheet"],{infoTop:true})

        SAMAC.Voice.on(["Show me a list of commands","Show me commands","Show command list","Show list of commands","Show commands"], false, function() {
          SAMAC.Voice.speak("Here's what I can do for you");
          _this.showCommands();
        })

        SAMAC.Voice.on(["Close","Close App"], {ignoreActivate:true}, function() {
          SAMAC.ModalManager.closeAll()
        })

};

app.prototype.showCommands = function() {
    var list = SAMAC.ModuleManager.getCommandList();
    var html = this.generateCommandHTML(list);
    this.modal.open(html);
}

app.prototype.generateCommandHTML = function(data, quantity) {

    if (quantity == null) {
        quantity = data.length;
    }
    var rows = 8
    var columns = Math.ceil(quantity / rows)

    var html = "";

    for (i = 0; i < quantity; i++) {

        if (i % rows == 0) {
            if (i != 0) {
                html += '</ul></div>'
            }
            html += '<div style="display:inline-block;"><ul class="collection">'
        }

        html += '<li class="collection-item">';
        //html += '<img src="' + data.articles[i].urlToImage + '" alt="" class="circle">'
        html += '<span style="font-size:25px">' + data[i].command + '</span>'
        html += '<br><i>' + data[i].description + '</i>'
        html += '</li>';
    }

    html += '</ul></div>'
    return (html)
}

SAMAC.ModuleManager.addModule("engine", app);
