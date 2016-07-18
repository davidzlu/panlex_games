var app = require("http").createServer(handler);
var io = require("socket.io")(app);
var PORT = 8000;

io.on('connection', onConnection);

function handler(request, response) {
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello World");
  response.end();
}

app.listen(PORT, function() {
    console.log('Server running at http://127.0.0.1:' + PORT.toString() + '/');
});


