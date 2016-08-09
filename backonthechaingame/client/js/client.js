var socket = io.connect("http://127.0.0.1:8000");

$(document).ready(function() {
    
    var curScreen = $("#languageContainer");
    var language;

    socket.on("languageSuccess", onLanguageSuccess);
    socket.on("languageFail", onLanguageFail);
    socket.on("sendWords", onReceiveWords);
    socket.on("singleTrans", onReceiveTranslation);

    /* When the button on the first screen is clicked, send language 
     * selection to server and show second screen */
    $("button[name=languageSubmit]").on("click", function() {
        language = $("#selectLanguage").val();
        console.log("language: "+language);
        socket.emit("languageSubmit", language);
    });

    /*Called when language is in database*/
    function onLanguageSuccess(msg) {
        console.log(msg);
        socket.emit("askWords", language);
        curScreen.fadeOut(function() {
            curScreen = $("#gameContainer");
            $("#currentLanguage").text(msg);
        });
    }

    function onLanguageFail(msg) {
        console.log(msg);
        alert(msg);
    }

    function onReceiveWords(word1, word2) {
        curScreen.fadeIn();
        console.log("received "+word1+" and "+word2);
        var translationButton = $("<button>",{ type:"button", name:"seeTrans",text:"Show translations"});
        translationButton.on("click", function(){
            console.log("translation button clicked, asking server for translations");
            socket.emit("askTrans", $("#selectSecondaryLang").val(), word1);  //asks server for a translation of word1
        });
        $("#selectSecondaryLang").after(translationButton);
        $("#gameContainer h2").after("Choose a language in which to list PanLex's translations/synonyms of <font color=\"FF0000\">"+word1+"</font>: <br>");
        $("#gameContainer h2").after("<h3>Can you get from <font color=\"FF0000\">"+word1+"</font> to <font color=\"FF0000\">"+word2+"</font> using a chain of translations/synonyms?</h3>");
        //curScreen.append("<h3>Can you get from <font color=\"FF0000\">"+word1+"</font> to <font color=\"FF0000\">"+word2+"</font> using a chain of translations/synonyms?</h3>");
        //curScreen.append("Choose a language in which to list PanLex's translations/synonyms of <font color=\"FF0000\">"+word1+"</font>: <br>");
    }

    function onReceiveTranslation(word) {
        console.log(word);
        var $wordOption = $("<option>"+word+"<option/>")
        $("#synonymContainer").append($wordOption);
    }
});
