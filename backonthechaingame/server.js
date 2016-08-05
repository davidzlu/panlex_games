var http = require('http');
var socketio = require("socket.io");
var express = require("express");
var panlex = require("panlex");
var ChainGame = require("./chainGame.js");

var app = express();
var server = http.createServer(app);
var io = socketio(server);
var PORT = 8000;

app.use(express.static(__dirname + '/client'));
server.listen(8000, function() {
	console.log("Server started on port: "+PORT.toString());
});

io.on("connection", onConnection);
//io.on("langMsg", _onLanguage);

function onConnection(sock) {
	/* Parameters:
	 *   sock: the socket of the player
	 * Handles starting game for new player. This function will:
	 *   1) tell player they're connected and playing game. 
	 *   2) set up listener for language selection */
	
	sock.emit("msg", "Hello you are playing ___");
	console.log("just sent message");
	sock.on("languageSubmit", function(lang) {
		_onLanguage(sock, lang);
	});
}

function _onLanguage(sock, lang) {
	/* Parameters:
	 *   sock: the socket of the player
	 *   lang: the uid string the player has chosen
	 * Handles setting language, starting game, and sending error
	 * messages if language invalid. */
        console.log("about to check if "+lang+" is valid.");
	panlex.query("/lv", {"uid":lang}, function(err, data) {
		if (data.resultNum > 0) {
			sock.emit("languageSuccess", "Playing in "+lang);
			new ChainGame(sock, lang);
		} else {
			sock.emit("languageFail", "Error, can't find that language.");
		}
	});
        sock.on("askWords",function(lang){
            _getWords(sock,lang);
        });
};

var word1, word2;
function _getWords(sock, lang){
    var count = 230000;
    var offset = Math.floor(count*Math.random()+20000);
    _queryForWord(sock,lang,offset,1);
    //offset = Math.floor(count*Math.random()+20000);
    //_queryForWord(sock,lang,offset,2);
}

function _queryForWord(sock, lang,offset,wrdNumber){
    panlex.query('/ex',{uid:lang,offset:offset,limit:1},function(err,data){
        console.log("querying for word"+wrdNumber+" at "+offset);
        data.result.forEach(function(ex){
            if(ex.tt.length<12 && ex.tt.indexOf(" ")==-1){
                if(wrdNumber == 1){
                    word1 = ex.tt;
                    console.log(word1);
                    var count = 200000;
                    offset = Math.floor(count*Math.random()+20000);
                    _queryForWord(sock,lang,offset,2);
                }else{
                    if(ex.tt != word1){
                        word2 = ex.tt;
                        console.log(word2);
                        sock.emit("sendWords",word1,word2);
                        console.log("just sent words");
                    }else{
                        _queryForWord(sock,lang,(offset + 10000)%229000,wrdNumber);
                    }
                }       
            }else{
                  _queryForWord(sock,lang,(offset + 10000)%229000,wrdNumber);
            }
        });
    });
}
