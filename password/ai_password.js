$(document).ready(function() {
  
  var sourceLanguage = "default language"; // Assigned by user input
  var curScreen = $("#start");
  var role = "guess";
  var passwords = ["cat","sun","hello"];
  var password = passwords[Math.floor(Math.random()*3)];
  var catClues = ["feline","whiskers"];
  var sunClues = ["bright","day"];
  var helloClues = ["greeting","wave"]
  var guess = "default guess";
  var input;

  function getGuess() {
    // Should retrieve guess from server
    return guess;
  }

  function getClue(password) {
    // Should retrieve clue from server
    var index;
    if(Math.random()>0.5){
      index = 1;
    }else{
      index = 0;
    }
    switch (password){
      case "cat":
        return catClues[index];
      case "sun":
        return sunClues[index];
      case "hello":
        return helloClues[index];
      default:
        return "none";
    }
  }

  function createFormElement(inputName, formAction="") {
    /* Helper function for createQuestionElement. Creates an HTML form
       element that accepts text input. */
    var form = $('<form>', { name: "userInput",
      action: formAction,
      method: "post"});
    input = $('<input>', {type: "text", name: inputName});
    var submitButton = $('<button type="button" name="submit">Submit</button>');
    //$('button[name=submitButton]').on("click", getUserGuess());

    form.append(input, '<br><br>', submitButton);
    return form
  }

  function createPasswordForm() {
    
    var passElem = $("<div>", { id: "passEntry"});
    var passFormTitle = $("<h2>Enter a password</h2>");
    var passForm = createFormElement("password");
    passElem.append(passFormTitle, passForm);
    return passElem;
  }

  function createClueForm() {
    var clueElem = $('<div>', { id: "clueEntry"});
    var clueFormTitle = $("<h2>Enter a clue</h2>");
    var clueForm = createFormElement("clue");
    clueElem.append(clueFormTitle, clueForm);
    return clueElem;
  }

  function createWaitScreen() {
    console.log("in createWaitScreen()");
    $("#wait").remove();
    var waitScreen = $('<div>', { id: "wait"});
    var message, callback, newClueButton;
    if (role == "password") {
      message = $("<p>Waiting for guess...</p>");
      callback = displayPassword;
    } else if (role == "guess") {
      message = $("<h3>That's not the password, try again!</h3>");
      newClueButton = $("<button>Get another clue</button>",{type:"button",name:"newClueButton"});
      callback = displayGuess;
    }
    waitScreen.append(message,newClueButton);
    newClueButton.on("click", callback);
    return waitScreen;
  }

  function createGuessForm() {
    $("#guessEntry").remove();
    var guessEntry = $('<div>', { id: "guessEntry"});
    var title = $("<h2>Type in a guess</h2>");
    var clue = $("<p>Clue: " + getClue(password) + "</p>");
    var form = createFormElement("guessForm");
    guessEntry.append(title, clue, form);
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
    //console.log("message: "+message.text());
    return winScreen;
  }


  function createSwapScreen() {
    console.log("in createSwapScreen()");
    $("#swapContainer").remove();
    var swapScreen = $("<div>", { id: "swapContainer"});
    var message = $("<p>Switching roles...</p>");
    var swapButton = $("<button>Switch</button>", { type:"button", name:"swapButton"});
    if (role == "password") {
      role = "guess";
    } else if (role == "guess") {
      role = "password";
    }
    swapScreen.append(message, swapButton);
    swapButton.on("click", displayPlayScreen);
    return swapScreen;
  }

  function displayPassword() {
    curScreen.fadeOut(function() {
      switch (curScreen.attr("id")) {
        case "matching":
          curScreen = $("#password");
          curScreen.append(createPasswordForm()).fadeIn();
          break;
        case "password":
          if (password == null) {
            password = $('form[name=userInput] input')[0].value;
          }
          curScreen = $("#clue");
          $('#password').empty();
          var endButton = $('<button type="button" name="endButton">End Round</button>');
          curScreen.append(createClueForm(), endButton).fadeIn();
          $('button[name=endButton]').on("click", function() {
            if(guess = password){
               //do something really obvious
            }
            displayPassword();
          });
          break;
        case "clue":
          curScreen = $("#waiting");
          $('#clue').empty();
          curScreen.append(createWaitScreen(), endButton).fadeIn();
          break;
        case "waiting":
          if (guess == password) {
            curScreen = $("#swap");
            curScreen.append(createSwapScreen()).fadeIn();
          } else {
            curScreen = $("#password");
            displayPassword();
          }
          break;
        default:
          curScreen = $("#matching");
          guess = "defaultGuess"
          displayPassword();
      }
    });
  }

  function displayLanguages() {
    /* Handles transition from start screen to language input screen. */
    curScreen.fadeOut(function() {
      curScreen = $("#languages");
      curScreen.fadeIn();
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
          $("button[name=endButton]").remove();
          var endButton = $('<button type="button" name="endButton">End Round</button>');
          curScreen.append(createGuessForm()).fadeIn();//, endButton).fadeIn();
          //$('button[name=endButton]').on("click", function() {
          //  guess = password;
          //  displayGuess();
          //});
          break;
        case "guess":        
          console.log("before: "+guess);
          $('button[name=submitButton]').on("click", getUserGuess());
          console.log("after: "+guess);
          if (guess == password) {
            curScreen = $("#win");//swap");         
            curScreen.append(createWinScreen()).fadeIn();//createSwapScreen()).fadeIn();
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

  $("#start button").on("click", displayLanguages);
  /*if enter key is pressed on the start screen, it is as though the start button
    has been pressed*/
  $(document).keypress(function(e){
    if(e.which == 13){
       if($("#start button").is(":visible")){
         $("#start button").focus().click();
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
    if(sourceLanguage!=""){
       displayPlayScreen();
    }else{
       alert("Please enter a language!");
    }
  });//displayPlayScreen);
  $("#container").on("click", "button[name=submit]", displayPlayScreen);
  $("#end:last-child").on("click", displayPlayScreen);
});


