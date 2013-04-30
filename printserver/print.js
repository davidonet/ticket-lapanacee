var page = require('webpage').create(), system = require('system');
page.open("http://localhost:5090/ticket/" + system.args[1], function() {
	page.viewportSize = {
		width : 640,
		height : 800
	};
	window.setTimeout(function() {
		page.render('/tmp/ticket.png');
		phantom.exit();
	}, 200);
});
