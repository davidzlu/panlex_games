var http = require('http');
var socketio = require("socket.io");
var express = require("express");
var panlex = require("panlex");

var app = express();
var server = http.createServer(app);
var io = socketio(server);
var PORT = 8000;

app.use(express.static(__dirname + '/client'));
server.listen(8000, function() {
	console.log("Server started on port: "+PORT.toString());
});

io.on("connection", onConnection);

function onConnection(sock) {
	/* Handles starting game for new player. This function will:
	 * 1) tell player they're connected and playing game. 
	 * 2) set up listener for language selection */
	
	sock.emit("msg", "Hello you are playing ___");
	console.log("just sent message");
	sock.on("languageSubmit", function(lang) {
		_onLanguage(sock, lang);
	});
}

function _onLanguage(sock, lang) {
	/* Handles setting language and sending error messages if language invalid. */
	panlex.query("/lv", {"uid":lang}, function(err, data) {
		if (data.resultNum > 0) {
			sock.emit("languageSuccess", lang);
			//start the game with lang as default language
		} else {
			sock.emit("languageFail", "Error, can't find that language.");
		}
	});
};
