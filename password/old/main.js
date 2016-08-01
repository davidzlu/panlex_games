/* Hello, World! program in node.js */
var http = require("http");
console.log("Hello, World!")
http.createServer(function (request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Hello World\n');
}).listen(8081);
console.log('Server running at http://127.0.0.1:8081/');
