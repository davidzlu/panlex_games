var sock = io.connect("http://127.0.0.1:8000");

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
    var LANG_SUCCESS = "languageSuccess";
    var LANG_FAIL = "languageFail";
    var WIN = "win";
    var LOSE = "lose";
    var RESET = "reset";
    var VALID_LANGUAGES = "validLanguages";

    //sock event listeners
    sock.on(LANG_SUCCESS, onLanguageSuccess);
    sock.on(LANG_FAIL, onLanguageFail);
    sock.on(SEND_WORDS, onReceiveWords);
    sock.on(TRANS_LIST, onReceiveTranslation);
    sock.on(WIN, onWin);
    sock.on(VALID_LANGUAGES, onLanguageList);

    //DOM event listeners
    $("#languageSubmit").on("click", function() {
        language = $("#selectLanguage").val();
        console.log("language: "+language);
        sock.emit("languageSubmit", language);
    });
    $("#transSubmit").on("click", sendWord);
    $("#loseButton").on("click", forfeit);
    $("#resetButton").on("click", function() {
        sock.emit(RESET);
        curScreen.fadeOut();
        curScreen = $("#gameContainer");
    });
    $("#seeTrans").on("click", function() {
        console.log("translation button clicked, asking server for translations");
        secondaryLang = $("#selectSecondaryLang").val();
        sock.emit(ASK_TRANS, secondaryLang, curWord);  //asks server for a translation of word1
    });

    /*Called when language is in database*/
    function onLanguageSuccess(msg) {
        console.log(msg);
        sock.emit(ASK_WORDS, language);
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
        var newLangMsg = $("<p id='chooseLangMsg'>Choose a language in which to list PanLex's translations/synonyms of <font color=\"FF0000\">"+word1+": </font></p>");
        $("#chooseLangMsg").replaceWith(newLangMsg);
        $("#objectiveMsg").replaceWith($("<h3 id='objectiveMsg'>Can you get from <font color=\"FF0000\">"+word1+"</font> to <font color=\"FF0000\">"+word2+"</font> using a chain of translations/synonyms?</h3>"));
        curScreen.fadeIn(function() {
            console.log("received "+word1+" and "+word2); 
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
        if (word !== null) {
            $("#synonymContainer").empty();
            sock.emit(SET_WORD, word, secondaryLang);
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

    function onLanguageList(lvList) {
        $("#selectSecondaryLang").empty();
        for (var i=0; i<lvList.length; i++) {
            var langOption = $("<option>"+lvList[i]+"</option>");
            $("#selectSecondaryLang").append(langOption);
        }
    }
});
