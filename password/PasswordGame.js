var panlex = require("panlex");
panlex.setUserAgent('Password Game', '0.0');

function PasswordGame(sock1, sock1Lang, sock2, sock2Lang) {
  /* An object that tracks the state of a game of Password for two players,
   * and provides methods for implementing the game's mechanics. */
  this.sockets = [sock1, sock2];
  this.knower = sock1;
  this.knowerLang = sock1Lang;
  this.guesser = sock2;
  this.guesserLang = sock2Lang;
  this.password = '';
  this.clues = [];
  this.guesses = [];

  this.initSockets();
};

PasswordGame.prototype.verifyPassword = function(pword) {
  /* Checks if pword satisfies game rules for passwords. */
  // check if proper noun somehow?
  return (/^[a-z]+$/.test(pword)); // if pword has only lower case letters
};

PasswordGame.prototype.verifyClue = function(clue) {
  /* Checks if clue satisfies game rules for clues. */
  return /^[a-z]+$/.test(clue) && this.password.indexOf(clue) == -1 && this.clues.indexOf(clue) == -1;
};

PasswordGame.prototype.verifyGuess = function(guess) {
  /* Checks if guess satisfies game rules for guesses. */
  return /^[a-z]+$/.test(guess) && this.guesses.indexOf(guess) == -1;
};

function onSetPassword() {

}

// TODO: onReceive___ functions can probably be simplified to one function
PasswordGame.prototype.onReceivePassword = function(sock, pword) {
  /* Checks if password 'pword' from player 'sock' is valid. Passwords must
   * follow the rules for passwords, and be in PanLex. */

  function checkPasswordInPanlex(err, data) {
    /* Callback function for panlex.query. Checks if pword was returned
     * from PanLex query, and acts accordingly. */
   	if (err) {
	  console.log("Something went wrong with the query");
	}

	var result = data["result"][0];   
	if (result["tt"] == pword) {
	  this.password = pword;
	  // passwordSuccess event sends confirmation message. Client side will change screens
	  // and display message
	  sock.emit('passwordSuccess', 'Your password has been set. Please enter a clue');
	} else {
	  // passwordFail sends failure message. Client side stays on same screen.
	  socket.emit('passwordFail', pword + " was not found in PanLex. Please submit another.");
	}
  }

  var followsRules = this.verifyPassword(pword);
  var params = {
    uid: this.knowerLang,
    tt: pword,
  };
 
  if (followsRules) {
    panlex.query('/ex', params, checkPasswordInPanlex); 
  } else {
    socket.emit('passwordFail', pword + " does not follow rules for a password. Please submit another.");
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
	  }

	  var result = data["result"][0]; 
    if (result["tt"] == clue) {
	    this.clues.push(clue);
	    // TODO: translate this.clues from knowerLang to gueserLang if needed
	    // clueSuccess is an event for both knower and guesser.
		this.knower.emit('clueSuccess', { role: 'knower', msg: 'Clue accepted, please wait for guess.' });
		this.guesser.emit('clueSuccess', { role: 'guesser', clues: this.clues, guesses: this.guesses });
	  } else {
	    sock.emit('clueFail', clue + ' was not found in PanLex. Please submit another.');
	  }
  }

  var followsRules = this.verifyClue(clue);
  var params = {
    uid: this.knowerLang,
    tt: clue,
  };
 
  if (followsRules) {
    panlex.query('/ex', params, checkClueInPanlex); 
  } else {
    sock.emit('clueFail', clue + " does not follow rules for clues. Please submit another.");
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
	}

	var result = data["result"][0]; 
	// TODO: may want to write separate function for handling this conditional block
	if (result["tt"] == guess) {
	  this.guesses.push(guess);
	  // TODO: translate this.guesses from knowerLang to guesserLang if needed
	  var guessMatches = guess == this.password;
      if (guessMatches) {
        this.resetGame(true);
      }
	  var overGuessLimit = this.guesses >= 10;
	  if (overGuessLimit) {
        this.resetGame(false);
	  } else {
		this.guesser.emit('guessSuccess', {role: 'guesser', msg: 'Guess not correct. Please wait for next clue' });
		this.knower.emit('guessSuccess', {role: 'knower', clues: this.clues, guesses: this.guesses });
	  }
	} else {
	  sock.emit('guessFail', guess + " not found in PanLex. Please submit another.");
	}
  }

  var followsRules = this.verifyGuess(guess);
  var params = {
    uid: this.guesserLang,
    tt: guess,
  };
 
  if (followsRules) {
    panlex.query('/ex', params, checkGuessInPanlex); 
  } else {
    sock.emit('guessFail', guess + " does not follow rules for guesses. Please submit another.");
  }
}

PasswordGame.prototype.initSockets = function() {
  /* Sets up event listeners for each player in a game. */
  var self = this;
  for (var i=0; i < this.sockets.length; i++) {
	var sock = this.sockets[i];
	sock.emit('msg', 'Player found.');

	// Are all these listeners needed? All very similar
	// Will need more verification of state in game to prevent cheating

    sock.on('password', function(pword) {
      self.onReceivePassword(sock, pword); 
    });

    sock.on('clue', function(clue) {
      self.onReceiveClue(sock, clue);
    });

    sock.on('guess', function(guess) {
      self.onReceiveGuess(sock, guess);
    });
  }
};


PasswordGame.prototype.resetGame = function(gameWon) {
  /* gameWon is a boolean, true if the guesser guessed the password
   * within ten guesses, false otherwise. */
}

module.exports = PasswordGame;
