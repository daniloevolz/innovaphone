
/// <reference path="../../web1/lib1/innovaphone.lib1.js" />
/// <reference path="../../web1/appwebsocket/innovaphone.appwebsocket.Connection.js" />
/// <reference path="../../web1/ui1.lib/innovaphone.ui1.lib.js" />

var Wecom = Wecom || {};
Wecom.CriticalView = Wecom.CriticalView || function (start, args) {
    this.createNode("body");
    var that = this;
    var storeObject;

    var colorSchemes = {
        dark: {
            "--bg": "#191919",
            "--button": "#303030",
            "--text-standard": "#f2f5f6",
            "--colbutton": "#ffffff",
            "--coltext": "#000000",
        },
        light: {
            "--bg": "white",
            "--button": "#e0e0e0",
            "--text-standard": "#4a4a49",
            "--colbutton": "#000000",
            "--coltext": "#ffffff",
        }
    };
    var schemes = new innovaphone.ui1.CssVariables(colorSchemes, start.scheme);
    start.onschemechanged.attach(function () {
        if (start.scheme == "dark") {
            //document.getElementById('menu-icon').setAttribute('src', './images/menu-icon-white.png');
        }
        if (start.scheme == "light") {
            //document.getElementById('menu-icon').setAttribute('src', './images/menu-icon.png');
        }

        schemes.activate(start.scheme)
    });
    var texts = new innovaphone.lib1.Languages(Wecom.CriticalViewTexts, start.lang);
    start.onlangchanged.attach(function () { texts.activate(start.lang) });

    var app = new innovaphone.appwebsocket.Connection(start.url, start.name);
    app.checkBuild = true;
    app.onconnected = app_connected;
    app.onmessage = app_message;

    function app_connected(domain, user, dn, appdomain) {
        app.send({ api: "user", mt: "UserMessage" });
        app.send({ api: "channel", mt: "SelectChannelMessage" });
        app.send({ api: "channel", mt: "SelectPageMessage" });
    } 

    function app_message(obj) {
        if (obj.api == "user" && obj.mt == "UserMessageResult") {
            
        }
        if (obj.api == "channel" && obj.mt == "ChannelMessageError") {
            console.log(obj.result);
        }
        if (obj.api == "channel" && obj.mt == "SelectPageMessageResultSuccess") {

            
            var pages = JSON.parse(obj.result);
            console.log(pages);
            // storeObject = pages;

            if (app.logindata.info.unlicensed) {
                
                CriticalView()
                unlicensed();
                insert(pages)
                // onChangePage("1");
            
            }else{


            CriticalView()
           // grid();
            insert(pages)
           //onChangePage("1");
            
        }

        }
        if (obj.api == "channel" && obj.mt == "SelectChannelMessageResultSuccess") {
        var channels= JSON.parse(obj.result);
        console.log(channels);
        storeObject = channels;
        
        grid();
        onChangePage("1");

        }

    }

    function unlicensed(){
        var grid = that.add(new innovaphone.ui1.Div("position:absolute;left:15%;width:85%;height: 100%; flex-wrap: wrap; display: flex; justify-content: center;",null,null));
        grid.setAttribute("id","grid");
        // // tirar o border se n for mais necessário!
        var divGrid0 = grid.add(new innovaphone.ui1.Div("width:49%;height:49%;border: 2px solid; border-color: transparent;",null,null));
             divGrid0.setAttribute("id","div0") 
        for (i = 0 ; i < 3 ; i++){
        var divGrid1 = grid.add(new innovaphone.ui1.Div("width:49%;display:flex;align-items:center; height:49%;border: 2px solid; justify-content:center; font-weight: bold; color:black; font-size:20px; border-color: transparent;",texts.text("licUnLicensed"),null))
        }
        
    }
    function CriticalView(){
        var colesquerda = that.add(new innovaphone.ui1.Div("position:absolute;width:15%;float:left; height: 100%",null,"colunaesquerda"));
        var wecom = colesquerda.add(new innovaphone.ui1.Div("position:absolute; width:100%; height: 5%; top: 90%;display:flex;justify-content:center; align-items:center;",null,null));
        var wecomA = wecom.add(new innovaphone.ui1.Node("a",null,null,null))
        wecomA.setAttribute("href","https://wecom.com.br")
        wecomA.setAttribute("id","wecomA")
        var imgwecom = wecomA.add(new innovaphone.ui1.Node("img",null,null,"imglogo"));
        imgwecom.setAttribute("src","logo.png")
        var scroll = colesquerda.add(new innovaphone.ui1.Node("scroll-container", null, null, "scroll-container"));
        var uliptv = scroll.add(new innovaphone.ui1.Node("ul",null,null,null));
        uliptv.setAttribute("id","listchannels");
    }
    function grid(){
        var grid = that.add(new innovaphone.ui1.Div("position:absolute;left:15%;width:85%;height: 100%; flex-wrap: wrap; display: flex; justify-content: center;",null,null));
        grid.setAttribute("id","grid");
        // // tirar o border se n for mais necessário!

         for (let i = 0; i < 4; i++) {
            var divGrid = grid.add(new innovaphone.ui1.Div("width:49%;height:49%;border: 2px solid; border-color: transparent;",null,null));
             divGrid.setAttribute("id","div"+i) 
         }
    }
    function onChangePage(page) {     
        try {
            for (let i = 0; i < 4; i++) {
                var oldPlayer = document.getElementById('my_video_' + i);
                flvjs(oldPlayer).dispose();
                document.getElementById('div' + i).innerHTML = "";

            }

        } catch {
            for (let i = 0; i < 4; i++) {
                var oldPlayer = document.getElementById('my_video_' + i);
                videojs(oldPlayer).dispose();
                document.getElementById('div' + i).innerHTML = "";
            }
        } finally {
            let i = 0;
            storeObject.forEach(function (item, index) {
                if (String(item.page) == String(page)) {
                    document.getElementById('div' + i).innerHTML = "";
                    var playerElement = document.getElementById('div' + i);
                
                    if (item.type == "video/flv") {
                        var video = document.createElement("video");
                        video.setAttribute("id", "my_video_" + i);
                        video.setAttribute("class", "video-flv vjs-fluid vjs-default-skin");
                        video.setAttribute("controls", "");
                        video.setAttribute("preload", "auto");
                        video.setAttribute("allow", "autoplay");
                        video.setAttribute("autoplay", "true");
                        video.setAttribute("muted", "muted");

                        var source = document.createElement("source");
                        source.setAttribute("src", item.url);
                        source.setAttribute("type", "flv");

                        video.appendChild(source);
                        playerElement.appendChild(video);

                        var flvPlayer = flvjs.createPlayer({
                            type: 'flv',
                            url: item.url
                        });
                        flvPlayer.attachMediaElement(video);
                        flvPlayer.load();
                        flvPlayer.play();   // teste apagar depois
                        //}
                    }
                    if (item.type == "youtube") {
                        var iframe = document.createElement("iframe");
                        iframe.src = item.url + "?autoplay=1&mute=1";
                        iframe.frameBorder = "0";
                        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                        iframe.width = "100%";
                        iframe.height = "180%";
                        iframe.setAttribute("id", "my_video_" + i);
                        document.getElementById("div" + i).appendChild(iframe);

                        var divtest = document.getElementById('div' + i);
                        divtest.setAttribute("class", "youtube" + i)


                        /*
                        var labelVideo = document.createElement("label");
                        labelVideo.setAttribute("class", "label" + i);
                        var txtNode = document.createTextNode(item.name);
                        playerElement.appendChild(labelVideo);
                        labelVideo.appendChild(txtNode);
                        */

                    }
                    if (item.type == "application/x-mpegURL" || item.type == "video/mp4" || item.type == "video/ogg" || item.type == "audio/mpeg" || item.type == "audio/wav") {
                        var video = document.createElement("video");
                        video.setAttribute("id", "my_video_" + i);
                        video.setAttribute("class", "video-js vjs-fluid vjs-default-skin");
                        video.setAttribute("controls", "");
                        video.setAttribute("preload", "auto");
                        video.setAttribute("allow", "autoplay");
                        video.setAttribute("autoplay", "true");
                        video.setAttribute("muted", "muted");

                        var source = document.createElement("source");
                        source.setAttribute("src", item.url);
                        source.setAttribute("type", item.type);

                        var divtmpeg = document.getElementById('div' + i);
                        divtmpeg.setAttribute("class", "mpeg" + i)

                        /*
                        var labelVideo2 = document.createElement("label");
                        labelVideo2.setAttribute("class", "labelmpeg" + i);
                        var txtNode2 = document.createTextNode(item.name);
                        playerElement.appendChild(labelVideo2);
                        labelVideo2.appendChild(txtNode2);
                        */

                        video.appendChild(source);
                        playerElement.appendChild(video);
                        var video = videojs('my_video_' + i, {
                            html5: {
                                vhs: {
                                    overrideNative: !videojs.browser.IS_SAFARI
                                },
                                nativeAudioTracks: false,
                                nativeVideoTracks: false
                            }
                        });
                        //video.src({ type: type, src: url });
                        video.ready(function () {
                            video.src({ type: item.type, src: item.url });
                        });

                    }
                    i++;
                }
            });
        }
    }


    function insert(pages) {
        try {
            //var lis = document.querySelectorAll('#listchannels');
            //for (var i = 0; li = lis[i]; i++) {
            //    li.parentNode.removeChild(li);
            //}
            document.getElementById("listchannels").innerHTML = "";
            console.log("Limpou o LI")
        } catch {
            console.log("o LI estava limpo!")
        }
        var page;
        pages.forEach(function (item, index) {
            if (page != item.page) {
                page = item.page;
                var ul = document.getElementById('listchannels');
                var newEl = document.createElement('li');
                var newImg = document.createElement('img');
                var newA = document.createElement('a');
                var newText = document.createTextNode(item.name_page)

                newImg.setAttribute("class", "logo");
                newImg.setAttribute("src", item.img)
                newA.setAttribute("nonce", item.page) // correto é usar nonce ao invés de value nesse caso
                newA.setAttribute("href", "#");
                newA.setAttribute("id", "playChannel");
                newA.appendChild(newText);
                newA.appendChild(newImg);
                newEl.appendChild(newA);
                ul.appendChild(newEl);
            }
            

            var botoes = document.querySelectorAll("#playChannel");
            for (var i = 0; i < botoes.length; i++) {
                var botao = botoes[i];

                botao.addEventListener("click", function (event) {
                    const el = event.target || event.srcElement;
                    const nonce = el.nonce;
                    console.log("Valor do button " + nonce);
                    onChangePage(nonce);
                });

            }

        });

    }


    /*
    function pageName() {

         var namePage1 = "";
         var namePage2 = "";
         var namePage3 = "";
         var namePage4 = "";
         var namePage5 = "";

           storeObject.forEach(function (item, index) {
            if (String(item.page) == String(1)) {
                namePage1 += item.name_page + "\n " ;
           }
           if (String(item.page) == String(2)) {
                namePage2 += item.name_page + "\n " ;
            }
            if (String(item.page) == String(3)) {
                namePage3 += item.name_page + "\n " ;
            }
             if (String(item.page) == String(4)) {
                namePage4 += item.name_page + "\n " ;
            }
            if (String(item.page) == String(5)) {
                namePage5 += item.name_page + "\n ";
             }
        })
     var colEsquerda = that.add(new innovaphone.ui1.Div("position:absolute;width:15%;float:left; height: 100%",null,"colunaesquerda"));
     var allBtn = colEsquerda.add(new innovaphone.ui1.Node("div", null, namePage1, "allbutton"));
     allBtn.setAttribute("value",1)
     var allBtn = colEsquerda.add(new innovaphone.ui1.Node("div", null, namePage2, "allbutton"));
     allBtn.setAttribute("value",2)
     var allBtn = colEsquerda.add(new innovaphone.ui1.Node("div", null, namePage3, "allbutton"));
     allBtn.setAttribute("value",3)
     var allBtn = colEsquerda.add(new innovaphone.ui1.Node("div", null, namePage4, "allbutton"));
     allBtn.setAttribute("value",4)
     var allBtn = colEsquerda.add(new innovaphone.ui1.Node("div", null, namePage5, "allbutton"));
     allBtn.setAttribute("value",5)

     for (let i = 1; i < 6; i++) {
        var allBtn = colEsquerda.add(new innovaphone.ui1.Div(null,null,"allbutton"));
    }

        var botoes = document.querySelectorAll(".allbutton");
        for (var i = 0; i < botoes.length; i++) {
            var botao = botoes[i];

            // O jeito correto e padronizado de incluir eventos no ECMAScript
            // (Javascript) eh com addEventListener:
            botao.addEventListener("click", function (event) {
                 const el = event.target || event.srcElement;
                 const value = el.value;
                //const type = el.type;
                console.log("Valor do button" + value);
                onChangePage(value);
            });
         }
     }
     */

}
Wecom.CriticalView.prototype = innovaphone.ui1.nodePrototype;