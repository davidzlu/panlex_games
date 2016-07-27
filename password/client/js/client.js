// Based on https://github.com/Juriy/gamedev-demos/tree/master/rps/v2
$(document).ready(function() {

  var sock = io();
  sock.on("matched", onMatched);
  sock.on("passwordSuccess", onPasswordSuccess);
  sock.on("clueSuccess", onClueSuccess);
  sock.on("guessSuccess", onGuessSuccess);
  sock.on("inputFail", onInputFail);
  sock.on("languageSuccess", onLangaugeSuccess);
  sock.on("languageFail", onLanguageFail);
  sock.on("endRound", onEndRound);

  function onEndRound(data) {
    var msg = data["msg"];
    GameState.clues = data["clues"];
    GameState.guesses = data["guesses"];
    GameState.password = data["password"];
    onMessage(msg);
  }

  // TODO: how to keep these variables around? Is this the most sensible way?
  var GameState = {
    curScreen: $("#startContainer"),
    role: "",
    password: "",
    guesses: [],
    clues: [],
  }

  function onMatched(data) {
    /* Transition from waiting screen to game screens. Tell players
     * their roles. */
    var msg = data["msg"];
    onMessage(msg);
    GameState.role = data["role"];
    GameState.curScreen.fadeOut(_matchToGame);
  }

  function _matchToGame() {
    GameState.curScreen.empty();
    if (GameState.role == "knower") {
      GameState.curScreen = $("#passwordContainer");
      GameState.curScreen.append(createPasswordElement()).fadeIn();
    } else if (GameState.role == "guesser") {
      GameState.curScreen = $("#waitContainer");
      GameState.curScreen.append(createWaitElement()).fadeIn();
    }
  }

  function onMessage(text) {
    /* Function for displaying messages in title. For debugging purposes.
     * Don"t keep in final game. Or at least modify heavily. */
    var title = $("#title");
    var msg = $("<h2>" + text + "</h2>");
    title.append(msg);
  }

  function onPasswordSuccess(data) {
    /* This function:
     *   1) displays confirmation message from server.
     *   2) sets the password for the round
     *   3) empties the passwordContainer div of all elements
     *   4) transitions to clue screen */
    var msg = data["msg"];
    GameState.password = data["password"];
    onMessage(msg);
    GameState.curScreen.fadeOut(function() {
      GameState.curScreen.empty();
      GameState.curScreen = $("#clueContainer");
      GameState.curScreen.append(createClueElement()).fadeIn();
    });
  }

  function onInputFail(data) {
    /* This function:
     *   1) displays the error message from server
     *   2) fades in current screen (because form submission fades out screen) */
    var msg = data["msg"];
    onMessage(msg);
    GameState.curScreen.fadeIn();
  }

  function onClueSuccess(data) {
    /* For the knower, this function:
     *   1) displays confirmation message from server
     *   2) empties clueContainer div of all elements
     *   3) transitions to wait screen 
     * For the guesser, this function:
     *   1) displays confirmation message from server
     *   2) empties waitContainer div of all elements
     *   3) transitions from wait screen to guess screen
     *   4) Updates clues and guesses */
    var msg = data["msg"];
    onMessage(msg);
    if (GameState.role == "knower") {
      GameState.curScreen.fadeOut(function() {
        GameState.curScreen.empty();
        GameState.curScreen = $("#waitContainer");
        GameState.curScreen.append(createWaitElement()).fadeIn();
      });
    } else if (GameState.role == "guesser") {
      GameState.clues = data["clues"];
      GameState.guesses = data["guesses"];
      GameState.curScreen.fadeOut(function() {
        GameState.curScreen.empty();
        GameState.curScreen = $("#guessContainer");
        GameState.curScreen.append(createGuessElement()).fadeIn();
      });
    }
  }

  function onGuessSuccess(data) {
    /* Called when guess sent, but does not match password and less than 10 guesses sent.
     * For the guesser, this function:
     *   1) displays confirmation from server
     *   2) empties guessContainer div of all elements
     *   3) transitions to wait screen 
     * For the knower, this function:
     *   1) displays confirmation from server
     *   2) empties waitContainer div of all elements
     *   3) transitions from wait to clue screen */
    var msg = data["msg"];
    onMessage(msg);
    if (GameState.role == "knower") {
      GameState.clues = data["clues"];
      GameState.guesses = data["guesses"];
      GameState.curScreen.fadeOut(function() {
        GameState.curScreen.empty();
        GameState.curScreen = $("#clueContainer");
        GameState.curScreen.append(createClueElement()).fadeIn();
      });
    } else if (GameState.role == "guesser") {
      GameState.curScreen.fadeOut(function() {
        GameState.curScreen.empty();
        GameState.curScreen = $("#waitContainer");
        GameState.curScreen.append(createWaitElement()).fadeIn();
      });
    }
  }

  function onLangaugeSuccess(data) {
    /* This function:
     *   1) Send confirmation messgage
     *   2) Transitions to matching screen */
    var sourceLanguage = data["lang"];
    $("p:last").text("Playing in "+sourceLanguage);
    if (data["waiting"]) {
      GameState.curScreen.fadeOut(function() {
        GameState.curScreen.empty();
        GameState.curScreen = $("#matchingContainer");
        GameState.curScreen.append("<p>Matching...</p>").fadeIn();
      });
    }
  }

  function onLanguageFail(data) {
    /* This function:
     *   1) Sends error message asking for another language */
    var msg = data["msg"];
    onMessage(msg);
  }

  /* createXXXElement functions create a div that will contain all
   * necesseary parts of a screen. These divs will be in another div
   * with the name of XXXContainer. */
  function createPasswordElement() {
    var passElem = $("<div>", { id: "passElem"});
    var passFormTitle = $("<h2>Enter a password</h2>");
    var passForm = _createFormElement("password", "passwordSubmit");
    passElem.append(passFormTitle, passForm);
    return passElem;
  }

  function createClueElement() {
    var clueElem = $("<div>", {id: "clueElem"});
    var clueFormTitle = $("<h2>Enter a clue</h2>");
    var clueForm = _createFormElement("clue", "clueSubmit");
    var clueList = _createSubmissionList("clues", "clueList");
    var guessList = _createSubmissionList("guesses", "guessList");
    var endButton = _createEndButton();
    
    clueElem.append(clueFormTitle, clueList, guessList, clueForm, endButton);
    return clueElem;
  }

  function createGuessElement() {
    var guessElem = $("<div>", { id: "guessElem"});
    var title = $("<h2>Type in a guess</h2>");
    var clueList = _createSubmissionList("clues", "clueList");
    var guessList = _createSubmissionList("guesses", "guessList");
    var form = _createFormElement("guess", "guessSubmit");
    var endButton = _createEndButton();

    guessElem.append(title, clueList, guessList, form, endButton);
    return guessElem;
  }

  function createWaitElement() {
    var waitElem = $("<div>", { id: "waitElem"});
    var message;
    if (GameState.role == "knower") {
      message = $("<p>Waiting for guess...</p>");
    } else if (GameState.role == "guesser") {
      message = $("<p>Waiting for clue...</p>");
    }
    waitElem.append(message);
    return waitElem;
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

  function _createFormElement(inputName, socketEvent) {
    /* Creates an HTML form element that accepts text input.
     * inputName: name of input element
     * socketEvent: the event to emit upon submission */
    var form = $("<div>");
    var input = $("<input>", {type: "text", name: inputName});
    var submitButton = $("<button>", {type: "button", name:inputName});
    submitButton.text("Submit");
    form.append(input, "<br/>", submitButton);
    submitButton.on("click", function() {
      sock.emit(socketEvent, $("input[name="+inputName+"]").val());
      GameState.curScreen.fadeOut(); // to avoid multiple submissions at once?
    });
    return form;
  }

  function _createSubmissionList(lst, lstname) {
    var subList = $("<ol>", {id: lstname});
    for (var i=0; i<GameState[lst].length; i++) {
      var lstItem = $("<li>"+GameState[lst][i]+"</li>");
      subList.append(lstItem);
    }
    return subList;
  }

  function _createEndButton() {
    // endButton should be used for debugging purposes, currently no intention to keep
    var endButton = $("<button>", {type:"button", name:"endButton", value:"End Round"});
    $("button[name=endButton]").on("click", function() {
      if (GameState.guess == GameState.password) {
        //do something really obvious
      }
    });
  }

  function displayLanguages() {
    /* Handles transition from start screen to language input screen. */
    GameState.curScreen.fadeOut(function() {
      GameState.curScreen = $("#languagesContainer");
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

  function onLanguageSubmit() {
    var sourceLanguage = $("#sourceLanguage").val();
    sock.emit("language", sourceLanguage);
    // if check is fast enough, no transition needed
  }

  // Local event listeners below
  $("#startContainer button").on("click", displayLanguages);
  $("#languagesContainer button").on("click", onLanguageSubmit);
});