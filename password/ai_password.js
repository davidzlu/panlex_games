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
  var clueTrans="Clue";
  var revealLetter = 0;
  var winMessage;
  var thankyou;
  var incorrectMess;
  var loseMessage;
  var luckMessage;
  var playingIn;
  var submitMess;
  var playAgain;
  var forfeitMess;
  var typeGuessMess;
  var moreClue;
  var langTrans;
  var langPrompt;
  var powerMess;
  var linkText;

  function getInstructions(){
      if(sourceLanguage=="eng-000"){
          playingIn="Your language: eng-000";
          $("p:last").text(playingIn);
      }else{
          panlex.query('/ex',{"uid":sourceLanguage,"trtt":"your",limit:1,include:"trq",sort:"trq desc"},function(err,data){
            data.result.forEach(function(trtt){
              playingIn = trtt.tt+" ";
              panlex.query('/ex',{"uid":sourceLanguage,"trtt":"language",limit:1,include:"trq",sort:"trq desc"},function(err,data){
                data.result.forEach(function(trtt){
                  langTrans = trtt.tt;
                  playingIn = playingIn+trtt.tt+": "+sourceLanguage;
                  $("p:last").text(playingIn);
                });
              });
            });
          });
      }
      if(sourceLanguage=="eng-000"){
          forfeitMess="Forfeit";
      }else{
          panlex.query('/ex',{"uid":sourceLanguage,"trtt":"give up",limit:1,include:"trq",sort:"trq desc"},function(err,data){
            data.result.forEach(function(trtt){
              forfeitMess = trtt.tt;
            });
          });
      }
      if(sourceLanguage=="eng-000"){
          typeGuessMess ="Type in a guess:";
      }else{
          panlex.query('/ex',{"uid":sourceLanguage,"trtt":"write",limit:1,include:"trq",sort:"trq desc"},function(err,data){
            data.result.forEach(function(trtt){
              typeGuessMess = trtt.tt+" ";
              panlex.query('/ex',{"uid":sourceLanguage,"trtt":"guess",limit:1,include:"trq",sort:"trq desc"},function(err,data){
                data.result.forEach(function(trtt){
                  typeGuessMess = typeGuessMess+trtt.tt+":";
                });
              });
            });
          });
      }
      if(sourceLanguage=="eng-000"){
          powerMess="Powered by PanLex";
          $("h4").text(powerMess);
      }else{
          panlex.query('/ex',{"uid":sourceLanguage,"trtt":"power",limit:1,include:"trq",sort:"trq desc"},function(err,data){
            data.result.forEach(function(trtt){
              powerMess = "PanLex "+trtt.tt;
              $("h4").text(powerMess);
            });
          });
      }

    instructions = "";
    if(sourceLanguage == "eng-000"){
      instructions = "every clue same meaning secret word.\nguess secret word?!";
      passwordTrans = "secret word";
      $("#title p").text(instructions);
      getWinExpr();
    }else{
      panlex.query('/ex',{"uid":sourceLanguage,"trtt":"every",limit:1,include:"trq",sort:"trq desc"},function(err,data){
          data.result.forEach(function(trtt){
              instructions = instructions + trtt.tt;
              panlex.query('/ex',{"uid":sourceLanguage,"trtt":"clue",limit:1,include:"trq",sort:"trq desc"},function(err,data){
                  data.result.forEach(function(trtt){
                      instructions = instructions + " " + trtt.tt;
                      clueTrans = trtt.tt;
                      panlex.query('/ex',{"uid":sourceLanguage,"trtt":"equal",limit:1,include:"trq",sort:"trq desc"},function(err,data){
                          data.result.forEach(function(trtt){
                              instructions = instructions + " " + trtt.tt;
                              panlex.query('/ex',{"uid":sourceLanguage,"trtt":"meaning",limit:1,include:"trq",sort:"trq desc"},function(err,data){
                                  data.result.forEach(function(trtt){
                                      instructions = instructions + " " + trtt.tt;
                                      	panlex.query('/ex',{"uid":sourceLanguage,"trtt":"unknown",limit:1,include:"trq",sort:"trq desc"},function(err,data){
                                          data.result.forEach(function(trtt){
                                              instructions = instructions + " " + trtt.tt;
                                              passwordTrans = trtt.tt;
                                              panlex.query('/ex',{"uid":sourceLanguage,"trtt":"word",limit:1,include:"trq",sort:"trq desc"},function(err,data){
                                                  data.result.forEach(function(trtt){
                                                      instructions = instructions + " " + trtt.tt;
                                                      passwordTrans = passwordTrans + " " + trtt.tt;
                                                      var undef = $("h2").text().search("loading...");
                                                      if(undef!=-1){
                                                        $("h2").text(passwordTrans+" : loading...");
                                                      }
                                                      panlex.query('/ex',{"uid":sourceLanguage,"trtt":"guess",limit:1,include:"trq",sort:"trq desc"},function(err,data){
                                                          data.result.forEach(function(trtt){
                                                              instructions = instructions + ".\n " + trtt.tt + " " + passwordTrans+ "?!";
                                                              $("#title p").text(instructions);
                                                              getWinExpr();
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
  }

  function getWinExpr(){
      if(sourceLanguage=="eng-000"){
          winMessage="Congratulations, you won!";
      }else{
          panlex.query('/ex',{"uid":sourceLanguage,"trtt":"congratulations",limit:1,include:"trq",sort:"trq desc"},function(err,data){
            data.result.forEach(function(trtt){
              winMessage = trtt.tt+", ";
              panlex.query('/ex',{"uid":sourceLanguage,"trtt":"win",limit:1,include:"trq",sort:"trq desc"},function(err,data){
                data.result.forEach(function(trtt){
                  winMessage = winMessage+trtt.tt+"!";
                });
              });   
            });
          });
      }
      if(sourceLanguage=="eng-000"){
          thankyou="Thank you for playing.";
      }else{
          panlex.query('/ex',{"uid":sourceLanguage,"trtt":"thank you",limit:1,include:"trq",sort:"trq desc"},function(err,data){
            data.result.forEach(function(trtt){
              thankyou = trtt.tt+".";
            });
          });
      }
      if(sourceLanguage=="eng-000"){
          incorrectMess="That's not the password, try again!";
      }else{
          //var counter=0;
          panlex.query('/ex',{"uid":sourceLanguage,"trtt":"no", limit:1,include:"trq",sort:"trq desc"},function(err,data){//,include:"trq",sort:"trq"},function(err,data){
            data.result.forEach(function(trtt){
             // if(counter=0){
              incorrectMess = trtt.tt+" "+passwordTrans+".";
              //}
             // counter = counter + 1;
            });
          });
      }
      if(sourceLanguage=="eng-000"){
          loseMessage="The password was ";
          luckMessage=". Better luck next time!";
      }else{
          panlex.query('/ex',{"uid":sourceLanguage,"trtt":"before",limit:1,include:"trq",sort:"trq desc"},function(err,data){
            data.result.forEach(function(trtt){
              loseMessage = trtt.tt+" "+passwordTrans+": ";
              panlex.query('/ex',{"uid":sourceLanguage,"trtt":"try",limit:1,include:"trq",sort:"trq desc"},function(err,data){
                data.result.forEach(function(trtt){
                  luckMessage = trtt.tt;
                  playAgain = trtt.tt;
                  panlex.query('/ex',{"uid":sourceLanguage,"trtt":"again",limit:1,include:"trq",sort:"trq desc"},function(err,data){
                      data.result.forEach(function(trtt){
                        luckMessage = luckMessage + " "+trtt.tt;
                        playAgain = playAgain+" "+trtt.tt;
                        panlex.query('/ex',{"uid":sourceLanguage,"trtt":"please",limit:1,include:"trq",sort:"trq desc"},function(err,data){
                          data.result.forEach(function(trtt){
                              luckMessage = luckMessage + " "+trtt.tt+"!";
                          });
                        });
                      });
                  });
                });
              });
            });
          });
      }
      if(sourceLanguage=="eng-000"){
          moreClue="get another clue";
      }else{
          panlex.query('/ex',{"uid":sourceLanguage,"trtt":"more",limit:1,include:"trq",sort:"trq desc"},function(err,data){
            data.result.forEach(function(trtt){
              moreClue = trtt.tt+" "+clueTrans;
            });
          });
      }
      if(sourceLanguage=="eng-000"){
          langPrompt="Choose language:";
          $("#languageSelect p").text(langPrompt);
      }else{
          panlex.query('/ex',{"uid":sourceLanguage,"trtt":"choose",limit:1,include:"trq",sort:"trq desc"},function(err,data){
            data.result.forEach(function(trtt){
              langPrompt = trtt.tt+" "+langTrans+":";
              $("#languageSelect p").text(langPrompt);
            });
          });
      }
      if(sourceLanguage=="eng-000"){
          linkText="PanLex Website";
          $("a").text(linkText);
      }else{
          panlex.query('/ex',{"uid":sourceLanguage,"trtt":"website",limit:1,include:"trq",sort:"trq desc"},function(err,data){            
            data.result.forEach(function(trtt){
              linkText = "PanLex "+trtt.tt;
              $("a").text(linkText);
            });
          });
      }

  }

  function getPassword(){
      panlex.query('/ex',{uid:sourceLanguage,offset:offset,limit:1},function(err,data){
          data.result.forEach(function (ex) {
              var wrd = ex.tt;
              if(wrd.indexOf(" ")==-1 && wrd.indexOf("\'"==-1)&&wrd.length<13){// && (new RegExp('[A-Z]')).test(wrd)==false){
                  getClue(wrd,ex.ex);
              }else{
                  offset = (offset + 1000)%249000;
                  getPassword();
              }
          });
      });
  }

  function getClue(wrd,password_id) {
    // Should retrieve clue from server
    clue = "";
    panlex.query('/ex',{"uid":sourceLanguage,"trex":password_id},function(err,data,password_id){
        var counter = 1;
        var len = data.result.length;
                if(len==0){
                    var count=230000;
                    offset = Math.floor(count*Math.random()+20000);
                    var stop = false;
                    getPassword();
                }
        data.result.forEach(function(trtt,password_id){
            if(counter==1){
                clue=trtt.tt;
            }else{
                clue=trtt.tt+", "+clue;
            }
                if(len==0){
                    var count=230000;
                    offset = Math.floor(count*Math.random()+20000);
                    var stop = false;
                    getPassword();
                }else{
                    if(counter==len){
                        $("h3").html("<h3>"+clueTrans+":</h3>");
                        $("h3").html($("h3").html()+"<font color = \"990000\">"+clue+", </font>");
                        password = wrd;
                        console.log("final password chosen");
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
    var submitButton = $('<button type="button" name="submit">OK ✓</button>');
    $('button[name=submitButton]').on("click", getUserGuess);
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
    $("#wait").remove();
    var waitScreen = $('<div>', { id: "wait"});
    var message, callback, newClueButton;
      message = $("<h3>"+incorrectMess+"</h3>");
      newClueButton = $("<button>"+moreClue+"</button>",{type:"button",name:"newClueButton"});
      callback = displayGuess;
      first=false;
      revealLetter = revealLetter + 1;
      var giveUp = $("<button>"+forfeitMess+"</button>", { type:"button", name:"giveUpButton"});
      giveUp.on("click",forfeited);
    waitScreen.append(message,newClueButton,giveUp);
    newClueButton.on("click", callback);
    return waitScreen;
  }
  function createGuessForm(isCallback) {
  /*creates and returns guessEntry object (for displaying clues and
    asking for user's guesses)*/
    $("winContainer").remove();
    var passText;
    var clueText;
        if(!isCallback){
            $("winContainer").remove();
            $("#guessEntry").remove();
            var guessEntry = $('<div>', { id: "guessEntry"});
            if(first){
                //These 4 lines necessary prep for calling getPassword()
                var count=230000;
                offset = Math.floor(count*Math.random()+20000);
                var stop = false;
                getPassword();
                passText =  $("<h2>"+passwordTrans+" loading...</h2>");
                clueText = $("<h3>"+clueTrans+": <font color = \"990000\">loading...</font></h3>");
            }else{
                passText =  $("<h2>"+passwordTrans+": "+star()+"</h2>");
                clueText = $("<h3>"+clueTrans+": <font color = \"990000\">"+clue+"</font></h3>");
            }
        }else{
            if(first){
                 $("h2").html(passwordTrans+": "+star());
                first=true;
            }
        }
    var title2 = $("<p>"+typeGuessMess+"</p>");
    var form = createFormElement("guessForm");
    var giveUp = $("<button>"+forfeitMess+"</button>", { type:"button", name:"giveUp"});
    giveUp.on("click",forfeited);
    guessEntry.append(passText, clueText, title2, form, giveUp);
    return guessEntry;
  }

  function createWinScreen() {
  /*composes winScreen object (to be displayed if user guesses password 
correctly)*/
    $("#winContainer").remove();
    $("#guessContainer").remove();
    $("#guessEntry").remove();
    var winScreen = $("<div>",{id:"winContainer"});
    first=true;
    var score = Math.ceil(((password.length - revealLetter)/password.length)*10);
    var message = $("<h2>"+winMessage+"</h2><h3>Your score: <font color= \"990000\">"+score+"</font> points out of 10</h2><p>"+thankyou+"</p>");
    var againButton = $("<button>"+playAgain+"</button>", { type:"button", name:"againButton"});
    winScreen.append(message, againButton);
    againButton.on("click", displayLanguages);
    return winScreen;
  }

  function createLoseScreen(){
  /*composes loseScreen object (to be displayed if user forfeits password)*/
    $("#loseContainer").remove();
    var loseScreen = $("<div>",{id:"loseContainer"});
    var message = $("<h2>"+loseMessage+"<font color=\"990000\">"+password+"</font>. "+luckMessage+"</h2>");
    var thank = $("<h4>"+thankyou+"</h4>");
    var againButton = $("<button>"+playAgain+"</button>", { type:"button", name:"againButton"});
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
      $("p").first().next().replaceWith(langPrompt);
      $('button[name=help]').on("click",function(){
          var win = window.open("https://new.panlex.org/wp-content/uploads/2016/08/langs.txt", '_blank');
      });
      curScreen.fadeIn();
      $("input:text:visible:first").focus();
    });
  }

  function getUserGuess(){
  /*gather input for user guesses*/
    guess = $("#guessEntry").children().last().prev().children().first().val();
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
          curScreen.append(createGuessForm(false)).fadeIn();
          $("input:text:visible:first").focus();
          break;
        case "guess":
          $('button[name=submitButton]').on("click", getUserGuess());
          if (guess == password) {
            curScreen = $("#win");
            curScreen.append(createWinScreen()).fadeIn();
          } else {
            curScreen = $("#matching");
            displayGuess();
          }
          break;
        case "feedback":
          curScreen = $("#lose")
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
  /*if enter key is pressed on the start screen, it is as though the start button
    has been pressed*/
  $(document).keypress(function(e){
    if(e.which == 13){
       if($("#start button").is(":visible")){
         $("#start button").focus().click();
       }else if($("input:text").is(":visible")){
         displayGuess();
       return false;
       }
    }
  });
  /*collects sourceLanguage from user input and sets footer language
message*/

  $("button[name=next]").mousedown(function(){
    sourceLanguage = $("#sourceLanguage").val();
    //$("p:last").text("Playing in "+sourceLanguage);
    getInstructions();
  });

  $("button[name=next]").on("mouseup", function(){
    if(sourceLanguage!=""){
        displayGuess();
        $("#helpButton").remove();
    }else{
        alert("Please enter a language!");
    }
  });
  $("#container").on("click", "button[name=submit]", displayGuess);
  $("#end:last-child").on("click", displayGuess);
});

