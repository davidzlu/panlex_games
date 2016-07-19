// Based on https://github.com/Juriy/gamedev-demos/tree/master/rps/v2

var http = require("http");
var socketio = require("socket.io");
var express = require("express");
//var pg = require("./PasswordGame");

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
    if (waitingPlayer) {
      new PasswordGame(waitingPlayer, waitingPlayerLang, sock, lang);
      waitingPlayer = null;
      waitingPlayerLang = null;
    } else {
      waitingPlayer = sock;
      waitingPlayerLang = lang;
      // TODO: change event to move client to matching screen
      sock.emit('msg', 'Matching you with another player');
    }
  });


}

