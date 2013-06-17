requirejs.config({
	paths : {
	}
});

var width, height, xcenter, ycenter;
var curName = "";
var letSet;
var paper;
var drawLetters;

require(["jquery", "lib/raphael-min"], function($) {
	$(document).click(function() {
		if (document.documentElement.mozRequestFullScreen)
			document.documentElement.mozRequestFullScreen();
	});
	$('.info').hide();
	$(window).resize(function() {
		width = $(document).width();
		height = $(document).height();
		xcenter = Math.floor(width - (height / 2));
		ycenter = Math.floor(height / 2);
		paper = Raphael(0, 0, width, height);
		
		require(['dial_ui', 'dial_letter'], function(ui, letter) {
			ui.setup();
			letter.setup();
			$('.info').show();
		});

	});
});
