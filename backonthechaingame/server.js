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

var word1, word2;          //global variable workaround, may need changing later
function _getWords(sock, lang){
    var count = 230000;    //hard-coded, corresponds approximately to number of expressions in eng-000 
           //(will eventually be changed to a query of the PanLex database to find how many expressions exist)
    var offset = Math.floor(count*Math.random()+20000);
    _queryForWord(sock,lang,offset,1);
    sock.on("askTrans",function(lang,word1) {        //called when user asks for translations of word1
        _translate(sock, lang,word1);
    });
}

function _queryForWord(sock, lang,offset,wrdNumber){
    panlex.query('/ex',{uid:lang,offset:offset,limit:1},function(err,data){  //get one random expression from PanLex
        data.result.forEach(function(ex){
            if(ex.tt.length<12 && ex.tt.indexOf(" ")==-1){    //if the expression is one word and not too long
                if(wrdNumber == 1){
                    word1 = ex.tt;
                    console.log(word1);
                    var count = 200000;
                    /*recalculate offset and recursively call _queryForWord() to find word2 (since word1 was
                      just successfully found*/
                    offset = Math.floor(count*Math.random()+20000);
                    _queryForWord(sock,lang,offset,2);
                }else{
                    if(ex.tt != word1){      //if the candidate for word2 is not the same as word1
                        word2 = ex.tt;
                        console.log(word2);
                        sock.emit("sendWords",word1,word2);   //send word1 and word2 back to client
                        console.log("just sent words");
                    }else{                   //if word2 candidate is same as word1
                        _queryForWord(sock,lang,(offset + 10000)%229000,wrdNumber);  //try again
                    }
                }       
            }else{      //if the expression is too long or consists of multiple words
                  _queryForWord(sock,lang,(offset + 10000)%229000,wrdNumber);   //try again
            }
        });
    });
}

/*Finds translations of word1 (in the original user-selected language) into the second user-selected language 
  (both languages may be the same, in which case synonyms are emitted back to the client instead of 
  translations*/
function _translate(sock,lang,word1){
    console.log("in _translate()");
    panlex.query('/ex',{"uid":lang,"trtt":word1},function(err,data){
        data.result.forEach(function(word){
            console.log(word.tt);
            sock.emit("singleTrans",word.tt);        //emits translations back to client one at a time
        });
    });
}
