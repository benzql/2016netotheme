jQuery(document).ready(function() {

/* For showing image gallery or group of images */
	
	$("a.group").fancybox({
		'transitionIn'	:	'elastic',
		'transitionOut'	:	'elastic',
		'speedIn'		:	300, 
		'speedOut'		:	200, 
		'overlayShow'	:	true
	});
	
});

/* For showing header menu dropdown*/
sfHover = function() {
	var sfEls = document.getElementById("nav").getElementsByTagName("LI");
	for (var i=0; i<sfEls.length; i++) {
		sfEls[i].onmouseover=function() {
			this.className+=" sfhover";
		}
		sfEls[i].onmouseout=function() {
			this.className=this.className.replace(new RegExp(" sfhover\\b"), "");
		}
	}
}
if (window.attachEvent) window.attachEvent("onload", sfHover);

$(document).ready(function(){

		$(".my_account").click(function(event){

			$("ul.popOut").toggle();		

			return false;

		});

		$("html").click(function(event){

			$("ul.popOut").hide();

		});

	});