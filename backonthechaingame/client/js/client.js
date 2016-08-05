var socket = io.connect("http://127.0.0.1:8000");
console.log("outside jQuery");
	socket.on('connect', (socket) => {
        console.log("connected!");
		//socket.write("stuff");
    });
	socket.on('msg', function(msg,err){
		if(err){
			console.log(err);
		}
		console.log(msg);
	});
$(document).ready(function(){
    //var io = require('socket.io');
    
    var curScreen = $("#firstContainer");
    console.log("right at beginning");
    $("#secondContainer").hide();
    $("p").text("This text was changed using client.js");
    $(":button").on("click",function(){
        console.log("button clicked");
		var language = $("#selectLanguage").val();
		console.log("language: "+language);
        curScreen.fadeOut(function(){
            curScreen = $("#secondContainer");
            curScreen.fadeIn();
        });
    });

});
