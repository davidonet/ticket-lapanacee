/*
 * GET home page.
 */

exports.index = function(req, res) {
	res.render('index', {
		title : 'La Panacée',
		count : [2, 3, 4, 5, 6, 7, 8, 9, 10]
	});
};
