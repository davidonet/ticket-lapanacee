var mongo = require('mongoskin');
var async = require('async');
var cube = require('cube');

var emitter = cube.emitter("ws://log.bype.org:80");

var db = mongo.db("mongodb://cloud.bype.org/lapanacee", {
	safe : false
})

db.bind('tickets');

db.tickets.find({}).toArray(function(err, tickets) {
	async.each(tickets, function(ticket, fn) {
		emitter.send({
			type : 'ticketPanacee',
			time : ticket.time,
			data :{
				name : ticket.message
			}
		});
		fn();
	}, function() {
		console.log('done !!');
	});
});
