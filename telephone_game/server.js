var http = require('http');
var socketio = require("socket.io");
var express = require("express");
var panlex = require("panlex");
var TelephoneGame = require("./telephone_game.js");

var app = express();
var server = http.createServer(app);
var io = socketio(server);
var PORT = 8001;

app.use(express.static(__dirname + '/client'));
server.listen(PORT, function() {
	console.log("Server started on port: "+PORT.toString());
});

io.on("connection", function(sock) {
    sock.on("languageSubmit", function(lang) {
        _onLanguage(sock, lang);
    });
});

function _onLanguage(sock, lang) {
	/* Parameters:
	 *   sock: the socket of the player
	 *   lang: the uid string the player has chosen
	 * Handles setting language, starting game, and sending error
	 * messages if language invalid. */
    console.log("about to check if "+lang+" is valid.");
	panlex.query("/lv", {"uid":lang}, function(err, data) {
		if (data.resultNum > 0) {
			sock.emit("languageSuccess", "Playing in "+lang);
			new TelephoneGame(sock, lang);
		} else {
			sock.emit("languageFail", "Error, can't find that language.");
		}
	});
};
