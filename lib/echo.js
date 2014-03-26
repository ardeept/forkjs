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
      self.count  = self.config.id;
      self.id     = self.config.id;

      console.log("child init");
      self.emit('status','ready');
   }

   self.run = function()
   {
      var p = self.count;
      
      for(i = 0 ; i <= p; i++)
      { 
          setTimeout(self.echo_console, i * 1000);
      }
   }

   self.echo_console = function()
   {
      console.log(self.id,"Hello world");

      // is this the last one?
      if(self.echoed++ == self.count)
      {
          self.done();
      }
   }

   self.done = function()
   {
      self.emit('status','done');
   }
}

util.inherits(Echo, EventEmitter);

module.exports = Echo;