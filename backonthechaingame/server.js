var http = require('http');
var socketio = require("socket.io");
var express = require("express");
var url = require('url');
var fs = require('fs');
var app = express();
var io = socketio(server);
var PORT = 8000;

app.use(express.static(__dirname + '/client'));

var server = http.createServer(app,function(request, response){
    var path = url.parse(request.url).pathname; 
    fs.readFile(__dirname +path, function(error, data){
    });
    response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data, "utf8");
        response.end();
});

server.listen(8000);
