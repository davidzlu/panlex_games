var panlex = require("panlex");
panlex.setUserAgent("Chain Game", "0.0");

//Event names


function ChainGame(sock, lang) {
    /* Constructor function for creating an instance of the game. */
    this.player = sock;
    this.playerLang = lang;
    this.currentWord = {
        tt:"",
        uid:"",
    };
    this.targetWord = {
        tt:"",
        uid:"",
    };
    this.translations = [];
    this.forfeited = false;
    this.initSocket(sock);
}

ChainGame.prototype.initSocket = function(sock) {
    /* Sets up event listeners for socket */
    var self = this;
    sock.on("askWords", function(lang) {
        self.getWords(sock, lang);
    });
    sock.on("askTrans", function(lang) { //called when user asks for translations of word1
        self.getTranslations(lang);
    });

}

ChainGame.prototype.getWords = function() {
    var count = 230000;    //hard-coded, corresponds approximately to number of expressions in eng-000 
           //(will eventually be changed to a query of the PanLex database to find how many expressions exist)
    var offset = Math.floor(count*Math.random()+20000);
    this._queryForWord(this.player, this.playerLang, offset, 1);
}

ChainGame.prototype._queryForWord = function(sock, lang, offset, wrdNumber) {
	var self = this;
    panlex.query('/ex', {uid:lang,offset:offset,limit:1}, function(err, data) {  //get one random expression from PanLex
        data.result.forEach(function(ex) {
            if (wrdNumber == 1) {
                self.currentWord.tt = ex.tt;
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
                    self.targetWord.uid = lang;
                    console.log(self.targetWord);
                    sock.emit("sendWords", self.currentWord.tt, self.targetWord.tt);   //send word1 and word2 back to client
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
        for (var i=0; i<data.resultNum; i++) {
            var word = data.result[i].tt;
            console.log(word);
            self.player.emit("singleTrans", word); //emits translations back to client one at a time
        }
    });

}

ChainGame.prototype.setCurrentWord = function(exp, lang) {
    /* Parameters:
     *   exp: the expression string the player has chosen
     *   lang: the uid string of exp
     * Sets current word to be exp of language variety lang. */

}

ChainGame.prototype.isValidExp = function(exp) {
    /* Parameters:
     *   exp: a string submitted by client, intended as next word in chain
     * Returns:
     *   a boolean
     * Checks if player submission is valid. true if exp in list of all
     * translations of currentWord. false otherwise.

}

ChainGame.prototype.isWinState = function() {
    /* Returns:
     *   a boolean
     * Checks if player has won game. true if currentWord matches targetWord.
     * false otherwise. */
    
}

ChainGame.prototype.isLoseState = function() {
    /* Returns:
     *   a boolean
     * Checks if player has lost game. true if forfeited is true. false otherwise. */

}

ChainGame.prototype.resetGame = function() {
    /* Resets instance variables to those at beginning of game. Emits a confirmation
     * when finished. */

}

module.exports = ChainGame;
