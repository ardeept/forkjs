/** SAMPLE APP **/

var util            = require('util');
var EventEmitter    = require('events').EventEmitter;

var Echo = function(c)
{
   var self = this;

   self.config = c;

   self.echoed = 0;

   

   self.init = function()
   {
      self.id     = self.config.id;
      
      self.max    = self.config.max;
   
      self.process = false;
      self.status  = 'ready';

      self.emit('status','ready');
   }

   self.run = function()
   {
      if(self.status == 'running')
      {
         // already running
         self.emit('status','already running');
      }
      else
      {
         self.running = setInterval(self.echo_console, 1000);      

         self.status = 'running';

         self.emit('status','running');
      }
   }

   self.echo_console = function()
   {
      if(self.status == 'running')
      {
         self.echoed++

         console.log(self.echoed, 'Hello world');

         self.emit('status','Sent ' + self.echoed + " of " + self.max); 

         // is this the last one?
         if(self.echoed == self.max)
         {
             self.done();
         }
      }
      else
      {
         self.emit('status','Not running'); 
      }
   }

   self.done = function()
   {
      clearInterval(self.running);
      self.emit('status','done');

      process.exit(0);
   }

   self.stop = function()
   {
      clearInterval(self.running);

      self.status  = 'stopped';

      self.emit('status','stopped');
   }

   self.resume = function()
   {
      self.run();
   }
}

util.inherits(Echo, EventEmitter);

module.exports = Echo;