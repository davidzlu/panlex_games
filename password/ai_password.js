$(document).ready(function() {
  var panlex = require('panlex');
  var sourceLanguage = "default language"; // Assigned by user input
  var curScreen = $("#start");
  var role = "guess";
  var password;
  var password_id;
  var guess = "default guess";
  var input;
  var clue;
  var first = true;
  var instructions = "";
  var passwordTrans;
  var clueTrans;
  var revealLetter = 0;

  function getInstructions(){
      panlex.query('/ex',{"uid":sourceLanguage,"trtt":"every",limit:1},function(err,data){
          data.result.forEach(function(trtt){
              instructions = instructions + trtt.tt;
              panlex.query('/ex',{"uid":sourceLanguage,"trtt":"clue",limit:1},function(err,data){
                  data.result.forEach(function(trtt){
                      instructions = instructions + " " + trtt.tt;
                      clueTrans = trtt.tt;
                      panlex.query('/ex',{"uid":sourceLanguage,"trtt":"same",limit:1},function(err,data){
                          data.result.forEach(function(trtt){
                              instructions = instructions + " " + trtt.tt;
                              panlex.query('/ex',{"uid":sourceLanguage,"trtt":"meaning",limit:1},function(err,data){
                                  data.result.forEach(function(trtt){
                                      instructions = instructions + " " + trtt.tt;
                                      panlex.query('/ex',{"uid":sourceLanguage,"trtt":"secret",limit:1},function(err,data){
                                          data.result.forEach(function(trtt){
                                              instructions = instructions + " " + trtt.tt;
                                              passwordTrans = trtt.tt;
                                              panlex.query('/ex',{"uid":sourceLanguage,"trtt":"word",limit:1},function(err,data){
                                                  data.result.forEach(function(trtt){
                                                      instructions = instructions + " " + trtt.tt;
                                                      passwordTrans = passwordTrans + " " + trtt.tt;
                                                      panlex.query('/ex',{"uid":sourceLanguage,"trtt":"guess",limit:1},function(err,data){
                                                          data.result.forEach(function(trtt){
                                                              instructions = instructions + ".\n " + trtt.tt + " " + passwordTrans+ "?!";
                                                              console.log("instructions: "+instructions+" passwordTrans: "+passwordTrans);
                                                          });
                                                      });
                                                  });
                                              });
                                          });
                                      });
                                  });
                              });
                          });
                      });
                  });
              });
          });
      });
  }

  function getPassword(){
      console.log("while loop entered");
      panlex.query('/ex',{uid:sourceLanguage,offset:offset,limit:1},function(err,data){
          console.log("queried!");
          data.result.forEach(function (ex) {
              var wrd = ex.tt;
              console.log(offset+": "+wrd);
              if(wrd.indexOf(" ")==-1 && wrd.indexOf("\'"==-1)&&wrd.length<13){// && (new RegExp('[A-Z]')).test(wrd)==false){
                  console.log("about to call getClue");
                  getClue(wrd,ex.ex);
              }else{
                  //console.log("doesn't meet criteria");
                  offset = (offset + 1000)%249000;
                  getPassword();
              }
          });
      });
  }

  function getClue(wrd,password_id) {
    // Should retrieve clue from server
    console.log("behaving as though first=true, actually first="+first);
    clue = "";
    console.log("password_id: "+password_id);
    panlex.query('/ex',{"uid":sourceLanguage,"trex":password_id},function(err,data,password_id){
        var counter = 1;
        var len = data.result.length;
        console.log("len: "+len);
                if(len==0){
                    console.log("found no clues");// for "+toString(password_id)", calling getPassword() again");
                    var count=230000;
                    offset = Math.floor(count*Math.random()+20000);
                    console.log(offset);
                    var stop = false;
                    getPassword();
                }
        data.result.forEach(function(trtt,password_id){
            console.log("trtt: "+trtt.tt);
            clue=trtt.tt+", "+clue;
                if(len==0){
                    console.log("found no clues");// for "+toString(password_id)", calling getPassword() again");
                    var count=230000;
                    offset = Math.floor(count*Math.random()+20000);
                    console.log(offset);
                    var stop = false;
                    getPassword();
                }else{
                    if(counter==len){
                        console.log("approved because clue = "+clue);
                        console.log("data: "+JSON.stringify(data, null, 4));
                        $("h3").html("<h3>Clue:</h3>");
                        //first=false;
                        $("h3").html($("h3").html()+"<font color = \"990000\">"+clue+", </font>");
                        console.log("just approved: "+wrd);
                        password = wrd;
                        console.log("final password: "+password);
                        stop=true;
                        first=true;
                        createGuessForm(true);
                    }
                }
            counter = counter + 1;
        });
    });
  }
  function star(){
    var starized = "";
    console.log("trying to starize "+password);
    if(password!=null){
        for(var j = 0; j < revealLetter; j++){
            starized = starized + password[j];
        }
        for(var i = revealLetter; i < password.length; i++){
          starized = starized + "*";
        }
    }else{
        starized="loading...";
    }
    return starized;
  }

  function createFormElement(inputName, formAction) {
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
    return form;
  }

  function forfeited(){
  /*callback that is executed after user clicks the forfeit button from
    the guessEntry or wait screen*/
      first=true;
      curScreen.fadeOut(function(){
          curScreen = $("#feedback");
          displayGuess();
      });
  }
  function createWaitScreen() {
  /*creates screen to be displayed when user submits incorrect guess*/
    console.log("in createWaitScreen()");
    $("#wait").remove();
    var waitScreen = $('<div>', { id: "wait"});
    var message, callback, newClueButton;
      message = $("<h3>That's not the password, try again!</h3>");
      newClueButton = $("<button>Get another clue</button>",{type:"button",name:"newClueButton"});
      callback = displayGuess;
      first=false;
      revealLetter = revealLetter + 1;
      var giveUp = $("<button>Forfeit this password</button>", { type:"button", name:"giveUpButton"});
      giveUp.on("click",forfeited);
    waitScreen.append(message,newClueButton,giveUp);
    newClueButton.on("click", callback);
    return waitScreen;
  }
  function createGuessForm(isCallback) {
  /*creates and returns guessEntry object (for displaying clues and
    asking for user's guesses)*/
    console.log("in createGuessForm() with first="+first+", isCallback="+isCallback);
    $("winContainer").remove();
    var passText;
    var clueText;
    //console.log("about to call getClue with first="+first);
        if(!isCallback){
            $("winContainer").remove();
            $("#guessEntry").remove();
            var guessEntry = $('<div>', { id: "guessEntry"});
            if(first){
                //These 4 lines necessary prep for calling getPassword()
                var count=230000;
                offset = Math.floor(count*Math.random()+20000);
                console.log(offset);
                var stop = false;
                getPassword();//function(){
                console.log("after calling getPassword");
                passText =  $("<h2>Password: loading...</h2>");
                clueText = $("<h3>Clue: <font color = \"990000\">loading...</font></h3>");
            }else{
                passText =  $("<h2>Password: "+star()+"</h2>");
                clueText = $("<h3>Clue: <font color = \"990000\">"+clue+"</font></h3>");
            }
        }else{
            if(first){
                 $("h2").html("Password: "+star());
                first=true;
                //getClue(function(){
                  //  console.log(clue);
                    //clueText = clue;
                //});
            }
        }
    var title2 = $("<p>Type in a guess:</p>");
    var form = createFormElement("guessForm");
    var giveUp = $("<button>Forfeit this password</button>", { type:"button", name:"giveUp"});
    giveUp.on("click",forfeited);
    guessEntry.append(passText, clueText, title2, form, giveUp);
    return guessEntry;
  }

  function createWinScreen() {
  /*composes winScreen object (to be displayed if user guesses password 
correctly)*/
    console.log("in createWinScreen()");
    $("#winContainer").remove();
    $("#guessContainer").remove();
    $("#guessEntry").remove();
    var winScreen = $("<div>",{id:"winContainer"});
    first=true;
    var score = Math.ceil(((password.length - revealLetter)/password.length)*10);
    console.log((password.length - revealLetter)/password.length);
    var message = $("<h2>Congratulations, you won!</h2><h3>Your score: <font color= \"990000\">"+score+"</font> points out of 10</h2><p>Thank you for playing.</p>");
    var againButton = $("<button>Play Again!</button>", { type:"button", name:"againButton"});
    winScreen.append(message, againButton);
    againButton.on("click", displayLanguages);
    return winScreen;
  }

  function createLoseScreen(){
  /*composes loseScreen object (to be displayed if user forfeits password)*/
    console.log("in createLoseScreen()");
    $("#loseContainer").remove();
    var loseScreen = $("<div>",{id:"loseContainer"});
    var message = $("<h2>The password was <font color=\"990000\">"+password+"</font>. Better luck next time!</h2>");
    var thank = $("<h4>Thank you for playing.</h4>");
    var againButton = $("<button>Play Again!</button>", { type:"button", name:"againButton"});
    loseScreen.append(message, thank, againButton);
    againButton.on("click", displayLanguages);
    return loseScreen;
  }
  function displayLanguages() {
    /* Handles transition from start screen to language input screen. */
    curScreen.fadeOut(function() {
      first=true;
      revealLetter = 0;
      curScreen = $("#languages");
      curScreen.fadeIn();
      $("input:text:visible:first").focus();
    });
  }

  function getUserGuess(){
  /*gather input for user guesses*/
    //console.log("trying to set guess from user input");
    guess = $("#guessEntry").children().last().prev().children().first().val();
    //console.log("guess: "+guess);
  }

  function displayGuess() {
  /*Main function for managing the html contents of the page*/
    curScreen.fadeOut(function() {
      switch (curScreen.attr("id")) {
        case "matching":
          curScreen = $("#waiting");
          curScreen.append(createWaitScreen()).fadeIn();
          break;
        case "waiting":
          curScreen = $("#guess");
          $("guesserContainer").remove();
          console.log("about to creatGuessForm()");
          curScreen.append(createGuessForm(false)).fadeIn();
          $("input:text:visible:first").focus();
          break;
        case "guess":
          console.log("before: "+guess);
          $('button[name=submitButton]').on("click", getUserGuess());
          console.log("after: "+guess);
          if (guess == password) {
            curScreen = $("#win");
            console.log("WIN! calling createWinScreen");
            curScreen.append(createWinScreen()).fadeIn();
          } else {
            curScreen = $("#matching");
            displayGuess();
          }
          break;
        case "feedback":
          curScreen = $("#lose")
          console.log("in feedback case");
          curScreen.append(createLoseScreen()).fadeIn();
          break;
        default:
          curScreen = $("#waiting");
          guess = "hello"
          displayGuess();
      }
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

  $("#start button").on("click", displayLanguages);
  /*if enter key is pressed on the start screen, it is as though the start 
button
    has been pressed*/
  $(document).keypress(function(e){
    if(e.which == 13){
       if($("#start button").is(":visible")){
         console.log("start button visible!");
         $("#start button").focus().click();
       }else if($("input:text").is(":visible")){
         console.log("input text visible!");
         displayGuess();
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
    getInstructions();
  });

  $("#languages button").on("mouseup", function(){
    if(sourceLanguage!=""){
        displayGuess();
    }else{
        alert("Please enter a language!");
    }
  });
  $("#container").on("click", "button[name=submit]", displayGuess);
  $("#end:last-child").on("click", displayGuess);
});


