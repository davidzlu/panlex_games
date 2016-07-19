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
	  self._verifyExpression(self._knowerLang, pword);
	  // save pword for round
    });
    sock.on('clue', function(clue) {
      self._verifyExpression(self._knowerLang, clue);
      // verify clue in panlex, and follows rules for clues
	  // save clue
	  // display all clues to both players
    });
    sock.on('guess', function(guess) {
      self._verifyExpression(self._guesserLang, guess);
	  // save guess
	  // display all guesses to both players
	  // move to next round if guess correct, or 10th guess and wrong
    });
  }
};

PasswordGame.prototype._verifyExpression = function(lang, exp) {
  /* Checks if an expression 'exp' in language 'lang' is in PanLex. */
  var goodExp = false;
  var params = {};
  var callback = function(err, data) {};
  panlex.query('/ex', params, callback);
  // Check if exp in what query returns
  return goodExp;
};

PasswordGame.prototype._verifyGuess = function(guess) {

};

PasswordGame.prototype._verifyClue = function(clue) {

};

module.exports = PasswordGame;







