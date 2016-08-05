var socket = io.connect("http://127.0.0.1:8000");

$(document).ready(function() {
    
    var curScreen = $("#languageContainer");
    var language;

    socket.on("languageSuccess", showMain);
    socket.on("languageFail", function(msg) {
        console.log(msg);
        alert(msg);
    });
    socket.on("sendWords", function(word1, word2) {
        console.log("received "+word1+" and "+word2);
        curScreen.append("<h3>Can you get from "+word1+" to "+word2+" using a chain of translations/synonyms?</h3>");
    });
    socket.on("connect", function() {
        console.log("Connected!");
    });

    /* When the button on the first screen is clicked, send language 
     * selection to server and show second screen */
    $("button[name=languageSubmit]").on("click", function() {
        language = $("#selectLanguage").val();
        console.log("language: "+language);
        socket.emit("languageSubmit", language);
    });

    /*Called when language is in database*/
    function showMain(msg) {
        console.log(msg);
        curScreen.fadeOut(function() {
            socket.emit("askWords", language);
            curScreen = $("#gameContainer");
            curScreen.fadeIn();
            $("#currentLanguage").text(msg);
        });
    }
});