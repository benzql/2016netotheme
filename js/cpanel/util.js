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
function setCSS(obj,css_class) { 
	if(_isIE()) {
		var cl = obj.getAttributeNode("class");
		if(!cl) {
			var nl = document.createAttribute('class');
			nl.value = css_class;
			obj.setAttributeNode(nl);
		} else {
			cl.value = css_class;
		}
	} else { 
		obj.className = css_class; 
	} 
}

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

function varDump(data, html, ind) {
	if(!ind) { ind=0;}
	var br = (html? '<br>' : '\n');
	var tg = (html? '&nbsp;&nbsp;&nbsp;' : '\t');
	var rtn = '';
	for(var x=0; x<ind; x++) { rtn+=tg; }
	if(data instanceof Array) {
		rtn += '['+br;
		for(var i=0; i<data.length; i++) {
			for(var x=-1; x<ind; x++) { rtn+=tg; }
			rtn += varDump(data[i], html, ind+1)+br;
		}
		for(var x=0; x<ind; x++) { rtn+=tg; }
		rtn += ']';
	} else if(data instanceof Object) {
		rtn += '{'+br;
		for(var k in data) {
			for(var x=-1; x<ind; x++) { rtn+=tg; }
			rtn += varDump(k, html, ind+1)+':'+br+varDump(data[k], html, ind+2)+br;
		}
		for(var x=0; x<ind; x++) { rtn+=tg; }
		rtn += '}';
	} else {
		if(typeof data == 'string') {
			var tmp = data.replace('\\','\\\\');
			tmp = tmp.replace('"','\\"');
			if(html) {
				tmp = tmp.replace('<','&lt;').replace('>','&gt;');
				tmp = tmp.replace('&','&amp;');
			}
			rtn += '"'+data+'"';
		} else if(typeof data == 'undefined') {
			rtn += 'undefined';
		} else {
			for(var x=0; x<ind; x++) { rtn+=tg; }
			rtn += data;
		}
	}
	return rtn;
}

function extractJSData_Rec(val) {
	var data;
	if(val.indexOf('#') == 0) {
		val = unescape(val.substr(1,val.length));
		data = {};
		var tdata = val.split('^');
		for(var j=0; j<tdata.length; j++) {
			if(tdata[j] != '') {
				var kvdata = tdata[j].split('|');
				if(kvdata.length > 1) {
					data[unescape(kvdata[0])] = extractJSData_Rec(kvdata[1]);
				}
			}
		}
	} else if(val.indexOf('@') == 0) {
		val = unescape(val.substr(1,val.length));
		data = [];
		var tdata = val.split('^');	
		for(var j=0; j<tdata.length; j++) {
			if(tdata[j] != '') {
				data.push(extractJSData_Rec(tdata[j]));
			}
		}
	} else {
		data = unescape(val);
	}
	return data;
}

function extractJSData(txt) {
	var rtn = {};
	if((txt.toLowerCase()).indexOf('error')>=0) {
		alert(txt);
	} else {
		var arr = txt.split('^');
		var debug = false;
		for(var i=0; i<arr.length-1; i++) {
			if(i==0) {
				if(arr[i].indexOf('DEBUG:')>=0) {
					var tmp = arr[i].split('DEBUG:');
					debug = true;
					if(tmp.length>1 && tmp[1]!='') {
						alert(tmp[1]);
					}
				} 
			} else {
				var tmp = arr[i].split('|');
				if(tmp.length>1 && tmp[0] != '') {
					var key = unescape(tmp[0]);
					rtn[key] = extractJSData_Rec(tmp[1])
				}
			}
		}
		
		if(debug) {
			alert(varDump(rtn));
		}
		
	}
	return rtn;
}

function roundNearest(d, n) {
	if(d > 0) { /* round to integer */
		return roundNearest(0, n / Math.pow(10, d)) * Math.pow(10, d);
	} else {
		var s = ''+n;
		var p = s.indexOf('.');
		d = 0 - d;
		if(/e/.test(s)) {
			/* for +??e numbers */
			return Math.round(n * Math.pow(10, d)) / Math.pow(10, d);
		} else if(p>=0) {
			d -= 1;
			var f = parseInt(s.substr(0,p));
			var t = s.substr(p+1);

			var x = ''; var hasx = false;
			var i=t.length-1;
			var ad = 0;
			while(i>=0) {
				var v = parseInt(t[i]);
				v += ad; ad=0;
				if(v >= 10) {
					ad = 1; v = 0; /* ten */
				} else if(i>d) {
					if(v >= 5) { ad = 1; } v = 0;  /* round up when > 5 */
				}
				
				if(hasx || v>0) {
					x = v + x; hasx=true;
				}
				
				i--;
			}
			if(ad>0) { f += ad; } /* round up integer */
			
			return parseFloat(f+'.'+x);
		}
	}
	return n;
}