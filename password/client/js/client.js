// Based on https://github.com/Juriy/gamedev-demos/tree/master/rps/v2
$(document).ready(function() {

  var sock = io();
  // Event names
  var MATCH_SUCCESS = "matchSuccess";
  var MATCH_FAIL = "matchFail";
  var PASSWORD_SUCCESS = "passwordSuccess";
  var CLUE_SUCCESS = "clueSuccess";
  var GUESS_SUCCESS = "guessSuccess";
  var INPUT_FAIL = "inputFail";
  var LANGUAGE_SUCCESS = "languageSuccess";
  var LANGUAGE_FAIL = "languageFail";
  var MSG = "msg";
  var END_ROUND = "endRound";

  sock.on(MATCH_SUCCESS, onMatched);
  sock.on(MATCH_FAIL, onMessage);
  sock.on(PASSWORD_SUCCESS, onPasswordSuccess);
  sock.on(CLUE_SUCCESS, onClueSuccess);
  sock.on(GUESS_SUCCESS, onGuessSuccess);
  sock.on(INPUT_FAIL, onInputFail);
  sock.on(LANGUAGE_SUCCESS, onLanguageSuccess);
  sock.on(LANGUAGE_FAIL, onLanguageFail);
  sock.on(MSG, onMessage);
  sock.on(END_ROUND, onEndRound);

  function focusInput() {
    $("input").focus();
  }

  function onEndRound(data) {
    var msg = data["msg"];
    GameState.clues = data["clues"];
    GameState.guesses = data["guesses"];
    GameState.password = data["password"];
    onMessage(msg);
  }

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
      GameState.curScreen.append(createPasswordElement()).fadeIn(focusInput);
    } else if (GameState.role == "guesser") {
      GameState.curScreen = $("#waitContainer");
      GameState.curScreen.append(createWaitElement()).fadeIn(focusInput);
    }
  }

  function onMessage(text) {
    /* Function for displaying messages in title. For debugging purposes.
     * Don"t keep in final game. Or at least modify heavily. */
    var msg = $("<p>" + text + "</p>");
    $("#msgContainer").prepend(msg);
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
      GameState.curScreen.append(createClueElement()).fadeIn(focusInput);
    });
  }

  function onInputFail(data) {
    /* This function:
     *   1) displays the error message from server
     *   2) fades in current screen (because form submission fades out screen) */
    var msg = data["msg"];
    onMessage(msg);
    GameState.curScreen.fadeIn(focusInput);
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
        GameState.curScreen.append(createWaitElement()).fadeIn(focusInput);
      });
    } else if (GameState.role == "guesser") {
      GameState.clues = data["clues"];
      GameState.guesses = data["guesses"];
      GameState.curScreen.fadeOut(function() {
        GameState.curScreen.empty();
        GameState.curScreen = $("#guessContainer");
        GameState.curScreen.append(createGuessElement()).fadeIn(focusInput);
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
        GameState.curScreen.append(createClueElement()).fadeIn(focusInput);
      });
    } else if (GameState.role == "guesser") {
      GameState.curScreen.fadeOut(function() {
        GameState.curScreen.empty();
        GameState.curScreen = $("#waitContainer");
        GameState.curScreen.append(createWaitElement()).fadeIn(focusInput);
      });
    }
  }

  function onLanguageSuccess(data) {
    /* This function:
     *   1) Send confirmation messgage
     *   2) Transitions to matching screen */
    var sourceLanguage = data["lang"];
    $("p:last").text("Playing in "+sourceLanguage);
    if (data["waiting"]) {
      GameState.curScreen.fadeOut(function() {
        GameState.curScreen.empty();
        GameState.curScreen = $("#matchingContainer");
        GameState.curScreen.append("<p>Matching...</p>").fadeIn(focusInput);
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
    var clueList = _createSubmissionList("clues", "Clues");
    var guessList = _createSubmissionList("guesses", "Guesses");
    
    clueElem.append(clueFormTitle, clueList, guessList, clueForm);
    return clueElem;
  }

  function createGuessElement() {
    var guessElem = $("<div>", { id: "guessElem"});
    var title = $("<h2>Type in a guess</h2>");
    var clueList = _createSubmissionList("clues", "Clues");
    var guessList = _createSubmissionList("guesses", "Guesses");
    var form = _createFormElement("guess", "guessSubmit");

    guessElem.append(title, clueList, guessList, form);
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
      GameState.curScreen.fadeOut();
    });
    input.keypress(function(e) {
      if (e.which == 13) {
        e.preventDefault();
        sock.emit(socketEvent, $("input[name="+inputName+"]").val());
        GameState.curScreen.fadeOut();
      }
    });
    return form;
  }

  function _createSubmissionList(lst, lstname) {
    var title = $("<ul>");
    title.append($("<li>"+lstname+"</li>"));
    var subList = $("<ol>");
    for (var i=0; i<GameState[lst].length; i++) {
      var lstItem = $("<li>"+GameState[lst][i]+"</li>");
      subList.append(lstItem);
    }
    title.append(subList);
    return title;
  }

  function displayLanguages() {
    /* Handles transition from start screen to language input screen. */
    GameState.curScreen.fadeOut(function() {
      GameState.curScreen = $("#languagesContainer");
      GameState.curScreen.fadeIn(focusInput);
    });
  }

  function displayEnd() {
    /* Handles transition from translation data input to end screen. */
    GameState.curScreen.fadeOut(function() {
      GameState.curScreen = $("#end");
      GameState.curScreen.fadeIn();
    });
  }

  function onLanguageSubmit() {
    var sourceLanguage = $("#sourceLanguage").val();
    sock.emit("language", sourceLanguage);
  }

  // Local event listeners below
  $("#startContainer button").on("click", displayLanguages);
  $("#languagesContainer button").on("click", onLanguageSubmit);
  $("#sourceLanguage").keypress(function(e) {
    if (e.which == 13) {
      e.preventDefault();
      onLanguageSubmit();
    }
  });
});
