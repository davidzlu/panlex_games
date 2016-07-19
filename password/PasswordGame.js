var panlex = require("panlex");
panlex.setUserAgent('Password Game', '0.0');

function PasswordGame(sock1, sock1Lang, sock2, sock2Lang) {
  /* An object that tracks the state of a game of Password for two players,
   * and provides methods for implementing the game's mechanics. */
  this._sockets = [sock1, sock2];
  this._knower = sock1;
  this._knowerLang = sock1Lang;
  this._guesser = sock2;
  this._guesserLang = sock2Lang;
  this._password = '';
  this._clues = [];
  this._guesses = [];

  this._initSockets();
};

PasswordGame.prototype._initSockets = function() {
  /* Sets up event listeners for each player in a game. */
  var self = this;
  for (var i=0; i < this._sockets.length; i++) {
	var sock = this._sockets[i];
	sock.emit('msg', 'Player found.');
	// Are all these listeners needed? All very similar
	// Will need more verification of state in game to prevent cheating
    sock.on('password', function(pword) {
	  var inPanLex = self._verifyExpression(self._knowerLang, pword);
	  var followsRules = self._verifyPassword(pword);
	  if (inPanLex && followsRules) {
	    self._password = pword;
		// send confirmation and ask for clue
		// TODO: create event for transitioning from password to clue screens
	  } else {
	    // send error message, ask for another password
	  }
    });
    sock.on('clue', function(clue) {
      var inPanLex = self._verifyExpression(self._knowerLang, clue);
	  var followsRules = self._verifyClue(clue);
      if (inPanLex && followsRules) {
	    self._clues.push(clue);
		// send confirmation and array of clues, have knower wait and guesser start guessing
	  } else {
	    // send error message, ask for another clue
	  }
    });
    sock.on('guess', function(guess) {
	  if (self._checkRoundEnd(guess)) {
	    // finish round, change roles, points
	  }
      var inPanLex = self._verifyExpression(self._guesserLang, guess);
	  var followsRules = self._verifyGuess(guess);
	  if (inPanLex && followsRules) {
	    self._guesses.push(guess);
		// send confirmation and array of guesses
		// have guesser wait, ask knower for clue
	  } else {
	    // send error message, ask for another guess
	  }
    });
  }
};

PasswordGame.prototype._verifyExpression = function(lang, exp) {
  /* Checks if an expression 'exp' in language 'lang' is in PanLex. */
  var inPanLex = false;
  var params = {
    uid: lang,
	tt: exp,
  };
  var callback = function(err, data) {
  	if (err) {
	  console.log("Something went wrong with the query");
	}
	var result = data["result"][0];
  };
  panlex.query('/ex', params, callback);
  // Check if exp in what query returns
  return inPanLex;
};

PasswordGame.prototype._verifyPassword = function(pword) {

};

PasswordGame.prototype._verifyClue = function(clue) {

};

PasswordGame.prototype._verifyGuess = function(guess) {

};

PasswordGame.prototype._checkRoundEnd = function(guess) {
  return guess === self._password || self._guesses.length >= 10;
};


module.exports = PasswordGame;







