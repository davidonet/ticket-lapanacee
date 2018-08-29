var mongo = require('mongoskin');
var async = require('async');
//var cube = require('cube');
//var emitter = cube.emitter("ws://log.bype.org:80");

var db = mongo.db("mongodb://cloud.bype.org/lapanacee", {
	safe : false
})

db.bind('tickets');

db.tickets.find({
	time : {
		$gt : new Date('2013-06-23')
	}
}).toArray(function(err, tickets) {
	var hours = [];
	var days = [];
	var sum = 0;
	for (var h = 0; h < 24; h++)
		hours[h] = 0;
	for (var d = 0; d < 7; d++)
		days[d] = 0;

	async.each(tickets, function(ticket, fn) {
		hours[ticket.time.getHours()]++;
		days[ticket.time.getDay()]++;
		sum++;
		fn();
	}, function() {
		console.log('hours');
		for (var h = 0; h < 24; h++)
			console.log(h, Math.floor(100 * hours[h] / sum));
		console.log('day');
		for (var d = 0; d < 7; d++)
			console.log(d, Math.floor(100 * days[d] / sum));

		console.log('done !!');
	});
});
