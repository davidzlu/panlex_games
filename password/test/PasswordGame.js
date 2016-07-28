var assert = require('chai').assert;
var PasswordGame = require('./PasswordGame.js');
var socketio = require('socket.io-client');
var HOSTURL = "http://localhost:8000";


describe("Password Game API", function() {
  describe("Server connection", function() {
    it("sends message on connection", function(done) {
      var sock1 = socketio(HOSTURL);
	  sock1.on('msg', function(msg) {
        assert.equal(msg, "Hello, You are playing Password!");
		done();
	  });
	});

	it("matches players in pairs", function(done) {
      var sock1 = socketio(HOSTURL); 
	  sock1.on("matched", function(data) {
        assert.equal(data.role, "knower");
		done();
	  });

	  sock1.on("languageSuccess", function(data) {
        assert.equal(data.lang, "eng-000");
		assert.equal(data.waiting, true);

        var sock2 = socketio(HOSTURL);
		sock2.on("languageSuccess", function(data) {
          assert.equal(data.lang, "cmn-000");
		  assert.equal(data.waiting, false, "returned "+data.waiting);
		});
		sock2.emit("language", "cmn-000");
	  });
	  sock1.emit("language", "eng-000");
	});

	it("does not allow player to play against themselves", function(done) {
      var sock1 = socketio(HOSTURL);
	  var sock2 = sock1;

      sock2.on("matchFail", function(msg) {
        assert.equal(msg, "Error, can't play against yourself.");
		done();
	  });
	  sock1.emit("language", "eng-000");
	  sock2.emit("language", "eng-000");
	});
  });

  describe("PanLex data verification", function() {

  });

  describe("Receive password submission", function() {

  });

  describe("Receive clue submission", function() {

  });

  describe("Receive guess submission", function() {

  });

  describe("End round, restart game", function() {

  });
});
