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
	// self.app 		= self.config['app'];

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
	self.http_server_port 	= config.http_server_port;
	self.max_instances 		= config.max_instances || 2;

	// if this is set to true, when a RUN command is received by the server, it will spawn a process if it's not existing
	self.auto_run 			= config.auto_run || false;


	self.driver 			= self.driver;


	self.app_config 		= config.app;

	// this will store all the instances
	self.child_processes 		= {};
	self.child_processes_count 	= 0;

	// store ids when max instances is already created
	self.spawn_queue			= [];

	// this will receive all the remote commands
	self.http_server		= require('express').createServer();

	// run the server
	self.run = function()
	{
		self.run_remote_command_handler();

		self.log('info',"App: " + self.app_name);
	}

	// create the process here, and put it into the process array
	self.spawn_process = function(p)
	{
		// check first if this has been already spawned
		if(self.child_processes[p])
		{
			self.child_error("error","CAN'T SPAWN. ALREADY EXISTS:" + p);

			return false;
		}
		else
		{		
			// check max instances
			var id 			= p;

			if(self.child_processes_count < self.max_instances)
			{
				self.log('info',"Creating process:" + id);

				var c = new Child_handle({ process: self.driver, id:id});

				c.on('closed',self.child_closed);
				c.on('log',self.child_log);
				c.on('error',self.child_error);

				self.child_processes[id] = c;
				self.child_processes[id].init();

				// pass on the configuration for the app
				self.child_processes[id].send({ command: 'init', config: self.app_config });

				self.child_processes_count++;

				return true;
			}
			else
			{
				self.child_error("error","CAN'T SPAWN. MAX INSTANCES reached:" + self.max_instances);

				// queue instead?
				if(self.spawn_queue.indexOf(id) == -1)
				{
					self.spawn_queue.push(id);
				}
				else
				{
					// already in the queue
				}

				return false;
			}
		}
	}

	self.remove_child = function(id)
	{
		if(id)
		{
			delete self.child_processes[id];

			self.child_processes_count--;

			self.check_spawn_queue();
		}
		else
		{
			self.log("info","remove_child: child do not exist: " + id);	
		}
	}

	self.check_spawn_queue = function()
	{
		// check queue if there are waiting requests
		if(id = self.spawn_queue.shift())
		{
			self.log('info',"Retrieved from spawn queue: " + id);
			
			if(self.spawn_process(id))
			{
				if(self.auto_run)
				{
					self.send_command(id,{ 'command':'run'});
				}
			}
		}
		else
		{
			// queue is empty
		}
	}

	self.child_closed = function(id, code, signal)
	{		
		self.log("info","child closed: " + id + " " + code  + " [" + signal + "]");

		self.remove_child(id);
	}

	self.child_error = function(id, code, signal)
	{
		self.log("error","child error: " + code  + " [" + signal + "]");

		// self.remove_child(id);
	}
	
	self.send_command = function(id, message)
	{
		if(self.child_processes[id])
		{
			self.child_processes[id].send(message);
		}
		else
		{
			//child not running, so just create it
			if(self.auto_run)
			{
				if(self.spawn_process(id))
				{
					self.child_processes[id].send(message);
				}
				else
				{
					// failure to create the child
				}
				
				
			}
			else
			{
				self.log("info","child error: Child not found");
			}				
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

	self.run_remote_command_handler = function()
	{
		self.http_server.get('/', function(req, res){
		  var p = req.query;
		  
		  if(p['id'] && p['action'])
		  {
		  	self.remote_command(p['action'],p['id']);

		  	res.send('ACK ' + p['action'] + " " + p['id']);	
		  }
		  else
		  {
		  	res.send('INVALID_PARAM');
		  }  
		});

		self.http_server.listen(self.http_server_port);

		self.log("info", "Listening at Port: " + self.http_server_port);
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
			source_id = ("[ SERVER \t\t\t]   \t").server ;

		console.log( source_id  +   colored_type , (new Date() + "").prompt, "\t", message);
	}

	self.heartbeat = function()
	{
		
	}
}

util.inherits(Child_server, EventEmitter);

module.exports = Child_server;