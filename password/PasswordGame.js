var panlex = require("panlex");
panlex.setUserAgent("Password Game", "0.0");

function PasswordGame(sock1, sock1Lang, sock2, sock2Lang) {
  /* An object that tracks the state of a game of Password for two players,
   * and provides methods for implementing the game's mechanics. */
  this.sockets = [sock1, sock2];
  this.knower = sock1;
  this.knowerLang = sock1Lang;
  this.guesser = sock2;
  this.guesserLang = sock2Lang;
  this.password = "";
  this.clues = [];
  this.guesses = [];
  this.translatedPassword = "";
  this.translatedClues = [];
  this.translatedGuesses = [];
  this.roundLength = 10;

  this._initSockets();
};

PasswordGame.prototype._initSockets = function() {
  /* Sets up event listeners for each player in a game. */
  var self = this;
  for (var i=0; i < this.sockets.length; i++) {
    var sock = this.sockets[i];
    var emitData;
    if (sock === this.knower) {
      emitData = {
        "msg":"Player found. You are the password holder.",
        "role":"knower"
      };
      sock.emit("matchSuccess", emitData);
    } else if (sock === this.guesser) {
      emitData = {
        "msg":"Player found. You are the guesser.",
        "role":"guesser"
      };
      sock.emit("matchSuccess", emitData);
    }

    // Will need more verification of state in game to prevent cheating
    sock.on("passwordSubmit", function(pword) {
      self._onReceivePassword(self.knower, pword);
    });

    sock.on("clueSubmit", function(clue) {
      self._onReceiveClue(self.knower, clue);
    });

    sock.on("guessSubmit", function(guess) {
      self._onReceiveGuess(self.guesser, guess);
    });

    sock.on("disconnect", function() {
      for (var j=0; j<self.sockets.length; j++) {
        self.sockets[j].emit("msg", "Player disconnected, please refresh");
      }
    });
  }
};

// following 3 functions very troublesome for other languages
PasswordGame.prototype._verifyPassword = function(pword) {
  /* Checks if pword satisfies game rules for passwords. */
  return true; //(any expression in PanLex)
  //return !/^\s+$/.test(pword); (no whitespace in expression)
  //return /^[a-z]+$/.test(pword);
};

PasswordGame.prototype._verifyClue = function(clue) {
  /* Checks if clue satisfies game rules for clues. */
  return true; //(any expression in PanLex)
  //return !/^\s+$/.test(pword); (no whitespace in expression)
  //return /^[a-z]+$/.test(clue) && this.password.indexOf(clue) == -1 && this.clues.indexOf(clue) == -1;
};

PasswordGame.prototype._verifyGuess = function(guess) {
  /* Checks if guess satisfies game rules for guesses. */
  return true; //(any expression in PanLex)
  //return !/^\s+$/.test(pword); (no whitespace in expression)
  //return /^[a-z]+$/.test(guess) && this.guesses.indexOf(guess) == -1;
};

function _checkPanlexError(err, data, sock, cb) {
  /* Callback function for all PanLex queries. Used for checking if query
   * returned an error. If not, calls cb to continue game. */
  if (err) {
    console.log("Something went wrong with the query");
    sock.emit("inputFail", {"data":"Something went wrong, please send your word again."})
  } else {
    cb(data);
  }
}

function _verifyExp(plxData, exp) {
  /* Takes in data from a PanLex query and an expression. Returns true
   * if expression was returned from query, false otherwise. */
  var result = plxData["result"];
  for (var i=0; i<plxData["resultNum"]; i++) {
    if (result[i]["tt"] === exp) {
      return true;
    }
  }
  return false;
}

function _verifyTranslation(plxData) {
  /* Verifies that translation query returned by panlex is not empty. */
  return plxData["resultNum"] > 0;
}

function _translateExpression(exp, targetLang, cb) {
  /* Takes a single expression and translates it to a target language. 
   * cb is a callback function for the PanLex query. */
  var params = {
    "uid": targetLang,
    "trtt": exp,
    "include": "trq",
    "sort":"trq desc",
    "limit": 1,
  };
  console.log(params);

  panlex.query("/ex", params, cb);
}

PasswordGame.prototype._onReceivePassword = function(sock, pword) {
  /* Checks if password 'pword' from player 'sock' is valid. Passwords must
   * follow the rules for passwords, and be in PanLex. */

  function _finishPasswordCheck(plxData) {
    /* Implements game logic after panlex query returns. Checks if pword
     * was found in returned data and acts accordingly. */
    var emitData;
    if (_verifyExp(plxData, pword)) {
      self.password = pword;

      //translate password block
      if (self.knowerLang == self.guesserLang) {
        self.translatedPassword = pword;
      } else {
        _translateExpression(pword, self.guesserLang, function(err, data) {
          _checkPanlexError(err, data, sock, function(data) {
            if (_verifyTranslation(data)) {
              self.translatedPassword = data["result"][0]["tt"];
              console.log(self.translatedPassword);
            } else {
              //can't find translation event
            }
          });
        });
      }

      emitData = {
        "msg": "Your password has been set. Please enter a clue",
        "password": pword
      };
      sock.emit('passwordSuccess', emitData);
    } else {
      emitData = {
        "msg": pword + " was not found in PanLex. Please submit another."
      }
      sock.emit('inputFail', emitData);
    }
  }

  var followsRules = this._verifyPassword(pword);
  var params = {
    "uid": this.knowerLang,
    "tt": pword,
  };
 
  if (followsRules) {
    var self = this;
    panlex.query('/ex', params, function(err, data) {
      _checkPanlexError(err, data, sock, _finishPasswordCheck);
    }); 
  } else {
    var emitData = {
      "msg": pword + " does not follow rules for a password. Please submit another."
    };
    sock.emit('inputFail', emitData);
  }
};

PasswordGame.prototype._onReceiveClue = function(sock, clue) {
  /* Checks if clue 'clue' from player 'sock' is valid. Clues must
   * follow the rules for clues, and be in PanLex. */

  function _finishClueCheck(plxData) {
    /* Implments game logic for clues after panlex data returned. */
    var emitData;
    if (_verifyExp(plxData, clue)) {
      self.clues.push(clue);
      emitData = {
        "role": "knower",
        "msg": "Clue accepted, please wait for guess."
      };
      self.knower.emit("clueSuccess", emitData);

      if (self.knowerLang == self.guesserLang) {
        self.translatedClues = self.clues;
        var emitData = {
          "role": "guesser",
          "msg":"Clue sent.",
          "clues": self.translatedClues,
          "guesses": self.guesses
        };
        self.guesser.emit("clueSuccess", emitData);
      } else {
        _translateExpression(clue, self.guesserLang, function(err, data) {
          _checkPanlexError(err, data, sock, _finishClueTranslation);
        });
      }
    } else {
      emitData = {
        "msg": clue + " was not found in PanLex. Please submit another."
      };
      sock.emit("inputFail", emitData);
    }
  }

  function _finishClueTranslation(plxData) {
    if (_verifyTranslation(plxData)) {
      var transClue = plxData["result"][0]["tt"];
      self.translatedClues.push(transClue);
      var emitData = {
        "role": "guesser",
        "msg":"Clue sent.",
        "clues": self.translatedClues,
        "guesses": self.guesses
      };
      //self.guesser.emit("clueSuccess", {"role": "guesser", "msg":"Clue sent.", "clues": self.clues, "guesses": self.guesses});
      self.guesser.emit("clueSuccess", emitData);
    } else {
      // can't find translation event
    }
  }

  var followsRules = this._verifyClue(clue);
  var params = {
    "uid": this.knowerLang,
    "tt": clue,
  };
 
  if (followsRules) {
    var self = this;
    panlex.query('/ex', params, function(err, data) {
      _checkPanlexError(err, data, sock, _finishClueCheck);
    }); 
  } else {
    var emitData = {
      "msg": clue + " does not follow rules for clues. Please submit another."
    };
    sock.emit('inputFail', emitData);
  }
}

PasswordGame.prototype._onReceiveGuess = function(sock, guess) {
  /* Checks if guess 'guess' from player 'sock' is valid. Guesses must
   * follow the rules for guesses, and be in PanLex. */

  function _finishGuessCheck(plxData) {
    /* Implments game logic for guesses after panlex data returned. */
    var emitData;
    if (_verifyExp(plxData, guess)) {
      var guessMatches = guess == self.translatedPassword;
      var overGuessLimit = self.guesses.length >= self.roundLength;
      self.guesses.push(guess);
      if (guessMatches) {
        self._endRound(true);
      } else if (overGuessLimit) {
        self._endRound(false);
      } else {
        emitData = {
          "role": "guesser",
          "msg": "Guess not correct. Please wait for next clue"
        };
        self.guesser.emit("guessSuccess", emitData);

        if (self.knowerLang == self.guesserLang) {
          self.translatedGuesses = self.guesses;
          emitData = {
            "role": "knower",
            "msg":"Guess sent",
            "clues": self.clues,
            "guesses": self.translatedGuesses
          };
          self.knower.emit("guessSuccess", emitData);
        } else {
          _translateExpression(guess, self.knowerLang, function(err, data) {
            _checkPanlexError(err, data, sock, _finishGuessTranslation);
          });
        }
      }
    } else {
      emitData = {
        "msg": guess + " not found in PanLex. Please submit another."
      };
      sock.emit('inputFail', emitData);
    }
  }

  function _finishGuessTranslation(plxData) {
    if (_verifyTranslation(plxData)) {
      var transGuess = plxData["result"][0]["tt"];
      self.translatedGuesses.push(transGuess);
      emitData = {
        "role": "knower",
        "msg":"Guess sent",
        "clues": self.clues,
        "guesses": self.translatedGuesses
      };
      self.knower.emit("guessSuccess", emitData);
      //self.knower.emit("guessSuccess", {"role": "knower", "msg":"Guess sent", "clues": self.clues, "guesses": self.guesses});    
    } else {
      // translation not found event
    }
  }

  var followsRules = this._verifyGuess(guess);
  var params = {
    "uid": this.guesserLang,
    "tt": guess,
  };
 
  if (followsRules) {
    var self = this;
    panlex.query('/ex', params, function(err, data) {
      _checkPanlexError(err, data, sock, _finishGuessCheck);
    }); 
  } else {
    var emitData = {
      "msg": guess + " does not follow rules for guesses. Please submit another."
    };
    sock.emit('inputFail', emitData);
  }
}

PasswordGame.prototype._endRound = function(gameWon) {
  /* gameWon is a boolean, true if the guesser guessed the password
   * within ten guesses, false otherwise. */
  //if tracking score, calculate here

  var knowerMsg, guesserMsg;
  if (gameWon) {
    knowerMsg = "The guesser guessed correctly. Ending round";
    guesserMsg = "You guessed correctly. Ending round";
  } else {
    knowerMsg = "The guesser did not guess your password. Ending round";
    guesserMsg = "You ran out of guesses. The password was: "+this.password+". Ending round";
  }
  this.password = "";
  this.translatedPassword = "";
  this.clues = [];
  this.translatedClues = [];
  this.guesses = [];
  this.translatedGuesses = [];

  var knowerData = {
    "msg":knowerMsg,
    "clues":this.clues,
    "guesses":this.guesses,
    "password":this.password
  };
  var guesserData = {
    "msg":guesserMsg,
    "clues":this.clues,
    "guesses":this.guesses,
    "password":this.password
  };
  this.knower.emit("endRound", knowerData);
  this.guesser.emit("endRound", guesserData);

  var sockPlaceholder = this.guesser;
  var langPlaceholder = this.guesserLang;
  this.guesser = this.knower;
  this.guesserLang = this.knowerLang;
  this.knower = sockPlaceholder;
  this.knowerLang = langPlaceholder;

  knowerData = {
    "msg":"You are the password holder.",
    "role":"knower"
  };
  guesserData = {
    "msg":"You are the guesser.",
    "role":"guesser"
  };
  this.knower.emit("matchSuccess", knowerData);
  this.guesser.emit("matchSuccess", guesserData);
}

module.exports = PasswordGame;