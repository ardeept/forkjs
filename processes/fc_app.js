/** SAMPLE APP for child_process usage**/

var App   = require('./app');
var uuid  = require('uuid');

var id = process.argv[2];

if(id !== 'undefined')
{
    var config = { id: id  };

    // let's add some simulated data for the app
    config.max    = parseInt(id);


    var e = new App(config);

    e.on('status',function(status){
      // send to server
      process.send({type:"status", "message": status, "id" : id});
    });

     e.on('message',function(message){

      // send to server
      process.send({type:"message", "message": message, "id" : id});
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