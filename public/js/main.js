requirejs.config({
	paths : {
		jqui : 'http://code.jquery.com/ui/1.9.2/jquery-ui.min'
	}
});
require(["jquery", "lib/jquery.form"], function($) {
	$('.ticketForm').ajaxForm({
		beforeSubmit : function(arr, $form, options) {
			$('#overlay').fadeIn();
		},
		success : function() {
			$('#overlay').fadeOut();
		}
	});
});
