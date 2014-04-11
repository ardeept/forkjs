var fs 			= require('fs');
var Email 		= require('sendgrid').Email;
var SendGrid 	= require('sendgrid').SendGrid;
var sendgrid 	= new SendGrid('promotexter', 'ptsupp234');

var rt_port    = 11123;

var express        	= require('express');
var app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

io.configure(function(){
    io.set("transports", ["websocket"]);
});

server.listen(rt_port);

console.log("Mail RT server LISTENING AT " + rt_port);

io.sockets.on('connection', function (socket) {
  socket.on('send_test', function (c) {
    	console.log("email test request received");

    	var optionalParams = new Email({
			to: 			c.email,
			fromname: 		c.from_name,
			from: 			c.reply_to,
			subject: 		c.subject,
			html: 			c.content										
		});

		// console.log(optionalParams);
							       	
		var email = new Email(optionalParams);
		
		email.setCategory('MB_TEST');

		console.log('SENDING test TO ' + c.email + " " + new Date());
		sendgrid.send(email, function(success, message) {
			if(success)
			{
				socket.emit("send_test_result",true);
			}
			else
			{
				socket.emit("send_test_result",false,message);
			}
  		});
  	});
});

