var config        		= require('./config/server');

var Child_server      	= require('./lib/child_server');


var s = new Child_server(config);
s.run();