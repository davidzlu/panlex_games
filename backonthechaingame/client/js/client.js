var socket = io.connect("http://127.0.0.1:8000");

$(document).ready(function(){
    
    var curScreen = $("#firstContainer");
    $("#secondContainer").hide();
    $("p").text("This text was changed using client.js");
    var language;

   /*When the button on the first screen is clicked, send language 
     selection to server and show second screen*/
    $("button[name=next]").on("click",function(){
        console.log("button clicked");
        language = $("#selectLanguage").val();
        socket.emit('languageSubmit',language);   //send user-selected language to server for verification
        socket.on("languageFail",function(msg,err){ 
            console.log(msg);
            alert(msg);     //bring up alert box telling the user that the language they entered is invalid
        });
        socket.on("languageSuccess",showMain);
    });

    /*Called when user-selected language is in database*/
    function showMain(msg,err){
        curScreen.fadeOut(function(){
            curScreen = $("#secondContainer");
            socket.emit("askWords",language);   //asks server to send two random words in user-selected language
            curScreen.fadeIn();
            $('#currentLanguage').text(msg);    //adds message to footer indicating the user-selected language
            socket.on("sendWords", function(word1,word2){  //sendWords event is how server sends the two words
                console.log("received "+word1+" and "+word2);
                curScreen.append("<h3>Can you get from <font color=\"FF0000\">"+word1+"</font> to <font color=\"FF0000\">"+word2+"</font> using a chain of translations/synonyms?</h3>");
                curScreen.append("Choose a language in which to list PanLex's translations/synonyms of <font color=\"FF0000\">"+word1+"</font>: <br>");

                //append an text input box and button
                curScreen.append($("<input>", {type:"text", id:"selectSecondaryLang", value:"eng-000"}));
                var translationButton = $("<button>",{ type:"button", name:"seeTrans",text:"Show translations"});
                translationButton.on("click",function(){
                   console.log("translation button clicked, asking server for translations");
                   socket.emit("askTrans",$("#selectSecondaryLang").val(),word1);  //asks server for a translation of word1
                });
                curScreen.append(translationButton);
            });
        });
    }

    /*Socket event handling*/
    socket.on('connect', (socket) => {
        console.log("connected!");
    });
    socket.on("singleTrans", function(word){
        console.log(word);
        curScreen.append("<br>"+word);
    });
    socket.on('msg', function(msg,err){
        if(err){
            console.log(err);
        }
        console.log(msg);
    });
});
