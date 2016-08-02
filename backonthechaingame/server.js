var http = require("http");
var socketio = require("socket.io");
var express = require("express");

var app = express();
var server = http.creatServer(app);
var io = socketio(server);
var PORT = 8000;

app.use(express.static(__dirname + "/client"));
server.listen(PORT, function() {
	console.log("Server running at port: " + PORT.toString());
});

io.on("connection", onConnection);

function onConnection(sock) {
	/* Handles starting game for new player. This function will:
	 * 1) tell player they're connected and playing game. 
	 * 2) set up listener for language selection */
	
	sock.emit("msg", "Hello you are playing ___");
	sock.on("language", function(lang) {
		_onLanguage(sock, lang);
	});
}

function _onLanguage(sock, lang) {
	/* Handles setting language and sending error messages if language invalid. */

}
