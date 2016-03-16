jQuery(document).ready(function() {
/* For post code popup box */	
$("#post_code").fancybox({
	'scrolling'		: 'no',
	'titleShow'		: false
});
/* For share this popup box */	
$("#sharethis").fancybox({
		'titlePosition'		: 'inside',
		'transitionIn'		: 'none',
		'transitionOut'		: 'none',
		'type'				: 'iframe'
	});
/* For tooltip in porduct thumbnails */	
$(".extra img[title]").tooltip();

	/* For showing a single image */
	
	$("a#single_image").fancybox();
	
	/* For showing content */
	
	$("a#inline").fancybox({
		'hideOnContentClick': true
	});

	/* For showing image gallery or group of images */
	
	$("a.group").fancybox({
		'transitionIn'	:	'elastic',
		'transitionOut'	:	'elastic',
		'speedIn'		:	300, 
		'speedOut'		:	200, 
		'overlayShow'	:	true
	});
	
		$("#questions").fancybox({
		'width'				: '60%',
		'height'			: '90%',
        'autoScale'     	: false,
        'transitionIn'		: 'none',
		'transitionOut'		: 'none',
		'type'				: 'iframe'
	});
});