/**
	This will send commands to the forkjs server
**/


var urls 	= 
	[
		"http://localhost:8081/?id=10&action=create", 	
		"http://localhost:8081/?id=10&action=run", 		
		"http://localhost:8081/?id=20&action=create", 	
		"http://localhost:8081/?id=20&action=run",
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