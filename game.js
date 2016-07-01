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

  // var activityType; flag for choosing activity?
  var translationData = placeholderData,
      translationInput = placeholderInput;
  var nextWord = "Hello"; // Tracks next word to translate. Maybe an int? 
  var sourceLanguage = "English", 
      targetLanguage = "Pig Latin"; // Assigned by user input
  var curScreen = $("#start");


  function createQuestionElement() { // This could change for different tasks
    var question = $('<div id="question"><h1>Translate</h1></div>'),
        sourceHeader = $('<h3>' + sourceLanguage + '</h3>'),
        sourceWord = $('<p>' + nextWord + '</p>'),
        targetHeader = $('<h3>' + targetLanguage + '</h3>'),
        form = createFormElement();
    question.append(sourceHeader, sourceWord, targetHeader, form);
    return question;
  }

  function createFormElement() {
    var form = $('<form name="userTranslation" action=""></form>');
    form.append('<input type="text" name="translation"><br/>');
    form.append('<button type="button" name="submit">Submit</button>');

    return form
  }

  function displayQuestion() {
    curScreen.fadeOut(function() {
      curScreen = $("#translate");
      $("#question").remove();
      var question = createQuestionElement();
      curScreen.append(question).fadeIn();
      $("button[name=submit]").on("click", displayEnd);
    });
  }

  function displayEnd() {
    curScreen.fadeOut(function() {
      curScreen = $("#end");
      curScreen.fadeIn();
    });
  }

  $("#end:last-child").on("click", displayQuestion);
  $("#start button[name=start]").on("click", displayQuestion);
});
