
/** util functions **/

function isSSL(url) {
	if(!url) { url = window.location.href; }
	return ((url.substring(0,5)).toLowerCase() == 'https');
}


function getHost() {
	if(isSSL()) { return 'https://'+window.location.hostname; }
	else { return 'http://'+window.location.hostname; }
}

function _isIE() { return (navigator.appName == 'Microsoft Internet Explorer'? true: false); }
function isNav() { return (navigator.appName == 'Netscape'? true: false); }

function getCSS(obj) { return (_isIE()? obj.getAttributeNode("class").value : obj.className); }
function setCSS(obj,css_class) { if(_isIE()) { obj.getAttributeNode("class").value = css_class; } else { obj.className = css_class; } }

function goToURL(url, blank) { if(blank) { window.open(url, ''); } else { window.location.href = url; } }
function getCookieVal(offset) {
	var endstr = document.cookie.indexOf (";", offset);
	if (endstr == -1) { endstr = document.cookie.length; }
	return unescape(document.cookie.substring(offset, endstr));
}

function isNull (val) {
	if (val == "null") { return true; }
	if (val == null) { return true; }
	if (val == undefined) { return true; }
	if (val == 'undefined') { return true; }
	if (val == '') { return true; }
	return false;
}

/* getTop(obj)
 * This function get the top most position of the element object
 * obj = any element objects in the document
 * return the top most position of the element object
 */
function getTop(obj) {
	var top = obj.offsetTop;
	var parent = obj.offsetParent;
	if(obj.offsetParent) {
		while(parent && parent.tagName.toUpperCase()!='BODY') {
			if(parent.tagName.toUpperCase()!='TR') {
				top += parent.offsetTop;
			}
			parent = parent.offsetParent;
		}
	} else {
		top = obj.x;
	}
	return top;
} // end function getTop

/* getLeft(obj)
 * This function get the left most position of the element object
 * obj = any element objects in the document
 * return the left most position of the element object
 */
function getLeft(obj) {
	var left = obj.offsetLeft;
	if(obj.offsetParent) {
		var parent = obj.offsetParent;
		while(parent && parent.tagName.toUpperCase()!='BODY') {
			if(parent.tagName.toUpperCase()!='TR') {
				left += parent.offsetLeft;
			}
			parent = parent.offsetParent;
		}
	} else {
		left = obj.y;
	}
	return left;
} // end function getLeft

function isMouseOut(obj, evt) {
	if(_isIE()) {
		var ox = getLeft(obj) - document.body.scrollLeft;
		var oy = getTop(obj) - document.body.scrollTop
	}	else {
		var ox = getLeft(obj) - window.scrollX;
		var oy = getTop(obj) - window.scrollY;
	}
	if(evt.clientX < ox || evt.clientY < oy ||
		evt.clientX > ox+obj.offsetWidth ||
		evt.clientY > oy+obj.offsetHeight) {
		return true;
	}
	return false;
}
/** util functions **/

function add2cart(f) {
	alert(2);
	f.submit();
}

function addItm2cart(id) {
	var f = document.a2c;
	var sf = document.add2cart;
	if(f && sf) {
		var s1 = sf['sku'];
		var q1 = sf['qty'];
		var s2 = f['sku'+id];
		var q2 = f['qty'+id];
		if(s1 && s2) {
			alert(s2.value);
			s1.value = s2.value;
			if(q1 && q2) {
				q1.value = q2.value;
				q2.value = '';
			}
		}
		//sf.submit();
	}
}

function addItm2cartMulti(fn,id) {
	var f = document.getElementById(fn);
	var sf = document.add2cart;	
	if(f && sf) {
		var s1 = sf['sku'];
		var q1 = sf['qty'];
		var s2 = f['sku'+id];
		var q2 = f['qty'+id];
		if(s1 && s2) {
			s1.value = s2.value;
			alert(s1.value);
			if(q1 && q2) {
				q1.value = q2.value;
				q2.value = '';
			}
		}
		//sf.submit();
	}
}

/** menu functions **/
function menu_onMouseOver(obj) {
	var css = getCSS(obj);
	if(!css) { css = 'hover'; } else { css += 'hover'; }
	setCSS(obj,css);
}

function menu_onMouseOut(obj) {
	var css = getCSS(obj);
	if(!css) { css = ''; } else { css = css.replace(/hover$/,''); }
	setCSS(obj,css);
}

function menu_onClick(obj,evt) {
	var links = obj.getElementsByTagName("a");
	if(links.length > 0) {
		if(evt.button == 0) { goToURL(links[0].href, evt.shiftKey); }
	}
}
/** menu functions **/

/* get1stChildTag(tagName, obj)
 * This function find the first element with the tagName in obj or return null if not found
 * tagName = HTML tag name to lookup
 * obj = the element object to lookup
 */
function get1stChildTag(tagName, obj) {
	var child = null
	if(obj.childNodes) {
		child = obj.childNodes[0];
		var i=1;
		while( (!child.tagName || child.tagName.toUpperCase()!=tagName) && i<obj.childNodes.length) {
			child = obj.childNodes[i];
			i++;
		}
		if(child.tagName != tagName) { return null; }
	}
	return child;
}// end function get1stChildTag

/** image function **/
function getImageDim(image) {
	var dim = new Object();
	if(image.naturalHeight && image.naturalWidth) {
		dim.height = image.naturalHeight;
		dim.width = image.naturalWidth;
	} else {
		var temp = new Image();
		temp.src = image.src;
		dim.height = temp.height;
		dim.width = temp.width;
	}
	return dim;
}

function resizeImage(image,w,h) {
	var dim = getImageDim(image);
	var ratio_h = (1.00*h)/dim.height;
	var ratio_w = (1.00*w)/dim.width;
	var ratio = 0;
	if(ratio_h>0 && ratio_w>0) {
		ratio = Math.min( ratio_h, ratio_w);
	} else if(ratio_h>0) {
		ratio = ratio_h;
	} else {
		ratio = ratio_w;
	}
	var newheight = Math.floor(dim.height*ratio);
	var newWidth = Math.floor(dim.width*ratio);
	image.height = (newheight>0?newheight:h);
	image.width = (newWidth>0?newWidth:w);
}
/** image function **/

/** format function **/
function formatFloat(value, dc, sp, ret) {
	if(isNaN(value) || value == 'NaN' || value == 'Infinity' || value == '-NaN' || value == '-Infinity') {
		return ret;
	} else {
		var text = ''+Math.round(value* Math.pow(10, dc));
		while(text.length <= dc) {
			text = '0'+text;
		}
		var first = text.substring(0, text.length - dc);
		var last = text.substring(text.length - dc, text.length);
		
		if(sp != '' && ((first.length> 3 && first.charAt(0) != '-') || first.length> 4)) {
			var temp = '';
			while(((first.length> 3 && first.charAt(0) != '-') || first.length> 4)) {
				temp = sp+first.substring(first.length - 3, first.length)+temp;
				first = first.substring(0, first.length - 3);
			}
			first = first+temp;
		}
					
		return first+(dc>0? '.'+last : '');
	}
}
/** format function **/

/** popup function **/
function popup(url , params) {
	if(!params) {  params = {}; }
	if(!params['width']) { params['width'] = 500; }
	if(!params['height']) { params['height'] = 500; }
	if(!params['name']) { params['name'] = '_popup'; }
	if(params['setting']) { params['setting'] = ','+params['setting']; }

	var winl = (screen.width - params['width']) / 2;
	var wint = (screen.height - params['height']) / 2;
	if(url == '') {
		var content = '';
		if(!params['setting']) { params['setting'] = ',scrollbars=no,resizable=yes'; }
		if(params['content']) { content = params['content']; }
		else if(params['image']) { content = '<img src="'+params['image']+'" border=0 alt="">'; }
		newWindow = window.open('', params['name'],'height='+params['height']+',width='+params['width']+',top='+wint+',left='+winl+params['setting']);
		newWindow.document.open();
		newWindow.document.write('<html><head><script language="javascript" type="text/javascript" src="'+getHost()+'/assets/js/util.js"></script><body onLoad="fitWindowSize()" style="margin:0 0 0 0;">'+content+'</body></html>');
		newWindow.document.close();
		newWindow.focus();
	} else {
		if(!params['setting']) { params['setting'] = ',scrollbars=yes,resizable=yes'; }
		if(url.indexOf('://') < 0) { url = getHost()+'/'+url; } 
		var newWindow = window.open(url, params['name'],'height='+params['height']+',width='+params['width']+',top='+wint+',left='+winl+params['setting']);
		newWindow.focus();
	}
}

function fitWindowSize() {
	var isNav4, isIE4;
	if (parseInt(navigator.appVersion.charAt(0)) >= 4) {  isNav4 = isNav(); isIE4 = _isIE(); }
	if (isNav4) {window.innerWidth = document.images[0].width; window.innerHeight = document.images[0].height; }
	if (isIE4) { window.resizeTo(500, 500); width = 500 - (document.body.clientWidth -  document.images[0].width); height = 500 - (document.body.clientHeight -  document.images[0].height); window.resizeTo(width, height); }
}

function image_popup(image) {
	return popup('' , {'image':image});
}
/** popup function **/

/* AJAX */
function ajax_XMLHttpRequest() {
	var client = null;
	try {
		client = new XMLHttpRequest();
	} catch (e) {
		try {
			client=new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			client=new ActiveXObject("Microsoft.XMLHTTP");
		}
	}
	return client;
}

function itemSel(form,flag) {
	var f = document.forms[form];
	if(f) {
		var i=0;
		var o = f.elements['itm'+i];
		while(o) {
			if(flag==2) {
				o.checked = !o.checked;
			} else if(flag==1) {
				o.checked = true;
			} else {
				o.checked = false;
			}
			i++; o = f.elements['itm'+i];
		}
	}
}