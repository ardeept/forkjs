/*********************************************************************************************************
  
  Author      :   Ferdinand Yanto III
  Class       :   Child_handle
  Date        :   March 28, 2014
  Description :     

  Driver


***********************************************************************************************************/

var App   = require('./app-test');
var uuid  = require('uuid');

var id = process.argv[2];

if(id !== 'undefined')
{
    var config = { id: id  };

    var e = new App(config);

    e.on('status',function(status){
      process.send({type:"status", "message": status, "id" : id});
    });

    e.on('message',function(message){
      process.send({type:"message", "message": message, "id" : id});
    });

    e.on('log',function(type, message){
      process.send({type:"log", "log_type" : type, "message": message, "id" : id});
    });


    e.init();

      
    // server to child communication
    process.on('message',function(m){
      if(m.command)
      {
        switch(m.command)
        {
             case 'run'     : e.run();      break;
             case 'stop'    : e.stop();     break;
             case 'resume'  : e.resume();   break;
             case 'kill'    : e.kill();     break;

             default        : process.send({type:"status", "message": "invalid command: " + m.command, "id" : p});
        }
      }
      else
      {
        // what's this for?
      }
    });
}
else
{
  process.send({type:"error", message: "1 integer param is required"});
}