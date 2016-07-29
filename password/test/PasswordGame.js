var assert = require('chai').assert;
var PasswordGame = require('../PasswordGame.js');
var panlex = require('panlex');
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
	  var sock2 = socketio(HOSTURL);
	  sock1.on("matchSuccess", function(data) {
        assert.equal(data.role, "knower");
		done();
	  });
      sock2.on("languageSuccess", function(data) {
        assert.equal(data.lang, "cmn-000");
		assert.equal(data.waiting, false, "returned "+data.waiting);
	  });
	  
	  sock1.on("languageSuccess", function(data) {
        assert.equal(data.lang, "eng-000");
		assert.equal(data.waiting, true);
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

//    it("how does it handle a lot of sockets??", function(done) {
//
//	});

  });

  describe("PanLex queries", function() {
	it("confirms data in panlex is returned in query", function(done) {
	  console.log(PasswordGame);
      var sock1 = socketio(HOSTURL);
      var sock2 = socketio(HOSTURL);
      var pg = new PasswordGame(sock1, "eng-000", sock2, "eng-000");
	
      var params = {
        "uid":"eng-000",
		"tt":"text"
	  };
      panlex.query("/ex", params, function(err, data) {
	    assert.isTrue(pg._verifyExp(data, "text"));
		assert.isNotTrue(pg._verifyExp(data, "no"));
		done();
	  });
	});

	it("confirms data not in panlex not returned in query", function(done) {
      var sock1 = socketio(HOSTURL);
      var sock2 = socketio(HOSTURL);
      var pg = new PasswordGame(sock1, "eng-000", sock2, "eng-000");

	  params = {
        "uid":"eng-000",
		"tt":"nonsenseText"
	  };
      panlex.query("/ex", params, function(err, data) {
	    assert.isFalse(pg._verifyExp(data, "text"));
		assert.isFalse(pg._verifyExp(data, "nonsenseText"));
	  });
	});

	it("translates between any two languages", function() {

	});
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
