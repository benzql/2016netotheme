var NETOCPDATA = new Object();

/* UTIL FUNCTIONS */
(function($) {
	$.extend({

		isJQVersion : function(cmp, vertxt) {

			var reg = /[^\d]+/g;

			var vernum = '';
			var txtnum = '';

			var ver =	$().jquery;

			var verarr = ver.split('.');
			for(var i=0; i<verarr.length; i++) {
				verarr[i].replace(reg, '');
				var num = $.toInt(verarr[i]);
				if(i==0) {
					vernum = num+'.';
				} else {
					vernum += (num<10?'0':'')+num;
				}
			}

			var txtarr = vertxt.split('.');
			for(var i=0; i<txtarr.length; i++) {
				txtarr[i].replace(reg, '');
				var num = $.toInt(txtarr[i]);
				if(i==0) {
					txtnum = num+'.';
				} else {
					txtnum += (num<10?'0':'')+num;
				}
			}

			var cver = $.toFloat(vernum);
			var chk = $.toFloat(txtnum);

			switch (cmp) {
				case '>' : return cver > chk;
				case '<' : return cver < chk;
				case '>=' : return cver >= chk;
				case '<=' : return cver <= chk;
			}

			return cver == chk;
		},

		formatNumber :	function (num, param) {
			param = $.soap_default_data(param, {'pf':'','dp':0,'sp':''});
			if(param['dp'] <= 0)
				param['dp'] = 0;
			var si = param['pf'];
			if(num <0) {
				num =0-num;
				si = '-'+si;
			}
			num = $.toFloat(num).toFixed(param['dp']);
			var tmp = num.split('.');
			var intgr = tmp[0];
			var dec = tmp[1];
			if (dec)
				dec='.'+dec;
			var txt=''; var ctr = 0;
			for(var i=intgr.length-1; i>=0; i--) {
				ctr++;
				txt = (ctr % 3 ==0 && i>0? ',':'')+intgr.charAt(i)+''+txt;
			}
			return si+txt+dec;
		},

		formatCurrency :	function (num) {
			return $.formatNumber(num, {'pf': $.cpGetFormat('currency_symbol') ,'dp':2,'sp':','} );
		},

		soap_input_opt : function(rdata, def , vds) {
			if(!rdata && !(rdata instanceof Object)) { rdata = {};}
			return $.soap_default_data(rdata, def , vds);
		},

		soap_default_data : function (rdata, def , vds) {
			if(!vds) { vds = []; }
			if(rdata instanceof Object) {
				if(def instanceof Object) {
					for(var k in def) {
						if(typeof rdata[k] == 'undefined') {
							rdata[k] = def[k];
						} else if( def[k] instanceof Array) {
							if(!(rdata[k] instanceof Array)) {
								rdata[k] = def[k];
							}
						} else if( def[k] instanceof Object) {
							if(!(rdata[k] instanceof Object)) {
								rdata[k] = def[k];
							} else {
								var found = false;

								for(var i=0; i<vds.length && !found; i++) {
									if(vds[i] == def[k]) {
										found=true;
									}
								}

								if(!found) {
									vds.push(def[k]);
									rdata[k] = $.soap_default_data( rdata[k],def[k], vds);
								}
							}
						} else {
							var tof = typeof def[k];
							var rof = typeof rdata[k];
							if(rof != tof) {
								switch (tof) {
									case 'boolean':
										if(rof == 'string') {
											rdata[k] = $.isTrue(rdata[k]);
										} else if(rof == 'number') {
											rdata[k] = (rdata[k] >0);
										} else {
											rdata[k] = def[k];
										}
										break;
									case 'number':
										if(rof == 'string') {
											var pos = rdata[k].indexOf('.');
											if(pos>=0) {
												rdata[k] = $.toFloat(rdata[k], def[k]);
											} else {
												rdata[k] = $.toInt(rdata[k], def[k]);
											}
										} else if(rof == 'boolean') {
											rdata[k] = (rdata[k]? 1 : 0);
										} else {
											rdata[k] = def[k];
										}
										break;
									case 'string':
										rdata[k] = ''+rdata[k];
										break;
									default: rdata[k] = def[k]; break;
								}
							}
						}
					}
				}
			} else {
				rdata = {};
			}
			return rdata;
		},

		escape_reserved : function (text) {
			if(typeof(text) != 'string') {return '';}
			return text.replace(/[!\"#$%&\'()\*+,\.\/:;<=>?@\[\\\]^`\{|\}~\s]/g, "\\$&");
		},

		js_var_dump : function (data, html, ind, vds) {
			if(!vds) { vds=[]; }
			if(!ind) { ind=0;}
			var br = (html? '<br>' : '\n');
			var tg = (html? '&nbsp;&nbsp;' : '\t');
			var rtn = '';
			if(data instanceof Array) {

				var found = -1;

				for(var i=0; i<vds.length && found<0; i++) {
					if(vds[i] == data) {
						found=i;
					}
				}

				if(found < 0) {
					vds.push(data);
					rtn += '['+br;
					for(var i=0; i<data.length; i++) {
						for(var x=-1; x<ind; x++) { rtn+=tg; }
						rtn += $.js_var_dump(data[i], html, ind+1, vds)+br;
					}
					for(var x=0; x<ind; x++) { rtn+=tg; }
					rtn += ']';
				} else {
					rtn += '[Array '+(found+1)+']';
				}
			} else if(data instanceof Object) {

				var found = -1;

				for(var i=0; i<vds.length && found<0; i++) {
					if(vds[i] == data) {
						found=i;
					}
				}
				if(found < 0) {
					vds.push(data);
					rtn += '{'+br;
					for(var k in data) {
						for(var x=-1; x<ind; x++) { rtn+=tg; }
						rtn += $.js_var_dump(k, html, ind+1, vds)+': ';
						rtn += $.js_var_dump(data[k], html, ind+2, vds)+br;
					}
					for(var x=0; x<ind; x++) { rtn+=tg; }
					rtn += '}';
				} else {
					rtn += '{Object '+(found+1)+'}';
				}

			} else {
				if(typeof data == 'string') {
					var tmp = data.replace('\\','\\\\');
					tmp = tmp.replace('"','\\"');
					if(html) {
						tmp = tmp.replace('<','&lt;').replace('>','&gt;');
						tmp = tmp.replace('&','&amp;');
					}
					rtn += '"'+data+'"';
				} else if(typeof data == 'boolean') {
					rtn += $.isTrue(data);
				} else if(typeof data == 'undefined') {
					rtn += 'undefined';
				} else {
					rtn += data;
				}
			}
			return rtn;
		},

		create_netosd_data : function (data, sp) {
			if(!sp) { sp = '|'; }
			return 'NSD1;'+$.create_netosd_data_rc(data, {}, sp);
		},

		create_netosd_data_rc : function (data, vids, sp) {
			var rtn = '';
			if(data instanceof Array) {
				rtn = '@';
				var ctr = data.length;
				rtn += ''+ctr+sp;
				for(var i=0; i<ctr; i++) {
					rtn += ''+$.create_netosd_data_rc(data[ctr], vids, sp);
				}
			} else if(data instanceof Object) {
				rtn = '#';
				var ctr = 0;
				for(var k in data) {
					ctr++;
				}

				rtn += ''+ctr+sp;
				for(var k in data) {
					rtn += ''+$.create_netosd_data_rc(k, vids, sp)+
						$.create_netosd_data_rc(data[k], vids, sp);
				}
			} else {
				rtn = '$';
				var tmp = escape(data);
				rtn += tmp.length + sp + tmp;
			}

			return rtn;
		},

		parse_netosd_data : function (data, sp) {
			if(!sp) { sp = '|'; }
			var txt = data.substr(0,5);
			data = data.substr(5);
			if(txt == 'NSD1;') {
				var tmp = $.parse_netosd_data_rc(data, [], sp);
				return tmp[1];
			}
			return null;
		},

		parse_netosd_data_rc : function (data, vds, sp) {
			if(!sp) { sp = '|'; }
			var typ = '$';
			var len = '';
			var kvdata;

			var cur = 0;
			typ = data.substr(cur,1);
			if(typ=='#' || typ=='@' || typ=='&' || typ=='$') {
				var done = false;
				while(!done && cur<data.length) {
					cur++;
					var chr = data.substr(cur,1);
					if(chr== '|') {
						done = true;
					} else {
						len += chr;
					}
				}

				len = $.toInt(len, -1);
				if(len >=0) {
					data = data.substr(cur+1);

					if(typ == '@' || typ == '#') {
						if(typ == '@') {
							kvdata = [];
						} else {
							kvdata = {};
						}

						vds.push(kvdata);

						if(typ == '@') {
							for(var i=0; i<len; i++) {
								var tmp = $.parse_netosd_data_rc(data, vds, sp);
								data = tmp[0];
								kvdata.push(tmp[1]);
							}
						} else {
							for(var i=0; i<len; i++) {
								var tmpk = $.parse_netosd_data_rc(data, vds, sp);
								data = tmpk[0];
								var tmp = $.parse_netosd_data_rc(data, vds, sp);
								data= tmp[0];
								kvdata[tmpk[1]]=tmp[1];
							}
						}

						return [data, kvdata];
					} else if(typ == '&') {
						if(len-1 < vds.length) {
							return [data, vds[len-1]];
						}

						return (data, null);
					} else if(typ == '$') {
						var txt = unescape(data.substr(0,len));
						txt = txt.replace(/%u{([0-9A-Za-z]+)}/g,
							function($1, $2){
								return String.fromCharCode($.toInt('0x'+$2));
							}
						);
						data = data.substr(len);
						return [data, txt];
					}
				}
			}
			return [data, kvdata];
		},

		isEmpty : function (text) {
			if(typeof(text) == 'string') {
				return text.length == 0;
			}
			return true;
		},

		trimSpace : function (text) {
			return $.trim(text);
		},

		isTrue : function (t) {
			if(typeof(t) == 'string') {
				switch(t.toLowerCase()) {
					case 'y':
					case 'yes':
					case 'on':
					case 'true':
					case 'okay':
					case 'ok':
					case 't':
					case '1':
					return 1;
				}
			} else if(typeof(t) == 'boolean') {
				return t;
			} else if(typeof(t) == 'number') {
				return t > 0;
			}
			return false;
		},

		toInt : function (n, def) {
			if(typeof(n) == 'number') {
				return n;
			} else if(typeof(n) == 'string') {
				n = n.replace('$','').replace(' ','').replace(',','');
				n = parseInt(n);
				if(isFinite(n)) { return n; }
			}
			if(typeof(def) == 'undefined') { return 0; }
			return def;
		},

		toText : function (n) {
			if(typeof(n) == 'string') {
				return n;
			} else if(typeof(n) == 'undefined') {
				return '';
			} else if(n === null) {
				return '';
			}
			return ''+n;
		},

		toFloat : function (n, def) {
			if(typeof(n) == 'number') {
				return n;
			} else if(typeof(n) == 'string') {
				n = n.replace('$','').replace(' ','').replace(',','');
				n = parseFloat(n);
				if(isFinite(n)) { return n; }
			}
			if(typeof(def) == 'undefined') { return 0; }
			return def;
		},

		timestamp : function () {
			return (new Date()).getTime();
		},

		randID : function	() {
			return Math.floor(Math.random()*1000000);
		},

		isChecked : function ( obj ) {
			var jquery_version = $.fn.jquery;
			var version_num = jquery_version.split(/\./);
			var use_attr = false;

			version_num[0] = $.toInt(version_num[0]);
			version_num[1] = $.toInt(version_num[1]);

			if(version_num[0] < 1  || (version_num[0] == 1 && version_num[1] < 6) ) {
				use_attr = true;
			}

			if(use_attr && obj.attr) {
				return obj.attr('checked');
			} else {
				return obj.is(':checked');
			}
		},

		setChecked : function ( obj, val ) {
			var jquery_version = $.fn.jquery;
			var version_num = jquery_version.split(/\./);
			var use_attr = false;

			version_num[0] = $.toInt(version_num[0]);
			version_num[1] = $.toInt(version_num[1]);

			if(version_num[0] < 1  || (version_num[0] == 1 && version_num[1] < 6) ) {
				use_attr = true;
			}

			if(use_attr && obj.attr) {
				obj.attr('checked', val);
			} else {
				obj.prop('checked', val);
			}

			return obj;
		}

	});
}) (jQuery);

$.fn.extend({
	overlay: function(opt) {
		opt = $.extend({'visible':true}, opt);

		var z = 100000;

		if ( $('div.noverlay').length === 0 ) {
			$('<div class="noverlay"></div>').hide().css({'z-index': (z-1), left: '0px', top: '0px'}).appendTo(document.body);
			/*
			$(window).resize(function() {
				//var ov = $('div.noverlay:visible');
				//ov.css({ width: $(document).width()+'px', height: $(document).height()+'px'});
			});
			*/
		}

		var o = $('div.noverlay');
		o.css({width:	$(document).width()+'px', height: $(document).height()+'px'});
		if(opt['visible']) {
			var lv = 0;
			$('[overlay\-level^="lv"]').each(function() {
				var val = $(this).attr('overlay-level');
				if(val) {
					val = $.toInt(val.replace(/^lv/, ''));
					if(val > lv) {
						lv = val;
					}
				}
			});

			this.each(function() {
				$(this).attr('overlay-old-z-index', $(this).css('z-index'));
				$(this).attr('overlay-level', 'lv'+(lv+1));
				$(this).css({'z-index': z+(lv*2)});
			});
			o.css({'z-index': (z-1)+(lv*2)}).show();
		} else {
			var reqhide = false;
			this.each(function() {
				$(this).attr('overlay-level', '');
				$(this).css({'z-index': $(this).attr('overlay-old-z-index')});
			});

			var lv = 0;
			$('[overlay\-level^="lv"]').each(function() {
				var val = $(this).attr('overlay-level');
				if(val) {
					val = $.toInt(val.replace(/^lv/, ''));
					if(val > lv) {
						lv = val;
					}
				}
			});
			lv -= 1;
			o.css({'z-index': (z-1)+(lv*2)});
			if(lv < 0 ) {
				o.hide();
			}
		}

		return this;
	},

	cpIsInited : function(n) {
		n = n.replace(';',':');
		var txt = $(this).attr('cp-init');
		if(typeof(txt) == 'string') {
			var arr = txt.split(';');
			for(var i=0; i<arr.length; i++) {
				if(arr[i] == n) {
					return true;
				}
			}
		}
		return false;
	},
	cpAddInit : function(n) {
		n = n.replace(';',':');
		var itxt = n+';';

		var txt = $(this).attr('cp-init');
		if(typeof(txt) == 'string') {
			var arr = txt.split(';');
			for(var i=0; i<arr.length; i++) {
				if(arr[i] != n) {
					itxt += arr[i]+';';
				}
			}
		}

		$(this).attr('cp-init', itxt);
		return this;
	},

	cpRemoveInit : function(n) {
		n = n.replace(';',':');

		var txt = $(this).attr('cp-init');
		if(typeof(txt) == 'string') {
			var itxt = '';
			var arr = txt.split(';');
			for(var i=0; i<arr.length; i++) {
				if(arr[i] != n) {
					itxt += arr[i]+';';
				}
			}

			$(this).attr('cp-init', itxt);
		}

		return this;
	},
	get_center_pos : function() {
		return	{
			'top':	Math.round(($(window).height()-$(this).height())/2+$(window).scrollTop()),
			'left':	Math.round(($(window).width()-$(this).width()+$(window).scrollLeft())/2)
		};
	},

	move_center : function() {
		var pos = $(this).get_center_pos();


		if($(this).height() > $(window).height() - 20) { pos['top'] = 20; }
		if($(this).width() > $(window).width() - 20) { pos['left'] = 20; }

		pos['top'] += 'px';
		pos['left'] += 'px';

		$(this).css(pos);
		return this;
	},

	move_current_top : function() {
		var pos = {};

		pos['top'] = Math.round($(window).scrollTop() + 10);
		pos['left'] = Math.round($(window).scrollLeft() + 10);

		pos['top'] += 'px';
		pos['left'] += 'px';

		$(this).css(pos);
		return this;
	},

	move_under : function(obj) {
		var opos = obj.position();
		var pos = {
			'top' : opos['top']+obj.outerHeight()+2,
			'left' : opos['left']
		};

		if((pos['left'] + $(this).outerWidth()) > $(window).width()+$(window).scrollLeft()) { pos['left'] -= (pos['left'] + $(this).outerWidth()) - ($(window).width()+$(window).scrollLeft()); }

		if(pos['left'] <= 0) {
			pos['left'] = 0;
		}

		pos['top'] += 'px';
		pos['left'] += 'px';

		$(this).css(pos);
		return this;
	},

	move_over : function(obj, opt) {

		opt = $.extend({}, opt);

		var opos = obj.position();
		var pos = {
			'top' : opos['top'],
			'left' : opos['left']
		};

		if((pos['left'] + $(this).outerWidth()) > $(window).width()+$(window).scrollLeft()) { pos['left'] -= (pos['left'] + $(this).outerWidth()) - ($(window).width()+$(window).scrollLeft()); }

		if(pos['left'] <= 0) {
			pos['left'] = 0;
		}

		pos['top'] += 'px';
		pos['left'] += 'px';

		$(this).css(pos);
		return this;
	},


	timepicker : function(opt) {

		if(typeof(opt['format']) != 'string') { opt['format'] = 'HH:ii:ss'; }
		if(typeof(opt['separator']) != 'string') { opt['separator']=' '; }

		return this.each(function() {
			var o = $(this);
			$(this).attr('cp-datetime-picker', 'yes');
			$(this).attr('cp-datetime-format', opt['format']);
			$(this).attr('cp-datetime-separator', opt['separator']);
		});
	}

});
/* END UTIL FUNCTIONS */


/* CPANEL FUNCTIONS */
(function($) {
	$.extend({
		cpData : function(k, v) {
			if(v && v instanceof Object) {
				NETOCPDATA[k] = v;
			} else if(!NETOCPDATA[k] || !(NETOCPDATA[k] instanceof Object)) {
				NETOCPDATA[k] = new Object();
			}
			return NETOCPDATA[k];
		},

		cpAddPlural : function(count, text) {
			var regexp = new RegExp('\\((.+)\\)$');
			if(text.match(regexp)) {
				if(count == 1 || count == -1) {
					return text.replace(regexp,'');
				} else {
					return text.replace(regexp,'$1');
				}
			} else if(count != 1 && count != -1) {
				var lch = text.substr(text.length-2,2);
				switch(lch) {
					case 'sh': case 'ch': case 'es':
						return text + 'es';
					case 'ex': case 'ix':
						return text.substr(0,text.length-2) + 'ices';
					case 'us':
						return text.substr(0,text.length-2) + 'i';
				}

				lch = lch.substr(1,1);
				switch(lch) {
					case 's': case 'z': case 'x':
						return text + 'es';
					case 'y':
						return text.substr(0,text.length-1) + 'ies';
					case 'f':
						return text.substr(0,text.length-1) + 'ves';
				}

				return text+'s';
			}

			return text;
		},

		cpParseTemplate : function(text, data) {
			if(typeof(text) != 'string') { text = ''; }
			if(typeof(data['item']) == 'string' && typeof(data['count']) == 'number') {
				data['item'] = $.cpAddPlural(data['count'], data['item']);
			}

			for(var k in data) {
				var tof = typeof data[k];
				var rtn = false;
				if(tof == 'string' || tof == 'boolean' || tof == 'number') {
					var regexp = new RegExp('##'+k+'##', 'gim');
					text = text.replace(regexp, data[k]);


					var regexp2 = new RegExp('##\\^'+k+'##', 'gim');
					if(tof == 'string') {
						text = text.replace(regexp, data[k].substr(0,1).toUpperCase()+data[k].substr(1));
					} else {
						text = text.replace(regexp, data[k]);
					}

					if(tof == 'string') {
						rtn = (!$.isEmpty(data[k]));
					} else if(tof == 'boolean') {
						rtn = data[k];
					} else if(tof == 'number') {
						rtn = data[k] > 0;

						var regexp = new RegExp('##CURRENCY:'+k+'##', 'gim');
						text = text.replace(regexp,	$.formatCurrency( data[k] ) );
					}
				} else if(tof == 'undefined') {
					var regexp = new RegExp('##'+k+'##', 'gim');
					text = text.replace(regexp, '');
				}

				if(rtn) {
					var regexp = new RegExp('##IF:'+k+'##(.+?)##END IF:'+k+'#', 'gim');
					text = text.replace(regexp, '$1');
				} else {
					var regexp = new RegExp('##IF:'+k+'##.*?##END IF:'+k+'##', 'gim');
					text = text.replace(regexp, '');
				}
			}

			return text;

		},

		cpGoToPage : function (pgnum, opt) {
			opt = $.soap_input_opt(opt, {
				'form' : 'itemForm',
				'page_field' : '_sb_pgnum'
			});

			$('FORM[name="'+opt['form']+'"] INPUT[name="'+opt['page_field']+'"]').val(pgnum);
			$('FORM[name="'+opt['form']+'"]').submit();
		},

		cpAlert : function (msg, opt) {
			opt = $.soap_input_opt(opt, {
				'title': '',
				'content': msg,
				'btn-cancel': 'Okay',
				'close-all': false
				/* onReady, onActive, onOkay, onCancel, onClose */
			});

			if(opt['close-all']) {
				$('div.nalert').find('.btn-nalert-close:first').click();
			}

			if ( $('div.nalert').length === 0 ) {
				/*
				$(window).resize(function() {
					//$('div.nalert:visible').move_current_top();
				});
				$(window).scroll(function() {
					//$('div.nalert:visible').move_center();
				});
				*/
			}

			var o = $('div.nalert[nalert-status="inactive"]:first').attr({'nalert-status': 'ready' });
			if ( o.length === 0 ) {
				var inpid = $('div.nalert').length+'-'+$.randID();
				o = $('<div class="nalert">'+
'<a class="btn-nalert-close"></a>'+
'<div class="nalert-header"></div>'+
'<div class="nalert-body"></div>'+
	'<div class="nalert-btn"><button class="btn btn-nalert-cancel"> <i class="icon-remove-sign"></i> <span> </span> </button></div>'+
'<div class="nalert-clear"></div>'+
				'</div>').hide().css({'position': 'absolute'}).attr({'nalert-id': inpid, 'nalert-status': 'ready' }).appendTo(document.body);
			}

			if(typeof(opt['onReady']) == 'function') { opt['onReady'](o); }

			o.find('.nalert-header:first').html(opt['title']);
			o.find('.nalert-body:first').html(opt['content']);
			o.find('.btn-nalert-cancel span:first').html(opt['btn-cancel']);

			o.find('.btn-nalert-cancel').off('click');
			o.find('.btn-nalert-cancel').on('click', function () {
				var okay = true;
				var pr = $(this).closest('.nalert');
				if(typeof(opt['onCancel']) == 'function') { okay = opt['onCancel'](pr); }
				if(okay !== false ) {
					if(typeof(opt['onClose']) == 'function') { opt['onClose'](pr); }
					pr.hide().attr({'nalert-status': 'inactive' }).overlay({'visible': false});
				}
			});

			o.find('.btn-nalert-close').off('click');
			o.find('.btn-nalert-close').on('click', function () {
				var okay = true;
				var pr = $(this).closest('.nalert');
				if(typeof(opt['onCancel']) == 'function') { okay = opt['onCancel'](pr); }
				if(okay !== false ) {
					if(typeof(opt['onClose']) == 'function') { opt['onClose'](pr); }
					pr.hide().attr({'nalert-status': 'inactive' }).overlay({'visible': false});
				}
			});

			if(typeof(opt['onActive']) == 'function') { opt['onActive'](o); }
			o.move_current_top().attr({'nalert-status': 'active' }).show().overlay({'visible': true});
		},

		cpDebug : function (msg, opt) {
			$.cpAlert(msg,opt);
		},

		cpDebugDiv :function(id, txt) {

			if(typeof(id) == 'undefined') { id = ''; }

			var obj = $('DIV.debug[cp-debug-id="'+$.escape_reserved(id)+'"]:first');
			if(obj.length <= 0) {
				obj = $('<div class="debug" cp-debug-id="'+id+'"></div>').appendTo('body');
			}
			if(typeof(txt) == 'undefined') {
				return obj.html();
			} else {
				obj.html( txt );
			}
		},

		cpError : function (msg, opt) {
			var regexp = new RegExp('For\\s+help,\\s+please\\s+send\\s+mail\\s+to\\s+the\\s+webmaster\\s+\\([^\\)]*\\),\\s+giving\\s+this\\s+error\\s+message\\s+and\\s+the\\s+time\\s+and\\s+date\\s+of\\s+the\\s+error\\.','mi');
			msg = msg.replace(regexp, '');

			opt = $.soap_input_opt(opt, {
				'title': '',
				'content': msg,
				'btn-cancel': 'Close And Send Error Report'
				/* onReady, onActive, onOkay, onCancel, onClose */
			});

			if ( $('div.nerror').length === 0 ) {
				/*
				$(window).resize(function() {
					//$('div.nerror:visible').move_center();
				});
				$(window).scroll(function() {
					//$('div.nerror:visible').move_center();
				});
				*/
			}

			var o = $('div.nerror[nerror-status="inactive"]:first').attr({'nerror-status': 'ready' });
			if ( o.length === 0 ) {
				var inpid = $('div.nerror').length+'-'+$.randID();
				o = $('<div class="nerror">'+
'<a class="btn-nerror-close"></a>'+
'<div class="nerror-header"></div>'+
'<div class="nerror-body"></div>'+
	'<button class="btn btn-nerror-cancel"> <i class="icon-remove-sign"></i> <span> </span> </button>'+
'<div class="nerror-clear"></div>'+
				'</div>').hide().css({'position': 'absolute'}).attr({'nerror-id': inpid, 'nerror-status': 'ready' }).appendTo(document.body);
			}

			o.find('.nerror-header:first').html(opt['title']);
			o.find('.nerror-body:first').html(opt['content']);
			o.find('.btn-nerror-cancel span:first').html(opt['btn-cancel']);

			o.find('.btn-nerror-cancel').off('click');
			o.find('.btn-nerror-cancel').on('click', function () {
				var pr = $(this).parent('.nerror');
				$.cpSendAjax({
					'url' : 'https://ndevelop.neto.com.au/_cpanel',
					'ajaxfn' : '_rperr_',
					'soap-input': { 'agent':window.navigator.userAgent, 'url':window.location.href, 'msg':msg, 'code': opt['title'], 'head': $('head').html(), 'body': $('body').html() }
				});
				pr.hide().attr({'nerror-status': 'inactive' }).overlay({'visible': false});
			});

			o.find('.btn-nerror-close').off('click');
			o.find('.btn-nerror-close').on('click', function () {
				var pr = $(this).parent('.nerror');
				pr.hide().attr({'nerror-status': 'inactive' }).overlay({'visible': false});
			});

			o.move_current_top().attr({'nerror-status': 'active' }).show().overlay({'visible': true});
		},

		cpConfirm : function (msg, opt) {
			opt = $.soap_input_opt(opt, {});
			return confirm(msg);
		},

		cpDialog : function (opt) {
			opt = $.soap_input_opt(opt, {
				'title': '',
				'content': '',
				'width':'',
				'btn-okay': 'Okay',
				'btn-cancel': 'Close',
				'btn-close':'Close',
				'other-buttons': [] /* fn title class icon */
				/* onReady, onActive, onOkay, onCancel, onClose */
			});

			if ( $('div.ninput').length === 0 ) {
				/*
				$(window).resize(function() {
					//$('div.ninput:visible').move_center();
				});
				$(window).scroll(function() {
					//$('div.ninput:visible').move_center();
				});
				*/
			}


			var o = $('div.ninput[ninput-status="inactive"]:first').attr({'ninput-status': 'ready' });
			if ( o.length === 0 ) {
				var inpid = $('div.ninput').length+'-'+$.randID();
				o = $('<div class="ninput">'
+(opt['btn-close']?'<a class="btn-ninput-close"></a>':'')
+'<div class="ninput-header"></div>'
+'<div class="ninput-msg"></div>'
+'<div class="ninput-body"></div>'
+'<div class="ninput-btn"></div>'
+'<div class="ninput-clear"></div>'
+'</div>').hide().css({'position': 'absolute'}).attr({'ninput-id': inpid, 'ninput-status': 'ready' }).appendTo(document.body);
			}


			if(typeof(opt['onReady']) == 'function') { opt['onReady'](o); }

			if(opt['title']){
				o.find('.ninput-header:first').html(opt['title']);
			}else{
 				o.find('.ninput-header:first').html("");
			}

			if(opt['btn-close']){
				if(o.find('.btn-ninput-close:first').length === 0){
					o.prepend('<a class="btn-ninput-close"></a>');
				}
			}else{
				o.find('.btn-ninput-close:first').remove();
			}

			o.find('.btn-ninput-okay').hide().remove();
			o.find('.btn-ninput-cancel').hide().remove();

			o.find('.btn-ninput-other-pl:first').hide().remove();
			if(opt['other-buttons'].length > 0) {
				if(o.find('.btn-ninput-other-pl:first').length === 0){
					o.find('.ninput-body:first').after('<span class="btn-ninput-other-pl"></span>');
				}

				var btnpl = o.find('.btn-ninput-other-pl:first').html('').show();

				for(var i=0; i<opt['other-buttons'].length; i++) {
					var btnopt = opt['other-buttons'][i];
					btnopt = $.soap_input_opt(btnopt, {
						'title' : '',
						'class' : '',
						'icon' : ''
						/* fn */
					});

					var other_btn = $('<button class="btn btn-ninput-other" style="margin: 0px 10px; float:right;"> <span> </span> </button>').appendTo(btnpl);

					other_btn.find('span:first').html(btnopt['title']);

					if (!$.isEmpty(btnopt['icon'])) {
						$('<i></i>').addClass(btnopt['icon']).prependTo( other_btn );
					}
					if (!$.isEmpty(btnopt['class'])) {
						other_btn.addClass(btnopt['class']);
					}

					if(typeof(btnopt['onClick']) == 'string' && typeof(window[btnopt['onClick']]) == 'function') {
						btnopt['onClick'] = window[btnopt['onClick']];
					}
					if(typeof(btnopt['onClick']) == 'function') {
						other_btn.click( function () { btnopt['onClick']( $(this), o ); } );
					}

				}
			}

			if(!$.isEmpty(opt['btn-okay'])){
				if(o.find('.btn-ninput-okay:first').length === 0){
					o.find('.ninput-body:first').after('<button class="btn btn-ninput-okay"> <i class="icon-ok-sign"></i> <span> </span> </button>');
				}
				o.find('.btn-ninput-okay:first').show();
			}


			if(!$.isEmpty(opt['btn-cancel'])){
				if(o.find('.btn-ninput-cancel:first').length === 0){
					o.find('.ninput-clear:first').before('<button class="btn btn-ninput-cancel"> <i class="'+opt['btn-cancel-icon']+'"></i> <span> </span> </button>');
				}
				o.find('.btn-ninput-cancel:first').show();
			}


			o.find('.ninput-body:first').html(opt['content']);
			o.find('.ninput-msg:first').hide().html();
			o.find('.btn-ninput-okay span:first').html(opt['btn-okay']);
			o.find('.btn-ninput-cancel span:first').html(opt['btn-cancel']);


			o.find('.btn-ninput-okay').off('click');
			o.find('.btn-ninput-okay').on('click', function () {
				var okay = true;
				var pr = $(this).closest('.ninput');

				var rtndata = {};
				pr.find('.ninput-body input[type="text"]').each(function() { rtndata[$(this).attr('ref')]=$(this).val(); });
				pr.find('.ninput-body input[type="hidden"]').each(function() { rtndata[$(this).attr('ref')]=$(this).val(); });
				pr.find('.ninput-body input[type="checkbox"]:checked').each(function() {
							var vals = $(this).val();
							var vfn = $(this).attr('cp-set-value-fn');
							if(typeof(vfn) == 'string' && vfn.length>0) {
								$.cpCallSetValueFn(vfn, $(this), [vals]);
							}
							rtndata[$(this).attr('ref')]=$(this).val();
					 });
				pr.find('.ninput-body input[type="ratio"]:checked').each(function() { rtndata[$(this).attr('ref')]=$(this).val(); });
				pr.find('.ninput-body select').each(function() { rtndata[$(this).attr('ref')]=$(this).val(); });

				var errmsg = '';
				if(typeof(opt['onOkay']) == 'function') {
					okay = opt['onOkay'](pr, rtndata);
					if(okay instanceof Object) {
						if(okay['error'] instanceof Array) {
							for(var i=0; i<okay['error'].length; i++) {
								errmsg += '<div class="alert alert-error">'+okay['error'][i]+'<a class="close" data-dismiss="alert"><i class="icon-remove"></i></a></div>';
							}
						}
						okay = false;
					}
				}
				var ftr = o.find('.ninput-msg:first');
				if(!$.isEmpty(errmsg)) {
					ftr.show().html(errmsg);
				} else {
					ftr.hide().html(errmsg);
				}
				if(okay !== false ) {
					if(typeof(opt['onClose']) == 'function') { opt['onClose'](pr); }
					pr.hide().attr({'ninput-status': 'inactive' }).overlay({'visible': false});
				}
			});

			o.find('.btn-ninput-cancel').off('click');
			o.find('.btn-ninput-cancel').on('click', function () {
				var okay = true;
				var pr = $(this).closest('.ninput');
				if(typeof(opt['onCancel']) == 'function') { okay = opt['onCancel'](pr); }
				if(okay !== false ) {
					if(typeof(opt['onClose']) == 'function') { opt['onClose'](pr); }
					pr.hide().attr({'ninput-status': 'inactive' }).overlay({'visible': false});
				}
			});

			o.find('.btn-ninput-close').off('click');
			o.find('.btn-ninput-close').on('click', function () {
				var okay = true;
				var pr = $(this).parent('.ninput');
				if(typeof(opt['onCancel']) == 'function') { okay = opt['onCancel'](pr); }
				if(okay !== false ) {
					if(typeof(opt['onClose']) == 'function') { opt['onClose'](pr); }
					pr.hide().attr({'ninput-status': 'inactive' }).overlay({'visible': false});
				}
			});

			if(typeof(opt['onActive']) == 'function') { opt['onActive'](o); }
			if(!$.isEmpty(opt['width'])){
				o.width(opt['width']);
			} else {
				o.width('');
				o.show();
				var wd = o.find('.ninput-body:first').width();
				o.width(wd);
				o.hide();

			}
			o.move_current_top().attr({'ninput-status': 'active' }).show().overlay({'visible': true});

			if(typeof(opt['onActive2']) == 'function') { opt['onActive2'](o); }
			return o;
		},

		cpCloseDialog : function (o) {
			o.find('.btn-ninput-close').click();
		},

		cpEval : function (obj, js) {
			if(typeof(js)=='function') {
				return js(obj);
			} else if(typeof(js)=='string') {
				if(!$.isEmpty(js)) {
					try {
						return eval(js);
					} catch(err) {
						$.cpDebug(err.message);
					}
				}
			}

			return;
		},

		cpPageLoading : function(opt) {
			opt = $.extend({'percent': 1, 'visible':true, 'title': 'Loading...'}, opt);

			if(!opt['visible']) {
				opt['percent'] = 100;
			} else if(opt['percent'] < 1) {
				opt['percent'] = 1;
			} else if(opt['percent'] > 99) {
				opt['percent'] = 100;
			}

			if ( $('div.nloading').length === 0 ) {
				$('<div class="nloading"><h4>'+opt['title']+'</h4>'+
					'<div class="progress progress-striped active"><div class="bar"></div></div></div>').hide().css({'position': 'absolute'}).appendTo(document.body);
				/*
				$(window).resize(function() {
					//$('div.nloading:visible').move_center();
				});
				$(window).scroll(function() {
					//$('div.nloading:visible').move_center();
				});
				*/
			}

			var o = $('div.nloading');

			o.find('H4:first').html(opt['title']);

			o.move_center();
			if(opt['visible']) {
				o.show().overlay({'visible': opt['visible']});
			}
			var b = $('div.nloading div.bar');
			if(opt['visible']) {
				b.css({ width:	opt['percent']+'%'});
			} else {
				b.animate({ width:	'100%'}, 200, function() {
					o.hide().overlay({'visible': false});
					$(this).css({ width:	'0%'});
				});
			}
		},

		cpSelectItem : function (f,sel, opt) {
			var cfg = $.cpData('CPAjaxForm'+f);
			opt = $.soap_input_opt(opt, {
				'item_field' : cfg['item_field']
			});

			if(typeof(sel) != 'string') { sel = ''; }

			var objs = $('FORM[name="'+$.escape_reserved(f)+'"] INPUT[type="checkbox"][name^="'+opt['item_field']+'"]');
			switch(sel.toLowerCase()) {
				case 'all':
					$.setChecked(objs, true);
					break;
				case 'none':
					$.setChecked(objs, false);
					break;
				case 'inverse':
					objs.each(function () { $.setChecked($(this), !($.isChecked($(this)))); });
					break;
			};

			$.cpCountSelected(f);
		},

		cpCountSelected : function(f) {
			var cfg = $.cpData('CPAjaxForm'+f);
			var count = $('FORM[name="'+$.escape_reserved(f)+'"] INPUT[type="checkbox"][name^="'+cfg['item_field']+'"]:checked').length;
			$('.'+cfg['item_count']).html( ''+(count>0? count : '')	 );
		},

		cpRunProc : function (f, cmd, opt) {
			var cfg = $.cpData('CPAjaxForm'+f);
			if(cfg['form_proc'] && cfg instanceof Object) {
				var scfg = cfg['form_proc'];

				opt = $.soap_input_opt(opt, {
					'proc_all' : '',
					'confirm_off' : '',
					'cmd_text' : cmd,
					'confirm_msg' : scfg['msg']['confirm'],
					'empty_msg' : scfg['msg']['empty'],
					'item_field' : cfg['item_field'],
					'proc_field' : cfg['proc_field']
				});


				if(typeof(cmd) != 'string') { cmd = ''; }
				if(!$.isEmpty(cmd)) {
					var fm = $('FORM[name="'+$.escape_reserved(f)+'"]');
					var objs = fm.find('INPUT[type="checkbox"][name^="'+opt['item_field']+'"]:checked');
					var tdata = {'count': objs.length, 'item': cfg['item_name'], 'cmd': opt['cmd_text']};
					if(objs.length > 0 || $.isTrue(opt['proc_all'])) {
						if($.isTrue(opt['confirm_off']) || opt['confirm_msg'].length==0 || $.cpConfirm($.cpParseTemplate(opt['confirm_msg'], tdata)) ) {
							var inp = fm.find('INPUT[name="'+opt['proc_field']+'"]');
							inp.val(cmd);
							fm.submit();
							inp.val('');
						}
					} else if(opt['empty_msg'].length > 0) {
						$.cpAlert($.cpParseTemplate(opt['empty_msg'], tdata));
					}
				}
			}
		},

		cpInitAjaxForm : function (f, opt) {
			if(!$.isEmpty(f)) {
				opt = $.soap_input_opt(opt, {
					'form' : f,

					'na_image' : '/assets/na.gif',

					'ajax_panel' : 'ajax-content-pl',
					'paging_results' : 'paging-results',
					'paging_pagination' : 'paging-pagination',

					'filter_panel' : 'ftr-morefilter',
					'textswitch_link' : 'ntextswitch-lnk',

					'textswitch_pl' : 'ntextswitch-pl',
					'textcount_pl' : 'ntextcount-pl',

					'textsearch_pl' : 'nsearchinput-pl',
					'textsearch_link' : 'nsearchinput-lnk',

					'textsearch_default_max_num' : '50',

					'colorpicker_pl' : 'colorpicker-pl',

					'inlinehelp_pl' : 'inlinehelp-pl',
					'fileinput_pl' : 'file-input-pl',

					'resultsfilter-pl' : 'resultsfilter',

					'item_name' : 'item',
					'item_field' : 'itm',
					'item_count' : '_sel_count',
					'proc_field' : 'proc',

					'cp_frame_target' : 'cp-frame',

					'form_proc_btn' : 'cp-proc',
					'form_proc' : {
						'item' : 'item',
						'msg' : {
							'confirm' : '##^cmd## ##count## ##item##?',
							'empty' : 'No ##item## are selected.'
						}
					},

					'form_select_btn' : 'cp-select'

					/* onSubmit onLoad */
				});
				$.cpData('CPAjaxForm'+f, opt);


				$.cpInitalAjaxFormRec(f);

				$('input[ref="reopen"]').each(function() {
					var val = $(this).val();
					if(typeof(val) == 'string') {
						var arr = val.split('|');
						for(var i =0; i<arr.length; arr++) {
							if(!$.isEmpty(arr[i])) {
								var lnk = $('ul.nav-tabs a[data-toggle="tab"][href="#'+$.escape_reserved(arr[i])+'"]');
								lnk.tab('show');
							}
						}
					}
				});

			}
		},

		cpInitalAjaxFormRec : function(f) {
			var opt = $.cpData('CPAjaxForm'+f);
			var fm = $('FORM[name="'+$.escape_reserved(f)+'"]');

			fm.each(function() {
				if( !$(this).cpIsInited('ajax-form') ) {

					$(this).on('submit', function() {
						var nf = $(this).prop('name');

						var fileinp = $(this).find('input[type="file"]');
						if( fileinp.length > 0 ) {
							if( !$.isTrue($(this).attr('cp-file-upload-submit')) ) {
								$(this).attr('cp-file-upload-submit', 'yes');
								$.cpAjaxFileUpload(nf, opt);
							}
						} else {
							$.cpAjaxFormSubmit(nf, opt);
						}

						return false;
					});

					$(this).cpAddInit('ajax-form');
				}
			});

			// File Input Fields
			var imgctr = 0;
			fm.find('INPUT[type="file"]').each(function() {
				if( !$(this).cpIsInited('file-input') ) {
					var ftype = $.toText($(this).attr('cp-file-class')).toLowerCase();
					var hasdel = $.isTrue($(this).attr('cp-file-delete'));

					var fleid = $.timestamp()+'-'+imgctr+'-'+$.randID();
					var lastid = $(this).attr('cp-file-last-id');
					if( !$.isEmpty(lastid) ) {
						fleid = lastid;
					}
					$(this).attr('cp-file-input-id', fleid);

					$(this).before('<div class="file-input-error" cp-file-input-id="'+fleid+'"></div>');
					$(this).after('<div class="'+opt['fileinput_pl']+'" cp-file-input-id="'+fleid+'"></div>');
					$(this).after('<div class="file-preview" cp-file-input-id="'+fleid+'"></div>');

					var fileerrobj = $(this).parent().find('DIV.file-input-error[cp-file-input-id="'+$.escape_reserved(fleid)+'"]');
					var fileprevobj = $(this).parent().find('DIV.file-preview[cp-file-input-id="'+$.escape_reserved(fleid)+'"]');
					var fileprevhtml = '';
					var fileinpobj = $(this).parent().find('DIV.'+$.escape_reserved(opt['fileinput_pl'])+'[cp-file-input-id="'+$.escape_reserved(fleid)+'"]');
					var fileinphtml = '<input type="hidden" name="'+$(this).prop('name')+'" cp-file-input-id="'+fleid+'" value="'+fleid+'">';
					$(this).prop('name', '');

					if(ftype == 'image') {
						var srcwh = $(this).attr('cp-file-src-width');
						var srchi = $(this).attr('cp-file-src-height');
						if($.isEmpty(srcwh)) { srcwh = '80px'; }
						if($.isEmpty(srchi)) { srchi = '80px'; }

						var imgsrc = $.toText($(this).attr('cp-file-src'));
						var imgdef = $.toText($(this).attr('cp-file-default'));
						if($.isEmpty(imgdef)) { imgdef = opt['na_image']; }

						if($.isEmpty(imgsrc)) {
							imgsrc = imgdef;
						}

						fileprevhtml += '<div class="file-image"><a target="cp-frame" href="'+imgsrc+'"><img src="'+imgsrc+(imgsrc!=imgdef ? '?'+$.timestamp() : '')+'" cp-img-default="'+imgdef+'" width="'+srcwh+'" height="'+srchi+'"/></a></div>';
						if(hasdel) {
							fileprevhtml += '<div class="file-remove">Delete Image? <input type="checkbox" cp-file-input-id="'+fleid+'" cp-file-input-name="fn" value="delete"></div>';
						}

						var fformat = $.toText($(this).attr('cp-file-format')).toLowerCase();
						var fmtarr;
						if(!$.isEmpty(fformat)) {
							fmtarr = [{ 'title': fformat.toUpperCase()+' (*.'+fformat+')', 'value': fformat }];
						} else {
							fmtarr = [
								{ 'title': '', 'value':''},
								{ 'title': 'JPEG (*.jpg)', 'value':'jpg'},
								{ 'title': 'GIF (*.gif)', 'value':'gif'},
								{ 'title': 'PNG (*.png)', 'value':'png'}
							];
						}
						fileinphtml += '<div><span class="image-convert"><label>Convert to: </label>';
						fileinphtml += $.cpHTMLSelectBox({
							'args': 'cp-file-input-name="format" cp-file-input-id="'+fleid+'"',
							'options' : fmtarr
						});
						fileinphtml += '</span>';
						if(!$.isTrue($(this).attr('cp-file-fix-size'))) {
							fileinphtml +=
								'<span class="image-dimension"><label>Quality:</label> <input type="text" cp-file-input-id="'+fleid+'" cp-file-input-name="quality" value="'+$.toText($(this).attr('cp-file-quality'))+'">%</span>';
						}

						fileinphtml += '</div>';

						var imgwh = $(this).attr('cp-file-width');
						var imghi = $(this).attr('cp-file-height');

						if($.isEmpty(imgwh)) { imgwh = ''; }
						if($.isEmpty(imghi)) { imghi = ''; }

						if(!$.isTrue($(this).attr('cp-file-fix-size'))) {
							fileinphtml +=
								'<div><span class="image-dimension"><label>Width: </label><input type="text" cp-file-input-id="'+fleid+'" cp-file-input-name="width" value="'+imgwh+'">px</span>'+
								'<span class="image-dimension"><label>Height:</label><input type="text" cp-file-input-id="'+fleid+'" cp-file-input-name="height" value="'+imghi+'">px</span></div>';
						} else {
							fileinphtml +=
								'<div><span class="image-dimension"><label>Width:</label> '+imgwh+'px</span>'+
								'<span class="image-dimension"><label>Height:</label> '+imghi+'px</span></div>';
						}

						fileprevobj.html(fileprevhtml).addClass('image-preview');
						fileinpobj.html(fileinphtml);

						// Setup Image Preview
						var imgpre = $(this).parent().find('DIV.file-preview[cp-file-input-id="'+$.escape_reserved(fleid)+'"] IMG');
						imgpre.error(function () {
							var csrc = $.toText($(this).attr('src'));

							var srca = csrc.split('?');
							csrc = srca[0];

							var tsrc = '';
							var def = $.toText($(this).attr('cp-img-default'));
							if($.isEmpty(tsrc)) {
								tsrc = def;
							}

							if(csrc != def && tsrc != csrc) {
								var turl = tsrc;
								if(tsrc != def) { turl += '?'+$.timestamp(); }
								$(this).attr('src', turl);
								$(this).closest('A').attr('href', turl);
							}
						});

						$(this).change(function() {
							var imgarr = [];
							if(this.files) {
								for(var i=0; i<this.files.length; i++) {
									imgarr.push(this.files[i].name);
								}
							} else {
								imgarr.push($(this).val());
							}

							var okay = true;
							var totaleimg = 0;
							for(var i=0; i<imgarr.length; i++) {
								if(!$.isEmpty(imgarr[i])) {
									var ind = imgarr[i].lastIndexOf('.');
									if(ind >= 0) {
										var fmt = imgarr[i].substr(ind+1).toLowerCase();
										switch(fmt) {
											case fformat :
												if(fmt == '') { okay=false; totaleimg++; }
												break;
											case 'zip' :
											case 'jpg' :
											case 'jpeg' :
											case 'gif' :
											case 'png' :
												break;
											default: okay=false; totaleimg++;
												break;
										}
									} else {
										okay = false; totaleimg++;
									}
								}
							}

							if(!okay) {
								$(this).attr('cp-image-input-invalid', 'yes');
								fileerrobj.html( totaleimg > 1? 'Invalid image format on '+totaleimg+' files.' : 'Invalid image format.' );
								fileerrobj.show();
								$(this).val('');
							} else {
								fileerrobj.hide();
								$(this).removeAttr('cp-image-input-invalid');
							}
						});
						$(this).change();

						imgctr++;
					} else {

						var imgsrc = $.toText($(this).attr('cp-file-src'));
						if($.isEmpty(imgsrc)) {
							imgsrc = 'javascript:void(0);';
						}
						fileprevhtml = '<div><a target="cp-frame" href="'+imgsrc+'">Download File</a>';

						var fformat = $.toText($(this).attr('cp-file-format')).toLowerCase();
						if(!$.isEmpty(fformat)) {
							fileprevhtml += ' &nbsp; <span>(*.'+fformat+')</span>';
						}

						if(hasdel) {
							fileprevhtml += ' &nbsp; <span class="file-remove">Delete File? <input type="checkbox" cp-file-input-id="'+fleid+'" cp-file-input-name="delete" value="y"></span>';
						}
						fileprevhtml += '</div>';

						fileprevobj.html(fileprevhtml);
						if($.isEmpty(fileprevhtml)) {
							fileprevobj.hide();
						}
						fileinpobj.html(fileinphtml);
					}

					$(this).cpAddInit('file-input');
				}
			});

			// All Form
			$('a[target="'+$.escape_reserved(opt['cp_frame_target'])+'"]').each(function() {
				if( !$(this).cpIsInited('cp-frame') ) {
					$(this).click(function() { return $.cpGoToURL($(this).attr('href'), {'target':$(this).attr('target'), 'width':$(this).attr('cp-width'), 'height':$(this).attr('cp-height')}); });

					$(this).cpAddInit('cp-frame');
				}
			});

			$('input[type="button"][cp-href], input[type="button"][cp-btn-action]').each(function() {
				var url =$(this).attr('cp-href');
				var btxt =$(this).attr('cp-btn-action');

				if((typeof(url) != 'undefined' && url.length >0) || (typeof(btxt) != 'undefined' && btxt.length >0)) {
					if( !$(this).cpIsInited('cp-btn') ) {
						$(this).click(function() { $.cpRunAction($(this)); });
						$(this).cpAddInit('cp-btn');
					}
				}
			});

			// Result Listing Page

			if( fm.find('.'+$.escape_reserved(opt['filter_panel'])).length > 0 ) {
				fm.find('#'+opt['resultsfilter-pl']).each(function() {
					if( !$(this).cpIsInited('result-filter') ) {
						$(this).on('shown', function () {
							fm.find('A.toggle[href="#'+opt['resultsfilter-pl']+'"] SPAN:first').removeClass('icon-chevron-down').addClass('icon-chevron-up');
						});

						$(this).on('hidden', function () {
							fm.find('A.toggle[href="#'+opt['resultsfilter-pl']+'"] SPAN:first').removeClass('icon-chevron-up').addClass('icon-chevron-down');
						});

						$(this).cpAddInit('result-filter');
					}
				});

				$.cpShowAdvFilter(f);
			}

			$('.'+$.escape_reserved(opt['form_proc_btn'])).each(function() {
				if( !$(this).cpIsInited('form-proc') ) {
					$(this).click(function() {
						$.cpRunProc(f, $(this).attr('cp-proc'), {
							'proc_all':$(this).attr('cp-proc-all'),
							'empty_msg':$(this).attr('cp-empty-msg'),
							'confirm_msg':$(this).attr('cp-confirm-msg'),
							'confirm_off': $(this).attr('cp-confirm-off')
						});
					});

					$(this).cpAddInit('form-proc');
				}
			});

			if( fm.find('INPUT[type="checkbox"][name^="'+opt['item_field']+'"]').length > 0 ) {
				fm.find('INPUT[type="checkbox"][name^="'+opt['item_field']+'"]').each(function() {
					if( !$(this).cpIsInited('item-select') ) {
						$(this).click(function () {
							$.cpCountSelected(f);
						});
						$(this).cpAddInit('item-select');
					}
				});
			}


			$.cpCountSelected(f);

			$('.'+$.escape_reserved(opt['form_select_btn'])).each(function() {
				if( !$(this).cpIsInited('form-select') ) {
					$(this).click(function() {
						$.cpSelectItem(f, $(this).attr('cp-select'));
					});

					$(this).cpAddInit('form-select');
				}
			});

			$('a[href="'+$.escape_reserved('#')+'"]').attr('href', 'javascript:void(0);');

			if( fm.find('a[cp-set-filter]').length > 0 ) {
				fm.find('a[cp-set-filter]').each(function() {
					if( !$(this).cpIsInited('set-filter') ) {
						$(this).click(function() { $.cpSetFilter($(this)); });
						$(this).cpAddInit('set-filter');
					}
				});
			}

			// Edit Page
			fm.find('.ntextinput').each(function() {
				if( !$(this).cpIsInited('text-input') ) {

					var len = $(this).attr('maxlength');
					if(typeof(len) == 'string') { len = $.toInt(len); }
					var tag = $(this).prop('tagName');

					var html = $(this).attr('cp-htmleditor');
					var nam = $(this).prop('name');
					if(typeof(len)=='number' && len > 0) {
						if($('div.'+$.escape_reserved(opt['textcount_pl'])+'[ref="'+$.escape_reserved(nam)+'"]').length <= 0) {

							var tcstyle = $(this).attr('cp-textcount-style');
							var tcclass = $(this).attr('cp-textcount-class');

							tcstyle = ($.isEmpty(tcstyle) ? '' : 'style="'+tcstyle+'"');
							tcclass = ($.isEmpty(tcclass) ? '' : ' '+tcclass);
							$(this).after('<div class="'+opt['textcount_pl']+tcclass+'" '+tcstyle+' ref="'+nam+'"></div>');
							$(this).off('change keydown');
							$(this).on('change keydown', function() {
								$.cpShowTextCount(f, $(this).prop('name'), {});
							});
							$(this).change();
						}
					} else if($.isTrue(html) && tag == 'TEXTAREA') {
						if($('a.'+$.escape_reserved(opt['textswitch_link'])+'[ref="'+$.escape_reserved(nam)+'"]').length <= 0) {
							var btngp = $('<div class="btn-group cp-htmleditor-switch" data-toggle="buttons-radio">'+
								'<a class="btn active" href="javascript:void(0);">Source Code</a>'+
								'<a class="btn" href="javascript:void(0);">WYSIWYG Editor</a>'+
								'</div>');
							$(this).before(btngp);

							if(CKEDITOR.instances instanceof Object && CKEDITOR.instances[nam]){
								CKEDITOR.instances[nam].destroy(true);
							}

							btngp.find('A.btn').click(function(){
								if(!$(this).hasClass('active')){
									$.cpHtmlEditor(f, nam, {});
								}
							});
						}
					}
					$(this).cpAddInit('text-input');
				}
			});

			fm.find('input.nsearchinput[type="text"]').each(function() {

				if( !$(this).cpIsInited('search-input') ) {

					var selid = $(this).prop('id');

					if($.isEmpty(selid)) {
						selid = $(this).prop('name');

						if(!$.isEmpty(selid)) {
							$(this).prop('id',selid);
						}
					}
					if(!$.isEmpty(selid)) {

						$(this).after('<a class="'+opt['textsearch_link']+'" cp-search-id="'+selid+'" href="javascript:void(0);"><i class="icon-search"></i></a>');
						$(this).after('<div class="'+opt['textsearch_pl']+'" cp-search-id="'+selid+'"></div>');

						var nd = $('div.'+$.escape_reserved(opt['textsearch_pl'])+'[cp-search-id="'+$.escape_reserved(selid)+'"]');


	 					//add attribute 'cp-popup-width' to set width of the popup. // cp-popup-width = '300'
						var pwidth = '';
						if(typeof($(this).attr('cp-popup-width')) != 'undefined'){
							pwidth = $(this).attr('cp-popup-width');
						}


						nd.hide().css({'position': 'absolute','z-index':'10000'});

						var nl = $('a.'+$.escape_reserved(opt['textsearch_link'])+'[cp-search-id="'+$.escape_reserved(selid)+'"]');
						var padding = 0;
						$(this).css({'padding-right': (0+(padding*2))+'px' });
						nl.css({'margin-left': ((0-padding)-0)+'px'});


						nl.click(function() {
							$.cpTypeSearch(selid, {'quick': false,'width':pwidth});
						});


						$(this).on('keyup focus', function () {
							var tmo = 150;
							var ndst = nd.attr('cp-search-status');
							if(typeof(ndst) == 'string') {
								switch(ndst) {
									case 'LOADING': tmo=1000; break;
									case 'WAITING': tmo = 0; break;
								}
							}
							if(tmo > 0) {
								nd.attr('cp-search-status', 'WAITING');
								setTimeout(function () {
									$.cpTypeSearch(selid, {'quick': true,'width':pwidth});
									}, tmo);
							}
						});

						$(this).on('blur', function () { $(this).attr('cp-focus', 'no'); setTimeout(function () { nd.hide(); }, 150);} );
						$(this).on('focus', function () { $(this).attr('cp-focus', 'yes'); } );
					}

					$(this).cpAddInit('search-input');
				}

			});

			// Table Functions
			var objs = fm.find('a[cp-table-fn], INPUT[type="button"][cp-table-fn], INPUT[type="checkbox"][cp-table-fn], INPUT[type="radio"][cp-table-fn], BUTTON[cp-table-fn]');
			if( objs.length > 0 ) {
				objs.each(function() {
					if( !$(this).cpIsInited('table-fn') ) {
						$(this).click(function () {
							var pam = { 'row' : -1 };
							var fn = $(this).attr('cp-table-fn');
							var tid = $(this).attr('cp-table-id');
							if(typeof(tid) == 'undefined') {
								var tbl = $(this).closest('table[cp-table-id]');
								tid = tbl.attr('cp-table-id');
							}

							var txt = $(this).attr('cp-table-param');
							if(typeof(txt) == 'string') {
								var param = $.parse_netosd_data(txt);
								if(param instanceof Object) {
									pam = $.extend(param, pam);
								}
							}

							var rowid = $(this).attr('cp-table-row');
							if(typeof(rowid) == 'string') {
								pam['row'] = $.toInt(rowid, -1);
							}

							$.cpDynamicTableFn(tid, fn, pam);
						});
						$(this).cpAddInit('table-fn');
					}
				});
			}

			var inps = fm.find('INPUT[type="text"][cp-table-fn], SELECT[cp-table-fn], TEXTAREA[cp-table-fn]');
			if( inps.length > 0 ) {
				inps.each(function() {
					if( !$(this).cpIsInited('table-fn') ) {
						$(this).on('change', function () {
							var pam = { 'row' : -1 };
							var fn = $(this).attr('cp-table-fn');
							var tid = $(this).attr('cp-table-id');
							if(typeof(tid) == 'undefined') {
								var tbl = $(this).closest('table[cp-table-id]');
								tid = tbl.attr('cp-table-id');
							}

							var txt = $(this).attr('cp-table-param');
							if(typeof(txt) == 'string') {
								var param = $.parse_netosd_data(txt);
								if(param instanceof Object) {
									pam = $.extend(param, pam);
								}
							}

							var rowid = $(this).attr('cp-table-row');
							if(typeof(rowid) == 'string') {
								pam['row'] = $.toInt(rowid, -1);
							}

							$.cpDynamicTableFn(tid, fn, pam);
						});
						$(this).cpAddInit('table-fn');
					}
				});
			}

			fm.find(".datetimepicker").each(function() {
				if( !$(this).cpIsInited('date-picker') ) {
					$(this).datepicker({'dateFormat': $.cpGetFormat('date') });
					$(this).timepicker({'format': $.cpGetFormat('time') });
					$(this).cpAddInit('date-picker');
				}
			});

			fm.find(".datepicker").each(function() {
				if( !$(this).cpIsInited('date-picker') ) {
					$(this).datepicker({'dateFormat': $.cpGetFormat('date') });
					$(this).cpAddInit('date-picker');
				}
			});

			fm.find(".inline-help").each(function () {
				var default_icon = 'icon-question-sign';

				if( !$(this).cpIsInited('inline-help') ) {

					var helptxt = $.trimSpace($(this).html());
					if( !$.isEmpty(helptxt) ) {

						if(typeof($(this).attr('icon-class')) != "undefined") {
							default_icon = $(this).attr('icon-class');
						}

						if($.isTrue($(this).attr('cp-help-div'))) {
							var html = '<div class="'+opt['inlinehelp_pl']+'"><i class="'+default_icon+' inlinehelp-icon"></i>'+helptxt+'</div>';
							$(this).html('<i class="'+default_icon+'"></i>');

							var dhelp = $(this).find('.'+$.escape_reserved(opt['inlinehelp_pl']));
							dhelp.hide();
							$(this).on('mouseover', function() {
								dhelp.move_over($(this)).show();
							});
							$(this).on('mouseout', function() {
								dhelp.move_over($(this)).hide();
							});
						} else {
							$(this).html('<a href="javascript:void(0);"><i class="'+default_icon+'"></i></a>');
							$(this).find('A:first').popover({'content': helptxt, 'title':$.toText($(this).attr('cp-help-title'))});
						}
						$(this).show();

					}

					$(this).cpAddInit('inline-help');
				}
			});

			fm.find("input.colorpicker").each(function() {
				if( !$(this).cpIsInited('color-picker') ) {
					var nam = $(this).prop('name');

					var selid = $(this).prop('id');
					if($.isEmpty(selid)) {
						selid = $(this).prop('name');
						if(!$.isEmpty(selid)) {
							$(this).prop('id',selid);
						}
					}
					if(!$.isEmpty(selid)) {
						var inp = $(this);

						var html = '<div class="'+opt['colorpicker_pl']+'" cp-colorpicker-id="'+selid+'"><div class="colorpicker-picker"></div>';

						var rgba = inp.attr('cp-colorpicker-rgba');
						if(typeof(rgba) != 'string') {
							rgba = '';
							inp.attr('cp-colorpicker-rgba', rgba);
						}

						if($.isTrue(rgba)) {
							html += '<span class="tiny" style="float:left; margin-top:-14px;">Alpha: <span class="colorpicker-alpha"></span></span><div class="colorpicker-slider" style="width:194px;"></div>';
						}

						html += '</div>';

						inp.after(html);

						var nd = $('div.'+$.escape_reserved(opt['colorpicker_pl'])+'[cp-colorpicker-id="'+$.escape_reserved(selid)+'"]');
						nd.hide().css({'position': 'absolute'});
						nd.find('.colorpicker-picker').farbtastic(this);

						if($.isTrue(rgba)) {
							var slid = nd.find('.colorpicker-slider');
							slid.slider({
								'start': function(event, ui) { inp.attr('cp-focus', 'yes'); },
								'stop': function(event, ui) { inp.attr('cp-focus', ''); inp.focus(); },
								'change': function(event, ui) {
									var v = inp.val();
									if(typeof(v)=='string' && v.match(/,/)) {
										var tmp = v.split(',',4);
										for(var i=0; i<4; i++) {
											if(i>=tmp.length) {	tmp.push( (i==0? 0: tmp[0]) );	}
											var num = $.toFloat(tmp[i], 255);
										}

										tmp[3] = ui.value / 100;

										inp.val(tmp.join(','));

										nd.find('.colorpicker-alpha').html(ui.value+'%');
										nd.find('.colorpicker-picker').css({'opacity': tmp[3], 'filter': 'alpha(opacity='+ui.value+')'});
									}

									inp.attr('cp-focus', '');
								},
								'min' : 0, 'max': 100
							});



							var aval = 1;
							var cv = inp.val();
							var ctmp = cv.split(',',4);
							if(ctmp.length == 4) {
								aval = $.toFloat(ctmp[3], 1);
							}
							slid.slider( "value" , Math.round(aval*100) );
						}


						inp.on('focus', function () { nd.move_under($(this)).show(); } );
						inp.on('blur', function () {
							var tmp =$(this).attr('cp-focus');
							if(!$.isTrue(tmp)) {
								nd.hide();
							}
						} );

					}

					$(this).cpAddInit('color-picker');
				}
			});

			fm.find('A[cp-open-tag]').each(function() {
				if( !$(this).cpIsInited('open-tag') ) {
					$(this).click(function() {
						var val = $.toText($(this).attr('cp-open-tag'));
						val = val.replace('#','');
						if(!$.isEmpty(val)) {
							var lnk = $('ul.nav-tabs a[data-toggle="tab"][href="#'+$.escape_reserved(val)+'"]');
							lnk.tab('show');
						}
					});

					$(this).cpAddInit('open-tag');
				}
			});
		},

		cpAjaxFileUpload : function(f, opt) {
			opt = $.soap_input_opt(opt, {
				'min-percent':0,
				'max-percent':50
				/* onUploadStart onUploadComplete onUploadError */
			});

			var fm = $('FORM[name="'+$.escape_reserved(f)+'"]');

			var tmo = 500;
			var opt = $.cpData('CPAjaxForm'+f);

			var tm = $.cpData('CPFileUpload'+f);
			if(tm) { clearTimeout(tm); }
			if( $.isTrue( fm.attr('cp-file-upload-ready') ) ) {
				// All upload finished
				$.cpPageLoading({'title': 'Upload Completed', 'percent': Math.floor(opt['min-percent'] + (opt['max-percent'] * (opt['max-percent']-opt['min-percent'])/100)) })

				var inpopt = opt;
				inpopt['min-percent'] = inpopt['max-percent'];
				inpopt['max-percent'] = 100;
				inpopt['onSubmitChecked'] = true;

				// Reset upload status flags
				fm.attr('cp-file-upload-submit', '');
				fm.attr('cp-file-upload-start', '');
				fm.attr('cp-file-upload-ready','');

				if($.isTrue(fm.attr('cp-file-upload-error'))) {
					// Cannot upload file...
					if(typeof(opt['onUploadError']) == 'function') {
						opt['onUploadError']();
					}
					$.cpPageLoading({'visible':false});

				} else {
					// Upload completed...
					if(typeof(opt['onUploadComplete']) == 'function') {
						opt['onUploadComplete']();
					}
					$.cpAjaxFormSubmit(f, inpopt);
				}
				fm.attr('cp-file-upload-error','');
			} else if( $.isTrue( fm.attr('cp-file-upload-start') ) ) {
				// Check if upload complete every 0.5 seconds
				tm = setTimeout(function () { $.cpAjaxFileUpload(f, opt); }, tmo);
			} else {
				// Create File Upload Form Then Submit
				var okay = true;
				if(okay !== false && typeof(opt['onSubmit']) == 'function') { okay = opt['onSubmit']( fm ); }

				if(okay !== false) {
					fm.attr( 'cp-file-upload-start','yes' );
					fm.attr( 'cp-file-upload-ready','' );

					var fileinp = fm.find('input[type="file"]');
					var fileid = [];
					if( fileinp.length > 0 ) {
						// Get All File Upload Inputs
						fileinp.each(function() {
							$(this).removeAttr('cp-file-upload-start');
							var fid = $.toText($(this).attr('cp-file-input-id'));
							if(!$.isEmpty(fid)) {
								var reqsend = false;
								if( $.isTrue(fileinp.attr('cp-image-input-invalid')) ) {
								} else if(!$.isEmpty($(this).val())) {
									reqsend = true;
								} else {
									var fdobj = $(this).parent().find('DIV.file-preview INPUT[cp-file-input-id="'+$.escape_reserved(fid)+'"][cp-file-input-name="fn"][value="delete"]:checked');
									if(fdobj.length > 0) {
										reqsend = true;
									}
								}
								if(reqsend) {
									fileid.push(fid)
									$(this).attr('cp-file-upload-start', 'yes');
								}
							}
						});
					}

					if(fileid.length <= 0){
						// Submit Form when there are no files to upload.
						fm.attr( 'cp-file-upload-submit','' );
						fm.attr( 'cp-file-upload-start','' );
						fm.attr( 'cp-file-upload-ready','' );

						var inpopt = opt;
						inpopt['min-percent'] = inpopt['max-percent'];
						inpopt['max-percent'] = 100;
						inpopt['onSubmitChecked'] = true;

						$.cpAjaxFormSubmit(f, inpopt);
					} else {
						// Create File Upload Sessions

						fm.attr( 'cp-file-upload-total', fileid.length );

						for(var i=0; i<fileid.length; i++) {
							var inpobj = fm.find('input[type="file"][cp-file-input-id="'+$.escape_reserved(fileid[i])+'"]');
							$.cpFileUploadSession(f, inpobj, opt);
						}

						if(typeof(opt['onUploadStart']) == 'function') {
							opt['onUploadStart']();
						}

						$.cpPageLoading({'title': 'Uploading '+fileid.length+' '+$.cpAddPlural(fileid.length, 'file')+'...', 'percent': Math.floor(opt['min-percent']) });
						// Check if upload complete every 0.5 seconds
						tm = setTimeout(function () { $.cpAjaxFileUpload(f, opt); }, tmo);
					}
				}
			}

			$.cpData('CPFileUpload'+f, tm);
		},

		cpFileUploadSession : function(f, inp, opt) {
			opt = $.soap_input_opt(opt, {
				'min-percent':0,
				'max-percent':100
			});

			inp.attr('cp-file-upload-ready', '');
			var ifm = $('IFRAME[cp-file-upload-iframe][cp-file-upload-ready="yes"]:first');

			if(ifm.length <= 0) {
				var ctr = $('IFRAME[cp-file-upload-iframe]').length+'-'+$.randID();

				// Create new upload iframe when none available
				ifm = $('<iframe cp-file-upload-iframe="'+ctr+'" name="cp-file-upload-'+ctr+'" cp-file-upload-ready="" cp-file-upload-init="yes" src="javascript:false;"/>').hide().appendTo('body');
				inp.attr('cp-file-upload-input', ctr);
				ifm.attr('cp-file-upload-form-name', f);

				// First Inital Function
				ifm.bind('load', function() {
					if($.isTrue( $(this).attr('cp-file-upload-init') )) {
						$(this).removeAttr('cp-file-upload-init');
						$(this).unbind('load');

						// Callback function for form submittion
						$(this).bind('load', function() {
							var fctr2 = $(this).attr('cp-file-upload-iframe');
							var nf2 = $(this).attr('cp-file-upload-form-name');
							var fm2 = $('FORM[name="'+$.escape_reserved(nf2)+'"]');
							var finp2 = fm2.find('INPUT[type="file"][cp-file-upload-input="'+$.escape_reserved(fctr2)+'"]');

							var resp = $(this).contents().find('body').html();
							var pos = resp.indexOf('NSD1;');

							var fid2 = $.toText(finp2.attr('cp-file-input-id'))

							if(pos >= 0 ) {
								// Show return message
								var dub = resp.substr(0,pos);
								resp = resp.substr(pos);
								if(pos > 0 ) {
									if(dub.indexOf('DEBUGALL')==0) { $.cpDebug(dup+'\n'+resp); }
									else if(dub.indexOf('DEBUG')==0) { $.cpDebug(dub); }
								}
								var rtn2 = $.soap_input_opt($.parse_netosd_data(resp), {'status': 0, 'error': [], 'url':'', 'deleted':0 });
								if(!$.isTrue(rtn2['status']) && rtn2['error'].length > 0) {
									var errobj = finp2.parent().find('DIV.file-input-error[cp-file-input-id="'+$.escape_reserved(fid2)+'"]');
									errobj.html('Upload failed.').show();

									$.cpError(rtn2['error'].join('<br>'), {'title': 'Upload Error'});
									fm2.attr('cp-file-upload-error', 'yes');
								}

								// Load New Image
								if($.isTrue(rtn2['deleted']) || !$.isEmpty(rtn2['url'])) {
									var prevobj = finp2.parent().find('DIV.file-preview[cp-file-input-id="'+$.escape_reserved(fid2)+'"] IMG');
									if(prevobj.length > 0) {
										var imgurl = $.toText(prevobj.attr('cp-img-default'));
										if(!$.isTrue(rtn2['deleted'])) {
											imgurl = rtn2['url']+'?'+$.timestamp();
										}
										prevobj.attr('src',	imgurl);
										prevobj.closest('A').attr('href', imgurl);
									}
								}
							} else {
								// Show upload error
								if(resp.indexOf('<h1>Software error:</h1>') >= 0) {
									var errobj = finp.parent().find('DIV.file-input-error[cp-file-input-id="'+$.escape_reserved(fid2)+'"]');
									errobj.html('Upload failed.').show();

									$.cpError(resp, {'title': 'Software Error'});
									fm.attr('cp-file-upload-error', 'yes');
								}
							}

							// Ready for the next upload
							finp2.attr('cp-file-upload-ready', 'yes');
							$(this).attr('cp-file-upload-ready','yes');

							var fileinp2 = fm2.find('input[type="file"][cp-file-upload-start="yes"]');
							var filerem = fileinp2.length;
							fileinp2.each(function() {
								if( $.isTrue( $(this).attr('cp-file-upload-ready') ) ) {
									filerem--;
								}
							});

							if(fileinp2.length > 0) {
								$.cpPageLoading({'title': 'Uploading '+fileinp2.length+' '+$.cpAddPlural(fileinp2.length,'file')+'... ('+filerem+' '+$.cpAddPlural(filerem,'file')+' left)', 'percent': Math.floor(opt['min-percent'] + ( ((fileinp2.length-filerem) / fileinp2.length) * (opt['max-percent']-opt['min-percent'])/100)) })
							}

							if(filerem <= 0 || fileinp2.length <= 0) {
								fm2.attr('cp-file-upload-ready', 'yes');
							}
						});

						var fctr = $(this).attr('cp-file-upload-iframe');
						var nf = $(this).attr('cp-file-upload-form-name');
						var fm = $('FORM[name="'+$.escape_reserved(nf)+'"]');
						var finp = fm.find('INPUT[type="file"][cp-file-upload-input="'+$.escape_reserved(fctr)+'"]');


						var okay = $.cpCreateUploadForm(finp, $(this));
						if(!okay) {
							fm.attr('cp-file-upload-error', 'yes');
						}
					}
				});
				ifm.load();
			} else {
				var fm = $('FORM[name="'+$.escape_reserved(f)+'"]');
				ctr = ifm.attr('cp-file-upload-iframe');
				inp.attr('cp-file-upload-input', ctr);

				ifm.attr('cp-file-upload-ready','');
				ifm.attr('cp-file-upload-form-name', f);
				if( !$.cpCreateUploadForm(inp, ifm) ) {
					fm.attr('cp-file-upload-error', 'yes');
					ifm.load();
				}
			}
		},

		cpCreateUploadForm : function(inp, ifm) {

			var errobj = inp.parent().find('DIV.file-input-error[cp-file-input-id="'+$.escape_reserved($.toText(inp.attr('cp-file-input-id')))+'"]');
			errobj.hide();

			var ctr = ifm.attr('cp-file-upload-iframe');

			if(!$.isEmpty(ctr)) {
				var ffm = $('FORM[cp-file-upload-form="'+$.escape_reserved(ctr)+'"]');

				if(ffm.length <= 0) {
					var url = '/cgi-bin/suppliers/testimage.cgi';
					ffm = $( '<form cp-file-upload-form="'+ctr+'" method="POST" action="'+url+'" target="'+ifm.prop('name')+'" enctype="multipart/form-data"></form>').hide().appendTo('body');
				}

				var fleid = inp.attr('cp-file-input-id');

				if(!$.isEmpty(fleid)) {
					var hds = [];

					var fm = inp.closest('FORM');
					var ftkn = $.toText(inp.attr('cp-file-tkn'));
					hds.push('<input type="hidden" name="tkn" value="'+$.cpNoHTML(ftkn)+'" />');

					var ttkn = $.toText(inp.attr('cp-file-type'));
					hds.push('<input type="hidden" name="type" value="'+$.cpNoHTML(ttkn)+'" />');

					var fid = inp.attr('cp-file-id');
					if( $.isEmpty(fid) ) {
						fid = fm.find('INPUT[name="id"]:first').val();
					}
					hds.push('<input type="hidden" name="id" value="'+$.cpNoHTML(fid)+'" />');

					hds.push('<input type="hidden" name="upload-id" value="'+$.cpNoHTML(fleid)+'" />');

					var hasdel = false;
					var ftype = $.toText(inp.attr('cp-file-class')).toLowerCase();
					var inps = inp.parent().find('INPUT[cp-file-input-id="'+$.escape_reserved(fleid)+'"], SELECT[cp-file-input-id="'+$.escape_reserved(fleid)+'"]');
					inps.each(function() {
						var nam = $(this).attr('cp-file-input-name');
						if(!$.isEmpty(nam)) {

							if(nam != 'fn') {
								nam = 'file-'+nam;
							} else {
								if($.isChecked($(this))) {
									hasdel = true;
								}
							}

							var tag = $(this).prop('tagName');
							var typ = $(this).prop('type');
							if(tag == 'SELECT') {
								var ival = $(this).val();
								if(ival instanceof Array) {
									for(var j=0; j<ival.length; j++) {
										hds.push('<input type="hidden" name="'+$.cpNoHTML(nam)+'" value="'+$.cpNoHTML(ival[j])+'" />');
									}
								} else {
									hds.push('<input type="hidden" name="'+$.cpNoHTML(nam)+'" value="'+$.cpNoHTML($(this).val())+'" />');
								}
							} else if(tag == 'INPUT' && (typ=='radio' || typ=='checkbox')) {
								if( $.isChecked($(this)) ) {
									hds.push('<input type="hidden" name="'+$.cpNoHTML(nam)+'" value="'+$.cpNoHTML($(this).val())+'" />');
								}
							} else {
								hds.push('<input type="hidden" name="'+$.cpNoHTML(nam)+'" value="'+$.cpNoHTML($(this).val())+'" />');
							}
						}
					});
					hds.push('<input type="hidden" name="file-class" value="'+$.cpNoHTML(ftype)+'" />');

					ffm.html(hds.join(''));

					if(!hasdel) {
						var cinp = inp.clone(true);
						inp.after(cinp);
						inp.prop('name','uploadfile');
						inp.prop('id','');
						inp.appendTo(ffm);
					}

					ffm.submit();
					return true;
				} else {
					errobj.html('Cannot load file id.').show();
					inp.attr('cp-file-upload-ready', 'yes');
				}
			} else {
				errobj.html('Cannot upload file.').show();
				inp.attr('cp-file-upload-ready', 'yes');
			}

			return false;
		},

		cpSetFormat : function (opt) {
				opt = $.soap_input_opt(opt, {
					'date' : 'dd/mm/yyyy',
					'time' : 'hh:ii aa',
					'currency_symbol' : '$'
				});
				$.cpData('CPFormat', opt);
		},

		cpGetFormat : function (n) {
			var cfg =	$.cpData('CPFormat');
			if(typeof(cfg[n]) == 'string') {
				return cfg[n];
			}
			return '';
		},

		cpTypeSearch : function (id, opt) {
			var obj = $('#'+id);

			opt = $.soap_input_opt(opt, {
				'quick': false,
				'width':''
			});


			//opt['quick'] = true; /* No Extend View */

			opt['quick'] = (opt['quick']? 'y':'n');

			var tkn = obj.attr('cp-search-tkn');
			if(typeof(tkn) == 'string' && tkn.length > 0) {
				var inp = {'kw': obj.val(), 'quick': opt['quick'] };

				var fn = obj.attr('cp-search-fn');
				if(typeof(fn) != 'string') {
					fn = '';
				}

				var multi = obj.attr('cp-search-multi');
				if(typeof(multi) != 'undefined') {
					inp['multi'] = 'y';
				}

				var ext = obj.attr('cp-search-extra-field');
				if(typeof(ext) == 'string') {
					var arr = ext.split(';');

					for(var i=0; i<arr.length; i++) {
						var kv = arr[i].split(':');
						if(kv.length > 1 && kv[1]!='' && kv[0]!='') {
							var tmp = $('[name="'+$.escape_reserved(kv[1])+'"]');
							if(tmp.length > 0) {
								inp[kv[0]] = tmp.val();
							} else {
								tmp = $('#'+$.escape_reserved(kv[1]));
								if(tmp.length > 0) {
									inp[kv[0]] = tmp.val();
								}
							}
						}

					}
				}

				var nd = $('div.'+$.escape_reserved(opt['textsearch_pl'])+'[cp-search-id="'+$.escape_reserved(id)+'"]');

				nd.attr('cp-search-status', 'LOADING');
				obj.attr('cp-set-value-auto', '');
				var old_val = obj.val();

				// Show More Filter
				$.cpSendAjax({
					'fn' : fn,
					'tkn' : tkn,
					'obj' : obj,
					'loading-icon': true,
					'icon-type' : 'spinning-circle',
					'ajaxfn' : 'search',
					'soap-input': inp,
					'soap-output': {'quick':opt['quick'], 'content': '', 'title': 'Search...' },
					'onSuccess': function(res, sts) {

						if(opt['quick']!='y' || (res['quick'] == opt['quick'])) {
							var ls;
							var dobj;
							if(res['quick'] == 'y' /* || true */) { /* No Extend View */
								var chk = obj.attr('cp-focus');
								if($.isTrue(chk)) {
									nd.show();
									nd.html(res['content']);
									nd.move_under(obj);
								}

								ls = nd.find('a[cp-set-value]');
							} else {
								if(res['title'].length == 0) { res['title']='Search...'; }
								dobj = $.cpDialog({'title': res['title'],
									'content': res['content'],
									'width' : opt['width'],
									'onOkay': function (o, data) {
										var vfn = obj.attr('cp-set-value-fn');

										if(typeof(vfn) == 'string' && vfn.length>0) {
											var lst = o.find('input[type="checkbox"][cp-set-value]');

											var inparr = [];
											lst.each(function() {
												if($.isChecked($(this))) {
													var vals = $(this).attr('cp-set-value');
													if(typeof(vals) == 'string') {
														var vobj = $.parse_netosd_data(vals);
														inparr.push(vobj);
													}
												}
											});

											if(inparr.length > 0) {
												$.cpCallSetValueFn(vfn, obj, inparr);
											}
										}

									}
								});
								ls = dobj.find('a[cp-set-value], input[type="radio"][cp-set-value]');
							}

							ls.each(function() {
								if( !$(this).cpIsInited('set-value') ) {
									$(this).click(function() {
										var vals = $(this).attr('cp-set-value');
										if(typeof(vals) == 'string') {
											var vobj = $.parse_netosd_data(vals);

											var vfn = obj.attr('cp-set-value-fn');

											if(typeof(vfn) == 'string' && vfn.length>0) {
												$.cpCallSetValueFn(vfn, obj, [vobj]);
											}
										}

										if(dobj) {
											$.cpCloseDialog(dobj);
										}
									});
									$(this).cpAddInit('set-value');
								}

							});

							if(ls.length == 1) {
								obj.attr('cp-set-value-auto', old_val);

								var vals = ls.attr('cp-set-value');
								if(typeof(vals) == 'string') {
									setTimeout(function () {
										var chk = obj.attr('cp-set-value-auto');
										if(typeof(chk) == 'string' && chk.length>0 && chk == obj.val()) {
											var vobj = $.parse_netosd_data(vals);
											var vfn = obj.attr('cp-set-value-fn');
											if(typeof(vfn) == 'string' && vfn.length>0) {
												$.cpCallSetValueFn(vfn, obj, [vobj]);
											}
										}
									}, 750);
								}

							}

						}


						var fm = obj.closest('form');
						$.cpInitalAjaxFormRec(fm.attr('name'));
					},

					'onLoaded' : function () {
						setTimeout(function () { nd.attr('cp-search-status', 'READY'); }, 1000);
					}

				});

			}

		},

		cpAddSetValueFn : function (obj) {
			var cfg =	$.cpData('CPSetValueFn');

			if(obj instanceof Object ) {
				for(var k in obj) {
					if(typeof(k)=='string' && k.length>0 && typeof(obj[k]) == 'function') {
						cfg[k] = obj[k];
					}
				}
			}

			$.cpData('CPSetValueFn', cfg);
		},

		cpCallSetValueFn : function (k, obj, inp) {
			var cfg =	$.cpData('CPSetValueFn');
			if(cfg instanceof Object ) {
				if(typeof(cfg[k]) == 'function') {
					cfg[k](obj, inp);
				}
			}
		},

		cpShowFilterTags : function (f, opt) {
			var cfg = $.soap_input_opt(opt, {
					'filter_tag_panel' : 'ftr-filtertag',
					'filter_tag_count' : 'ftr-filtertag-count',
					'filter_col_save' : '_ftr_showcols'
				});
			var p = $('FORM[name="'+$.escape_reserved(f)+'"] .'+$.escape_reserved(cfg['filter_tag_panel']));
			var pc = $('FORM[name="'+$.escape_reserved(f)+'"] .'+$.escape_reserved(cfg['filter_tag_count']));
			if(p.length > 0 || pc.length > 0) {
				var tagcount = 0;
				var hastag = {};

				var fm = $('FORM[name="'+$.escape_reserved(f)+'"]');
				var taghtml = '';
				var regFm = new RegExp('(fmdate|_fm)$');
				var regTo = new RegExp('(todate|_to)$');
				var regLbFm = new RegExp('(^|\\s)(From|On)\\s*$');
				var regLbTo = new RegExp('(^|\\s)(To|On)\\s*$');

				var lablkey = {};

				fm.find('[name^="_ftr_"]').each(function () {
					var ftr = $.toText($(this).attr('name'));
					if(ftr != cfg['filter_col_save']) {
						var tag = $(this).prop('tagName');
						var typ = $(this).prop('type');
						var lobj = $(this).prevAll('LABEL:last');
						var label = '';
						if(lobj.length > 0) {
							label = $.toText(lobj.is('[cp-label-name]')? lobj.attr('cp-label-name') : lobj.html());
							if( lobj.is('[cp-prepend-label]') ) {
								var atxt = $.toText(lobj.attr('cp-prepend-label'));
								atxt = ($.isEmpty(lablkey[atxt]) ? '' : lablkey[atxt]);
								if(atxt.length > 0) { label = atxt+' '+label; }
							}
							if( lobj.is('[cp-append-label]') ) {
								var atxt = $.toText(lobj.attr('cp-append-label'));
								atxt = ($.isEmpty(lablkey[atxt]) ? '' : lablkey[atxt]);
								if(atxt.length > 0) { label = label+' '+atxt; }
							}
						}

						switch(tag) {
							case 'INPUT':
								switch(typ) {
									case 'checkbox':
									case 'radio':
										if(!$.isEmpty($(this).val()) && $.isChecked($(this))) {
											var shlabel = $.cpNoHTML(label);
											if( !$.isTrue(lobj.attr('cp-label-hidden')) ) {
												taghtml += '<div class="pull-left" style="margin: 0 4px 10px 0px;"><a cp-set-filter="'+$.cpNoHTML(ftr)+'" '+
												'href="javascript:void(0);" title="Click to remove this filter" class="btn btn-mini btn-info btn-tag" ><i class="icon-remove"></i> '+shlabel+'</a></div>';
												if(!hastag[ftr]) { hastag[ftr]=true; tagcount++; }
											}

											if( !$.isEmpty(lobj.attr('cp-label-key')) ) {  lablkey[$.toText(lobj.attr('cp-label-key'))] = shlabel; }
										}
										break;
									default :
										if(!$.isEmpty($(this).val())) {
											if(regFm.test(ftr) && !regLbFm.test(label)) {
												label += ' From';
											} else if(regTo.test(ftr) && !regLbTo.test(label)) {
												label += ' To';
											}

											var lval = $.toText($(this).val());
											if(lval.length > 35) {
												lval = lval.substr(0,35)+'...';
											}
											else if(lval == '-') {
												lval = '(unspecified)';
											}

											var shlabel = $.cpNoHTML(label + (label.length>0?': ':'')+lval);
											if( !$.isTrue(lobj.attr('cp-label-hidden')) ) {
												taghtml += '<div class="pull-left" style="margin: 0 4px 10px 0px;"><a cp-set-filter="'+$.cpNoHTML(ftr)+'" '+
												'href="javascript:void(0);" title="Click to remove this filter" class="btn btn-mini btn-info btn-tag" ><i class="icon-remove"></i> '+shlabel+'</a></div>';
												if(!hastag[ftr]) { hastag[ftr]=true; tagcount++; }
											}

											if( !$.isEmpty(lobj.attr('cp-label-key')) ) { lablkey[$.toText(lobj.attr('cp-label-key'))] = shlabel; }
										}
								}
								break;
							case 'SELECT':
								var optlen = $(this).find('OPTION').length;
								var sellen = $(this).find('OPTION:selected').length;
								var always = $.isTrue($(this).attr('cp-label-always'));
								var multi = $(this).is('[multiple]');
								var optctr = 0;
								$(this).find("OPTION").each(function () {
									if( (sellen < optlen || always) && $(this).is(':selected')) {

										var lval = $.toText($(this).html()); if(lval.length > 35) { lval = lval.substr(0,35)+'...'; }

										var shlabel = $.cpNoHTML(label + (label.length>0?': ':'')+lval);
										if( (multi || optctr>0) && !$.isTrue(lobj.attr('cp-label-hidden')) ) {
											taghtml += '<div class="pull-left" style="margin: 0 4px 10px 0px;"><a cp-set-filter="'+$.cpNoHTML(ftr)+'" cp-clear-filter-value="'+$.cpNoHTML($(this).val())+'" '+
											'href="javascript:void(0);" title="Click to remove this filter" class="btn btn-mini btn-info btn-tag" ><i class="icon-remove"></i> '+shlabel+'</a></div>';
											if(!hastag[ftr]) { hastag[ftr]=true; tagcount++; }
										}

										if( !$.isEmpty(lobj.attr('cp-label-key')) ) { lablkey[$.toText(lobj.attr('cp-label-key'))] = (multi? label : shlabel); }
									}
									optctr++;
								});
								break;
						}
					}
				});

				if(p.length > 0) {
					p.html(taghtml);
					p.find('A').click(function () { $.cpClearFilter($(this)); });
				}
				if(pc.length > 0) {
					if(tagcount > 0) {
						tagcount = '('+tagcount+' applied)';
					} else {
						tagcount = '';
					}
					pc.html(tagcount);
				}
			}
		},

		cpClearFilter : function (obj) {
			var ftr = $.toText(obj.attr('cp-set-filter'));
			if(typeof(ftr) == 'string' && ftr.length > 0) {
				var fm = obj.closest('form');
				var sobj = fm.find('[name="'+$.escape_reserved(ftr)+'"]:first');
				if(obj.is('[cp-clear-filter-value]')) {
					var ftv = $.toText(obj.attr('cp-clear-filter-value'));

					var tag = sobj.prop('tagName');
					var typ = sobj.prop('type');
					switch(tag) {
						case 'INPUT':
							switch(typ) {
								case 'radio':
								case 'checkbox':
									sobj = fm.find('INPUT[name="'+$.escape_reserved(ftr)+'"][value="'+$.escape_reserved(ftv)+'"]');
									$.setChecked(sobj, false);
									break;
								default :
									sobj = fm.find('INPUT[name="'+$.escape_reserved(ftr)+'"]')
									sobj.val('');
							}
							break;
						case 'SELECT':
							var sval = sobj.val();
							if(sobj.is('[multiple]')) {
								if(typeof(sval) != 'undefined') {
									if(sval instanceof Array) {
										var nval = [];
										for(var ni=0; ni<sval.length; ni++) {
											if($.toText(sval[ni]) != ftv) {
												nval.push(sval[ni]);
											}
										}
										sobj.val(nval);
									} else if($.toText(sval) == ftv) {
										sobj.val([]);
									}
								}
							} else {
								sobj.val('');
							}
							break;
					}
				} else {
					sobj.val([]);
				}
				obj.hide();
				fm.submit();
			}
		},

		cpShowAdvFilter : function (f) {
			var cfg =	$.cpData('CPAjaxForm'+f);
			var p = $('FORM[name="'+$.escape_reserved(f)+'"] .'+$.escape_reserved(cfg['filter_panel']));
			if(p.length > 0 && !p.hasClass('in')) {
				var show = false;

				p.find('[name^="_ftr_"]').each(function () {
					if(true || !show) {
						var tag = $(this).prop('tagName');
						var typ = $(this).prop('type');
						switch(tag) {
							case 'INPUT':
								switch(typ) {
									case 'radio':
									case 'checkbox':
										if( $.isChecked($(this)) ) { show=true; }
										break;
									default :
										if( !$.isEmpty($(this).val()) ) { show=true; }
								}
								break;
							case 'SELECT':
								if( $(this).find(":selected").length >0 ) {show=true;}
								break;
						}
					}
				});

				if(show) {
					p.collapse('show');
				}
			}
		},

		cpAjaxFormSubmit : function (f, opt) {
			var cfg = $.cpData('CPAjaxForm'+f);
			opt = $.soap_input_opt(opt, {
				'url': '', /* action=form action url */
				'type': '',
				'min-percent':0,
				'max-percent':100,
				'onSubmitChecked': false
				/* onSubmit onLoad */
				/* onSend onError onData onComplete onFail */
			});

			if(!$.isEmpty(f)) {
				var fm = $('FORM[name="'+$.escape_reserved(f)+'"]');

				// Save editor format
				fm.find('a.'+$.escape_reserved(cfg['textswitch_link'])).each(function () {
					$.cpHtmlEditorSave(f, $(this).attr('ref'));
				});

				var okay = true;
				if(fm.length) {
					if(!opt['onSubmitChecked']) {
						if(okay !== false && typeof(cfg['onSubmit']) == 'function') { okay = cfg['onSubmit']( fm ); }
						if(okay !== false && typeof(opt['onSubmit']) == 'function') { okay = opt['onSubmit']( fm ); }
					}

					if(okay !== false) {
						if(typeof(cfg['onLoad']) == 'function') { cfg['onLoad']( fm ); }
						if(typeof(opt['onLoad']) == 'function') { opt['onLoad']( fm ); }

						if(opt['url'] == 'action') { opt['url'] = fm.prop('action'); }


						var ainp = {
							'data': fm.serialize(),
							'soap-output': {'content': '', 'summary': '', 'pagination': '', 'msg': '' },
							'onSuccess': function(res) {
								if(cfg['ajax_panel']!='') {
									$('#'+$.escape_reserved(cfg['ajax_panel'])).html(res['content']);

									$('.'+$.escape_reserved(cfg['paging_results'])).html(res['summary']);
									$('.'+$.escape_reserved(cfg['paging_pagination'])).html(res['pagination']);

									if(!$.isEmpty(res['msg'])) {
										$.cpAlert(res['msg']);
									}
								}
							},
							'onPageLoaded' : function() {
								$.cpInitalAjaxFormRec(f);
							}
						};

						var reopen = [];
						$('ul.nav-tabs li.active a[data-toggle="tab"]').each(function() {
							var hid = $(this).attr('href');
							hid = hid.replace('#','');
							if(!$.isEmpty(hid)) {
								reopen.push(escape(hid));
							}
						});

						if(typeof(opt['reopen']) != 'undefined' && opt['reopen'] instanceof Array	) {
							for(var i=0; i<opt['reopen'].length; i++) {
								if(!$.isEmpty(opt['reopen'])) {
									reopen.push(escape(opt['reopen']));
								}
							}
						}
						if(reopen.length > 0) {
							ainp['reopen'] = reopen.join('|');
						}

						var inps = ['url','type'];
						for(var i=0; i<inps.length; i++) {
							if(!$.isEmpty(opt[inps[i]])) { ainp[inps[i]] = opt[inps[i]]; }
						}

						var inps = ['max-percent','min-percent'];
						for(var i=0; i<inps.length; i++) {
							if(typeof(opt[inps[i]]) == 'number') { ainp[inps[i]] = opt[inps[i]]; }
						}

						var fns = ['onSend','onError','onData','onComplete','onFail'];
						for(var i=0; i<fns.length; i++) {
							if(typeof(opt[fns[i]]) == 'function') { ainp[fns[i]] = opt[fns[i]]; }
						}


					$.cpSendAjax(ainp);
					}
				}

			}
		},

		cpInitalSearchFilter : function (opt) {
			opt = $.soap_input_opt(opt, {
				'savedfilter_opt' : 'ftr-custom-filter'
			});

			var obj = $('#'+$.escape_reserved(opt['savedfilter_opt']));
			obj.change(function() {
				var val = $.toInt( $(this).val() );
				if(val != 0) {
					$.cpSearchFilter(val, {'tkn': $.toText( $(this).attr('cp-saved-filter-tkn') )});
				} else {
					$(this).find('OPTION').prop('selected', false);
				}
			});
		},

		cpSearchFilter : function (id, opt) {
			opt = $.soap_input_opt(opt, {
				'form' : 'itemForm',
				'tkn_input' : 'tkn',
				'savedfilter_opt' : 'ftr-custom-filter',
				'tkn' : ''
			});

			if(!$.isEmpty(opt['form'])) {
				var fm = $('FORM[name="'+$.escape_reserved(opt['form'])+'"]');

				if(opt['tkn'] == ''){
					var tkno = fm.find('INPUT[name="'+$.escape_reserved(opt['tkn_input'])+'"]');
					opt['tkn'] = tkno.val();
				}

				if(fm.length > 0) {
					if(id > 0) {
						// Load Filter
						$.cpSendAjax({
							'max-percent': 50,
							'tkn' : opt['tkn'],
							'ajaxfn' : 'ldftr',
							'soap-input': { 'id': id },
							'soap-output': {'filter': {} },
							'onSuccess': function(res, sts) {
								fm.find('[name^="_ftr_"]').val([]);
								for(var k in res['filter']) {
									var val = res['filter'][k];
									if(!(val instanceof Array)) { val=[val]; }
									fm.find('[name="'+$.escape_reserved(k)+'"]').val(val);
								}
								fm.submit();
							}
						});
					} else if(id == 0) {
						// Add Filter - Not allowed
					} else if(id == -1) {
						// Empty All Filter
						fm.find('[name^="_ftr_"]').val([]);
						fm.submit();
					} else {
						var obj = $('#'+$.escape_reserved(opt['savedfilter_opt']));
						// Show More Filter
						$.cpSendAjax({
							'tkn' : opt['tkn'],
							'ajaxfn' : 'ldftr',
							'soap-input': { 'id': -1 },
							'soap-output': {'content': '' },
							'onSuccess': function(res, sts) {
								obj.html(res['content']);
							}
						});
					}
				}
			}
		},


		cpDeleteFilter : function (id, opt) {
			opt = $.soap_input_opt(opt, {
				'form' : 'itemForm',
				'tkn_input' : 'tkn',
				'filter_name' : ''
			});

			if($.cpConfirm("Do you really want to delete filter " + opt['filter_name'] + "?")){
				var fm = $('FORM[name="'+$.escape_reserved(opt['form'])+'"]');
				var tkno = fm.find('INPUT[name="'+$.escape_reserved(opt['tkn_input'])+'"]');
				$.cpSendAjax({
						'tkn' : tkno.val(),
						'ajaxfn' : 'delftr',
						'soap-input': { 'id': id },
						'soap-output': {'filter': {} },
						'onSuccess': function(res, sts) {
							$('#ftr-saved-filter li:not(.filter-remove)').each(function(){
									if($(this).children('a').html() == opt['filter_name']){
										$(this).nextAll('li.filter-remove:first').remove();
										$(this).remove();
									}
							});
						}
				});
			}

		},

		cpGetBaseUrl : function ()	{
			var url = window.location.href;
			var reg = new RegExp('^[^:]+://');
			url = url.replace(reg, '' );
			var arr = url.split('/');
			return 'https://'+arr[0]+'/do/suppliers/mobile';
		},

		cpSendAjax : function (opt) {
			opt = $.extend({
				'loading-icon': true,
				'icon-type': 'loading-bar', // options 'spinning-circle','loading-bar'
				'data':'',
				'min-percent':0,
				'max-percent':100
			},opt)

			if(opt['loading-icon'] && opt['icon-type'] == 'loading-bar') { $.cpPageLoading({'percent': Math.floor(opt['min-percent'] + (opt['max-percent'] * (50-opt['min-percent'])/100)) }); }

			var tarr = ['tkn','fn','proc','ajaxfn', 'id','reopen'];
			for(var i=0; i<tarr.length; i++) {
				if(typeof(opt[tarr[i]]) == 'string' ) { opt['data'] += '&'+tarr[i]+'='+escape(opt[tarr[i]]); }
			}
			opt['data'] += '&ajax=y';
			if(typeof(opt['soap-input']) == 'object' ) { opt['data'] += '&ajaxdata='+escape($.create_netosd_data(opt['soap-input'])); }

			opt['data'] = opt['data'].replace(/^&/,'');

			/* onSend onError onData onComplete onSuccess onFail onPageLoaded onLoaded */
			opt= $.extend({
				'type': 'POST',
				'url' : $.cpGetBaseUrl(),
				'beforeSend' : function(jq, set) {
					if(opt['loading-icon'] && opt['icon-type'] == 'spinning-circle'){
							if(opt['obj'].prev('img.search_loading_icon:last').length == 0){
								opt['obj'].before('<img class="search_loading_icon" src="/assets/loading.gif"/>');
								opt['obj'].prev('img.search_loading_icon:last').css('margin-left',opt['obj'].width()-10);
							}
							else{
								opt['obj'].prev('img.search_loading_icon:last').show();
							}
					}

					if(opt['loading-icon'] && opt['icon-type'] == 'loading-bar') { $.cpPageLoading({'percent': Math.floor(opt['min-percent'] + (opt['max-percent'] * (60-opt['min-percent'])/100)) }); }
					if(typeof(opt['onSend']) == 'function' ) { opt['onSend'](jq, set); }
					if(opt['loading-icon'] && opt['icon-type'] == 'loading-bar') { $.cpPageLoading({'percent': Math.floor(opt['min-percent'] + (opt['max-percent'] * (70-opt['min-percent'])/100)) }); }
				},
				'error' : function ( jq, sts, err) {
					var txt = sts;
					if(jq['responseText'] && typeof(jq['responseText']) == 'string') {	txt = jq['responseText']; }
					if(typeof(opt['onError']) == 'function') {
						opt['onError']( err,	txt)
					} else {
						$.cpError(txt, {'title': err});
					}
					if(opt['loading-icon'] && opt['icon-type'] == 'loading-bar') { $.cpPageLoading({'visible':false}); }
					if(opt['loading-icon'] && opt['icon-type'] == 'spinning-circle'){opt['obj'].prev('img.search_loading_icon:last').hide();}

					if(typeof(opt['onLoaded']) == 'function') { ctn = opt['onLoaded']( ); }
				},
				'dataFilter' : function(res,typ) {
					if(opt['loading-icon'] && opt['icon-type'] == 'loading-bar') { $.cpPageLoading({'percent': Math.floor(opt['min-percent'] + (opt['max-percent'] * (80-opt['min-percent'])/100)) }); }
					var pos = res.indexOf('NSD1;');
					if(pos >= 0 ) {
						dub = res.substr(0,pos);
						res = res.substr(pos);
						if(pos > 0 ) {
							if(typeof(opt['onDebug']) == 'function' ) { res = opt['onDebug'](dub,res); }
							else if(dub.indexOf('DEBUGALL')==0) { $.cpDebug(dup+'\n'+res); }
							else if(dub.indexOf('DEBUG')==0) { $.cpDebug(dub); }
						}
					} else {
						if(res.indexOf('<h1>Software error:</h1>') >= 0) {
							$.cpError(res, {'title': 'Software Error'});
							return 'SOFTWARE_ERROR';
						}
					}

					res = $.parse_netosd_data(res);
					if(res== null) { res = {}; }
					res['min_percent'] = opt['max-percent'];
					if(typeof(opt['soap-output']) == 'object' ) { res = $.soap_input_opt(res,opt['soap-output']); }
					if(typeof(opt['onData']) == 'function' ) { res = opt['onData'](res); }
					if(opt['loading-icon'] && opt['icon-type'] == 'loading-bar') { $.cpPageLoading({'percent': Math.floor(opt['min-percent'] + (opt['max-percent'] * (90-opt['min-percent'])/100)) }); }

					return res;
				},
				'success': function(res, sts) {
					if(typeof(res) == 'string' && res=='SOFTWARE_ERROR') {
						if(typeof(opt['onError']) == 'function') {
							opt['onError']( 'Server Error', res );
						}
						if(opt['loading-icon'] && opt['icon-type'] == 'loading-bar') { $.cpPageLoading({'visible':false}); }
						if(opt['loading-icon'] && opt['icon-type'] == 'spinning-circle'){opt['obj'].prev('img.search_loading_icon:last').hide();}

					} else {
						var ctn = true;
						if(typeof(opt['onComplete']) == 'function') { ctn = opt['onComplete']( res ); }
						if(ctn === false ) {
							if(typeof(opt['onFail']) ==	'function') { opt['onFail']( res );	}
						} else	{
							if(typeof(opt['onSuccess']) ==	'function') { opt['onSuccess']( res );	}
						}

						if(typeof(opt['onPageLoaded']) == 'function') { ctn = opt['onPageLoaded']( ); }


						if(opt['loading-icon'] && opt['icon-type'] == 'loading-bar' ) {
							if(opt['max-percent'] >= 100) {
								$.cpPageLoading({'visible':false});
							}
						}
						if(opt['loading-icon'] && opt['icon-type'] == 'spinning-circle'){opt['obj'].prev('img.search_loading_icon:last').hide();}
					}

					if(typeof(opt['onLoaded']) == 'function') { ctn = opt['onLoaded']( ); }

				}
			}, opt);



			$.ajax(opt);
		},

		cpRunAction : function(obj) {
			var bact = obj.attr('cp-btn-action');

			if(typeof(bact) == 'string') {
				switch(bact) {
					case 'submit-goback' : $.cpSaveAndClose(); break;
					case 'goback' : $.cpGoBack(); break;
				}
			} else {
				var bhref = obj.attr('cp-href');
				if(typeof(bhref) == 'string' && bhref.length>0) {
					$.cpGoToURL(obj.attr('cp-href'), {'target': obj.attr('cp-target'), 'width': obj.attr('cp-width'), 'height': obj.attr('cp-height')});
				}
			}
		},

		cpSetFilter : function (obj) {
			var ftr = obj.attr('cp-set-filter');
			if(typeof(ftr) == 'string' && ftr.length > 0) {
				var val = obj.attr('cp-set-filter-value');
				var fm = obj.closest('form');

				var clr = obj.attr('cp-clear-filter');
				if($.isTrue(clr)) {
					fm.find('[name^="_ftr_"]').val([]);
				}

				fm.find('[name="'+$.escape_reserved(ftr)+'"]').val(val);

				var subm = obj.attr('cp-sumbit');
				if($.isTrue(subm)) {
					$.cpAjaxFormSubmit(fm.prop('name'));
				}
			}
		},

		cpGoToURL : function (url, opt) {
			opt = $.soap_input_opt(opt, {
				'win-id' : 'cp-frame-ext',
				'target' : '',
				'source' : '',
				'width' : $(window).width() - 100,
				'height' : $(window).height() - 200
			});


			if(typeof(url) != 'string') { url=''; }
			if(url.indexOf('#')==0) {
				window.location.href = url;
				return false;
			}

			if(opt['width'] < 100 ) { opt['width']=100; }
			if(opt['height'] < 100 ) { opt['height']=100; }
			if(opt['height'] > 2000 ) { opt['height']=2000; }

			url = url.replace(/^http:/, 'https:');

			var bsname = ($.browser.msie? '' : opt['win-id']);

			switch(opt['target']) {
				case 'cp-frame' :
					if($.isEmpty(url)) {
						$.cpAlert('URL is empty.');
					} else if($.cpGetHost() != $.cpGetHost(url)) {
						var nw = window.open(url, bsname,'width='+opt['width']+',height='+opt['height']+',scrollbars=yes');
						nw.focus();
					} else {
						$.cpAlert('<iframe style="width:'+opt['width']+'px; height:'+opt['height']+'px;" src="'+url+'"></iframe>');
					}
					return false;
				case 'cp-blank' :
					var nw = window.open(url, bsname,'width='+opt['width']+',height='+opt['height']+',scrollbars=yes');
					nw.focus();
					return false;
			}

			window.location.href = url;
			return true;
		},

		cpGetHost : function (url) {
			if(typeof(url) != 'string'	|| url.indexOf('/') == 0 ) {
				url = window.location.pathname;
			}
			url = url.replace(new RegExp('^[^/]*://'), '');
			var arr = url.split('/');

			return arr[0];
		},

		cpGoBack : function (opt) {
			opt = $.soap_input_opt(opt, {
				'form' : 'itemForm',
				'tkn_input' : 'tkn',
				'tkn' : ''
			});

			var fm = $('FORM[name="'+opt['form']+'"]');
			var url = fm.prop('action');

			if($.isEmpty(opt['tkn'])) {
				var tkno = fm.find('INPUT[name="'+$.escape_reserved(opt['tkn_input'])+'"]');
				opt['tkn'] = tkno.val();
			}

			var ind = url.indexOf('?');
			if(ind>1) {
				url = url.substr(0,ind);
			}

			url += '?tkn='+opt['tkn'];
			window.location.href = url;
		},

		cpSaveAndClose : function (opt) {
			opt = $.soap_input_opt(opt, {
				'form' : 'itemForm'
			});

			$.cpAjaxFormSubmit(opt['form'],{'onComplete': function() { $.cpGoBack(); } });
		},

		cpHtmlEditor : function (f, n, opt) {
			var cfg =	$.cpData('CPAjaxForm'+f);
			opt = $.soap_input_opt(opt, {
				'textswitch_link' : cfg['textswitch_link']
			});
			var lnk = $('a.'+$.escape_reserved(opt['textswitch_link'])+'[ref="'+$.escape_reserved(n)+'"]');

			try{
				if ( CKEDITOR.loadFullCore ) { CKEDITOR.loadFullCore(); }
				if(CKEDITOR instanceof Object) {
					if(CKEDITOR.instances instanceof Object && CKEDITOR.instances[n]) {
						CKEDITOR.instances[n].updateElement();
						CKEDITOR.instances[n].destroy(true);
						lnk.html('<i class="icon-edit"></i>Enable Advanced Editor');
					} else {
						if(CKEDITOR.replace( n )) {
							lnk.html('<i class="icon-edit"></i>Disable Advanced Editor');
						} else {
							$.cpAlert('Sorry. Advanced Editor is not compatible with your browser.');
							$('a.'+$.escape_reserved(opt['textswitch_link'])).html('');
						}
					}
				}
			} catch(e) {
			}
		},

		cpHtmlEditorSave : function (f, n) {
			try{
				if(CKEDITOR instanceof Object) {
					if(CKEDITOR.instances instanceof Object && CKEDITOR.instances[n]) {
						CKEDITOR.instances[n].updateElement();
						CKEDITOR.instances[n].destroy(true);
					}
				}
			} catch(e) {
			}
		},

		cpShowTextCount : function (f, n, opt) {
			var cfg =	$.cpData('CPAjaxForm'+f);
			opt = $.soap_input_opt(opt, {
				'textcount_pl' : cfg['textcount_pl']
			});
			var txto = $('.ntextinput[name="'+$.escape_reserved(n)+'"]');
			var len = txto.attr('maxlength');
			if(typeof(len) == 'string') { len = $.toInt(len);	}
			if(typeof(len) == 'number') {
				var txt = txto.val()+'';
				var ctr = len - txt.length;
				if(ctr < 0) {
					ctr = 0;
					txto.val(txt.substr(0,len));
				}

				var pl = $('div.'+$.escape_reserved(opt['textcount_pl'])+'[ref="'+$.escape_reserved(n)+'"]');
				pl.html(ctr+' '+$.cpAddPlural(ctr, 'character')+' left.');
			}
		},

		cpNoHTML : function (txt) {
			if(typeof(txt) != 'string') { txt=''; }
			return txt.replace('<','&lt;').replace('>','&gt;').replace('"','&quot;');
		},

		cpHTMLParam : function (opt, data) {
			opt = $.soap_input_opt(opt, {
				'name': '',
				'id': '',
				'class': '',
				'style': '',
				'ref': '',
				'args': ''
			});

			var args = [];
			var arr = ['id','name','class','style','ref','args'];
			for(var i=0; i<arr.length; i++) {
				var k = arr[i];
				var html = '';
				if(typeof(opt[k]) == 'string') {
					html = opt[k];
				} else if(typeof(opt[k]) == 'function') {
					data = $.soap_input_opt(data, {});
					html = opt[k]( data );
				}

				if(html.length > 0) {
					args.push((k=='args'? html: k+'="'+$.cpNoHTML(html)+'"'));
				}
			}

			if(args.length > 0) {
				return ' '+args.join(' ');
			}

			return '';
		},

		cpHTMLSelectBox : function (opt, data) {
			opt = $.soap_input_opt(opt, {
				'name': '',
				'id': '',
				'class': '',
				'style': '',
				'args': '',
				'options' : []
			});

			$.cpHTMLParam(opt);

			var sel = {};
			if(typeof(opt['value']) == 'string' || typeof(opt['value']) == 'number') {
				sel[opt['value']] = true;
			} else if(opt['value'] instanceof Array) {
				for(var i=0; i<opt['value'].length; i++) {
					sel[opt['value'][i]] = true;
				}
			}

			if(opt['args'].length > 0) {
				opt['args']
			}

			var html = '<select'+	$.cpHTMLParam(opt)+'>';
			var curgp = '';
			for(var i=0; i<opt['options'].length; i++) {
				var d = $.soap_input_opt(opt['options'][i], { 'title': '', 'value':'', 'args':'', 'ref':'', 'group':'', 'options' : [] } );
				if(!$.isEmpty(d['group'])) {
					if(d['options'].length > 0) {
						html += '<optgroup label="'+$.cpNoHTML(d['group'])+'">';
						for(var j=0; j<d['options'].length; j++) {
							var g = $.soap_input_opt(d['options'][j], { 'title': '', 'value':'', 'args':'', 'ref':'' } );
							var seled = '';
							if(sel[g['value']] === true) {
								seled = 'selected';
							}
							html += '<option value="'+$.cpNoHTML(g['value'])+'"'+$.cpHTMLParam({'args':g['args'] ,'ref':g['ref']})+' '+seled+'>'+$.cpNoHTML(g['title'])+'</option>';
						}

						html += '</optgroup>';
					}
				} else {
					var seled = '';
					if(sel[d['value']] === true) {
						seled = 'selected';
					}
					html += '<option value="'+$.cpNoHTML(d['value'])+'"'+$.cpHTMLParam({'args':d['args'] ,'ref':d['ref']})+' '+seled+'>'+$.cpNoHTML(d['title'])+'</option>';
				}
			}
			html += '</select>';
			return html;
		},

		cpInitDynamicTable : function (n, opt) {
			opt = $.soap_input_opt(opt, {
				'total_field' : '_total',
				'rows' : [ ],
				'data' : {
					/* default */
					'upd_fields' : [],
					'upd_ids' : [],
					'upd_tbls' : []
				},
				'fn' : {
					/* change */
				}
			});

			$.cpData('CPDynamicTable'+n, opt);
		},

		cpGetDynamicTable : function (tbl) {
			if(typeof(tbl) == 'string') {
				tbl = $('table[cp-table-id="'+$.escape_reserved(tbl)+'"]').first();
			}

			return tbl;
		},

		cpGetDynamicTableDefaults : function (tbl, opt) {
			opt = $.soap_input_opt(opt, {
				'tbl_id' : '',
				'tbl_name' : '',
				'row' : -1
			});

			if($.isEmpty(opt['tbl_name'])) { opt['tbl_name']=$.toText(tbl.attr('cp-table')); }
			if($.isEmpty(opt['tbl_id'])) { opt['tbl_id']=$.toText(tbl.attr('cp-table-id')); }

			return opt;
		},

		cpDynamicTableCount	: function (tbl) {
			var tblname = $.toText(tbl.attr('cp-table'));
			var tbl_id = $.toText(tbl.attr('cp-table-id'));
			if(!$.isEmpty(tblname) && !$.isEmpty(tbl_id)) {
				var cfg = $.cpData('CPDynamicTable'+tblname);
				var ctr = $('input[name="'+$.escape_reserved(tbl_id+cfg['total_field'])+'"]');
				return $.toInt(ctr.val());
			}
			return 0;
		},

		cpDOMValue : function (o2, o1) {
			var tag = o2.prop('tagName');
			if(typeof(o1) != 'undefined') {
				var sval = null;
				if(o1 instanceof jQuery) {
					sval = $.cpDOMValue(o1);
				} else {
					sval = o1;
				}

				if(tag == 'INPUT') {
					var typ = o2.prop('type');
					if(typ == 'checkbox' || typ == 'radio') {
						$.setChecked(o2, sval);
					} else {
						o2.val(sval);
					}
				} else if(tag == 'TEXTAREA' || tag == 'SELECT') {
					o2.val(sval);
				} else {
					o2.html(sval);
				}
			} else {
				if(tag == 'INPUT') {
					var typ = o2.prop('type');
					if(typ == 'checkbox' || typ == 'radio') {
						return $.isChecked(o2);
					} else {
						return o2.val();
					}
				} else if(tag == 'TEXTAREA' || tag == 'SELECT') {
					return o2.val();
				} else {
					return o2.html();
				}
			}
		},

		cpDynamicTableAddRows : function (tbl, opt) {
			tbl = $.cpGetDynamicTable(tbl);
			if(opt instanceof Array) {
				for(var i=0; i<opt.length; i++) {
					$.cpDynamicTableAddRow(tbl, opt[i]);
				}
			}
		},

		cpDynamicTableDelRow : function (tbl, opt, fn) {
			opt = $.cpGetDynamicTableDefaults(tbl,opt);

			var cfg = $.cpData('CPDynamicTable'+opt['tbl_name']);

			var tbody = tbl.children('tbody');
			if(tbody.length > 0) {

				var ctr = $('input[name="'+$.escape_reserved(opt['tbl_id']+cfg['total_field'])+'"]');
				var total = $.toInt(ctr.val());

				if(opt['row'] == -2 ) { // Delete All
					while(total > 0) {
						for(var i=0; i<cfg['rows'].length; i++) {
							tbody.children('tr').last().remove();
						}
						total--;
					}
					ctr.val(0);

					if(typeof(fn) == 'function') {
						fn(opt['row'], tbl, opt );
					}
				} else if(total > 0 && opt['row'] < total) {
					if(opt['row'] == -1 ) { // Delete Last
						if(total > 0) {
							for(var i=0; i<cfg['rows'].length; i++) {
								tbody.children('tr').last().remove();
							}
							total--;
							ctr.val(total);

							if(typeof(fn) == 'function') {
								fn(total, tbl, opt );
							}
						}

					} else if(opt['row'] >= 0 ) {
						if(opt['row'] < total) {

							for(var i=opt['row']; i<total-1; i++) {
								for(var j=0; j<cfg['data']['upd_fields'].length; j++) {
									var kw = ''+opt['tbl_id']+cfg['data']['upd_fields'][j];
									var o1 = tbl.find('[name="'+$.escape_reserved(kw+(i+1))+'"]');
									var o2 = tbl.find('[name="'+$.escape_reserved(kw+(i))+'"]');

									$.cpDOMValue(o2,o1);
								}

								for(var j=0; j<cfg['data']['upd_ids'].length; j++) {
									var kw = ''+opt['tbl_id']+cfg['data']['upd_ids'][j];
									var o1 = tbl.find('#'+$.escape_reserved(kw+(i+1)));
									var o2 = tbl.find('#'+$.escape_reserved(kw+(i)));

									$.cpDOMValue(o2,o1);
								}

								for(var j=0; j<cfg['data']['upd_tbls'].length; j++) {
									var kwn = ''+opt['tbl_name']+cfg['data']['upd_tbls'][j];
									var kw1 = ''+opt['tbl_name']+cfg['data']['upd_tbls'][j]+(i+1);
									var kw2 = ''+opt['tbl_name']+cfg['data']['upd_tbls'][j]+(i);
									var ctbl1 = $.cpGetDynamicTable(kw1);
									var ctbl2 = $.cpGetDynamicTable(kw2);
									$.cpDynamicTableDelRow(ctbl2, {'tbl_id':kw2, 'tbl_name':kwn, 'row':-2} );
									var ctbctr = $.cpDynamicTableCount(ctbl1);
									for(var k=ctbctr-1; k>=0; k--) {
										$.cpDynamicTableMoveRow(ctbl1,{'tbl_id':kw1, 'tbl_name':kwn, 'row':k}, {'tbl_id':kw2,'row':-1});
									}
								}
							}

							for(var i=0; i<cfg['rows'].length; i++) {
								tbody.children('tr').last().remove();
							}
							total--;
							ctr.val(total);

							if(typeof(fn) == 'function') {
								fn(opt['row'], tbl, opt );
							}
						}
					}
				}
			}
		},

		cpDynamicTableMoveRow : function (tbl, opt, tar, fn) {
			opt = $.cpGetDynamicTableDefaults(tbl,opt);

			if(typeof(tar) == 'number') { tar = {'row': tar}; }
			tar = $.soap_input_opt(tar, {
				'tbl_id' : '',
				'row' : -1,
				'copy' : false
			});

			var tbody = tbl.children('tbody');
			if(tbody.length > 0) {

				var cfg = $.cpData('CPDynamicTable'+opt['tbl_name']);
				var ctr = $('input[name="'+$.escape_reserved(opt['tbl_id']+cfg['total_field'])+'"]');
				var total = $.toInt(ctr.val());

				if(tar['tbl_id'].length == 0 || tar['tbl_id'] == opt['tbl_id']) {
					// Move to same table
					if(tar['row'] > total) { tar['row'] =total-1; }
					if(tar['row'] < 0) { tar['row'] =0; }

					if(opt['row'] >= 0 && opt['row'] < total && ((tar['row'] != opt['row'] && tar['row'] < total) || tar['copy'])) {
						if(!tar['copy']) {
							var tmpdata = {'upd_ids':{}, 'upd_fields': {}};

							// Get Current Value
							for(var j=0; j<cfg['data']['upd_fields'].length; j++) {
								var k = cfg['data']['upd_fields'][j];
								var kw = ''+opt['tbl_id']+k;
								var o1 = tbl.find('[name="'+$.escape_reserved(kw+(opt['row']))+'"]');


								tmpdata['upd_fields'][k] = $.cpDOMValue(o1);
							}

							for(var j=0; j<cfg['data']['upd_ids'].length; j++) {
								var k = cfg['data']['upd_ids'][j];
								var kw = ''+opt['tbl_id']+k;
								var o1 = tbl.find('#'+$.escape_reserved(kw+(opt['row'])));

								tmpdata['upd_ids'][k] = $.cpDOMValue(o1);
							}

							// Move Values
							if(opt['row'] > tar['row']) {
								var add1 = -1;
								for(var i=opt['row']; i>tar['row'] && i>0; i--) {
									for(var j=0; j<cfg['data']['upd_fields'].length; j++) {
										var kw = ''+opt['tbl_id']+cfg['data']['upd_fields'][j];
										var o1 = tbl.find('[name="'+$.escape_reserved(kw+(i+add1))+'"]');
										var o2 = tbl.find('[name="'+$.escape_reserved(kw+(i))+'"]');

										$.cpDOMValue(o2,o1);
									}

									for(var j=0; j<cfg['data']['upd_ids'].length; j++) {
										var kw = ''+opt['tbl_id']+cfg['data']['upd_ids'][j];
										var o1 = tbl.find('#'+$.escape_reserved(kw+(i+add1)));
										var o2 = tbl.find('#'+$.escape_reserved(kw+(i)));

										$.cpDOMValue(o2,o1);
									}
								}
							} else {
								var add1 = 1, add2=0;
								for(var i=opt['row']; i<tar['row'] && i<total; i++) {
									for(var j=0; j<cfg['data']['upd_fields'].length; j++) {
										var kw = ''+opt['tbl_id']+cfg['data']['upd_fields'][j];
										var o1 = tbl.find('[name="'+$.escape_reserved(kw+(i+add1))+'"]');
										var o2 = tbl.find('[name="'+$.escape_reserved(kw+(i))+'"]');

										$.cpDOMValue(o2,o1);
									}

									for(var j=0; j<cfg['data']['upd_ids'].length; j++) {
										var kw = ''+opt['tbl_id']+cfg['data']['upd_ids'][j];
										var o1 = tbl.find('#'+$.escape_reserved(kw+(i+add1)));
										var o2 = tbl.find('#'+$.escape_reserved(kw+(i)));

										$.cpDOMValue(o2,o1);
									}
								}
							}

							// Set Target Value
							if(tar['row'] >= 0 && tar['row'] < total) {
								for(var j=0; j<cfg['data']['upd_fields'].length; j++) {
									var k = cfg['data']['upd_fields'][j];
									var kw = ''+opt['tbl_id']+k;
									var o1 = tbl.find('[name="'+$.escape_reserved(kw+(tar['row']))+'"]');


									$.cpDOMValue(o1,tmpdata['upd_fields'][k]);
								}

								for(var j=0; j<cfg['data']['upd_ids'].length; j++) {
									var k = cfg['data']['upd_ids'][j];
									var kw = ''+opt['tbl_id']+k;
									var o1 = tbl.find('#'+$.escape_reserved(kw+(tar['row'])));

									$.cpDOMValue(o1,tmpdata['upd_ids'][k]);
								}
							}

							if(typeof(fn) == 'function') {
								fn(opt['row'], tbl, opt );
							}
						} else {
							// Copy Row
							$.cpDynamicTableAddRow(tbl, {'tbl_name': opt['tbl_name'],'tbl_id': opt['tbl_id'] });

							for(var j=0; j<cfg['data']['upd_fields'].length; j++) {
								var kw = ''+opt['tbl_id']+cfg['data']['upd_fields'][j];
								var o1 = tbl.find('[name="'+$.escape_reserved(kw+(opt['row']))+'"]');
								var o2 = tbl.find('[name="'+$.escape_reserved(kw+(total))+'"]');

								$.cpDOMValue(o2,o1);
							}

							for(var j=0; j<cfg['data']['upd_ids'].length; j++) {
								var kw = ''+opt['tbl_id']+cfg['data']['upd_ids'][j];
								var o1 = tbl.find('#'+$.escape_reserved(kw+(opt['row'])));
								var o2 = tbl.find('#'+$.escape_reserved(kw+(total)));

								$.cpDOMValue(o2,o1);
							}

							for(var j=0; j<cfg['data']['upd_tbls'].length; j++) {
								var kwn = ''+opt['tbl_name']+cfg['data']['upd_tbls'][j];
								var kw1 = ''+opt['tbl_name']+cfg['data']['upd_tbls'][j]+(opt['row']);
								var kw2 = ''+opt['tbl_name']+cfg['data']['upd_tbls'][j]+(total);
								var ctbl1 = $.cpGetDynamicTable(kw1);
								var ctbl2 = $.cpGetDynamicTable(kw2);
								var ctbctr = $.cpDynamicTableCount(ctbl1);
								for(var k=ctbctr-1; k>=0; k--) {
									$.cpDynamicTableMoveRow(ctbl1, {'tbl_name': kwn,'tbl_id': kw1,'row':k }, {'tbl_id': kw2,'copy':true } );
								}
							}

							if(typeof(fn) == 'function') {
								fn(total, tbl, opt );
							}
						}
					}

				} else {
					// Move to different table
					var tbl2 = $.cpGetDynamicTable(tar['tbl_id']);

					if(opt['row'] >= 0 && opt['row'] < total) {

						var tmpdata = {'upd_ids':{}, 'upd_fields': {}};

						// Get Current Value
						for(var j=0; j<cfg['data']['upd_fields'].length; j++) {
							var k = cfg['data']['upd_fields'][j];
							var kw = ''+opt['tbl_id']+k;
							var o1 = tbl.find('[name="'+$.escape_reserved(kw+(opt['row']))+'"]');


							tmpdata['upd_fields'][k] = $.cpDOMValue(o1);
						}

						for(var j=0; j<cfg['data']['upd_ids'].length; j++) {
							var k = cfg['data']['upd_ids'][j];
							var kw = ''+opt['tbl_id']+k;
							var o1 = tbl.find('#'+$.escape_reserved(kw+(opt['row'])));

							tmpdata['upd_ids'][k] = $.cpDOMValue(o1);
						}

						if(!tar['copy']) {
							$.cpDynamicTableDelRow(tbl, opt);
						}
						$.cpDynamicTableAddRow(tbl2, {'tbl_name': tar['tbl_name'],'tbl_id': tar['tbl_id'] });

						var ctr2 = $('input[name="'+$.escape_reserved(tar['tbl_id']+cfg['total_field'])+'"]');
						var total2 = $.toInt(ctr2.val());
						var tarrow = total2 - 1;

						// Set Target Value
						if(tarrow >= 0 && tarrow < total2) {
							for(var j=0; j<cfg['data']['upd_fields'].length; j++) {
								var k = cfg['data']['upd_fields'][j];
								var kw = ''+tar['tbl_id']+k;
								var o1 = tbl2.find('[name="'+$.escape_reserved(kw+(tarrow))+'"]');

								$.cpDOMValue(o1,tmpdata['upd_fields'][k]);
							}

							for(var j=0; j<cfg['data']['upd_ids'].length; j++) {
								var k = cfg['data']['upd_ids'][j];
								var kw = ''+tar['tbl_id']+k;
								var o1 = tbl2.find('#'+$.escape_reserved(kw+(tarrow)));

								$.cpDOMValue(o1,tmpdata['upd_ids'][k]);
							}
						}

						$.cpDynamicTableMoveRow(tbl2, {'tbl_name': tar['tbl_name'],'tbl_id': tar['tbl_id'],'row': tarrow }, {'row': tar['row'] } );

						if(typeof(fn) == 'function') {
							fn(opt['row'], tbl, opt );
							fn(tar['row'], tbl2, opt );
						}
					}
				}
			}

		},

		cpDynamicTableAddRow : function (tbl, opt, fn) {
			opt = $.cpGetDynamicTableDefaults(tbl,opt);

			var cfg = $.cpData('CPDynamicTable'+opt['tbl_name']);

			if(tbl.children('tbody').length <= 0) {
				tbl.append('<tbody>');
			}
			var tbody = tbl.children('tbody');

			var torow = opt['row'];

			var ctr = $('input[name="'+$.escape_reserved(opt['tbl_id']+cfg['total_field'])+'"]');

			if(opt['row'] < 0) { opt['row']= $.toInt(ctr.val()); }

			if(!(cfg['rows'] instanceof Array)) {
				return -1;
			}

			for(var i=0; i<cfg['rows'].length; i++) {
				var rw = cfg['rows'][i];

				if(typeof(cfg['data']['default']) == 'function') {
					opt = cfg['data']['default'](opt);
				} else if(cfg['data']['default'] instanceof Object) {
					opt = $.soap_input_opt(opt, cfg['data']['default']);
				}

				var rh = '';
				if(typeof(rw) == 'function') {
					rh = rw(opt);
				} else if(typeof(rw) == 'string') {
					rh = $.cpParseTemplate(rw, opt);
				} else {
					rh = '<tr></tr>';
				}
				tbody.append(rh);
			}
			ctr.val(opt['row']+1);

			if(torow >= 0) {
				$.cpDynamicTableMoveRow(tbl, {'tbl_name': opt['tbl_name'],'tbl_id': opt['tbl_id'],'row': opt['row'] }, {'row': torow } );
			}


			if(typeof(fn) == 'function') {
				fn(opt['row'], tbl, opt );
			}

			return torow;

		},

		cpDynamicTableFn : function(id, fn, opt) {
			var tbl = $.cpGetDynamicTable(id);
			opt = $.cpGetDynamicTableDefaults(tbl,opt);
			if(tbl.length > 0) {
				var n = $.toText(tbl.attr('cp-table'));
				if(!$.isEmpty(n)) {
					opt['tbl_name'] = n;
					var cfg = $.cpData('CPDynamicTable'+n);
					if(typeof(cfg['fn'][fn]) == 'function') {
						cfg['fn'][fn](tbl, opt);

						if(typeof(cfg['fn']['change']) == 'function') {
							cfg['fn']['change'](tbl, opt);
						}

						var fm = tbl.closest('form');
						$.cpInitalAjaxFormRec(fm.attr('name'));
					}
				}
			}
		},

		cpFixDate : function (y,m,d) {
			var cm = m %12;
			switch(cm) {
				case 0:
				case 2:
				case 4:
				case 6:
				case 7:
				case 9:
				case 11:
					if(d > 31) { return new Date(y,m,31); }
					break;
				case 3:
				case 5:
				case 8:
				case 10:
					if(d > 30) { return new Date(y,m,30); }
					break;
				case 1:
					var md = ((y %4) == 0? 29 : 28);
					if(d > 30) { return new Date(y,m,md); }
					break;
			}
			return new Date(y,m,d);
		},

		cpSortableAddWidget : function (inp) {

			inp = $.soap_input_opt(inp, {
				'widgets' : [],
				'inital' : false,
				'reload_cache' : false
			});


			var opt = $.cpData('CPSortable');
			// Add Columns (Only allow one column panel)
			var pls = $( 'DIV.'+$.escape_reserved(opt['sortable_pl']) );

			pls.each(function() {
				if( $(this).cpIsInited('sortable') ) {
					var pl = $(this);
					var cols = pl.find('DIV.'+$.escape_reserved(opt['sortable_col']));

					if(cols.length <= 0) {
						$.cpSortableAddCol(pl, -1);
					}
				}
			});

			pls.each(function() {
				var pl = $(this);

				var wtype = $.toText(pl.attr('cp-widget-type'));
				var maxlen = $.toInt(pl.attr('cp-widget-cols')); if(maxlen<=0) { maxlen=1; }

				var curpos= 0;
				var wgtarr = new Array();
				for(var ik=0; ik<inp['widgets'].length; ik++) {
					var data = $.soap_input_opt(inp['widgets'][ik], {
						'id' : 0,
						'title' : '',
						'content' : '',
						'type' : '',
						'script' : '',
						'error' : '',
						'pos': -1
					});

					if(data['type'] == wtype) {
						if(data['pos'] > 0) {
							if(data['pos'] < curpos) { data['pos'] = curpos; }
							if(data['pos'] > curpos) {
								curpos = data['pos'];
							}
						}

						if(!$.isEmpty(data['error'])) {
							// Has error
							$.cpError(unescape(data['error']));
						} else {
							wgtarr.push(data);
						}

					}
				}

				if(curpos > 0) {
					var stcols = pl.find(' DIV.'+$.escape_reserved(opt['sortable_col']));

					var curind = 0;
					var lstcol = stcols.first();
					stcols.each(function() {
						lstcol = $(this);

						var collen = 1;
						for(var i=2; i<=maxlen; i++) {
							if($(this).hasClass(opt['sortable_span']+i)) {
								collen = i;
							}
						}
						$(this).removeClass(opt['sortable_span']+collen).addClass(opt['sortable_span']+1);
						for(var j=collen; j>1; j--) {
							var newcol = $.cpSortableAddCol(pl, 1);
							newcol.insertAfter(lstcol);
							lstcol = newcol;
							curind++;
						}
						curind++;
					});

					// Add All Widget Placeholder based on the maximum position number divided by maxlen
					curpos = Math.ceil((curpos+1)/maxlen)*maxlen;
					for(var i=curind; i<=curpos; i++) {
						var newcol = $.cpSortableAddCol(pl, 1);
						newcol.insertAfter(lstcol);
						lstcol = newcol;
					}
				}

				for(var ik=0; ik<wgtarr.length; ik++) {
					var data = wgtarr[ik];

					var addtocol;
					if(data['pos'] < 0) {
						// Add to the last row/column when position < 0
						addtocol = pl.find('DIV.'+$.escape_reserved(opt['sortable_col'])).last();
					} else if(data['pos'] == 0) {
						// Add to the first row/column when position == 0
						addtocol = pl.find('DIV.'+$.escape_reserved(opt['sortable_col'])).first();
					} else {
						addtocol = pl.find('DIV.'+$.escape_reserved(opt['sortable_col'])).slice(data['pos'], data['pos']+1);
					}




					if(addtocol.length > 0 && data['id'] > 0	) {
						var wis;

						if(inp['reload_cache']){
							// Reload widget
							wis = pl.find('DIV.'+$.escape_reserved(opt['sortable_widget'])+'[cp-widget-id="'+data['id']+'"]:first');
						} else {
							// Create widget

							if(data['type'] == 'midget'){
								wis = $('<div class="well '+opt['sortable_widget']+' " cp-widget-id="'+data['id']+'"><div class="div_header midget-header">'+
									'<span class="icon-remove pull-right" style="'+(data['closable'] == 'y' ?'':'display:none')+'"></span>'+
									(data['closable'] == 'y'?'<span class="icon-refresh pull-right"></span>':'')+
									'</div>'+
									'<div class="widget-content"></div></div>').appendTo(addtocol);

							}else{
							wis = $('<div class="'+opt['sortable_widget']+'" cp-widget-id="'+data['id']+'"><div class="div_header widget-header">'+
									'<span class="icon-remove pull-right" style="'+(data['closable'] == 'y' ?'':'display:none')+'"></span>'+
									(data['closable'] == 'y'?'<span class="icon-refresh pull-right"></span>':'')+
									'<span class="widget-title"></span></div>'+
									'<div class="widget-content"></div></div>').appendTo(addtocol);
							}






							wis.find("DIV.div_header:first").css({'cursor':opt['move_cursor']});
							wis.find(".icon-remove:first").click(function() {
								var curpl = $(this).closest('DIV.'+$.escape_reserved(opt['sortable_pl']));
								$(this).closest('DIV.'+$.escape_reserved(opt['sortable_widget'])).remove();
								$.cpSortableReposCol(curpl);
								$.cpSortableSaveCol(false);
							}).css({'cursor':opt['close_cursor']});


							wis.find(".icon-refresh:first").click(function() {
								var wid = $.toInt($(this).closest('.nsortable-widget').attr('cp-widget-id'));
								$.cpSendAjax({
									'loading-icon': true,
									'ajaxfn' : 'ldwget',
									'soap-input': { 'id': wid, 'reload_cache':1 },
									'soap-output': { 'widget':[] },
									'onSuccess': function(res, sts) {
										$.cpSortableAddWidget({'widgets': res['widget'], 'reload_cache': true});
									},
									'onError': function(err,	txt) { }
								});
							}).css({'cursor':opt['close_cursor']});
						}

						wis.find('.widget-title:first').html(unescape(data['title']));




						if($.trim(unescape(data['content']))){
							wis.find('.widget-content:first').html(unescape(data['content']));
							wis.show();
						}else{
							wis.hide();
						}

						$.cpEval(wis, unescape(data['script']));
					}
				}

				$.cpSortableReposCol(pl);
			});

			if(!inp['inital'] && !inp['reload_cache']) {
				$.cpSortableSaveCol(false);
			}
		},

		cpSortableAddCol : function (pl, size) {
			var opt = $.cpData('CPSortable');

			var maxlen = $.toInt(pl.attr('cp-widget-cols')); if(maxlen<=0) { maxlen=1; }

			if(size <= 0 || size > maxlen) {
					size = maxlen;
			}

			var newcol = $('<div class="'+opt['sortable_col']+' '+(opt['sortable_span']+size)+'"></div>').appendTo(pl);
			$.cpSortableInitCol(newcol);

			return newcol;
		},

		cpSortableLoadWidget : function (inp) {
			inp = $.soap_input_opt(inp, {
				'class' : '',
				'id' : 0,
				'max-num' : 50
			});

			if(inp['class']!=''){
				inp['class'] = '.'+inp['class'];
			}

			if($(inp['class']+' .nsortable-widget').length > inp['max-num']-1){
				$.cpAlert('You can only add up to ' + inp['max-num'] + ' widgets to the dashboard.');
				return false;
			}



			$.cpPageLoading({'percent':50});

			if(inp['id'] > 0) {
				var ctr = $('[cp-widget-id="'+inp['id']+'"]').length;
				if(ctr) {
					$.cpAlert('Widget already added.');
				} else {
					$.cpSendAjax({
						'loading-icon': false,
						'ajaxfn' : 'ldwget',
						'soap-input': { 'id': inp['id'] },
						'soap-output': { 'widget':[] },
						'onSuccess': function(res, sts) {
							$(".widget_selector").val("");
							$.cpPageLoading({'percent':100});
							$.cpSortableAddWidget({'widgets': res['widget'],'type':res['widget'][0]['type']});
							$.cpPageLoading({'visible':false});
						},
						'onError': function(err,	txt) { }
					});
				}
			}

		},

		cpSortableSaveCol : function (fc) {
			var opt = $.cpData('CPSortable');

			if(opt['status'] || fc) {
				opt['status'] = false;

				var objs = [];

				var curind = 0;


				var allpl = $( 'DIV.'+$.escape_reserved(opt['sortable_pl']) );
				allpl.each(function() {
					var maxlen = $.toInt($(this).attr('cp-widget-cols')); if(maxlen<=0) { maxlen=1; }
					var cols = $(this).find('DIV.'+$.escape_reserved(opt['sortable_col']));
					// Each Widget Type Can Only Have 1 Widget Panel
					cols.each(function() {
						var collen = 1;
						for(var i=2; i<=maxlen; i++) {
							if($(this).hasClass(opt['sortable_span']+i)) {
								collen = i;
							}
						}

						var wis = $(this).find('DIV.'+$.escape_reserved(opt['sortable_widget']));
						wis.each(function() {
							var wid = $.toInt($(this).attr('cp-widget-id'));
							if(wid > 0) {
								objs.push({'pos':curind,'id': wid});
							}
						});

						curind+=collen;
					});
				});


				$.cpSendAjax({
					'loading-icon': false,
					'ajaxfn' : 'savwget',
					'soap-input': { 'widget': objs },
					'soap-output': {'status': 0 },
					'onSuccess': function(res, sts) {
						opt['status'] = true;
					},
					'onError': function(err,	txt) { }
				});

			} else {
				if(opt['timer']) { clearTimeout(opt['timer']); }
				opt['timer'] = setTimeout(function () { $.cpSortableSaveCol(true);	}, opt['save_delay']);
			}
		},

		cpSortableReposCol : function (pl) {
			var opt = $.cpData('CPSortable');

			var curind = 0;
			var maxlen = $.toInt(pl.attr('cp-widget-cols')); if(maxlen<=0) { maxlen=1; }

			pl.find(' DIV.'+$.escape_reserved(opt['sortable_col'])).each(function() {
				var collen = 1;
				for(var i=2; i<=maxlen; i++) {
					if($(this).hasClass(opt['sortable_span']+i)) {
						collen = i;
					}
				}

				if($(this).find('DIV.'+$.escape_reserved(opt['sortable_widget'])).length <= 0) {
					if(collen < maxlen) {
						if(curind % maxlen == 0) {
							// Is the first column on the row
							var ntcol = $(this).nextAll('DIV.'+$.escape_reserved(opt['sortable_col'])+':first');
							var ntlen = 1;
							for(var i=2; i<=maxlen; i++) {
								if(ntcol.hasClass(opt['sortable_span']+i)) {
									ntlen = i;
								}
							}
							ntcol.removeClass(opt['sortable_span']+ntlen).addClass(opt['sortable_span']+(ntlen+collen));
							collen = 0;
						} else {
							var ntcol = $(this).prevAll('DIV.'+$.escape_reserved(opt['sortable_col'])+':first');
							var ntlen = 1;
							for(var i=2; i<=maxlen; i++) {
								if(ntcol.hasClass(opt['sortable_span']+i)) {
									ntlen = i;
								}
							}
							ntcol.removeClass(opt['sortable_span']+ntlen).addClass(opt['sortable_span']+(ntlen+collen));
						}
					} else {
						collen = 0;
					}

					$(this).remove();
				}

				curind += collen;

				$(this).removeClass('nsortable-placeholder-pl');
			});
			//$(window).resize();
		},

		cpSortableInitCol : function (objs) {
			var opt = $.cpData('CPSortable');

			objs.each(function(){
				var obj=$(this);
				if( !obj.cpIsInited('sortable') ) {
					var pl = obj.closest('DIV.'+$.escape_reserved(opt['sortable_pl']));
					var wtype = $.toText(pl.attr('cp-widget-type'));
					obj.sortable({
						'connectWith' : 'DIV.'+$.escape_reserved(opt['sortable_pl'])+'[cp-widget-type="'+$.escape_reserved(wtype)+'"] '+'DIV.'+$.escape_reserved(opt['sortable_col']),
						'placeholder': opt['sortable_placeholder'],
						'cancel' : 'BUTTON,INPUT,TEXTAREA,A',
						'handle' : 'DIV.div_header:first',
						'scroll' : true,
						'opacity' : 0.5,
						'tolerance' : 'pointer',
						'cursor': opt['move_cursor'],

						'update' : function (event, ui) {
							$.cpSortableSaveCol(false);
						},

						'sort' : function (event, ui) {

							var iconpos = $(ui.item).find('SPAN.icon-remove:first').position();

							var curcol = $(ui.placeholder).closest( 'DIV.'+$.escape_reserved(opt['sortable_col']) );

							var isstart = (curcol.prevAll('DIV.'+$.escape_reserved(opt['sortable_col'])).length > 0 && curcol.nextAll('DIV.'+$.escape_reserved(opt['sortable_col'])).length > 0 );

							if(isstart) {
								var curpl = $(ui.item).closest( 'DIV.'+$.escape_reserved(opt['sortable_pl']) );
								var itmpos = ui.offset;
								var pldim = curpl.position();

								itmpos['left'] -= pldim['left'] - iconpos['left'];

								var maxlen = $.toInt(curpl.attr('cp-widget-cols')); if(maxlen<=0) { maxlen=1; }
								var collen = 1;
								for(var i=2; i<=maxlen; i++) {
									if(curcol.hasClass(opt['sortable_span']+i)) {
										collen = i;
									}
								}

								var curind = Math.floor(itmpos['left']/ (curpl.width()/maxlen) )+1;
								if( curind < 1	) {
									curind = 1;
								} else if( curind > maxlen	) {
									curind = maxlen;
								}

								if(collen > 1 && curind > 1) {
									curcol.removeClass(opt['sortable_span']+collen).addClass(opt['sortable_span']+1);
									for(var i=1; i<collen; i++) {
										var newcol = $.cpSortableAddCol(curpl, 1);
										newcol.insertAfter(curcol);
									}
								}

								var stcols = curpl.find(' DIV.'+$.escape_reserved(opt['sortable_col']));
								stcols.addClass('nsortable-placeholder-pl');
								stcols.sortable("refresh");
								stcols.sortable("refreshPositions");
							}
						},

						'start' : function (event, ui) {
							var curpl = $(ui.item).closest( 'DIV.'+$.escape_reserved(opt['sortable_pl']) );

							curpl.find('DIV.clear[cp-clearall="yes"]').remove();

							$.cpSortableAddCol(curpl, -1).prependTo(curpl);
							$.cpSortableAddCol(curpl, -1);

							var stcols = curpl.find('DIV.'+$.escape_reserved(opt['sortable_col']));

							var maxlen = $.toInt(curpl.attr('cp-widget-cols')); if(maxlen<=0) { maxlen=1; }
							var curind = 0;
							stcols.each(function() {
								var collen = 1;
								for(var i=2; i<=maxlen; i++) {
									if($(this).hasClass(opt['sortable_span']+i)) {
										collen = i;
									}
								}
								curind+=collen;
								if(curind > 0 && curind % maxlen == 0) {
									$(this).after('<div cp-clearall="yes" class="clear"></div>');
								}

							});

							stcols.addClass('nsortable-placeholder-pl');
							stcols.sortable("refresh");
							stcols.sortable("refreshPositions");

						},

						'stop' : function (event, ui) {
							var curpl = $(ui.item).closest('DIV.'+$.escape_reserved(opt['sortable_pl']));
							$.cpSortableReposCol(curpl);
						}
					});

					obj.disableSelection();

					obj.cpAddInit('sortable');
				}

			});
		},

		cpInitSortable : function(opt, widgs) {
			opt = $.soap_input_opt(opt, {
				'sortable_pl' : 'nsortable',
				'sortable_col' : 'nsortable-cols',
				'sortable_widget' : 'nsortable-widget',
				'sortable_placeholder' : 'nsortable-placeholder',
				'sortable_span' : 'nsortable-col',
				'close_cursor' : 'pointer',
				'move_cursor' : 'move',
				'initial_widgets' : [18,24],
				'save_delay' : 1500
			});

			var saved_widgs = new Array();
			for(var i=0; i< widgs.length; i++){
				saved_widgs.push($.toInt(widgs[i].id));
			}


			for(var i=0;i<opt['initial_widgets'].length;i++){
					var initial_widget = opt['initial_widgets'][i];
					if($.inArray(initial_widget,saved_widgs) == -1){
						$.cpSendAjax({
						'loading-icon': false,
						'ajaxfn' : 'ldwget',
						'soap-input': { 'id': initial_widget },
						'soap-output': { 'widget':[] },
						'onSuccess': function(res, sts) {
							$.cpSortableAddWidget({'widgets': res['widget'],'type':res['widget'][0]['type']});
						},
						'onError': function(err,	txt) { }
					});
					}
			}



			opt['status'] = true;
			opt['timer'] = null;

			$.cpData('CPSortable', opt);

			var pls = $( 'DIV.'+$.escape_reserved(opt['sortable_pl']));
			pls.each(function() {
				var pl = $(this);
				if( !$(this).cpIsInited('sortable') ) {

					var cols = pl.find('DIV.'+$.escape_reserved(opt['sortable_col']));
					if(cols.length <= 0) {
						cols = $.cpSortableAddCol(pl, -1);
					}

					$(this).cpAddInit('sortable');
				}
			});

			$.cpSortableAddWidget({'widgets': widgs, 'inital':true});
		},


		cpGetUserRestriction: function(gid){
			if(gid>=1 && gid<=32) {
				return Math.pow(2,gid-1)
			} else {
				return 0;
			}
		}




	});
}) (jQuery);
/* END CPANEL FUNCTIONS */


/* DATETIME PICKER FUNCTIONS */
if($.datepicker) {
	if(!$.datepicker._generateHTML_PARENT) {

		$.datepicker._gotoDate = function(id) {
			var target = $(id);
			var inst = this._getInst(target[0]);

			var inp = $(inst.input);
			var addtime = inp.attr('cp-datetime-picker'); if(typeof(addtime) != 'string' ) { addtime=''; }
			var istime = $.isTrue(addtime);

			var day = inst.currentDay;
			var mon = inst.currentMonth;
			var year = inst.currentYear;

			var clr = false;
			var sel = $('.ui-datepicker-selectpane select[ref="datepicker-more"]').first();
			var v = sel.val();
			switch(v) {
				case 'CLEAR' :
					clr = true;
				case '' :
					day = inst.currentDay;
					mon = inst.currentMonth;
					year = inst.currentYear;
					break;
				case 'TODAY':
				case 'NOW' :
					var d = new Date();
					day = d.getDate();
					mon = d.getMonth();
					year = d.getFullYear();
					break;
				default:
					var c1 = v.substr(0,3);
					var c2 = v.substr(3,1);

					var d = new Date();

					switch(c1) {
						case 'CDL':
							switch(c2) {
								case 'W': d= new Date(d.getFullYear(), d.getMonth(), d.getDate()-7); break;
								case 'M': d= $.cpFixDate(d.getFullYear(), d.getMonth()-1, d.getDate()); break;
								case 'Q': d= $.cpFixDate(d.getFullYear(), d.getMonth()-3, d.getDate()); break;
								case 'Y': d= $.cpFixDate(d.getFullYear()-1, d.getMonth(), d.getDate()); break;
							}
							break;
						case 'CDN':
							switch(c2) {
								case 'W': d= new Date(d.getFullYear(), d.getMonth(), d.getDate()+7); break;
								case 'M': d= $.cpFixDate(d.getFullYear(), d.getMonth()+1, d.getDate()); break;
								case 'Q': d= $.cpFixDate(d.getFullYear(), d.getMonth()+3, d.getDate()); break;
								case 'Y': d= $.cpFixDate(d.getFullYear()+1, d.getMonth(), d.getDate()); break;
							}
							break;
						case 'FDC':
							switch(c2) {
								case 'W': d= new Date(d.getFullYear(), d.getMonth(), d.getDate()-d.getDay()); break;
								case 'M': d= new Date(d.getFullYear(), d.getMonth(), 1); break;
								case 'Q': var m = d.getMonth(); d= new Date(d.getFullYear(), m-(m%3), 1); break;
								case 'Y': d= new Date(d.getFullYear(), 1, 1); break;
							}
							break;
						case 'LDC':
							switch(c2) {
								case 'W': d= new Date(d.getFullYear(), d.getMonth(), d.getDate()+d.getDay()); break;
								case 'M': d= $.cpFixDate(d.getFullYear(), d.getMonth(), 31); break;
								case 'Q': var m = d.getMonth(); d= $.cpFixDate(d.getFullYear(), m+(2-(m%3)), 31); break;
								case 'Y': d= $.cpFixDate(d.getFullYear(), 12, 31); break;
							}
							break;
						case 'FDL':
							switch(c2) {
								case 'W': d= new Date(d.getFullYear(), d.getMonth(), d.getDate()-7-d.getDay()); break;
								case 'M': d= new Date(d.getFullYear(), d.getMonth()-1, 1); break;
								case 'Q': var m = d.getMonth()-3; d= new Date(d.getFullYear(), m-(m%3), 1); break;
								case 'Y': d= new Date(d.getFullYear()-1, 1, 1); break;
							}
							break;
						case 'LDL':
							switch(c2) {
								case 'W': d= new Date(d.getFullYear(), d.getMonth(), d.getDate()-7+d.getDay()); break;
								case 'M': d= $.cpFixDate(d.getFullYear(), d.getMonth()-1, 31); break;
								case 'Q': var m = d.getMonth()-3; d= $.cpFixDate(d.getFullYear(), m+(2-(m%3)), 31); break;
								case 'Y': d= $.cpFixDate(d.getFullYear()-1, 12, 31); break;
							}
							break;
						case 'FDN':
							switch(c2) {
								case 'W': d= new Date(d.getFullYear(), d.getMonth(), d.getDate()+7-d.getDay()); break;
								case 'M': d= new Date(d.getFullYear(), d.getMonth()+1, 1); break;
								case 'Q': var m = d.getMonth()+3; d= new Date(d.getFullYear(), m-(m%3), 1); break;
								case 'Y': d= new Date(d.getFullYear()+1, 1, 1); break;
							}
							break;
						case 'LDN':
							switch(c2) {
								case 'W': d= new Date(d.getFullYear(), d.getMonth(), d.getDate()+7+d.getDay()); break;
								case 'M': d= $.cpFixDate(d.getFullYear(), d.getMonth()+1, 31); break;
								case 'Q': var m = d.getMonth()+3; d= $.cpFixDate(d.getFullYear(), m+(2-(m%3)), 31); break;
								case 'Y': d= $.cpFixDate(d.getFullYear()+1, 12, 31); break;
							}
							break;
					}

					day = d.getDate();
					mon = d.getMonth();
					year = d.getFullYear();
					break;
			}

			inst.selectedDay = inst.currentDay = day;
			inst.drawMonth = inst.currentMonth = inst.selectedMonth = mon;
			inst.drawYear = inst.currentYear = inst.selectedYear = year;

			this._notifyChange(inst);
			this._adjustDate(target);

			if(clr) {
				this._clearDate(id);
			} else {
				if(istime) {

					if(v == 'NOW') {
						var d = new Date();
						var selh = $('.ui-datepicker-timepane select[ref="datepicker-hr"]').first();
						var selm = $('.ui-datepicker-timepane select[ref="datepicker-min"]').first();
						var sels = $('.ui-datepicker-timepane select[ref="datepicker-sec"]').first();
						var sela = $('.ui-datepicker-timepane select[ref="datepicker-am"]').first();

						inst.currentHours = d.getHours();
						inst.currentMinutes = d.getMinutes();
						inst.currentSeconds = d.getSeconds();

						selh.val((inst.currentHours % 12));
						selm.val(inst.currentMinutes);
						sels.val(inst.currentSeconds);
						sela.val(inst.currentHours > 12 ? 'pm':'am');
					}

					this._selectDateTime(id, this._formatDateTime(inst,inst.currentDay, inst.currentMonth, inst.currentYear, inst.currentHours, inst.currentMinutes, inst.currentSeconds));
				} else {
					this._selectDate(id, this._formatDate(inst,inst.currentDay, inst.currentMonth, inst.currentYear));
				}
			}
		};

		$.datepicker._generateHTML_SELECT = function (inst, opt) {

			var curcode = '';
			var curtxt = '';
			var arrtxt = ['week','month','quarter','year','financial'];
			var arrcode = ['W','M','Q','Y','F'];
			var curind = 0;

			var tarr = [
				{'title': 'More Date...', 'value' : '' },
				{'title': 'Today', 'value' : 'TODAY' }
			];

			if(opt['istime']) {
				tarr.push({'title': 'Today and now', 'value' : 'NOW' });
			}

			tarr.push(
				{'title': 'Clear Field', 'value' : 'CLEAR' },
				{ 'group' : (curtxt='Same day on pervious')+'...', 'value' : (curcode='CDL'),
					'options' : [
						{'title': curtxt+' '+arrtxt[(curind=0)], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
					]
				},
				{ 'group' : (curtxt='Same day on next')+'...', 'value' : (curcode='CDN'),
					'options' : [
						{'title': curtxt+' '+arrtxt[(curind=0)], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
					]
				},
				{ 'group' : (curtxt='First day of current')+'...', 'value' : (curcode='FDC'),
					'options' : [
						{'title': curtxt+' '+arrtxt[(curind=0)], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] }
					]
				},
				{ 'group' : (curtxt='Last day of current')+'...', 'value' : (curcode='LDC'),
					'options' : [
						{'title': curtxt+' '+arrtxt[(curind=0)], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] }
					]
				},
				{ 'group' : (curtxt='First day of pervious')+'...', 'value' : (curcode='FDL'),
					'options' : [
						{'title': curtxt+' '+arrtxt[(curind=0)], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] }
					]
				},
				{ 'group' : (curtxt='Last day of pervious')+'...', 'value' : (curcode='LDL'),
					'options' : [
						{'title': curtxt+' '+arrtxt[(curind=0)], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] }
					]
				},
				{ 'group' : (curtxt='First day of next')+'...', 'value' : (curcode='FDN'),
					'options' : [
						{'title': curtxt+' '+arrtxt[(curind=0)], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] }
					]
				},
				{ 'group' : (curtxt='Last day of next')+'...', 'value' : (curcode='LDN'),
					'options' : [
						{'title': curtxt+' '+arrtxt[(curind=0)], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] },
						{'title': curtxt+' '+arrtxt[curind], 'value' : curcode+arrcode[(curind++)] }
					]
				}
			);

			var html = $.cpHTMLSelectBox({
				'ref': 'datepicker-more',
				'args':'onchange="$.datepicker._gotoDate(\'#' + inst.id + '\');"',
				'options' : tarr
			});

			return '<div class="ui-datepicker-selectpane ui-widget-content">'+html+'</div>';
		};

		$.datepicker._possibleChars_PARENT = $.datepicker._possibleChars;
		$.datepicker._possibleChars = function (format) {
			var chars = this._possibleChars_PARENT(format);
			chars+=' :AaPpm';
			return chars;
		};

		$.datepicker._generateHTML_TIME = function (inst, tminst) {
			var hassec = tminst['format'].match(/s/);

			var arr;

			if(typeof(inst.currentHours) == 'undefined') { inst.currentHours=''; }
			if(typeof(inst.currentMinutes) == 'undefined') { inst.currentMinutes=''; }
			if(typeof(inst.currentSeconds) == 'undefined') { inst.currentSeconds=''; }

			arr = [ {'title': 'Hr', 'value' : '' } ];
			for(var i=1; i<=12; i++) {
				var txt = i;
				if(txt < 10) { txt='0'+txt; }
				arr.push({'title': txt, 'value' : i%12 });
			}
			var html = $.cpHTMLSelectBox({'ref': 'datepicker-hr', 'args':'onchange="$.datepicker._changeTime(\'#' + inst.id + '\');"',
				'value': (typeof(inst.currentHours) == 'number'? (inst.currentHours%12) : ''),
				'options' : arr
			});

			arr = [ {'title': 'Min', 'value' : '' } ];
			for(var i=0; i<60; i++) {
				var txt = i;
				if(txt < 10) { txt='0'+txt; }
				arr.push({'title': txt, 'value' : i });
			}
			html += ' : '+$.cpHTMLSelectBox({'ref': 'datepicker-min', 'args':'onchange="$.datepicker._changeTime(\'#' + inst.id + '\');"', 'value': inst.currentMinutes,
				'options' : arr
			});

			if(hassec) {
				arr = [ {'title': 'Sec', 'value' : '' } ];
				for(var i=0; i<60; i++) {
				var txt = i;
				if(txt < 10) { txt='0'+txt; }
				arr.push({'title': txt, 'value' : i });
				}
				html += ' : '+$.cpHTMLSelectBox({'ref': 'datepicker-sec', 'args':'onchange="$.datepicker._changeTime(\'#' + inst.id + '\');"', 'value': inst.currentSeconds,
					'options' : arr
				});
			}
			html += ' '+$.cpHTMLSelectBox({'ref': 'datepicker-am', 'args':'onchange="$.datepicker._changeTime(\'#' + inst.id + '\');"',
				'value': (typeof(inst.currentHours) == 'number'? (inst.currentHours>12? 'pm' : 'am') : ''),
				'options' : [
					{'title': 'AM', 'value' : 'am' },
					{'title': 'PM', 'value' : 'pm' }
				]
			});

			return '<div class="ui-datepicker-timepane ui-widget-content">'+html+'</div>';
		};
		$.datepicker._generateHTML_PARENT = $.datepicker._generateHTML;
		$.datepicker._generateHTML = function (inst) {
			var inp = $(inst.input);
			var addtime = inp.attr('cp-datetime-picker'); if(typeof(addtime) != 'string' ) { addtime=''; }
			var istime = $.isTrue(addtime);

			var html = this._generateHTML_PARENT(inst);
			if(istime) {
				var tminst = {
					'format' : inp.attr('cp-datetime-format'),
					'separator' : inp.attr('cp-datetime-separator')
				};
				if(typeof(tminst['format']) != 'string' ) { tminst['format']=''; }
				if(typeof(tminst['separator']) != 'string' ) { tminst['separator']=''; }

				html += this._generateHTML_TIME(inst, tminst);
			}

			return html + this._generateHTML_SELECT(inst, {'istime' : istime});
		};

		$.datepicker._changeTime = function (id) {
			var target = $(id);
			var inst = this._getInst(target[0]);

			var selh = $('.ui-datepicker-timepane select[ref="datepicker-hr"]').first();
			var selm = $('.ui-datepicker-timepane select[ref="datepicker-min"]').first();
			var sels = $('.ui-datepicker-timepane select[ref="datepicker-sec"]').first();
			var sela = $('.ui-datepicker-timepane select[ref="datepicker-am"]').first();

			var hr = selh.val();

			if(!$.isEmpty(hr)) {
				hr = $.toInt(hr);
				inst.currentHours = (sela.val() == 'am'? hr : hr+12 );
				inst.currentMinutes = selm.val();
				if(sels.length > 0) {
					inst.currentSeconds = sels.val();
				} else {
					inst.currentSeconds = 0;
				}
			} else {
				inst.currentHours =
				inst.currentMinutes =
				inst.currentSeconds = '';
			}
			this._selectDateTime(id, this._formatDateTime(inst,
				inst.currentDay, inst.currentMonth, inst.currentYear, inst.currentHours, inst.currentMinutes, inst.currentSeconds));
		};

		$.datepicker._selectDay_PARENT = $.datepicker._selectDay;
		$.datepicker._selectDay = function (id, month, year, td) {
			var target = $(id);
			if ($(td).hasClass(this._unselectableClass) || this._isDisabledDatepicker(target[0])) {
				return;
			}
			var inst = this._getInst(target[0]);

			var inp = $(inst.input);
			var addtime = inp.attr('cp-datetime-picker'); if(typeof(addtime) != 'string' ) { addtime=''; }
			var istime = $.isTrue(addtime);

			if(istime) {
				inst.selectedDay = inst.currentDay = $('a', td).html();
				inst.selectedMonth = inst.currentMonth = month;
				inst.selectedYear = inst.currentYear = year;

				this._changeTime(id);


				if (!inst.inline) {
					this._hideDatepicker();
					this._lastInput = inst.input[0];
					if (typeof(inst.input[0]) != 'object')
						inst.input.focus(); // restore focus
					this._lastInput = null;
				}
			} else {
				this._selectDay_PARENT(id, month, year, td);
			}
		};

		$.datepicker._selectDateTime = function (id, dateStr) {
			var target = $(id);
			var inst = this._getInst(target[0]);
			dateStr = (dateStr != null ? dateStr : this._formatDateTime(inst));

			this._updateAlternate(inst);
			var onSelect = this._get(inst, 'onSelect');
			if (onSelect)
				onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]);	// trigger custom callback

			if (inst.input) {
				inst.input.val(dateStr);
				inst.input.trigger('change'); // fire the change event
			}
		};

		$.datepicker._formatDateTime = function (inst, day, month, year, hr, mi, sec) {
			if (!day) {
				inst.currentDay = inst.selectedDay;
				inst.currentMonth = inst.selectedMonth;
				inst.currentYear = inst.selectedYear;

				if(typeof(inst.currentHours) == 'undefined') { inst.currentHours=''; }
				if(typeof(inst.currentMinutes) == 'undefined') { inst.currentMinutes=''; }
				if(typeof(inst.currentSeconds) == 'undefined') { inst.currentSeconds=''; }

				hr = inst.currentHours;
				mi = inst.currentMinutes;
				sec = inst.currentSeconds;
			} else {
				if(typeof(hr) == 'undefined') { hr=''; }
				if(typeof(mi) == 'undefined') { mi=''; }
				if(typeof(sec) == 'undefined') { sec=''; }
			}
			hr=$.toInt(hr);
			mi=$.toInt(mi);
			sec=$.toInt(sec);


			var date = (day ? (typeof day == 'object' ? day :
				new Date(year, month, day, hr, mi, sec)) :
				new Date(inst.currentYear, inst.currentMonth, inst.currentDay, hr, mi, sec));

			var inp = $(inst.input);
			var tminst = {
				'format' : inp.attr('cp-datetime-format'),
				'separator' : inp.attr('cp-datetime-separator')
			};
			if(typeof(tminst['format']) != 'string' ) { tminst['format']=''; }
			if(typeof(tminst['separator']) != 'string' ) { tminst['separator']=''; }

			return this.formatDate(this._get(inst, 'dateFormat'), date, this._getFormatConfig(inst))+
				this.formatTime(tminst['separator']+tminst['format'], date, this._getFormatConfig(inst));
			;
		};

		/* format h, i, s, H, a, A*/
		$.datepicker.formatTime =	function (format, date, settings) {
			if (!date) return '';

			if(date.getHours() == 0 && date.getMinutes() == 0 && date.getSeconds() == 0) {return '';}

			// Check whether a format character is doubled
			var lookAhead = function(match) {
				var matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) == match);
				if (matches)
					iFormat++;
				return matches;
			};
			// Format a number, with leading zero if necessary
			var formatNumber = function(match, value, len) {
				var num = '' + value;
				if (lookAhead(match))
					while (num.length < len)
						num = '0' + num;
				return num;
			};
			// Format a name, short or long as requested
			var formatName = function(match, value, shortNames, longNames) {
				return (lookAhead(match) ? longNames[value] : shortNames[value]);
			};
			var output = '';
			var literal = false;
			if (date)
				for (var iFormat = 0; iFormat < format.length; iFormat++) {
					if (literal)
						if (format.charAt(iFormat) == "'" && !lookAhead("'"))
							literal = false;
						else
							output += format.charAt(iFormat);
					else
						switch (format.charAt(iFormat)) {
							case 'h':
								output += formatNumber('h', date.getHours()%12, 2);
								break;
							case 'H':
								output += formatNumber('H', date.getHours(), 2);
								break;
							case 'i':
								output += formatNumber('i', date.getMinutes(), 2);
								break;
							case 's':
								output += formatNumber('s', date.getSeconds(), 2);
								break;
							case 'a':
								output += formatName('a', (date.getHours()>12? 1 : 0),['a','p'], ['am','pm']);
								break;
							case 'A':
								output += formatName('A', (date.getHours()>12? 1 : 0),['A','P'], ['AM','PM']);
								break;
							case "'":
								if (lookAhead("'"))
									output += "'";
								else
									literal = true;
								break;
							default:
								output += format.charAt(iFormat);
						}
				}
			return output;
		};

		/* Parse existing date and initialise date picker. */
		$.datepicker._setDateFromField_PARENT = $.datepicker._setDateFromField;
		$.datepicker._setDateFromField = function(inst, noDefault) {
			if (inst.input.val() == inst.lastVal) {
				return;
			}

			var inp = $(inst.input);
			var addtime = inp.attr('cp-datetime-picker'); if(typeof(addtime) != 'string' ) { addtime=''; }
			var istime = $.isTrue(addtime);
			if(istime) {

				var tminst = {
					'format' : inp.attr('cp-datetime-format'),
					'separator' : inp.attr('cp-datetime-separator')
				};
				if(typeof(tminst['format']) != 'string' ) { tminst['format']=''; }
				if(typeof(tminst['separator']) != 'string' ) { tminst['separator']=''; }

				// Parse Time
				var val = inp.val();
				var arr = val.split(tminst['separator']);
				var h='',m='',s='';
				if(arr.length > 1) {
					arr[1] = arr[1].toLowerCase();
					var add12 = false;

					if(arr[1].indexOf('pm') >= 0) { add12=true; }

					var regExp = new RegExp('[^0-9]','g');

					var tm = arr[1].split(':');
					if(tm.length > 0) {
						tm[0] = tm[0].replace(regExp,'');
						h = $.toInt(tm[0]);
						if(add12) { h = h +12; }
						h = h %24;
					}
					if(tm.length > 1) {
						tm[1] = tm[1].replace(regExp,'');
						m = $.toInt(tm[1]);
					}
					if(tm.length > 2) {
						tm[2] = tm[2].replace(regExp,'');
						s = $.toInt(tm[2]);
					}
				}
				inst.currentHours = h;
				inst.currentMinutes = m;
				inst.currentSeconds = s;

				if(arr.length==0) { arr.push(''); }

				var dateFormat = this._get(inst, 'dateFormat');
				var dates = inst.lastVal = arr[0];
				var date, defaultDate;
				date = defaultDate = this._getDefaultDate(inst);
				var settings = this._getFormatConfig(inst);
				try {
					date = this.parseDate(dateFormat, dates, settings) || defaultDate;
				} catch (event) {
					this.log(event);
					dates = (noDefault ? '' : dates);
				}
				inst.selectedDay = date.getDate();
				inst.drawMonth = inst.selectedMonth = date.getMonth();
				inst.drawYear = inst.selectedYear = date.getFullYear();
				inst.currentDay = (dates ? date.getDate() : 0);
				inst.currentMonth = (dates ? date.getMonth() : 0);
				inst.currentYear = (dates ? date.getFullYear() : 0);
				this._adjustInstDate(inst);

			} else {
				this._setDateFromField_PARENT(inst, noDefault);
			}
		};

	}
}
/* END DATETIME PICKER FUNCTIONS */

