var Provider = require('sensation/src'), request = require('superagent');
var provider = new Provider();
var winston = require('winston');
var Graylog2 = require('winston-graylog2').Graylog2;
winston.add(Graylog2, {
	graylogHost : "log.bype.org"
});
provider.on('error', function(error) {
	console.log('Error:', error);
});

provider.on('temperature', function(temperature) {
	var that = this;
	winston.log("info", "temperature", {
		temperature : parseInt(temperature)
	});
});

provider.start(30000);
