/**
	This will send commands to the forkjs server
**/


function run(count)
{
	var http 	= require('http');

	for(i = 1; i <= count ; i++)
	{
		var url_create 	= "http://localhost:8081/?id="+i+"&action=create";
		var url_run 	= "http://localhost:8081/?id="+i+"&action=run";

		http.get(url_create,got_result);
		http.get(url_run,got_result);
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

var count = process.argv[2] || 1
run(count);