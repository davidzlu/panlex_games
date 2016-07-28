// Based on https://github.com/Juriy/gamedev-demos/tree/master/rps/v2

var http = require("http");
var socketio = require("socket.io");
var express = require("express");
var PasswordGame = require("./PasswordGame");

var app = express();
var server = http.createServer(app);
var io = socketio(server);
var PORT = 8000;

var waitingPlayer, waitingPlayerLang;

app.use(express.static(__dirname + '/client'));
server.listen(PORT, function() {
  console.log('Server running at http://127.0.0.1:' + PORT.toString() + '/');
});

io.on('connection', onConnection);

function onConnection(sock) {
  /* Function has 3 tasks:
    1) Sends message to clients on connection
    2) Sets up event listener for langauge selection
    3) Matches players in pairs
  */
  sock.emit('msg', 'Hello, You are playing Password!');
  sock.on('language', function(lang) {
    //assuming lang is uid
    //TODO: check if lang is in PanLex
    /*if language in panlex:
        continue as normal
        sock.emit("languageSuccess", {})
      else:
        sock.emit("languageFail, {"msg":"Language not found, please enter another."});*/

    if (waitingPlayer && sock !== waitingPlayer) { // Make sure waitingPlayer not same as sock
      sock.emit("languageSuccess", {"lang":lang, "waiting":false});
      new PasswordGame(waitingPlayer, waitingPlayerLang, sock, lang);
      waitingPlayer = null;
      waitingPlayerLang = null;
    } else if (waitingPlayer && sock === waitingPlayer) {
      sock.emit("matchFail", "Error, can't play against yourself.");
    } else {
      waitingPlayer = sock; // may be racing condition
      waitingPlayerLang = lang;
      sock.emit("languageSuccess", {"lang":lang, "waiting":true});
      // TODO: change event to move client to matching screen
    }
  });
}