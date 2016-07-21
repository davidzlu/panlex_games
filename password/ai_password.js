$(document).ready(function() {
  var panlex = require('panlex');
  var sourceLanguage = "default language"; // Assigned by user input
  var curScreen = $("#start");
  var role = "guess";
  var passwords = ["cat","light","hi"];
  var password;
  var password_id;
  var catClues = ["feline","whiskers"];
  var lightClues = ["bright","day"];
  var hiClues = ["greeting","wave"]
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
    //var password;
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
                    first=true;
                    displayPlayScreen();
                }
              }
            }
        });
    });
  }

  function getClue() {
    // Should retrieve clue from server
    console.log("behaving as though first=true, actually first="+first);
    clue = "";
    console.log("password_id: "+password_id);
    panlex.query('/ex',{"uid":"eng-000","trex":password_id},function(err,data){
        console.log("data: "+JSON.stringify(data, null, 4));
        $("h3").html("<h3>Clue:</h3>");
        first=false;
        data.result.forEach(function(trtt){
            console.log("trtt: "+trtt.tt);
            clue=clue+", "+ trtt.tt;
            $("h3").html($("h3").html()+"<font color = \"990000\">"+trtt.tt+", </font>");
        });
    });
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

  function forfeited(){
        first=true;
        getPassword();
        //var oldPass = password;
        //do{
          //password = passwords[Math.floor(Math.random()*3)];
        //}while(oldPass==password);
        curScreen = $("#waiting");
        displayGuess()
  }
  function createWaitScreen() {
    console.log("in createWaitScreen()");
    $("#wait").remove();
    var waitScreen = $('<div>', { id: "wait"});
    var message, callback, newClueButton;
      message = $("<h3>That's not the password, try again!</h3>");
      newClueButton = $("<button>Get another clue</button>",{type:"button",name:"newClueButton"});
      callback = displayGuess;
      var giveUp = $("<button>Forfeit this password</button>", { type:"button", name:"giveUp"});
      giveUp.on("click",forfeited);
    waitScreen.append(message,newClueButton,giveUp);
    newClueButton.on("click", callback);
    return waitScreen;
  }

  function createGuessForm() {
    console.log("in createGuessForm()");
    $("#guessEntry").remove();
    var guessEntry = $('<div>', { id: "guessEntry"});
    var clueText;
    console.log("about to call getClue with first="+first);
    if(first){
        getClue(function(){
            console.log(clue);
            clueText = clue;
        });
        clueText = $("<h3>Clue: <font color = \"990000\">loading...</font></h3>");
    }else{
        clueText= $("<h3>Clue: <font color = \"990000\">"+clue+"</font></h3>");

    }
    var title1 = $("<h2>Password: "+star()+"</h2>");
    var title2 = $("<p>Type in a guess:</p>");
    var form = createFormElement("guessForm");
    var giveUp = $("<button>Forfeit this password</button>", { type:"button", name:"giveUp"});
    giveUp.on("click",forfeited);
    guessEntry.append(title1, clueText, title2, form, giveUp);
    return guessEntry;
  }

  function createWinScreen() {
    console.log("in createWinScreen()");
    $("#winContainer").remove();
    var winScreen = $("<div>",{id:"winContainer"});//, { id: "swapContainer"});
    var message = $("<h2>Congratulations, you won!</h2><p>Thank you for playing.</p>");
    var againButton = $("<button>Play Again!</button>", { type:"button", name:"againButton"});
    winScreen.append(message, againButton);
    againButton.on("click", displayLanguages);
    return winScreen;
  }

  function displayLanguages() {
    /* Handles transition from start screen to language input screen. */
    curScreen.fadeOut(function() {
      curScreen = $("#languages");
      curScreen.fadeIn();
      $("input:text:visible:first").focus();
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
          console.log("about to creatGuessForm()");
          curScreen.append(createGuessForm()).fadeIn();
          $("input:text:visible:first").focus();
          break;
        case "guess":        
          console.log("before: "+guess);
          $('button[name=submitButton]').on("click", getUserGuess());
          console.log("after: "+guess);
          if (guess == password) {
            curScreen = $("#win");         
            curScreen.append(createWinScreen()).fadeIn();
          } else {
            curScreen = $("#matching");
            displayGuess();
          }
          break;
        default:
          curScreen = $("#waiting");
          guess = "hello"
          displayGuess();
      }
    });
  }

  function displayPlayScreen() {
    // Manages selection b/t displayPassword and displayGuess
    if (role == "password") {
      displayPassword();
    } else if (role == "guess") {
      displayGuess();
    }
  }

  function displayMatching() {
    curScreen.fadeOut(function() {
      curScreen = $("#matching");
      curScreen.append('<p>Matching...</p>');
      $('p').on("click", displayPlayScreen);
      curScreen.fadeIn();
    });
  }

  function displayEnd() {
    /* Handles transition from translation data input to end screen. */
    curScreen.fadeOut(function() {
      // Send data to server
      curScreen = $("#end");
      curScreen.fadeIn();
    });
  }

  function setLang(){
    sourceLanguage = $("#sourceLanguage").val();
    $("p:last").text("Playing in "+sourceLanguage);
        //getPassword();
    if(sourceLanguage!=""){
       displayPlayScreen();
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
         //setLang();
         displayPlayScreen();
         //curScreen.submit();
         //$("#button[name=next]").focus().click();
       }else{
         console.log("neither visible!");
       }
       return false;
    }
  });

  /*collects sourceLanguage from user input and sets footer language 
message*/
  
  $("#languages button").mousedown(function(){
    sourceLanguage = $("#sourceLanguage").val();
    $("p:last").text("Playing in "+sourceLanguage);
  });

  $("#languages button").on("mouseup", function(){
    getPassword(function(){
        console.log("entered getPassword's callback");
        if(sourceLanguage!=""){
           displayPlayScreen();
        }else{
           alert("Please enter a language!");
        }
    });
  });//displayPlayScreen);
  $("#container").on("click", "button[name=submit]", displayPlayScreen);
  $("#end:last-child").on("click", displayPlayScreen);
});
