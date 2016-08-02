// Based on https://github.com/Juriy/gamedev-demos/tree/master/rps/v2

var http = require("http");
var socketio = require("socket.io");
var express = require("express");
var panlex = require("panlex");
var PasswordGame = require("./PasswordGame");

var app = express();
var server = http.createServer(app);
var io = socketio(server);
var PORT = 8000;

var waitingPlayer, waitingPlayerLang;

app.use(express.static(__dirname + '/client'));
server.listen(PORT, function() {
  console.log('Server running at port: ' + PORT.toString() + '/');
});

io.on('connection', onConnection);

function onConnection(sock) {
  /* Function has 3 tasks:
    1) Sends message to clients on connection
    2) Sets up event listener for langauge selection
    3) Matches players in pairs
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
