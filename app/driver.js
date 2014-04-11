/*********************************************************************************************************
  
  Author      :   Ferdinand Yanto III
  Class       :   Child_handle
  Date        :   March 28, 2014
  Description :     

  Driver


***********************************************************************************************************/

var App         = require('./main');
var uuid        = require('uuid');
var id          = process.argv[2];

if(id !== 'undefined')
{
    var App_config        = {};

    App_config['id'] = id;

    var e = new App(App_config);

    e.on('status',function(status){
      process.send({type:"status", "message": status, "id" : id});
    });

    e.on('message',function(message){
      process.send({type:"message", "message": message, "id" : id});
    });

    e.on('log',function(type, message){
      process.send({type:"log", "log_type" : type, "message": message, "id" : id});
    });
      
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
             case 'init'    : e.init(m.config);     break;

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