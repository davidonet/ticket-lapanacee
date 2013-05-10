/**
 * Module dependencies.
 */

var express = require('express'), routes = require('./routes'), img = require('./routes/img'), dial = require('./routes/dial'),ticket = require('./routes/ticket'), http = require('http'), path = require('path');

var app = express();

app.configure(function() {
	app.set('port', 5100);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'hjs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(require('less-middleware')({
		src : __dirname + '/public'
	}));
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
	app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/dial',dial.index)
app.get('/queryname/:prefix',dial.query);
app.get('/queryname',dial.query);
app.get('/dialupdate',dial.update)
app.get('/ticket/:name', ticket.index);
app.post('/ticket/submitTicket', ticket.submit);
app.get('/ticket', ticket.index);
app.get('/update',ticket.updateDaylight);
app.get('/logo.svg', img.logo_svg);
app.get('/logo.png', img.logo_png);


http.createServer(app).listen(app.get('port'), function() {
	console.log("Express server listening on port " + app.get('port'));
});
