var http = require("http");
var socketio = require("socket.io");
var express = require("express");

var app = express();
var server = http.createServer(app);
var io = socketio(server);
var PORT = 8000;

var waitingPlayer;

app.use(express.static(__dirname + '/client'));
server.listen(PORT, function() {
    console.log('Server running at http://127.0.0.1:' + PORT.toString() + '/');
});

io.on('connection', onConnection);

function onConnection(sock) {
    sock.emit('msg', 'Hello, You are playing Password!');
    sock.on('password', function(pword) {
        // Refer to game logic file
    });
    sock.on('guess', function() {
        // Refer to game logic file
    });
    sock.on('clue', function() {
        // Refer to game logic file
    });

    if (waitingPlayer) {
        waitingPlayer = null;
    } else {
        waitingPlayer = sock;
        sock.emit('msg', 'Matching you with another player'); // TODO: change event to move client to matching screen
    }
}

