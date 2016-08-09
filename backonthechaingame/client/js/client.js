var socket = io.connect("http://127.0.0.1:8000");

$(document).ready(function() {
    
    var curScreen = $("#languageContainer");
    var language;
    var secondaryLang;
    var curWord, targetWord;

    //event list
    var SET_WORD = "setWord";
    var ASK_TRANS = "askTrans";
    var ASK_WORDS = "askWords";
    var SEND_WORDS = "sendWords";
    var TRANS_LIST = "transList";

    socket.on("languageSuccess", onLanguageSuccess);
    socket.on("languageFail", onLanguageFail);
    socket.on(SEND_WORDS, onReceiveWords);
    socket.on(TRANS_LIST, onReceiveTranslation);
    socket.on("win", onWin);

    /* When the button on the first screen is clicked, send language 
     * selection to server and show second screen */
    $("#languageSubmit").on("click", function() {
        language = $("#selectLanguage").val();
        console.log("language: "+language);
        socket.emit("languageSubmit", language);
    });
    $("#transSubmit").on("click", sendWord);
    $("#loseButton").on("click", forfeit);

    /*Called when language is in database*/
    function onLanguageSuccess(msg) {
        console.log(msg);
        socket.emit("askWords", language);
        curScreen.fadeOut();
        curScreen = $("#gameContainer");
        $("#currentLanguage").text(msg);
    }

    function onLanguageFail(msg) {
        console.log(msg);
        alert(msg);
    }

    function onReceiveWords(word1, word2) {
        curWord = word1;
        targetWord = word2;
        curScreen.fadeIn(function() {
            console.log("received "+word1+" and "+word2);
            var translationButton = $("<button>",{ type:"button", name:"seeTrans",text:"Show translations"});
            translationButton.on("click", function(){
                console.log("translation button clicked, asking server for translations");
                secondaryLang = $("#selectSecondaryLang").val();
                socket.emit("askTrans", secondaryLang, word1);  //asks server for a translation of word1
            });
            $("#selectSecondaryLang").after(translationButton);
            $("#gameContainer h2").after("Choose a language in which to list PanLex's translations/synonyms of <font color=\"FF0000\">"+word1+"</font>: <br>");
            $("#gameContainer h2").after("<h3>Can you get from <font color=\"FF0000\">"+word1+"</font> to <font color=\"FF0000\">"+word2+"</font> using a chain of translations/synonyms?</h3>");
        });
        
    }

    function onReceiveTranslation(wordList) {
        
        for (var i=0; i<wordList.length; i++) {
            var word = wordList[i];
            var $wordOption = $("<option>"+word+"</option>");
            $("#synonymContainer").append($wordOption);
        }
    }

    function sendWord() {
        var word = $("#synonymContainer").val();
        if (word !== "") {
            $("#synonymContainer").empty();
            socket.emit("setWord", word, secondaryLang);
            curWord = word;
            $("#gameContainer h3").replaceWith($("<h3>Can you get from <font color=\"FF0000\">"+curWord+"</font> to <font color=\"FF0000\">"+targetWord+"</font> using a chain of translations/synonyms?</h3>"));
        } else {
            alert("Please select a word");
        }
    }

    function onWin() {
        curScreen.fadeOut(function() {
            curScreen = $("#endContainer");
            $("#endMessage").text("You win!");
            curScreen.fadeIn();
        });
    }

    function forfeit() {
        curScreen.fadeOut(function() {
            curScreen = $("#endContainer");
            $("#endMessage").text("You lose!");
            curScreen.fadeIn();
        });
    }

});
