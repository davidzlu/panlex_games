var panlex = require("panlex");
panlex.setUserAgent("Chain Game", "0.0");

//Event names


function ChainGame(sock, lang) {
	/* Constructor function for creating an instance of the game. */
	this.player = sock;
	this.startWord = {
		exp:"",
		uid:"",
	};
	this.targetWord = {
		exp:"",
		uid:"",
	};
	this.currentWord = {
		exp:"",
		uid:"",
	};
	this.translations = [];
	this.forfeited = false;
	this._initSocket();
}

ChainGame.prototype._initSocket = function() {
	/* Sets up event listeners for socket */

}

ChainGame.prototype.getTranslations = function(targetLang) {
	/* Parameters:
	 *   targetLang: uid of target language variety
	 * Returns:
	 *   An array of translated strings.
	 * Queries PanLex API for translations of currentWord into
	 * specified language variety. */

}

ChainGame.prototype.setCurrentWord = function(exp, lang) {
	/* Parameters:
	 *   exp: the expression string the player has chosen
	 *   lang: the uid string of exp
	 * Sets current word to be exp of language variety lang. */

}

ChainGame.prototype.isValidExp = function(exp) {
	/* Parameters:
	 *   exp: a string submitted by client, intended as next word in chain
	 * Returns:
	 *   a boolean
	 * Checks if player submission is valid. true if exp in list of all
	 * translations of currentWord. false otherwise.

}

ChainGame.prototype.isWinState = function() {
	/* Returns:
	 *   a boolean
	 * Checks if player has won game. true if currentWord matches targetWord.
	 * false otherwise. */
	
}

ChainGame.prototype.isLoseState = function() {
	/* Returns:
	 *   a boolean
	 * Checks if player has lost game. true if forfeited is true. false otherwise. */

}

ChainGame.prototype.resetGame = function() {
	/* Resets instance variables to those at beginning of game. Emits a confirmation
	 * when finished. */

}

module.exports = ChainGame;
