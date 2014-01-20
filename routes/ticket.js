var moment = require('moment');
var http = require('http');
var request = require('request');
var parseString = require('xml2js').parseString;
var async = require('async');
var phantom = require('node-phantom');
var childProcess = require('child_process');
var querystring = require("querystring");
var winston = require('winston');
var Graylog2 = require('winston-graylog2').Graylog2;
winston.add(Graylog2, {
	graylogHost : "log.bype.org"
});

request.defaults({
	proxy : process.env.HTTP_PROXY
});

moment.lang("fr");
sunrise = moment("06:00", "HH:mm");
sunset = moment("18:00", "HH:mm");

exports.updateDaylight = function(req, res) {
	request.get("http://www.earthtools.org/sun/43.612809/3.878124/" + moment().date() + "/" + (moment().month() + 1) + "/99/0", {
		proxy : process.env.HTTP_PROXY
	}, function(error, response, body) {
		response.setEncoding('utf8');
		parseString(body, function(err, result) {
			sunrise = moment(result.sun.morning[0].sunrise[0], "HH:mm").add('h', 1);
			sunset = moment(result.sun.evening[0].sunset[0], "HH:mm").add('h', 1);
			winston.info("sun time", {
				sunrise : result.sun.morning[0].sunrise[0],
				sunset : result.sun.evening[0].sunset[0]
			});
			if (res)
				res.json({
					sunrise : sunrise,
					sunset : sunset
				});
		});

	});
};

exports.heartbeat = function(req, res) {
	winston.info("heartbeat", {
		client : req.params.client,
		ping : 1.0
	});
	res.json({
		success : true
	});
};

exports.updateDaylight();

function textopolyGet(data, fn) {
	request.get("http://api.lapan.ac/textopoly/pickTxt", {
		proxy : process.env.HTTP_PROXY
	}, function(error, response, body) {
		var txt = JSON.parse(body);
		data.what = txt.t.replace(/\s+/g, ' ');
		data.fsize = 42 - Math.floor(3 * Math.sqrt((data.what.length / 6)));
		if (data.what.length < 5) {
			data.fsize = 300;
			data.what = "?!";
		}
		data.context = txt.mt + " " + txt.a + " dans<br/><em>www.textopoly.org</em>";
		fn(data);
	});
}

function microblogGet(data, fn) {
	request.get("http://pan.lapanacee.org/api/mb", {
		proxy : process.env.HTTP_PROXY
	}, function(error, response, body) {
		var mb = JSON.parse(body).microblog[0].post;
		data.what = mb.b.replace(/\n/g, '<br/>');
		data.fsize = 42 - Math.floor(3 * Math.sqrt((data.what.length / 6)));
		if (data.what.length < 5) {
			data.fsize = 300;
			data.what = "?!";
		}
		data.context = moment.unix(mb.d).fromNow() + "<br/>";

		if (mb.i !== "") {
			data.what = "<img src='" + mb.i + "'/>";
			if (mb.b !== "") {

				if (mb.b.length < 30) {
					data.context += mb.b;
				} else {
					data.context += mb.b.slice(0, 27);
					data.context += "...";
				}
				data.context += "<br/>&nbsp;";
			}
		} else {
			data.context += "&nbsp;";
		}

		fn(data);
	});
}

exports.index = function(req, res) {
	var data = {
		date : "Jeudi 18 juillet 2013",
		time : "15h30",
		hello : "Bonjour ",
		bighi : "BJR",
		context : "",

	};

	if ((moment().dayOfYear(1).year(0).isAfter(sunset)) && (moment().dayOfYear(1).year(0).isAfter(sunrise))) {
		data.hello = "Bonsoir ";
		data.bighi = "BSR ";
	}
	data.date = moment().format("dddd D MMMM YYYY");
	data.time = moment().format("HH[h]mm");

	if ((!req.params.name) || (req.params.name.length < 2)) {
		req.params.name = "";
		data.bigname = '~~~';
	} else {

		if (req.params.name.length < 3)
			req.params.name = req.params.name[0] + " " + req.params.name[1];

		data.bigname = req.params.name[0];
		data.hello += req.params.name;

		var dashpos = req.params.name.indexOf('-');
		if (0 < dashpos) {
			data.bigname += '-';
			data.bigname += req.params.name[dashpos + 1];
		} else {
			var name = req.params.name.slice(1, -1).replace(/[aeiou]/ig, '');
			if (1 < name.length)
				data.bigname += name[Math.floor(1 + ((name.length - 1) * Math.random()))];
			else {
				if (1 == name.length)
					data.bigname += name[0];
				else
					data.bigname += " ";
			}
			data.bigname += req.params.name[req.params.name.length - 1];
		}
		if (req.params.name.length == 3)
			data.bigname = req.params.name;
		data.bigname = data.bigname.toUpperCase();
	}
	data.fsign = (Math.random() < 0.5 ? '-' : '+') + Math.floor(10 + Math.random() * 5);

	microblogGet(data, function(data) {
		data.context = data.hello + '<br/>' + data.context;
		res.render('ticket', data);
	});
};

exports.submit = function(req, res) {
	var it = new Array(req.body.number);
	for (var i = 0; i < req.body.number; i++)
		it[i] = i;

	var pf = "";
	var wf = "";
	winston.info("ticket", {
		name : req.body.name || "~",
		nb : 0 + parseInt(req.body.number) || 1
	});
	async.each(it, function(item, fn) {
		wf += '/tmp/' + item + 'ticket.png ';
		pf += '/tmp/' + item + 'ticket_th.ps ';
		phantom.create(function(err, ph) {
			ph.createPage(function(err, page) {
				var url = "http://localhost/ticket";
				if (req.body.name)
					url += "/" + encodeURIComponent(req.body.name);
				page.open(url, function() {
					page.viewportSize = {
						width : 640,
						height : 1024
					};
					page.render('/tmp/' + item + 'ticket.png', function() {

						ph.exit();
						var conProc = childProcess.exec('convert /tmp/' + item + 'ticket.png  -black-threshold 70% -depth 1 -density 85 /tmp/' + item + 'ticket_th.ps', function(error, stdout, stderr) {

							if (error) {
								console.log(error.stack);
								console.log('Error code: ' + error.code);
								console.log('Signal received: ' + error.signal);
							}
						});
						conProc.on('exit', function(code) {
							fn();
						});
					});
				});
			});
		});
	}, function(err) {
		var printProc = childProcess.exec('lpr ' + pf, function(error, stdout, stderr) {
			if (error) {
				console.log(error.stack);
				console.log('Error code: ' + error.code);
				console.log('Signal received: ' + error.signal);
			}
		});

		printProc.on('exit', function(code) {
			childProcess.exec('rm -f ' + pf, function(error, stdout, stderr) {
				if (error) {
					console.log(error.stack);
					console.log('Error code: ' + error.code);
					console.log('Signal received: ' + error.signal);
				}
			});
			childProcess.exec('rm -f ' + wf, function(error, stdout, stderr) {
				if (error) {
					console.log(error.stack);
					console.log('Error code: ' + error.code);
					console.log('Signal received: ' + error.signal);
				}
			});
			res.json({
				success : true
			});
		});
	});
};

