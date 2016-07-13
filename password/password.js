$(document).ready(function() {
  
  var sourceLanguage = "default language"; // Assigned by user input
  var curScreen = $("#start");
  var role = "password";
  var password = null;
  var guess = "hello";

  function getGuess() {
    // Should retrieve guess from server
    return guess;
  }

  function getClue() {
    // Should retrieve clue from server
    return "none";
  }

  function createFormElement(inputName, formAction="") {
    /* Helper function for createQuestionElement. Creates an HTML form
       element that accepts text input. */
    var form = $('<form>', { name: "userInput",
      action: formAction,
      method: "post"});
    var input = $('<input>', {type: "text", name: inputName});
    var submitButton = $('<button type="button" name="submit">Submit</button>');
    form.append(input, '<br/>', submitButton);
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
    $("#wait").remove();
    var waitScreen = $('<div>', { id: "wait"});
    var message, callback;
    if (role == "password") {
      message = $("<p>Waiting for guess...</p>");//<p>Playing in " + sourceLanguage + "</p>");
      callback = displayPassword;
    } else if (role == "guess") {
      message = $("<p>Waiting for clue...</p>");//<p>Playing in " + sourceLanguage + "</p>");
      callback = displayGuess;
    }
    waitScreen.append(message);
    //curScreen.append("Playing in "+sourceLanguage);
    message.on("click", callback);
    return waitScreen;
  }

  function createGuessForm() {
    $("#guessEntry").remove();
    var guessEntry = $('<div>', { id: "guessEntry"});
    var title = $("<h2>Type in a guess</h2>");
    var clue = $("<p>Clue: " + getClue() + "</p>");
    var form = createFormElement("guessForm");
    guessEntry.append(title, clue, form);
    return guessEntry;
  }

  function createSwapScreen() {
    $("#swapContainer").remove();
    var swapScreen = $("<div>", { id: "swapContainer"});
    var message = $("<p>Switching roles...</p>");//<p>Playing in "+sourceLanguage+"</p>");
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
          //curScreen.append("Playing in "+sourceLanguage);
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
            guess = password;
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
          guess = "hello"
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

  function setSourceLanguage(){
    //
  }

  function displayGuess() {
    curScreen.fadeOut(function() {
      switch (curScreen.attr("id")) {
        case "matching":
          curScreen = $("#waiting");
          curScreen.append(createWaitScreen()).fadeIn();
          //curScreen.append("Playing in "+sourceLanguage);
          break;
        case "waiting":
          curScreen = $("#guess");
          $("button[name=endButton]").remove();
          var endButton = $('<button type="button" name="endButton">End Round</button>');
          curScreen.append(createGuessForm(), endButton).fadeIn();
          $('button[name=endButton]').on("click", function() {
            guess = password;
            displayGuess();
          });
          break;
        case "guess":        
          if (guess == password) {
            curScreen = $("#swap");
            curScreen.append(createSwapScreen()).fadeIn();

          } else {
            curScreen = $("#matching");
            displayGuess();
          }
          break;
        default:
          curScreen = $("#matching");
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
      curScreen.append('<p>Matching...</p>');//<p>Playing in '+sourceLanguage+'</p>');
      //curScreen.append("Playing in "+sourceLanguage);
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

  /*collects sourceLanguage from user input and sets footer language message*/
  $("#languages button").mousedown(function(){
    sourceLanguage = $("#sourceLanguage").val();
    $("p:last").text("Playing in "+sourceLanguage);
  });

  $("#languages button").on("mouseup", displayMatching);
  $("#container").on("click", "button[name=submit]", displayPlayScreen);
  $("#end:last-child").on("click", displayPlayScreen);
});
