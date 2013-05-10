requirejs.config({
	paths : {
	}
});
require(["jquery", "lib/raphael-min"], function($) {

	var width = $(document).width();
	var height = $(document).height();
	var xcenter = Math.floor(width - (height / 2));
	var ycenter = Math.floor(height / 2);
	var paper = Raphael(0, 0, width, height);
	var curPrintName;
	var curName = "";
	var letSet;

	// White circle

	var circle = paper.circle(xcenter, ycenter, height / 2);
	circle.attr("fill", "white");
	circle.attr("stroke", "none");

	// OK Icon
	paper.setStart();
	paper.circle((xcenter + 100), (ycenter + 100), 30).attr("fill", "#000").attr("stroke", "none");
	var okIc = paper.path('M2.379,14.729 5.208,11.899 12.958,19.648 25.877,6.733 28.707,9.561 12.958,25.308z').attr({
		fill : "#fff",
		stroke : "none"
	});
	okIc.transform("t" + (xcenter + 85) + "," + (ycenter + 85) + "s1.5");
	paper.setFinish().click(function() {
		console.log("OK", curName);
	});

	// Cancel Icon
	paper.setStart();
	paper.circle((xcenter - 100), (ycenter + 100), 30).attr("fill", "#000").attr("stroke", "none");
	var cancelIc = paper.path('M24.778,21.419 19.276,15.917 24.777,10.415 21.949,7.585 16.447,13.087 10.945,7.585 8.117,10.415 13.618,15.917 8.116,21.419 10.946,24.248 16.447,18.746 21.948,24.248z').attr({
		fill : "#fff",
		stroke : "none"
	});
	cancelIc.transform("t" + (xcenter - 117) + "," + (ycenter + 85) + "s1.7");
	paper.setFinish().click(function() {
		curName = '';
		letSet.attr("opacity", 0.5);
		$.get("/queryname", function(data) {
			letSet.remove();
			letSet.clear();
			drawLetters(data);
		});
	});

	// Back Icon
	paper.setStart();
	paper.circle(xcenter, (ycenter - 100), 30).attr("fill", "#000").attr("stroke", "none");
	var backIc = paper.path("M21.871,9.814 15.684,16.001 21.871,22.188 18.335,25.725 8.612,16.001 18.335,6.276z").attr({
		fill : "#fff",
		stroke : "none"
	});
	backIc.transform("t" + (xcenter - 15) + "," + (ycenter - 115) + "s1.5");
	paper.setFinish().click(function() {
		curName = curName.slice(0, curName.length - 1);
		letSet.attr("opacity", 0.5);
		$.get("/queryname/" + curName, function(data) {
			letSet.remove();
			letSet.clear();
			drawLetters(data);
		});
	});

	function drawLetters(aLet) {
		paper.setStart();
		paper.text(xcenter, ycenter, curName).attr({
			"fill" : "black",
			"font-family" : 'decima_monoregular',
			"font-size" : 40,
			"text-align" : "center"
		});
		var angleStep = 2 * Math.PI / aLet.length;
		var circleDiam = .44 * height;
		var angle = angleStep * Math.floor(Math.random() * aLet.length);
		if (aLet.length < 2)
			angle = Math.floor(Math.random() * 2 * Math.PI);
		for (l in aLet) {
			var x = xcenter + Math.floor(circleDiam * Math.sin(angle));
			var y = ycenter + Math.floor(circleDiam * Math.cos(angle));
			paper.circle(x, y, 30).attr("fill", "black").attr("stroke", "none").data('text', aLet[l]).mousedown(function() {
				curName += this.data('text');
				letSet.attr("opacity", 0.5);
				$.get("/queryname/" + curName, function(data) {
					letSet.remove();
					letSet.clear();
					drawLetters(data);
				});
			});
			paper.text(x, y, aLet[l]).attr({
				"fill" : "white",
				"font-family" : 'decima_monoregular',
				"font-size" : 40,
				"text-align" : "center",
			}).mousedown(function() {
				curName += this.attrs.text;
				letSet.attr("opacity", 0.5);
				$.get("/queryname/" + curName, function(data) {
					letSet.remove();
					letSet.clear();
					drawLetters(data);
				});
			});
			angle += angleStep;
		}
		letSet = paper.setFinish();
	}

	drawLetters(letters);
});
