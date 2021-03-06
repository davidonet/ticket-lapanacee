var fs = require('fs');
var jsdom = require('jsdom');
var $;
var svgCt;
fs.readFile('data/panacee.svg', function(err, xml) {
	svgCt = xml;
	if (err)
		throw err;
	jsdom.env({
		html : xml,
		scripts : ['http://localhost:5100/js/lib/jquery-1.9.1.min.js'],
		done : function(err, window) {
			$ = window.jQuery;
			$('g').attr('transform', 'translate(32 0)');
		}
	});

});

function randomizeLogo() {
	$('.movL').each(function(idx, value) {
		var sign = (Math.random() < .5 ? -1 : 1);
		var arc = (Math.PI / 2) - (sign * ((Math.PI / 12) + (Math.PI / 16) * Math.random()));
		var scale = Math.sin(arc);
		var shear = Math.cos(arc) / (2 * scale);
		$(value).attr('stroke', "none");
		$(value).attr('transform', 'matrix(1,0,' + shear + ',' + scale + ',0,87.5) translate(32 -87.5)');
	});
}

exports.logo_svg = function(req, res) {
	randomizeLogo();
	res.writeHead(200, {
		"Content-Type" : "image/svg+xml"
	});
	res.end($('svg')[0].outerHTML);
};

var im = require('imagemagick');

exports.logo_png = function(req, res) {
	randomizeLogo();
	res.writeHead('200', {
		'Content-Type' : 'image/png',
	});
	fs.writeFile('/tmp/logo.svg', $('svg')[0].outerHTML, function(err) {
		var conv = im.convert(['/tmp/logo.svg', 'png:-']);
		conv.on('data', function(data) {
			res.write(data, 'binary');
		});
		conv.on('end', function() {
			res.end();
		});
	});
};
