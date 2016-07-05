$(document).ready(function() {
  //import * as index from "./node-panlex/index.js"

  // Send data to server function, use JSON format
  // Pull data from server, possibly use panlex JS library
  // Painting and display/screen transition function

  // curl http://api.panlex.org/ex -d {fill in with language requests}
  //use $.get/$.ajax for data request
  var placeholderData = { 
                          "resultType": "ex",
                          "result": [],
                          "resultNum": 0,
                          "resultMax": 2000
                        }; //TODO: Figure out format data will come in as
  var placeholderInput = {
                           "uid": targetLanguage,
                           "trtt": "userTranslation",
                           // Other parameters sent
                         };
  var placeholderAlgoData = {};

  var activityType = "evaluate";
  var translationData = placeholderData,
      translationInput = placeholderInput;
  
  var sourceLanguage, targetLanguage; // Assigned by user input
  var nextWord = "Hello"; // Tracks next word to translate. Maybe an int? 
  
  var curScreen = $("#start");
  var ALGORITHM_COUNT = 2; // Number of algorithms to evaluate
  var algoList = [1, 2]


  function createQuestionElement() { // This could change for different tasks
    var question = $('<div id="question">');
    if (activityType == "translate") {
      var questionTitle = $('<h1>Translate</h1>'),
      sourceHeader = $('<h3>' + sourceLanguage + '</h3>'),
      sourceWord = $('<p>' + nextWord + '</p>'),
      targetHeader = $('<h3>' + targetLanguage + '</h3>'),
      form = createFormElement();
    } else {
      var questionTitle = $('<h1>Evaluate</h1>'),
      sourceHeader = $('<h3>' + sourceLanguage + '</h3>'),
      sourceWord = $('<p>' + nextWord + '</p>'),
      targetHeader = $('<h3>' + targetLanguage + '</h3>'),
      form = createRadioElement();
    }
    question.append(questionTitle, sourceHeader, sourceWord, targetHeader, form);
    return question;
  }

  function createFormElement() {
    var form = $('<form name="userTranslation" action="receiver.py" method="post">');
    form.append('<input type="text" name="translation"><br/>');
    form.append('<button type="button" name="submit">Submit</button>');
    return form
  }

  function createRadioElement() {
    var radioList = $('<div id="radioList">');
    for (var i=0; i < ALGORITHM_COUNT; i++) {
      var item = $('<input type="radio" name="translation">' + algoList[i] + '</input><br/>');
      radioList.append(item);
    }
    radioList.append('<button type="button" name="submit">Submit</button>');
    return radioList;
  }

  function createQuery() {
    var languages = $("form[name=languageSelect] input");
    sourceLanguage = languages[0].value;
    targetLanguage = languages[1].value;
    // return created query
  }

  function displayQuestion() {
    curScreen.fadeOut(function() {
      createQuery();
      curScreen = $("#translate");
      $("#question").remove();
      var question = createQuestionElement();
      curScreen.append(question).fadeIn();
      $("button[name=submit]").on("click", displayEnd);
    });
  }

  function displayLanguages() {
    curScreen.fadeOut(function() {
      // Set game type
      curScreen = $("#languages");
      curScreen.fadeIn();
    });
  }

  function displayEnd() {
    curScreen.fadeOut(function() {
      // Send data to server
      curScreen = $("#end");
      curScreen.fadeIn();
    });
  }

  $("#start button").on("click", displayLanguages);
  $("#languages button").on("click", displayQuestion);
  $("#end:last-child").on("click", displayQuestion);
});
