var panlex = require("panlex");
panlex.setUserAgent("Chain Game", "0.0");

var DEBUG = true;

//Event names
var SET_WORD = "setWord";
var ASK_TRANS = "askTrans";
var ASK_WORDS = "askWords";
var SEND_WORDS = "sendWords";
var TRANS_LIST = "transList";
var RESET = "reset";
var VALID_LANGUAGES = "validLanguages";
var GET_UIDS = "getUids";

function ChainGame(sock, lang) {
    /* Constructor function for creating an instance of the game. */
    this.player = sock;
    this.playerLang = lang;
    this.currentWord = {
        tt:"",
        ex:0,
        uid:"",
    };
    this.targetWord = {
        tt:"",
        ex:0,
        uid:"",
    };
    this.initSocket(sock);
}

ChainGame.prototype.initSocket = function(sock) {
    /* Sets up event listeners for socket */
    var self = this;
    sock.on(ASK_WORDS, function(lang) {
        self.getWords();
    });
    sock.on(ASK_TRANS, function(lang) { //called when user asks for translations of word1
        self.getTranslations(lang);
    });
    sock.on(SET_WORD, function(exp, lang) {
        self.setCurrentWord(exp, lang);
    });
    sock.on(RESET, function() {
        self.resetGame();
    });
    sock.on(GET_UIDS, function(word) {
        self.getLanguageVarieties(word);
    });
}

ChainGame.prototype.getWords = function() {
    if (DEBUG) {
        this.currentWord = {tt:"ship", uid:"eng-000"};
        this.targetWord = {tt:"sun", uid:"eng-000"};
        this.player.emit(SEND_WORDS, this.currentWord.tt, this.targetWord.tt);
    } else {
        var count = 230000;    //hard-coded, corresponds approximately to number of expressions in eng-000 
           //(will eventually be changed to a query of the PanLex database to find how many expressions exist)
        var offset = Math.floor(count*Math.random()+20000);
        this._queryForWord(this.player, this.playerLang, offset, 1);
    }
}

ChainGame.prototype._queryForWord = function(sock, lang, offset, wrdNumber) {
    var self = this;
    panlex.query('/ex', {uid:lang,offset:offset,limit:1}, function(err, data) {  //get one random expression from PanLex
        data.result.forEach(function(ex) {
            if (wrdNumber == 1) {
                self.currentWord.tt = ex.tt;
                self.currentWord.ex = ex.ex
                self.currentWord.uid = lang;
                console.log(self.currentWord);
                var count = 200000;
                /*recalculate offset and recursively call _queryForWord() to find word2 (since word1 was
                  just successfully found*/
                offset = Math.floor(count*Math.random()+20000);
                self._queryForWord(sock,lang,offset,2);
            } else {
                if (ex.tt != self.currentWord.tt) { //if the candidate for word2 is not the same as word1
                    self.targetWord.tt = ex.tt;
                    self.targetWord.ex = ex.ex;
                    self.targetWord.uid = lang;
                    console.log(self.targetWord);
                    sock.emit(SEND_WORDS, self.currentWord.tt, self.targetWord.tt);   //send word1 and word2 back to client
                    console.log("just sent words");
                } else { //if word2 candidate is same as word1
                    self._queryForWord(sock, lang, (offset + 10000)%229000, wrdNumber);  //try again
                }
            }       
        });
    });
}

ChainGame.prototype.getTranslations = function(targetLang) {
    /* Parameters:
     *   targetLang: uid of target language variety
     * Returns:
     *   An array of translated strings.
     * Queries PanLex API for translations of currentWord into
     * specified language variety. */

    /*Finds translations of word1 (in the original user-selected language) into the second user-selected language 
      (both languages may be the same, in which case synonyms are emitted back to the client instead of 
      translations*/
    var self = this;
    console.log("in getTranslations()");
    panlex.query('/ex', {"uid":targetLang, "trtt":this.currentWord.tt}, function(err, data) {
        var words = [];
        for (var i=0; i<data.resultNum; i++) {
            words.push(data.result[i].tt.trim());
            console.log(data.result[i].tt.trim());
        }
        self.player.emit(TRANS_LIST, words);
    });
}

ChainGame.prototype.setCurrentWord = function(exp, lang) {
    /* Parameters:
     *   exp: the expression string the player has chosen
     *   lang: the uid string of exp
     * Sets current word to be exp of language variety lang, then
     * checks if player has won game. */
    this.currentWord.tt = exp;
    this.currentWord.uid = lang;
    if (this.isWinState()) {
        this.player.emit("win");
    }
}

ChainGame.prototype.isWinState = function() {
    /* Returns:
     *   a boolean
     * Checks if player has won game. true if currentWord matches targetWord.
     * false otherwise. */
    return this.currentWord.tt == this.targetWord.tt && 
           this.currentWord.uid == this.targetWord.uid;
}

ChainGame.prototype.resetGame = function() {
    /* Resets state of game. */
    this.getWords();
    console.log("Reset game");
}

ChainGame.prototype.getLanguageVarieties = function(exp) {
	/* Parameter:
	 *   exp: a string of the expression to be translated
	 * Returns:
	 *   an array of uid strings
	 * Gets uids of language varieties that have exp as a translation of
	 * some expression in the language variety. */

	var params = {
		trex: this.currentWord.ex,
        // can only get 2000 uids, which ones?
	};
	var self = this;
	panlex.query("/lv", params, function(err, data) {
		var lvList = [];
		for (var i=0; i<data.resultNum; i++) {
			lvList.push(data.result[i].uid);
		}
		self.player.emit(VALID_LANGUAGES, lvList);
	});
}

module.exports = ChainGame;