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
  this.translatedPassword = "";
  this.clues = [];
  this.translatedClues = [];
  this.guesses = [];
  this.translatedGuesses = [];
  this.roundLength = 10;

  this.initSockets();
};

PasswordGame.prototype.initSockets = function() {
  /* Sets up event listeners for each player in a game. */
  var self = this;
  for (var i=0; i < this.sockets.length; i++) {
    var sock = this.sockets[i];
    if (sock === this.knower) {
      sock.emit("matched", {"msg":"Player found. You are the password holder.", "role":"knower"});
    } else if (sock === this.guesser) {
      sock.emit("matched", {"msg":"Player found. You are the guesser.", "role":"guesser"});
    }

    // Will need more verification of state in game to prevent cheating
    sock.on("passwordSubmit", function(pword) {
      self.onReceivePassword(self.knower, pword);
    });

    sock.on("clueSubmit", function(clue) {
      self.onReceiveClue(self.knower, clue);
    });

    sock.on("guessSubmit", function(guess) {
      self.onReceiveGuess(self.guesser, guess);
    });
  }
};

PasswordGame.prototype.verifyPassword = function(pword) {
  /* Checks if pword satisfies game rules for passwords. */
  // check if proper noun somehow?
  return /^[a-z]+$/.test(pword);
};

PasswordGame.prototype.verifyClue = function(clue) {
  /* Checks if clue satisfies game rules for clues. */
  return /^[a-z]+$/.test(clue) && this.password.indexOf(clue) == -1 && this.clues.indexOf(clue) == -1;
};

PasswordGame.prototype.verifyGuess = function(guess) {
  /* Checks if guess satisfies game rules for guesses. */
  return /^[a-z]+$/.test(guess) && this.guesses.indexOf(guess) == -1;
};

function _verifyExp(plxData, exp) {
  /* Takes in data from a PanLex query and an expression. Returns true
   * if expression was returned from query, false otherwise. */
  var result = plxData["result"];
  console.log(plxData);
  for (var i=0; i<plxData["resultNum"]; i++) {
    if (result[i]["tt"] === exp) {
      return true;
    }
  }
  return false;
}

PasswordGame.prototype._translateExpression = function(exp, targetLang, cb) {
  /* Takes a single expression and translates it to a target language. 
   * cb is a callback function for the PanLex query. */
  var params = {
    "uid": targetLang,
    "trtt": exp,
    "include": "trq",
    "sort":"trq desc",
    "limit": 1,
  };

  panlex.query("/ex", params, cb);
}

PasswordGame.prototype.onReceivePassword = function(sock, pword) {
  /* Checks if password 'pword' from player 'sock' is valid. Passwords must
   * follow the rules for passwords, and be in PanLex. */

  function checkPasswordInPanlex(err, data) {
    /* Callback function for panlex.query. Checks if pword was returned
     * from PanLex query, and acts accordingly. */
    if (err) {
      console.log("Something went wrong with the query");
      //Ask to resend
    } else {
      if (_verifyExp(data, pword)) {
        self.password = pword;
        sock.emit('passwordSuccess', {"msg": "Your password has been set. Please enter a clue", "password": pword});
      } else {
        sock.emit('inputFail', {"msg": pword + " was not found in PanLex. Please submit another."});
      }
    }
  }

  var followsRules = this.verifyPassword(pword);
  var params = {
    "uid": this.knowerLang,
    "tt": pword,
  };
 
  if (followsRules) {
    var self = this;
    panlex.query('/ex', params, checkPasswordInPanlex); 
  } else {
    sock.emit('inputFail', {"msg": pword + " does not follow rules for a password. Please submit another."});
  }
};

PasswordGame.prototype.onReceiveClue = function(sock, clue) {
  /* Checks if clue 'clue' from player 'sock' is valid. Clues must
   * follow the rules for clues, and be in PanLex. */

  function checkClueInPanlex(err, data) {
    /* Callback function for panlex.query. Checks if clue was returned
     * from PanLex query, and acts accordingly. */
    if (err) {
      console.log("Something went wrong with the query");
      //Ask to resend
    } else {
      if (_verifyExp(data, clue)) {
        self.clues.push(clue);
        // TODO: translate this.clues from knowerLang to gueserLang if needed
        self.knower.emit("clueSuccess", {"role": "knower", "msg": "Clue accepted, please wait for guess."});
        self._translateExpression(clue, self.guesserLang, function(err, data) {
          var transClue = data["result"][0]["tt"];
          self.translatedClues.push(transClue);
          self.guesser.emit("clueSuccess", {"role": "guesser", "msg":"Clue sent.", "clues": self.translatedClues, "guesses": self.guesses});
        });
        //self.guesser.emit("clueSuccess", {"role": "guesser", "msg":"Clue sent.", "clues": self.clues, "guesses": self.guesses});
      } else {
        sock.emit("inputFail", {"msg": clue + " was not found in PanLex. Please submit another."});
      }
    }
  }

  var followsRules = this.verifyClue(clue);
  var params = {
    "uid": this.knowerLang,
    "tt": clue,
  };
 
  if (followsRules) {
    var self = this;
    panlex.query('/ex', params, checkClueInPanlex); 
  } else {
    sock.emit('inputFail', {"msg": clue + " does not follow rules for clues. Please submit another."});
  }
}

PasswordGame.prototype.onReceiveGuess = function(sock, guess) {
  /* Checks if guess 'guess' from player 'sock' is valid. Guesses must
   * follow the rules for guesses, and be in PanLex. */

  function checkGuessInPanlex(err, data) {
    /* Callback function for panlex.query. Checks if guess was returned
     * from PanLex query, and acts accordingly. */
    if (err) {
      console.log("Something went wrong with the query");
      //ask to resend
    } else {
      // TODO: may want to write separate function for handling this conditional block
      if (_verifyExp(data, guess)) {
        self.guesses.push(guess);
        // TODO: translate this.guesses from knowerLang to guesserLang if needed
        var guessMatches = guess == self.password;
        var overGuessLimit = self.guesses.length >= self.roundLength;
        if (guessMatches) {
          self.endRound(true);
        } else if (overGuessLimit) {
          self.endRound(false);
        } else {
          self.guesser.emit("guessSuccess", {"role": "guesser", "msg": "Guess not correct. Please wait for next clue"});
          self._translateExpression(guess, self.knowerLang, function() {
            var transGuess = data["result"][0]["tt"];
            self.translatedGuesses.push(transGuess);
            self.knower.emit("guessSuccess", {"role": "knower", "msg":"Guess sent", "clues": self.clues, "guesses": self.translatedGuesses});
          });
          //self.knower.emit("guessSuccess", {"role": "knower", "msg":"Guess sent", "clues": self.clues, "guesses": self.guesses});
        }
      } else {
        sock.emit('inputFail', {"msg": guess + " not found in PanLex. Please submit another."});
      }
    }
  }

  var followsRules = this.verifyGuess(guess);
  var params = {
    "uid": this.guesserLang,
    "tt": guess,
  };
 
  if (followsRules) {
    var self = this;
    panlex.query('/ex', params, checkGuessInPanlex); 
  } else {
    sock.emit('inputFail', {"msg": guess + " does not follow rules for guesses. Please submit another."});
  }
}

PasswordGame.prototype.endRound = function(gameWon) {
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
  this.clues = [];
  this.guesses = [];

  this.knower.emit("endRound", {"msg":knowerMsg, "clues":this.clues, "guesses":this.guesses, "password":this.password});
  this.guesser.emit("endRound", {"msg":guesserMsg, "clues":this.clues, "guesses":this.guesses, "password":this.password});

  var sockPlaceholder = this.guesser;
  var langPlaceholder = this.guesserLang;
  this.guesser = this.knower;
  this.guesserLang = this.knowerLang;
  this.knower = sockPlaceholder;
  this.knowerLang = langPlaceholder;

  this.knower.emit("matched", {"msg":"You are the password holder.", "role":"knower"});
  this.guesser.emit("matched", {"msg":"You are the guesser.", "role":"guesser"});
}

module.exports = PasswordGame;