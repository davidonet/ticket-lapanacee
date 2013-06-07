var moment = require('moment');
var http = require('http');
var request = require('request');
var parseString = require('xml2js').parseString;
var async = require('async');
var phantom = require('node-phantom');
var childProcess = require('child_process');
var querystring = require("querystring");
request.defaults({proxy:process.env.HTTP_PROXY});



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
proxy:process.env.HTTP_PROXY,
	form : {
		"data[nation]" : 'old_french',
		"data[gender]" : "M",
		"data[num]" : 30
	}
}, function(error, response, body) {
	if (!error && response.statusCode == 200) {
		var aLst = JSON.parse(body).names;

		request.post('http://www.gunof.net/names/generateAjax', {
proxy:process.env.HTTP_PROXY,
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
		bighi : "BJR",
		context : "Hier soir, dans <b>Textopoly</b>, spectre a écrit :",
		what : "                                    court sur le chemin et retient la terre dans sa main refermée en poing",
		where : "www.textopoly.org"

	};
	request.get("http://api.lapan.ac/textopoly/pickTxt",{proxy:process.env.HTTP_PROXY} ,function(error,response,body) {
		
			var txt = JSON.parse(body);
			data.what = txt.t.replace(/\s+/g,' ');
			data.fsize = 40-Math.floor(3 * Math.sqrt((data.what.length/6)));
			console.log(data.what.length,data.what)
			data.context = txt.mt + "<br/>" + txt.a + " a écrit dans<br/><em>" + data.where + "</em>";
			if ((moment().dayOfYear(1).year(0).isAfter(sunset)) && (moment().dayOfYear(1).year(0).isAfter(sunrise)))
				data.hello = "Bonsoir ";
			data.date = moment().format("dddd D MMMM YYYY");
			data.time = moment().format("HH[h]mm");
			if (!req.params.name)
				req.params.name = ano[Math.floor(Math.random() * ano.length)];
			data.hello += req.params.name;

			data.bigname = req.params.name[0];
			var dashpos = req.params.name.indexOf('-');
			if (0 < dashpos) {
				data.bigname += '-';
				data.bigname += req.params.name[dashpos + 1];
			} else {
				var name = req.params.name.slice(1, -1).replace(/[aeiou]/ig, '');
				if (1 < name.length)
					data.bigname += name[Math.floor(1 + ((name.length - 1) * Math.random()))];
				else
					data.bigname += name[0];
				data.bigname += req.params.name[req.params.name.length - 1];
			}
			data.bigname = data.bigname.toUpperCase();
			data.context = data.hello + '<br/>' + data.context;

			data.fsign = (Math.random() < 0.5 ? '-' : '+') + Math.floor(10+Math.random()*5);

			res.render('ticket', data);

		
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
						height : 1024
					};
					page.render('/tmp/' + item + 'ticket.png', function() {

						ph.exit();
						var conProc = childProcess.exec('convert /tmp/' + item + 'ticket.png  -scale 609x -black-threshold 70% -depth 1 /tmp/' + item + 'ticket_th.png', function(error, stdout, stderr) {

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
