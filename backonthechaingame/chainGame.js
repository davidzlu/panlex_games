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
	this._initSocket();
}

ChainGame.prototype._initSocket = function () {
	/* Sets up event listeners for socket */

}









