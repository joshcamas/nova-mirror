//News module uses newsapi.org


var app = function(id) {
    SAMAC.Module.call(this, id);
};

app.prototype = Object.create(SAMAC.Module.prototype);
app.prototype.constructor = app;


app.prototype.init = function(div) {
    var _this = this;
    this.container = div;
    //API Key for newsapi.org
    this.apiKey = "2982aa07b4ea4a68867a8ce8c51c5b58";
    this.defaultSource = "google-news"
    this.sources = []
    var Source = function(){code="";names=[]};

    function addSource(code,names) {
      var s = new Source()
      s.code = code;
      s.names = names;
      _this.sources.push(s)
    }

    addSource("buzzfeed",["Buzzfeed","Buzz Feed"])
    addSource("business-insider",["Business Insider"])
    addSource("cnn",["CNN"])
    addSource("daily-mail",["Daily Mail"])
    addSource("espn",["ESPN"])
    addSource("google-news",["Google News"])
    addSource("mashable",["Mashable"])
    addSource("national-geographic",["National Geographic"])
    addSource("reddit-r-all",["Reddit"])
    addSource("polygon",["Polygon"])
    addSource("nfl-news",["NFL News","NFL"])
    addSource("techcrunch",["Tech Crunch","TechCrunch"])
    addSource("the-economist",["The Economist","Economist"])
    addSource("the-new-york-times",["The New York Times","New York Times"])
    addSource("the-huffington-post",["The Huffington Post","Huffington Post"])
    addSource("the-telegraph",["The Telegraph","Telegraph"])
    addSource("the-wall-street-journal",["The Wall Street Journal","Wall Street Journal"])
    addSource("time",["Time"])
    addSource("usa-today",["USA Today"])
    addSource("wired-de",["Wired"])

    this.modal = new SAMAC.Modal("news", "news");
    this.modal.init("", ["modal-fixed-footer"],{infoTop:true})
    this.modal.generate();
    var _this = this;

    SAMAC.Voice.on(["Show me the latest news","Show news","Give me the news","Show me the news","Give me the latest news","Give me some news","Show me some news"], false, function(i, wildcard) {

        SAMAC.Voice.speak("Showing the latest news")

        _this.showNews(_this.defaultSource)
    });





    SAMAC.Voice.on(["Show me some news from *", "Show me the latest news from *","Show news from *","Show me news from *","Show latest news from *","Give me the latest news from *","Give me the news from *"], true, function(i, wildcard) {
        console.log("Showing news from source")
        var code;
        for(i=0;i<_this.sources.length;i++) {
          for(m=0;m<_this.sources[i].names.length;m++) {
            var name = _this.sources[i].names[m].toLowerCase();
            if(wildcard == name) {
              code = _this.sources[i].code;
            }
          }
        }

        if(code == null) {
          SAMAC.Voice.speak("Sorry, I couldn't find a news source called " + wildcard)
          return;
        }


        SAMAC.Voice.speak("Showing news from " + wildcard)

        _this.showNews(code)
    });

    SAMAC.Voice.on(["show list of news sources","Show News Sources","Show me list of news sources","Show Sources","Display Sources","Show me news sources"], false, function(i, wildcard) {

        _this.modal.open(_this.generateSourceHTML());

    });



};

app.prototype.showNews = function(source, readOutloud, quantity) {
    var _this = this;

    if (quantity == null) {
        quantity = 4;
    }
    if (readOutloud == null) {
        readOutloud = false;
    }

    function onNewsGet(data) {

        _this.modal.open(_this.generateNewsHTML(data, quantity));
    }

    this.getNews(source, onNewsGet);
}

app.prototype.generateSourceHTML = function(quantity) {

    if(quantity == null) {
      quantity = this.sources.length;
    }
    var rows = 10
    var columns = Math.ceil(quantity /rows)
    console.log("COLUMNS:" + columns)
    var html = "<center>";

    for (i = 0; i < quantity; i++) {

        if(i % rows == 0) {
          if(i != 0) {
              html += '</ul></div>'
          }
          html += '<div style="display:inline-block;"><ul class="collection">'
        }

        html += '<li class="collection-item">';
        //html += '<img src="' + data.articles[i].urlToImage + '" alt="" class="circle">'
        html += '<span class="title">' + this.sources[i].names[0] + '</span>'
        html += '</li>';
    }

    html += "</center>"
    return (html)
}


app.prototype.generateNewsHTML = function(data,quantity) {

    var html = "";
    html += '<ul class="collection">'

    for (i = 0; i < quantity; i++) {
        html += '<li class="collection-item avatar">';
        html += '<img src="' + data.articles[i].urlToImage + '" alt="" class="circle">'
        html += '<span class="title">' + data.articles[i].title + '</span><p>'
        if(data.articles[i].publishedAt != null) {
        html += '<i>' + data.articles[i].publishedAt.split("T")[0] + '</i><br>'
        }
        html += data.articles[i].description + '</p>'
        html += '</li>';
    }

    html += "</ul>"
    return (html)
}



app.prototype.getNews = function(source, onComplete) {
    var _this = this;
    $.getJSON("https://newsapi.org/v1/articles?source=" + source + "&sortBy=top&apiKey=" + this.apiKey, function(data) {
        onComplete(data);
    })
}



app.prototype.build = function() {
    var html = "";
    this.container.html(html)
};

app.prototype.render = function() {};

SAMAC.ModuleManager.addModule("news", app);
