$(function(){

	$("ul.dropdown li").hover(function(){
		$(this).addClass("hover");
		$('ul:first',this).css('visibility', 'visible');

		var ofs = $('ul:first',this).offset();
		var w = $('ul:first',this).innerWidth();
		var ww = $(window).width();

		var pw = 0;
		var pl = 0;

		var sl = $(window).scrollLeft();
		var p = $(this).parent();
		if(p && !p.hasClass('dropdown') ) {
			var pfs = p.offset();
			pw = p.width();

			pl = ww+sl-pfs.left;
			ofs.left = pfs.left+pw;
			$('ul:first',this).offset(ofs);
			$('ul:first',this).css({top: ''});
		}
		if( ofs.left+w-sl > ww ) {
			var l = ww-w-pl+sl;
			if( ofs.left > ww-l-w) {
				ofs.left = l;
			}
			$('ul:first',this).offset(ofs);
			$('ul:first',this).css({top: ''});
		} else if(pw > 0) {
			$('ul:first',this).offset(ofs);
			$('ul:first',this).css({top: ''});
		}

	}, function(){
		$(this).removeClass('hover');
		$('ul:first',this).css('visibility', 'hidden');
		$('ul:first',this).css({top: '', left: ''});
	});

	$("ul.dropdown li ul li:has(ul)").find("a:first").append(" &raquo; ");
});





