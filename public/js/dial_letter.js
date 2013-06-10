define([], function() {
	var drawName;

	var update = function() {
		if (drawName)
			drawName.remove();
		drawName = paper.text(xcenter, ycenter, curName).attr({
			"fill" : "black",
			"font-family" : 'decima_monoregular',
			"font-size" : 44,
			"text-align" : "center"
		});
	}
	var drawLetters = function(aLet) {
		paper.setStart();
		var angleStep = -2 * Math.PI / aLet.length;
		var circleDiam = .43 * height;
		var angle = Math.PI;
		if (aLet.length < 2)
			angle = Math.floor(Math.random() * 2 * Math.PI);
		for (l in aLet) {
			var x = xcenter + Math.floor(circleDiam * Math.sin(angle));
			var y = ycenter + Math.floor(circleDiam * Math.cos(angle));
			paper.circle(x, y, 33).attr("fill", "black").attr("stroke", "none").data('text', aLet[l]).mousedown(function() {
				curName += this.data('text');
				update();
			});
			paper.text(x, y, aLet[l]).attr({
				"fill" : "white",
				"font-family" : 'decima_monoregular',
				"font-size" : 45,
				"text-align" : "center",
			}).mousedown(function() {
				curName += this.attrs.text;
				update();

			});
			angle += angleStep;
		}
		letSet = paper.setFinish();
	}

	return {
		setup : function() {
			drawLetters(letters);
		},
		update : update,
		animate : function() {
			drawName.animate({transform: "r360s0"},1500)
		}
	}
});
