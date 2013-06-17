exports.index = function(req, res) {
	var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ-";
	var letters = [];
	for (var i in alphabet) {
		letters.push(alphabet[i]);
	}
	res.render('dial', {
		title : 'La Panacée',
		letters :  JSON.stringify(letters)
	});

};

var fs = require("fs");

exports.update = function(req, res) {
	fs.readFile('base.txt', 'utf8', function(err, data) {
		lines = data.split(/\n/);
		var multi = red.multi();
		lines.forEach(function(line, j) {
			var name = line.toUpperCase();
			if (name) {
				multi.sadd("_root", name[0]);
				for (var i = 1; i < name.length; i++) {
					multi.sadd(name.substring(0, i), name[i]);
				}
			}
		});
		multi.exec(function(err, ret) {
			res.redirect('/dial');
		});
	});
};

exports.query = function(req, res) {
	var key = '_root';
	if (req.params.prefix)
		key = req.params.prefix.toUpperCase();

	red.smembers(key, function(err, ret) {
		ret.sort();
		res.json(ret);
	});

}
