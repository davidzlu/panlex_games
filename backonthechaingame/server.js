var http = require('http');
var socketio = require("socket.io");
var express = require("express");
var url = require('url');
var fs = require('fs');
//var PasswordGame = require("./PasswordGame");

var app = express();
//var server = http.createServer(app);
var io = socketio(server);
var PORT = 8000;

app.use(express.static(__dirname + '/client'));
//server.listen(PORT, function() {
  //console.log('Server running at http://127.0.0.1:' + 
//PORT.toString() + '/');
//});

var server = http.createServer(app,function(request, response){

    var path = url.parse(request.url).pathname; 
    fs.readFile(__dirname +path, function(error, data){
    });
    response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data, "utf8");
        response.end();
});
server.listen(8000);
