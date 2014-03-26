/*
	Server.js will fork processes as requested via HTTP requests
*/



var express        		= require('express');
var cp 					= require('child_process');
var EventEmitter 		= require('events').EventEmitter;
var fork_server_port 	= 8081;
var process_path 		= "/processes/";

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

	self.spawn_process = function(p)
	{
		// check first if this has been already spawned
		
		if(self.child_processes[p])
		{
			self.child_error("ERROR","CAN'T SPAWN. ALREADY EXISTS:" + p);
		}
		else
		{
			self.child_processes[p] = cp.fork(__dirname + process_path + 'fc_app.js',[p]);
		
			// console.log(self.child_processes[p]);

			if(self.child_processes[p])
			{
				self.child_processes[p].on('error', self.child_error);
				self.child_processes[p].on('message', self.child_message);
				self.child_processes[p].on('close', self.child_closed);
			}
			else
			{
				self.child_error("ERROR","CAN't SPAWN");
			}	
		}
	}

	self.child_message = function(m)
	{
		self.log("info","child message: " + m.id  + " [" + m.type + "]\t" + m.message);
		// console.log(m);
	}

	self.child_closed = function(code, signal)
	{
		self.log("info","child closed: " + code  + " [" + signal + "]");
		// console.log(m);
	}

	self.child_error = function(code, signal)
	{
		self.log("info","child error: " + code  + " [" + signal + "]");
		// console.log(m);
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
}

var s = new Server();
s.run();


var app = require('express').createServer();

app.get('/', function(req, res){
  var p = req.query;

  console.log("HTTP REQ:",p);
  
  if(p['id'] && p['action'])
  {
  	s.remote_command(p['action'],p['id']);

  	res.send('ACK');	
  }
  else
  {
  	res.send('INVALID_PARAM');
  }  
});

app.listen(fork_server_port);

console.log("forkJS SERVER LISTENING at " + fork_server_port);