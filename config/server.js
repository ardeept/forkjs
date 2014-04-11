var config = {};


/************************ SERVER RELATED config ****************************/

config.http_server_port 		= 8081;
config.max_instances			= 1;
config.driver					= './app/driver.js';
config.app_name					= 'MTAPP';
config.auto_run 				= true;


/************************ APP RELATED config ********************************/
// copy paste app config into here

config.app						= {};

config.app.host					= "localhost";


module.exports 					= config;