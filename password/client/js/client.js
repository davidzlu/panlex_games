var sock = io();
sock.on('msg', onMessage);

function onMessage(text) {
  var $title = $("#title");
  var $msg = $("<h2>" + text + "</h2>");
  $title.append($msg);
}

// TODO: should this data be all on server side? System design question
var GameState = {
  sourceLanguage: '',
  curScreen: null,
  role: 'password',
  password: '', // We won't want this field when game is finished
  guess: '',
  clues: [],
}

$(document).ready(function() {
  
  GameState.curScreen = $("#start");

  function getGuess() {
    // Should retrieve guess from server
    return GameState.guess;
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
    if (GameState.role == "password") {
      message = $("<p>Waiting for guess...</p>");
      callback = displayPassword;
    } else if (GameState.role == "guess") {
      message = $("<p>Waiting for clue...</p>");
      callback = displayGuess;
    }
    waitScreen.append(message);
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
    var message = $("<p>Switching roles...</p>");//<p>Playing in "+GameState.sourceLanguage+"</p>");
    var swapButton = $("<button>Switch</button>", { type:"button", name:"swapButton"});
    if (GameState.role == "password") {
      GameState.role = "guess";
    } else if (GameState.role == "guess") {
      GameState.role = "password";
    }
    swapScreen.append(message, swapButton);
    swapButton.on("click", displayPlayScreen);
    return swapScreen;
  }

  // TODO: Refactor this function
  function displayPassword() {
    GameState.curScreen.fadeOut(function() {
      switch (GameState.curScreen.attr("id")) {
        case "matching":
          GameState.curScreen = $("#password");
          GameState.curScreen.append(createPasswordForm()).fadeIn();
          break;
        case "password":
          if (GameState.password == null) {
            GameState.password = $('form[name=userInput] input')[0].value;
          }
          GameState.curScreen = $("#clue");
          $('#password').empty();
          var endButton = $('<button type="button" name="endButton">End Round</button>');
          GameState.curScreen.append(createClueForm(), endButton).fadeIn();
          $('button[name=endButton]').on("click", function() {
            if(GameState.guess = GameState.password){
               //do something really obvious
            }
            displayPassword();
          });
          break;
        case "clue":
          GameState.curScreen = $("#waiting");
          $('#clue').empty();
          GameState.curScreen.append(createWaitScreen(), endButton).fadeIn();
          break;
        case "waiting":
          if (GameState.guess == GameState.password) {
            GameState.curScreen = $("#swap");
            GameState.curScreen.append(createSwapScreen()).fadeIn();
          } else {
            GameState.curScreen = $("#password");
            displayPassword();
          }
          break;
        default:
          GameState.curScreen = $("#matching");
          GameState.guess = "hello"
          displayPassword();
      }
    });
  }

  function displayLanguages() {
    /* Handles transition from start screen to language input screen. */
    GameState.curScreen.fadeOut(function() {
      GameState.curScreen = $("#languages");
      GameState.curScreen.fadeIn();
    });
  }

  function setSourceLanguage(){
    //
  }

  // TODO: refactor this function
  function displayGuess() {
    GameState.curScreen.fadeOut(function() {
      switch (GameState.curScreen.attr("id")) {
        case "matching":
          GameState.curScreen = $("#waiting");
          GameState.curScreen.append(createWaitScreen()).fadeIn();
          //GameState.curScreen.append("Playing in "+GameState.sourceLanguage);
          break;
        case "waiting":
          GameState.curScreen = $("#guess");
          $("button[name=endButton]").remove();
          var endButton = $('<button type="button" name="endButton">End Round</button>');
          GameState.curScreen.append(createGuessForm(), endButton).fadeIn();
          $('button[name=endButton]').on("click", function() {
            GameState.guess = GameState.password;
            displayGuess();
          });
          break;
        case "guess":        
          if (GameState.guess == GameState.password) {
            GameState.curScreen = $("#swap");
            GameState.curScreen.append(createSwapScreen()).fadeIn();

          } else {
            GameState.curScreen = $("#matching");
            displayGuess();
          }
          break;
        default:
          GameState.curScreen = $("#matching");
          GameState.guess = "hello"
          displayGuess();
      }
    });
  }

  function displayPlayScreen() {
    // Manages selection b/t displayPassword and displayGuess
    if (GameState.role == "password") {
      displayPassword();
    } else if (GameState.role == "guess") {
      displayGuess();
    }
  }

  function displayMatching() {
    GameState.curScreen.fadeOut(function() {
      GameState.curScreen = $("#matching");
      GameState.curScreen.append('<p>Matching...</p>');//<p>Playing in '+GameState.sourceLanguage+'</p>');
      //GameState.curScreen.append("Playing in "+GameState.sourceLanguage);
      $('p').on("click", displayPlayScreen);
      GameState.curScreen.fadeIn();
    });
  }

  function displayEnd() {
    /* Handles transition from translation data input to end screen. */
    GameState.curScreen.fadeOut(function() {
      // Send data to server
      GameState.curScreen = $("#end");
      GameState.curScreen.fadeIn();
    });
  }


  // Event listeners below
  $("#start button").on("click", displayLanguages);

  /*collects GameState.sourceLanguage from user input and sets footer language message*/
  $("#languages button").mousedown(function(){
    GameState.sourceLanguage = $("#sourceLanguage").val();
    $("p:last").text("Playing in "+GameState.sourceLanguage);
  });

  $("#languages button").on("mouseup", displayMatching);
  $("#container").on("click", "button[name=submit]", displayPlayScreen);
  $("#end:last-child").on("click", displayPlayScreen);
});