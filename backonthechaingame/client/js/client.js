var socket = io.connect("http://127.0.0.1:8000");

$(document).ready(function(){
    
    var curScreen = $("#firstContainer");
    $("#secondContainer").hide();
    $("p").text("This text was changed using client.js");
    var language;

   /*When the button on the first screen is clicked, send language 
     selection to server and show second screen*/
    $(":button").on("click",function(){
        console.log("button clicked");
        language = $("#selectLanguage").val();
        console.log("language: "+language);
        socket.emit('languageSubmit',language);
        socket.on("languageFail",function(msg,err){
            console.log(msg);
            alert(msg);
        });
        socket.on("languageSuccess",showMain);
    });

    /*Called when language is in database*/
    function showMain(msg,err){
        console.log(msg);
        curScreen.fadeOut(function(){
            curScreen = $("#secondContainer");
            mainSetup();
            curScreen.fadeIn();
            $('#currentLanguage').text(msg);
        socket.on("sendWords", function(word1,word2){
            console.log("received "+word1+" and "+word2);
            curScreen.append("<h3>Can you get from "+word1+" to "+word2+" using a chain of translations/synonyms?</h3>");
        });

        });
        //$('footer').append(msg);
    }

    function mainSetup(){
        socket.emit("askWords", language);
       // socket.on("sendWords", function(word1,word2){
         //   curScreen.append("Can you get from "+word1+" to "+word2+" using a chain of translations/synonyms?");
       // });
    }

    /*Socket event handling*/
    socket.on('connect', (socket) => {
        console.log("connected!");
    });
    socket.on('msg', function(msg,err){
        if(err){
            console.log(err);
        }
        console.log(msg);
    });
    //socket.on("languageSuccess",showLang);
    //socket.on("languageFail",function(msg,err){
    //      console.log(msg);
    //});
});
