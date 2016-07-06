$(document).ready(function() {
  // Send data to server function, use JSON format
  // Pull data from server, possibly use panlex JS library
  // Painting and display/screen transition function
  // Need to go from language name to uid, or have people enter uid
  // curl http://api.panlex.org/ex -d {fill in with language requests}
  
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


  function createQuestionElement() {
    /* Dynamically creates form for accepting user input. */
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
    /* Helper function for createQuestionElement. Creates an HTML form
       element that accepts text input. */
    var form = $('<form name="userTranslation" action="receiver.py" method="post">');
    form.append('<input type="text" name="translation"><br/>');
    form.append('<button type="button" name="submit">Submit</button>');
    return form
  }

  function createRadioElement() {
    /* Helper function for createQuestionInput. Creates a div element that
       contains radio buttons. */
    var radioList = $('<div id="radioList">');
    for (var i=0; i < ALGORITHM_COUNT; i++) {
      var item = $('<input type="radio" name="translation">' + algoList[i] + '</input><br/>');
      radioList.append(item);
    }
    radioList.append('<button type="button" name="submit">Submit</button>');
    return radioList;
  }

  function createQuery() {
    /* Helper function for displayQuestion. Parses language input form
       and sets up a query for PanLex API using AJAX. */
    var xhttp;
    if (window.XMLHttpRequest) {
      xhttp = new XMLHttpRequest();
    } else {
      xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    var panlex_url = "http://api.panlex.org/ex";
    var languages = $("form[name=languageSelect] input");
    sourceLanguage = languages[0].value;
    targetLanguage = languages[1].value;
    var parameters = {
      "uid": "rus-000",
      "trtt": "tree",
      "indent": true
    };
    var query = { 
      data: parameters,
      dataType: "json",
      method: "POST",
      url: panlex_url
    };
    var results = $.ajax(query)
      .done(function() {
        alert("success");
      })
      .fail(function() {
        alert("fail");
      });
    console.log(results);
    return results;
  }

  function displayLanguages() {
    /* Handles transition from start screen to language input screen. */
    curScreen.fadeOut(function() {
      // Set game type
      curScreen = $("#languages");
      curScreen.fadeIn();
    });
  }

  function displayQuestion() {
    /* Handles transition from language input screen to user input screen. */
    curScreen.fadeOut(function() {
      createQuery();
      curScreen = $("#translate");
      $("#question").remove();
      var question = createQuestionElement();
      curScreen.append(question).fadeIn();
      $("button[name=submit]").on("click", displayEnd);
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
  $("#languages button").on("click", displayQuestion);
  $("#end:last-child").on("click", displayQuestion);
});
