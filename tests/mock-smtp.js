var express = require('express');
var app = express();

app.get('/mail', function(req, res){	
	var p = req.query;

	
	res.send('0 ' + p.email);
	
});

app.listen(20003);