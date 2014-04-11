/*********************************************************************************************************
	
	Author			: 	Ferdinand Yanto III
	Class 			: 	Child_server
	Date 			: 	March 28, 2014
	Description		: 		

	Child_server spawns child_handle. Child_server directly communicates with the child_handle EventEmitters.


***********************************************************************************************************/


var cp 					= require('child_process');
var util 				= require('util');
var EventEmitter 		= require('events').EventEmitter;
var colors 				= require('colors');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red',
  child: 'yellow',
  server: 'cyan'
});



var Child_handle = function(config)
{
	var self 		= this;
	self.config 	= config;

	self.id 		= self.config['id'];
	self.process 	= self.config['process'];

	self.init = function()
	{
		// fork the process now
		self.instance  	= cp.fork(self.process,[self.id]);

		// add some event handlers
		// this handlers will pass messages from the process, to the server
		self.instance.on('error', function(code, signal){
			self.emit('error',self.id, code, signal);
		});

		self.instance.on('message', function(m){
			var message = "[" + m.type + "]\t" + m.message;

			self.emit('log',self.id, "info", message);
		});

		self.instance.on('close', function(code, signal){
			self.emit('closed',self.id, code, signal);
		});

		return self.instance;
	}

	// send a message to the forked process
	self.send = function(message)
	{
		self.instance.send(message);
	}
}

util.inherits(Child_handle, EventEmitter);

var Child_server = function(config)
{
	var self 				= this;

	
	self.app_name 			= config.app_name;
	self.driver 			= config.driver;
	self.instance 			= config.instance;
	self.http_server_port 	= config.http_server_port;


	self.driver 			= self.driver;

	// this will store all the instances
	self.child_processes 	= {};

	// this will receive all the remote commands
	self.http_server		= require('express').createServer();

	// run the server
	self.run = function()
	{
		self.run_remote_command_handler();

		self.log('info',"Child_server running");
		self.log('info',"Driver:" + self.driver);
	}

	// create the process here, and put it into the process array
	self.spawn_process = function(p)
	{
		// check first if this has been already spawned
		if(self.child_processes[p])
		{
			self.child_error("error","CAN'T SPAWN. ALREADY EXISTS:" + p);
		}
		else
		{		
			var id 			= p;

			var c = new Child_handle({ process: self.driver, id:id});

			c.on('closed',self.child_closed);
			c.on('log',self.child_log);
			c.on('error',self.child_error);

			self.child_processes[id] = c;
			self.child_processes[id].init();
		}
	}

	self.child_closed = function(id, code, signal)
	{
		delete self.child_processes[id];
		self.log("info","child closed: " + id + " " + code  + " [" + signal + "]");
	}

	self.child_error = function(id, code, signal)
	{
		delete self.child_processes[id];
		self.log("error","child error: " + code  + " [" + signal + "]");
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

		self.http_server.listen(self.http_server_port);

		self.log("info", "forkJS SERVER LISTENING at " + self.http_server_port);
	}

	self.child_log = function(id,type,message)
	{
		self.log(type, message, id);		
	}

	self.log = function(type, message, id)
	{
		var colored_type ;
		switch(type)
		{
			case 'info'  : colored_type = ("[ INFO 	]  \t").info; break;
			case 'error' : colored_type = ("[ ERROR ]  \t").error; break;
			default : colored_type = "[" + type + "]";
		}

		var source_id;

		if(id)
			source_id = ("[ "+self.app_name+" #"+id+"   \t]   \t").child 
		else
			source_id = ("[ SERVER \t]   \t").server ;

		console.log( source_id  +   colored_type , (new Date() + "").prompt, "\t", message);
	}
}

util.inherits(Child_server, EventEmitter);

module.exports = Child_server;