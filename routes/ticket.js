var moment = require('moment');
var http = require('http');
var parseString = require('xml2js').parseString;
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

exports.index = function(req, res) {
	var data = {
		date : "Jeudi 18 juillet 2013",
		time : "15h30",
		hello : "Bonjour ",
		context : "Hier soir, dans <em>Delayed</em>, de Matthias Gommel, une femme a dit ceci:",
		what : "«C’est comme à la maison, tu me laisses jamais finir mes phrases».",
		where : "Salle 2 - <em>Delayed</em>, Matthias Gommel (2002)"

	};
	if ((moment().dayOfYear(1).year(0).isAfter(sunset)) && (moment().dayOfYear(1).year(0).isAfter(sunrise)))
		data.hello = "Bonsoir ";
	data.date = moment().format("dddd D MMMM YYYY");
	data.time = moment().format("HH[h]mm");
	data.hello += (req.params.name ? req.params.name : " A. Nonyme")
	res.render('ticket', data);
};

var phantom = require('node-phantom');
var childProcess = require('child_process');
var querystring = require("querystring");

exports.submit = function(req, res) {
	phantom.create(function(err, ph) {
		ph.createPage(function(err, page) {
			var url = "http://localhost:5090/ticket/" + encodeURIComponent(req.body.name);
			page.open(url, function() {
				page.viewportSize = {
					width : 640,
					height : 800
				};

				page.render('/tmp/ticket.png');
				res.redirect('/');
				setTimeout(function() {
					ph.exit();
					var conProc = childProcess.exec('convert /tmp/ticket.png -scale 609x -black-threshold 70% -depth 1 /tmp/ticket_th.png', function(error, stdout, stderr) {
						if (error) {
							console.log(error.stack);
							console.log('Error code: ' + error.code);
							console.log('Signal received: ' + error.signal);
						}
					});
					conProc.on('exit', function(code) {
						
						childProcess.exec('lpr /tmp/ticket_th.png', function(error, stdout, stderr) {
							if (error) {
								console.log(error.stack);
								console.log('Error code: ' + error.code);
								console.log('Signal received: ' + error.signal);
							}
						});
					});
				}, 200);
				
			});
		});
	});
};
