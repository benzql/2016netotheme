var menuids=new Array("cpmenu"); //Enter id(s) of UL menus, separated by commas
var submenuoffset=-2; //Offset of submenus from main menu. Default is -2 pixels.
var iframeoffsetleft=2;
var iframeoffsetwidth=-10;

function createcssmenu(){
	for (var i=0; i<menuids.length; i++){
		var fttag=document.getElementById(menuids[i]);
		var ultags=fttag.getElementsByTagName("ul");
		for (var t=0; t<ultags.length; t++){
			var spanref=document.createElement("span");
			spanref.className="arrowdiv";
			spanref.innerHTML="&nbsp;&nbsp;&nbsp;&nbsp;";
			ultags[t].parentNode.getElementsByTagName("a")[0].appendChild(spanref);
			ultags[t].parentNode.onmouseover=function(){
				var tul = this.getElementsByTagName("ul")[0];
				tul.style.left=(getLeft(this)+submenuoffset)+"px";
				tul.style.top=(getTop(this)+this.offsetHeight)+"px";
				tul.style.display="block";
				if(_isIE() && parseInt(navigator.appVersion) <= 6) {
					var ifr = document.getElementById('cmenuifr');
					if(!ifr) {
						ifr=document.createElement('iframe');
						if(ifr) {
							setCSS(ifr,'bgiframe');
							ifr.style.display = 'none';
							ifr.src = '/assets/empty.html';
							ifr = document.getElementsByTagName('body')[0].appendChild(ifr);
							ifr.id = 'cmenuifr';
						}
					}
					if(ifr) {
						ifr.style.display = '';
						ifr.style.top = tul.offsetTop;
						ifr.style.left = tul.offsetLeft+iframeoffsetleft;
						ifr.style.width = tul.offsetWidth+iframeoffsetwidth;
						ifr.style.height = tul.offsetHeight;
					}
				}
			}
			ultags[t].parentNode.onmouseout=function(){
				var ifr = document.getElementById('cmenuifr');
				if(ifr) {
					ifr.style.display = 'none';
				}
				this.getElementsByTagName("ul")[0].style.display="none";
			}
		}
	}
}

if (window.addEventListener) {
window.addEventListener("load", createcssmenu, false);
} else if (window.attachEvent) {
window.attachEvent("onload", createcssmenu);
}