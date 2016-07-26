var http = require("http");
    var url = require('url');
    var fs = require('fs');

    var express = require("express");


    var app = express();
    app.get('/ai_password.js', function(req, res){
        res.sendFile(__dirname+'/ai_password.js'); 
    });
    var server = http.createServer(function(request, response){
        var path = url.parse(request.url).pathname;

        switch(path){
            case '/':
                response.writeHead(200, {'Content-Type': 'text/html'});
                response.write('hello world');
                response.end();
                break;
            case '/ai_password.html':
                var winPath = __dirname + "\\"+ String(path).substr(1,path.length);
                fs.readFile(winPath, function(error, data){
                    if (error){
                        console.log("error!");
                        response.writeHead(404);
                        response.write("opps this doesn't exist - 404");
                        response.end();
                    }
                    else{
                        console.log("no error! "+winPath);
                        response.writeHead(200, {"Content-Type": "text/html"});
                        response.write(data, "utf8");
                        response.end();
                    }
                });
                break;
            default:
                response.writeHead(404);
                response.write("opps this doesn't exist - 404");
                response.end();
                break;
        }
    });

    server.listen(8001);
