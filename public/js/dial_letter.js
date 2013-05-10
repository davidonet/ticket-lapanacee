define([], function() {
	drawLetters = function(aLet) {
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

	return {
		setup : function() {
			drawLetters(letters);
		}
	}
});
