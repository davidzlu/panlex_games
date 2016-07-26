
var http = require('http');
var socketio = require("socket.io");
var express = require("express");
var app = express();
var server = http.createServer(app);
var io = socketio(server);
var socket = io('http://localhost:8000');
var PORT = 8000;
app.use(express.static(__dirname + '/client'));
server.listen(PORT, function() {
  console.log('Server running at http://127.0.0.1:' + PORT.toString() + '/');
});

server.listen(8000);
io.listen(server);
