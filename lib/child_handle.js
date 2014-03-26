var cp 					= require('child_process');
var util 				= require('util');
var EventEmitter 		= require('events').EventEmitter;


var Child_handle = function(config)
{
	var self 		= this;
	self.config 	= config;

	self.id 		= self.config['id'];
	self.process 	= self.config['process'];

	self.init = function()
	{
		self.instance  	= cp.fork(self.process,[self.id]);

		self.instance.on('error', 		self.error);
		self.instance.on('message', 	self.message);
		self.instance.on('close', 		self.closed);

		return self.instance;
	}

	self.closed = function(code, signal)
	{
		self.emit('closed',self.id, code, signal);
	}

	self.error = function(code, signal)
	{
		self.emit('error',self.id, code, signal);
	}

	self.message = function(m)
	{
		self.log("info","child message: " + m.id  + " [" + m.type + "]\t" + m.message);
	}

	self.log = function(type,message)
	{
		console.log("["+ self.id+"]", "[" + type + "] \t", new Date(), "\t", message);
	}

	self.send = function(message)
	{
		self.instance.send(message);
	}
}

util.inherits(Child_handle, EventEmitter);

module.exports = Child_handle;