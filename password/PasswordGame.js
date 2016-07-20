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
	  // send confirmation, ask for clue
	  // TODO: create event for transitioning from password to clue screens
	} else {
      // say pword not in panlex, ask for another
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
    // say pword doesn't follow rules, what pword must satisfy
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
	  // translate this.clues from knowerLang to gueserLang if needed
	  // send confirmation, list of clues, wait
	  // TODO: create event for going from clue to wait screens
	} else {
      // say clue not in panlex, ask for another
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
    // say clue doesn't follow rules, what clue must satisfy
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
	if (result["tt"] == guess) {
	  this.guesses.push(guess);
	  // translate this.guesses from knowerLang to guesserLang if needed
	  // check if guess matches password, act accordingly
	  // send confirmation, list of guesses, wait
	  // TODO: create event for going from guess to wait screens
	} else {
      // say guess not in panlex, ask for another
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
    // say guess doesn't follow rules, what guess must satisfy
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



PasswordGame.prototype.verifyPassword = function(pword) {

};

PasswordGame.prototype.verifyClue = function(clue) {

};

PasswordGame.prototype.verifyGuess = function(guess) {

};

PasswordGame.prototype.checkRoundEnd = function(guess) {
  return guess === this.password || this.guesses.length >= 10;
};


module.exports = PasswordGame;







