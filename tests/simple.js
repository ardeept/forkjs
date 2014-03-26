/**
	This will send commands to the forkjs server
**/


var urls 	= 
	[
		"http://localhost:8081/?id=1&action=create", 	// create an instance with ID = 1
		"http://localhost:8081/?id=1&action=run", 		// trigger the run command for instance with ID = 1
	]

function run()
{
	var http 	= require('http');

	for(i = 0; i < urls.length ; i++)
	{
		http.get(urls[i],got_result);
	}
}

function got_result(res)
{
	res.on('data',data_received);
}

function data_received(body)
{
	console.log("Response", body.toString());
}

run();