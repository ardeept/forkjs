var Marker = function(c)
{
	var self 	= this;

	self.id  	= c.id;

	self.start 	= new Date().getTime();
}


var Benchmark = function()
{
	var self = this;

	self.markers = {};

	self.mark_start = function(id)
	{
		if(self.markers[id])
		{
			//already existing

			// just refresh the start param
			self.markers[id].start = new Date().getTime();
		}
		else
		{
			var m = new Marker(id);

			self.markers[id] = m;

		}
	}

	self.mark_end = function(id)
	{
		if(self.markers[id])
		{
			// ok
			
			// compute latency
			var latency = new Date().getTime() -  self.markers[id].start;

			// remove data
			delete self.markers[id];

			return latency;

		}
		else
		{
			// invalid marker
		}
	}
}


module.exports = Benchmark;