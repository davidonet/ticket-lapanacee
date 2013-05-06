var moment = require('moment');
var http = require('http');
var request = require('request');
var parseString = require('xml2js').parseString;
var async = require('async');
var phantom = require('node-phantom');
var childProcess = require('child_process');
var querystring = require("querystring");

moment.lang("fr");
sunrise = moment("06:00", "HH:mm");
sunset = moment("18:00", "HH:mm");

exports.updateDaylight = function(req, res) {
	http.get({
		host : "www.earthtools.org",
		path : "/sun/43.612809/3.878124/" + moment().date() + "/" + (moment().month() + 1) + "/99/0"
	}).on('response', function(response) {
		response.setEncoding('utf8');
		response.on('data', function(data) {
			parseString(data, function(err, result) {
				sunrise = moment(result.sun.morning[0].sunrise[0], "HH:mm");
				sunset = moment(result.sun.evening[0].sunset[0], "HH:mm");
				res.json({
					sunrise : sunrise,
					sunset : sunset
				});
			});
		});
	});
};

var ano = [];

request.post('http://www.gunof.net/names/generateAjax', {
	form : {
		"data[nation]" : 'old_french',
		"data[gender]" : "M",
		"data[num]" : 30
	}
}, function(error, response, body) {
	if (!error && response.statusCode == 200) {
		var aLst = JSON.parse(body).names;

		request.post('http://www.gunof.net/names/generateAjax', {
			form : {
				"data[nation]" : 'old_french',
				"data[gender]" : "F",
				"data[num]" : 30
			}
		}, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				var aLst1 = JSON.parse(body).names;
				ano = ano.concat(aLst, aLst1);
			}
		});
	}
});

exports.index = function(req, res) {
	var data = {
		date : "Jeudi 18 juillet 2013",
		time : "15h30",
		hello : "Bonjour ",
		context : "Hier soir, dans <b>Textopoly</b>, spectre a écrit :",
		what : "                                    court sur le chemin et retient la terre dans sa main refermée en poing",
		where : "<b>http://www.textopoly.org</b>"

	};
	http.get({
		host : "api.lapan.ac",
		path : "/textopoly/pickTxt"
	}).on('response', function(response) {
		response.setEncoding('utf8');
		response.on('data', function(rTxt) {
			var txt = JSON.parse(rTxt);
			data.what = txt.t;
			data.what.replace(/\s+/g, " ");
			data.fsize = 200 - 15 * Math.sqrt((data.what.length - 100) / 8);
			data.context = txt.mt + "<br/>dans TEXTOPOLY<br/>" + txt.a + " a écrit : ";
			if ((moment().dayOfYear(1).year(0).isAfter(sunset)) && (moment().dayOfYear(1).year(0).isAfter(sunrise)))
				data.hello = "Bonsoir ";
			data.date = moment().format("dddd D MMMM YYYY");
			data.time = moment().format("HH[h]mm");
			if (req.params.name)
				data.hello += req.params.name;
			else
				data.hello += ano[Math.floor(Math.random() * ano.length)];
			res.render('ticket', data);

		});
	});
};

exports.submit = function(req, res) {
	var it = new Array(req.body.number);
	for (var i = 0; i < req.body.number; i++)
		it[i] = i;
	console.log(it);
	var pf = "";
	var wf = "";
	async.each(it, function(item, fn) {
		wf += '/tmp/' + item + 'ticket.png ';
		pf += '/tmp/' + item + 'ticket_th.png ';
		phantom.create(function(err, ph) {
			ph.createPage(function(err, page) {
				var url = "http://localhost:5100/ticket";
				if (req.body.name)
					url += "/" + encodeURIComponent(req.body.name);
				page.open(url, function() {
					page.viewportSize = {
						width : 640,
						height : 800
					};
					page.render('/tmp/' + item + 'ticket.png', function() {
						
						ph.exit();
						var conProc = childProcess.exec('convert /tmp/' + item + 'ticket.png -scale 609x -black-threshold 70% -depth 1 /tmp/' + item + 'ticket_th.png', function(error, stdout, stderr) {
							
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
		console.log(pf);
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
			res.redirect('/');
		});
	});
};
