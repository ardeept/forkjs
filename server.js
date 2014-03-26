/*
	Server.js will fork processes as requested via HTTP requests
*/



var cp 					= require('child_process');
var util 				= require('util');
var EventEmitter 		= require('events').EventEmitter;

var config        		= require('./config/server');
var Child_handle 		= require('./lib/child_handle');

var fork_server_port 	= config.fork_server_port;
var process_path 		= config.process_path;

var Server = function()
{
	var self 				= this;

	// this will store all the instances
	self.child_processes 	= {};

	// this will receive all the remote commands
	self.http_server		= require('express').createServer();

	self.run = function()
	{
		self.run_remote_command_handler();

		self.log('info',"Server running");
	}

	self.log = function(type,message)
	{
		console.log("[" + type + "] \t", new Date(), "\t", message);
	}

	self.spawn_process = function(p)
	{
		// check first if this has been already spawned
		
		if(self.child_processes[p])
		{
			self.child_error("ERROR","CAN'T SPAWN. ALREADY EXISTS:" + p);
		}
		else
		{
	
			var process 	= __dirname + process_path + 'fc_app.js';
			var id 			= p;

			var c = new Child_handle({ process: process, id:id});

			c.on('closed',self.child_closed);
			c.on('error',self.child_error);

			self.child_processes[id] = c;
			self.child_processes[id].init();

		}
	}

	self.child_closed = function(id, code, signal)
	{
		delete self.child_processes[id];
		self.log("info","child closed: " + code  + " [" + signal + "]");
	}

	self.child_error = function(id, code, signal)
	{
		delete self.child_processes[id];
		self.log("info","child error: " + code  + " [" + signal + "]");
	}
	


	self.send_command = function(id, message)
	{
		if(self.child_processes[id])
		{
			self.child_processes[id].send(message);
		}
		else
		{
			self.log("info","child error: Child not found");
		}
	}

	self.child_kill = function(id)
	{
		if(self.child_processes[id])
		{
			self.child_processes[id].kill();

			delete self.child_processes[id];
		}
		else
		{
			self.log("info","child error: Child not found");
		}
	}

	self.remote_command = function(command, id)
	{
		if(id)
		{
			switch(command)
			{
				case 'create'	:
				
					self.spawn_process(id);

					break;

				case 'run'	:

					self.send_command(id,{ 'command':'run'});

					break;

				case 'stop'	:
				
					self.send_command(id,{ 'command':'stop'});

					break;

				case 'resume'	:
				
					self.send_command(id,{ 'command':'resume'});

					break;

				case 'kill'	:
				
					self.child_kill(id);

					break;

				default :
					self.log("error","invalid command for "+ id);

			}
		}
		else
		{
			self.log("error","invalid ID");
		}
	}

	self.run_remote_command_handler = function()
	{
		self.http_server.get('/', function(req, res){
		  var p = req.query;

		  // console.log("HTTP REQ:",p);
		  
		  if(p['id'] && p['action'])
		  {
		  	self.remote_command(p['action'],p['id']);

		  	res.send('ACK');	
		  }
		  else
		  {
		  	res.send('INVALID_PARAM');
		  }  
		});

		self.http_server.listen(fork_server_port);

		self.log("info", "forkJS SERVER LISTENING at " + fork_server_port);
	}
}




var s = new Server();
s.run();