$(document).ready(function() {
  var panlex = require('panlex');
  var sourceLanguage = "default language"; // Assigned by user input
  var curScreen = $("#start");
  var password;
  var password_id;
  var guess = "default guess";
  var input;
  var clue;
  var first = true;

  function getPassword(){
    // Should retrieve password from server
    var count=230000;
    offset = Math.floor(count*Math.random()+20000);
    console.log(offset);
    var stop = false;
    panlex.query('/ex',{uid:'eng-000',offset:offset,limit:30},function(err,data){
	data.result.forEach(function (ex) {
            var wrd = ex.tt;
            if(wrd.indexOf(" ")==-1 && wrd.indexOf("\'"==-1)&&stop==false&&wrd.length<8){
              if((new RegExp('[A-Z]')).test(wrd)==false){
                console.log("just approved: "+wrd);                        
                if(stop==false){
                    password = wrd;
                    password_id = ex.ex;
                    console.log("final password: "+password);
                    stop=true;
                    console.log("stop set to "+stop);
                    curScreen = $("#waiting");
                    displayGuess();
                }
              }
            }
        });
    });
  }

  function getClue(password,first) {
    // Should retrieve clue from server
    if(first){
      clue = "";
      console.log("password_id: "+password_id);
      panlex.query('/ex',{"uid":"eng-000","trex":password_id},function(err,data){
          console.log("data: "+JSON.stringify(data, null, 4));
          $("h3").html("<h3>Clue:</h3>");
          data.result.forEach(function(trtt){
              console.log("trtt: "+trtt.tt);
              clue=clue+", "+ trtt.tt;
              $("h3").html($("h3").html()+"<font color = \"990000\">"+trtt.tt+", </font>");
          });
      });
    }
  }

  function star(){
    var starized = "";
    starized = starized + password[0];
    for(var i = 1; i < password.length; i++){
      starized = starized + "*";
    }
    return starized;
  }

  function createFormElement(inputName, formAction="") {
    /* Helper function for createQuestionElement. Creates an HTML form
       element that accepts text input. */
    var form = $('<form>', { name: "userInput",
      action: formAction,
      method: "post"});
    input = $('<input>', {type: "text", name: inputName});
    var submitButton = $('<button type="button" name="submit">Submit</button>');
    $('button[name=submitButton]').on("click", getUserGuess());
    $(':text').focus();
    form.append(input, '<br><br>', submitButton);
    return form
  }

  function feedback(){
      var oldPass = password;
      $("#guess").remove();
      curScreen = $("#lose");
      curScreen.append(createLoseScreen(oldPass)).fadeIn();
      createLoseScreen(oldPass);
  }

  function createWaitScreen() {
    console.log("in createWaitScreen()");
    $("#wait").remove();
    var waitScreen = $('<div>', { id: "wait"});
    first=false;
    var message, callback, newClueButton;
    message = $("<h3>That's not the password, try again!</h3>");
    newClueButton = $("<button>Get another clue</button>",{type:"button",name:"newClueButton"});
    newClueButton.on("click", displayGuess);
    var giveUp = $("<button>Forfeit this password</button>", { type:"button", name:"giveUp"});
    giveUp.on("click",feedback);
    waitScreen.append(message,newClueButton,giveUp);
    return waitScreen;
  }

  function createGuessForm(first) {
    if(first){
    $("#guessContainer").remove();
    $("#languages").remove();
    var guessEntry = $('<div>', { id: "guessEntry"});
    //getClue(password,first,function(){
        //clueText = clue;
    //});
    var title1 = $("<h2>Password: "+star()+"</h2>");
    var clueText = $("<h3>Clue: <font color = \"990000\">loading...</font></h3>");
    getClue(password,first,function(){
        clueText = clue;
    });
    var title2 = $("<p>Type in a guess:</p>");
    var form = createFormElement("guessForm");
    var giveUp = $("<button>Forfeit this password</button>", { type:"button", name:"giveUp"});
    giveUp.on("click",feedback);
    guessEntry.append(title1, clueText, title2, form, giveUp);
    return guessEntry;
    }
  }

  function createWinScreen() {
    console.log("in createWinScreen()");
    $("winContainer").remove();
    first = true;
    var winScreen = $("<div>",{id:"winContainer"});//, { id: "swapContainer"});
    var message = $("<h2>Congratulations, you won!</h2><p>Thank you for playing.</p>");
    var againButton = $("<button>Play Again!</button>", { type:"button", name:"againButton"});
    winScreen.append(message, againButton);
    againButton.on("click", function(){
       console.log("in againButton callback");
       //curScreen=$("#start");
       curScreen.fadeOut(function(){
           console.log("in fadeout callback");
           console.log("curscreen1: "+JSON.stringify(curScreen));
           curScreen=$("#start");
           console.log("curscreen1: "+JSON.stringify(curScreen));
           displayLanguages();
           //curScreen.append().fadeIn();
       });
       //displayLanguages();
    });
    return winScreen;
  }

  function createLoseScreen(oldPass) {
    console.log("in createLoseScreen()");
    $("loseContainer").remove();
    var loseScreen = $("<div>",{id:"loseContainer"});//, { id: "swapContainer"});
    var message = $("<h2>The password was <font color = \"990000\">"+oldPass+"</font>. Better luck next time!</h2><p>Thank you for playing.</p>");
    var againButton = $("<button>Play Again!</button>", { type:"button", name:"againButton"});
    loseScreen.append(message, againButton);
    againButton.on("click", displayLanguages);
    return loseScreen;
  }


  function displayLanguages() {
    /* Handles transition from start/win/lose screens to language input screen. */
    console.log("in displayLanguages()");
    console.log("first1: "+first);
    first = true;
    console.log("first2: "+first);
    console.log("curscreen1: "+JSON.stringify(curScreen));
    $("winContainer").remove();
    curScreen.fadeOut(function() {
      curScreen = $("#languages");
      console.log("curscreen2: "+JSON.stringify(curScreen));
      //curScreen = $("<div>",{id:"languages"});
      curScreen.append('<p>Matching...</p>');
      curScreen.fadeIn();
      console.log("languages screen should have faded in");
      $("input:text:visible:first").focus(); //put curser in text input box
    });
  }

  function getUserGuess(){ 
    console.log("trying to set guess from user input");
    guess = input.val();//$("#inputName").val();
  }


  function displayGuess() {
    curScreen.fadeOut(function() {
      switch (curScreen.attr("id")) {
        case "matching":
          curScreen = $("#waiting");
          curScreen.append(createWaitScreen()).fadeIn();
          break;
        case "waiting":
          curScreen = $("#guess");
          getClue();
          curScreen.append(createGuessForm(first)).fadeIn();
          $("input:text:visible:first").focus();
          break;
        case "guess":
          $('button[name=submitButton]').on("click", getUserGuess());
          console.log("after: "+guess);
          if (guess == password) {
            curScreen = $("#win");         
            curScreen.append(createWinScreen()).fadeIn();
          }else{
            curScreen = $("#matching");
            displayGuess();
          }
          break;
        //case "start":
          //console.log("in start case of displayGuess");
          //$("#start").remove();
          //var startScreen = $('<div>', { id: "start"});
          //var languageButton;
          //message = $("<h3>That's not the password, try again!</h3>");
          //languageButton = $("<button>Get another lang</button>",{type:"button",name:"languageButton"});
          //languageButton.on("click", displayLanguages);
          //startScreen.append(message,languageButton);
          //break;
        default:
          curScreen = $("#waiting");
          guess = "hello"
          displayGuess();
      }
    });
  }

  function displayMatching() {
    curScreen.fadeOut(function() {
      curScreen = $("#matching");
      curScreen.append('<p>Matching...</p>');
      $('p').on("click", displayGuess);
      curScreen.fadeIn();
    });
  }

  function setLang(){
    sourceLanguage = $("#sourceLanguage").val();
    $("p:last").text("Playing in "+sourceLanguage);
        //getPassword();
    if(sourceLanguage!=""){
       displayGuess();
    }else{
       alert("Please enter a language!");
    }
    getPassword();
  }

  $("#start button").on("click", displayLanguages);
  /*if enter key is pressed on the start screen, it is as though the start button
    has been pressed*/
  $(document).keypress(function(e){
    if(e.which == 13){
       if($("#start button").is(":visible")){
         console.log("start button visible!");         
         $("#start button").focus().click();
       }else if($("input:text").is(":visible")){
         console.log("input text visible!");
         displayGuess();
       }else{
         console.log("neither visible!");
       }
       return false;
    }
  });

  /*collects sourceLanguage from user input and sets footer language message*/
  $("#languages button").mousedown(function(){
    sourceLanguage = $("#sourceLanguage").val();
    $("p:last").text("Playing in "+sourceLanguage);
  });

  $("#languages button").on("mouseup", function(){
    getPassword(function(){
        console.log("entered getPassword's callback");
        if(sourceLanguage!=""){
           curScreen = $("#matching");
           //displayGuess();
        }else{
           alert("Please enter a language!");
        }
    });
  });
  $("#container").on("click", "button[name=submit]", displayGuess);
  $("#end:last-child").on("click", displayGuess);
});
