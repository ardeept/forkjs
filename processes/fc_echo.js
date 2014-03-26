/** SAMPLE APP for child_process usage**/

var Echo = require('../lib/echo');

var p = process.argv[2];

if(p)
{
    var e = new Echo({ id: p});
    e.init();

    e.on('status',function(status){
      console.log("got status message from child",status );
      // process.send({"status": status, "id" : p});
    })
    
    // this app's main routine
    process.on('message',function(m){
      switch(m.command)
      {
           case 'run'   : e.run(); break;
           case 'kill'  : e.kill(); break;
           default : console.log("Invalid command");
      }
    });
}
else
{
  console.log("Usage: node echo <int>");
}