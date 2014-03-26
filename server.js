/*
	Server.js will fork processes as requested via HTTP requests
*/



var express        	= require('express');
var cp 				= require('child_process');
var EventEmitter 	= require('events').EventEmitter;

// array of child processes
var child_processes = [];

var Server = function()
{
	var self 			= this;

	self.child_processes = {};

	self.run = function()
	{
		self.log('info',"Server running");
	}

	self.log = function(type,message)
	{
		// output the message to the console

		console.log("[" + type + "] \t", new Date(), "\t", message);
	}

	self.create_child = function(p)
	{
		self.child_processes[p] = cp.fork(__dirname + '/processes/fc_echo.js',[p]);
		self.child_processes[p].on('message', self.child_message);
	}

	self.child_message = function(m)
	{
		self.log("info","child message: " + m.status + " " + m.id);
		console.log(m);
	}

	self.send_command = function(id, message)
	{
		self.child_processes[id].send(message);
	}
}

var s = new Server();
s.run();
s.create_child(2);
// s.send_command(2,{ 'command':'run'});

s.create_child(3);
// s.send_command(3,{ 'command':'run'});