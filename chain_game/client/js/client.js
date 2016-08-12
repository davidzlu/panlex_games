var sock = io.connect("http://127.0.0.1:8000");

$(document).ready(function() {
    
    var curScreen = $("#languageContainer");
    var language;
    var secondaryLang;
    var curWord, targetWord;
    var insnsHaveBeenTranslated = false;
    var insnWords;
    var loseMess, winMess, selectWordMess="";

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
    var GET_UIDS = "getUids";
    var INSTRUCTIONS = "instructions";

    //sock event listeners
    sock.on(INSTRUCTIONS, onInstructions);
    sock.on(LANG_SUCCESS, onLanguageSuccess);
    sock.on(LANG_FAIL, onLanguageFail);
    sock.on(SEND_WORDS, onReceiveStartWords);
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
        $("#synonymContainer").empty();
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
        sock.emit("askInstructions",language);
        console.log("just sent askInstructions event");

    }

    function onLanguageFail(msg) {
        console.log(msg);
        alert(msg);
    }

    function onReceiveStartWords(word1, word2) {
        curWord = word1;
        targetWord = word2;
        sock.emit(GET_UIDS);
        if(!insnsHaveBeenTranslated || language=="eng-000"){
            console.log("changing messages because insns supposedly haven't been translated yet");
            var newLangMsg = $("<p id='chooseLangMsg'>Choose a language in which to list PanLex's translations/synonyms of <font color=\"FF0000\">"+curWord+": </font></p>");
            $("#chooseLangMsg").replaceWith(newLangMsg);
            $("#objectiveMsg").replaceWith($("<h3 id='objectiveMsg'>Can you get from <font color=\"FF0000\">"+curWord+"</font> to <font color=\"FF0000\">"+targetWord+"</font> using a chain of translations/synonyms?</h3>"));
        }
        curScreen.fadeIn(function() {
            console.log("received "+word1+" and "+word2); 
        });
    }

    function onReceiveTranslation(data) {
        for (var i=0; i<data.resultNum; i++) {
            var word = data.result[i].tt;
            var $wordOption = $("<option></option>", {text:word});
            $("#synonymContainer").append($wordOption);
        }
    }

    function sendWord() {
        var word = $("#synonymContainer").val();
        if (word !== null) {
            $("#synonymContainer").empty();
            $("#selectSecondaryLang").empty();
            sock.emit(SET_WORD, word, secondaryLang);
            curWord = word;
            if(!insnsHaveBeenTranslated || language=="eng-000"){
                var newLangMsg = $("<p id='chooseLangMsg'>Choose a language in which to list PanLex's translations/synonyms of <font color=\"FF0000\">"+curWord+": </font></p>");
                $("#chooseLangMsg").replaceWith(newLangMsg);
                $("#objectiveMsg").replaceWith($("<h3 id='objectiveMsg'><font color=\"FF0000\">"+curWord+"</font>--?--><font color=\"FF0000\">"+targetWord+"</font> using a chain of translations/synonyms?</h3>"));
            }else{
                onInstructions(insnWords);
            }
        } else {
            alert(selectWordMess);
        }
    }

    function onWin() {
        curScreen.fadeOut(function() {
            curScreen = $("#endContainer");
            $("#endMessage").text(winMess);
            curScreen.fadeIn();
        });
    }

    function forfeit() {
        curScreen.fadeOut(function() {
            curScreen = $("#endContainer");
            $("#endMessage").text(loseMess);
            curScreen.fadeIn();
        });
    }

    function onLanguageList(lvList) {
        for (var i=0; i<lvList.length; i++) {
            var langOption = $("<option>"+lvList[i]+"</option>");
            $("#selectSecondaryLang").append(langOption);
        }
    }
    
    function onInstructions(insnArr){
      if(language!="eng-000"){
       insnWords = insnArr;
       console.log("in onInstructions");
       insnsHaveBeenTranslated = true;
       for (var i=0; i<insnWords.length; i++) {
           console.log(insnWords[i]);
       }
       $("#currentLanguage").text(insnWords[0]+" "+insnWords[1]+": "+language);
       $("h4").text("PanLex "+insnWords[2]);
       $("h2").text(insnWords[0]+" "+insnWords[3]+":");
       $("#objectiveMsg").html("<h3>"+insnWords[12]+" "+insnWords[13]+" <font color=\"FF0000\">"+curWord+"</font> --?--> <font color=\"FF0000\">"+targetWord+"</font> "+insnWords[7]+" "+insnWords[6]+"?</h3>");
       $("#chooseLangMsg").html("<p id='chooseLangMsg'>"+insnWords[4]+" "+insnWords[1]+" -> PanLex "+insnWords[5]+" "+insnWords[6]+" "+insnWords[14]+" <font color=\"FF0000\">"+curWord+": </font></p>");
       $("#seeTrans").text(insnWords[5]+" "+insnWords[6]);
       $("#transSubmit").text(insnWords[4]);
       $("#loseButton").text(insnWords[8]);
       loseMess = insnWords[12]+" "+insnWords[10]+"!";
       winMess = insnWords[12]+" "+insnWords[9]+"!";
       selectWordMess = insnWords[4]+" "+insnWords[15];
       $("#resetButton").text(insnWords[11]);
     }else{
       loseMess = "You lose!";
       winMess = "You win!";
       selectWordMess = "Please select a word";

     }
    }
});
