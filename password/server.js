// Based on https://github.com/Juriy/gamedev-demos/tree/master/rps/v2

var http = require("http");
var socketio = require("socket.io");
var express = require("express");
var panlex = require("panlex");
var PasswordGame = require("./PasswordGame");

var app = express();
var server = http.createServer(app);
var io = socketio(server);
var port = process.argv[2] || 8000;

var waitingPlayer, waitingPlayerLang;

app.use(express.static(__dirname + '/client'));
server.listen(port, 'localhost', function() {
  console.log('Server started on port: ' + port);
});

io.on('connection', onConnection);

function onConnection(sock) {
  /* Parameters:
   *   sock: socket of a player who just connected
   * Handles sending a welcome message to sock, and setting up event
   * listeners for their disconnection and their language submission.
   */
  sock.emit("msg", "Hello, You are playing Password!");
  sock.on("disconnect", function() {
    if (sock === waitingPlayer) {
      waitingPlayer = null;
      waitingPlayerLang = null;
    }
  });
  sock.on("language", function(lang) {
    panlex.query("/lv", {"uid":lang}, function(err, data) {
      if (data.resultNum > 0) {
        _onLanguage(sock, lang);
      } else {
        sock.emit("languageFail", {"msg":"We can't find that language variety."});
      }
    });
  });
}

function _onLanguage(sock, lang) {
  /* Parameters:
   *   sock: the socket of a player
   *   lang: the uid emitted by sock
   * Called only if lang is a recognized uid. This function matches
   * sock to another player. If none found, sock is held as waitingPlayer
   * until another socket has emitted a valid uid.
   */
  if (waitingPlayer && sock !== waitingPlayer) {
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
  }
}
