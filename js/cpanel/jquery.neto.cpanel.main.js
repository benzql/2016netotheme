/* UTIL FUNCTIONS */
var NETOCurrencySymbol = '$';
(function($) {
	$.extend({
		setCurrencySymbol :  function (symb) {
			NETOCurrencySymbol = symb;
		},

		formatNumber :  function (num, param) {
			param = $.soap_default_data(param, {'pf':'','dp':0,'sp':''});
			if(param['dp'] <= 0)
				param['dp'] = 0;
			var si = param['pf'];
			if(num <0) {
				num =0-num;
				si = '-'+si;
			}
			num = parseFloat(num).toFixed(param['dp']);
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

		formatCurrency :  function (num) {
			return $.formatNumber(num, {'pf':NETOCurrencySymbol,'dp':2,'sp':','} );
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
					rtn += ''+$.create_netosd_data_rc(data[i], vids, sp);
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
				var tmp = encodeURI(data);
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

				len = parseInt(len);
				if(!isNaN(len) && len >=0) {
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
								return String.fromCharCode(parseInt('0x'+$2));
							}
						);
						data = data.substr(len);
						return [data, txt];
					}
				}
			}
			return [data, kvdata];
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
					rtn += (data? 'true':'false');
				} else if(typeof data == 'undefined') {
					rtn += 'undefined';
				} else {
					rtn += data;
				}
			}
			return rtn;
		},

		get_ajax_data : function (data) {
			var chktxt = '^NETO^';
			var spchar = '^';

			var code = 'ERROR';
			var kvdata = {'response': data};

			var pos = data.indexOf(chktxt);

			if(pos >= 0) {
				data = data.substr(pos+chktxt.length);
				pos = data.indexOf('^');
				if(pos >= 0) {
					code = data.substr(0, pos);
					data = data.substr(pos+spchar.length);
					kvdata = $.parse_netosd_data(data);

					if(kvdata instanceof Object) {
					} else {
						kvdata = {};
					}
				}
			}

			return [code, kvdata];
		},

		do_ajax : function (module, qs, syn, tp, fns) {
			if(!(qs instanceof Object)) { qs = {}; }

			var qsctr = 1;
			var qstxt = 'module='+module;
			for(var k in qs) {
				if(qs[k] instanceof Array) {
					for(var i=0; i<qs[k].length; i++) {
						qstxt += (qsctr?'&':'')+escape(k)+'='+escape(qs[k][i]);
					}
				} else if(qs[k] instanceof Object) {
					qstxt += (qsctr?'&':'')+escape(k)+'='+escape($.create_netosd_data(qs[k]));
				} else {
					qstxt += (qsctr?'&':'')+escape(k)+'='+escape(qs[k]);
				}
				qsctr++;
			}

			var url="/_cpanel";
			if (tp=='ds') {
				url="/_spanel";
			}

			$.ajax({
				type: "POST",
				url: url,
			  data: qstxt,
			  async: syn,
				success: function(response) {
					var rdata = $.get_ajax_data(response);

					var code = rdata[0].toUpperCase();
					var rdata = rdata[1];

					if(fns[code] instanceof Object) {
						if(fns[code]['debug']) { alert(response); }
						if(typeof fns[code]['fn'] == 'function') {
							if(fns[code]['def'] instanceof Object) {
								rdata = $.soap_default_data(rdata, fns[code]['def']);
							}
							if(fns[code]['debug']) { alert($.js_var_dump(rdata)); }
							fns[code]['fn'](code, rdata);
						}
					}
				}
			});
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
											rdata[k] = rdata[k].toLowerCase();
											if(rdata[k] == 'true' || rdata[k] == 'y' || rdata[k] == 'okay' || parseInt(rdata[k]) > 0) {
												rdata[k] = true;
											} else {
												rdata[k] = false;
											}
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
												rdata[k] = parseFloat(rdata[k]);
											} else {
												rdata[k] = parseInt(rdata[k]);
											}
											if(isNaN(rdata[k])) {
												rdata[k] = def[k];
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

		preload_images : function (images) {
			/* preload images into the DOM */
			for(var i=0; i<images.length; i++) {
				if(images[i] != '') {
					$('<img/>')[0].src = images[i];
				}
			}
		},

		show_tooltip : function (obj, txt, setting, ubary) {
			var tmp = obj.attr("title");
			obj.attr("title", txt);

			var unbind = {};
			if(ubary instanceof Array) {
				for(var i=0; i<ubary.length; i++) {
					unbind[ubary[i]] = true;
				}
			}

			var oldevt = obj.data("events");
			var oevtctr = {};
			if(oldevt) {
				for(var k in oldevt) {
					if(unbind[k]) {
						oevtctr[k] = {};
						for(var i=0; i<oldevt[k].length; i++) {
							oevtctr[k][oldevt[k][i]['guid']] = true;
						}
					}
				}
			}
			var tipo = obj.tooltip( setting );
			var newevt = obj.data("events");


			for(var k in newevt) {
				if(unbind[k]) {
					if(!oevtctr[k]) {
						obj.unbind(k);
					} else if(newevt[k].length != oevtctr[k].length) {
						for(var i=0; i<newevt[k].length; i++) {
							if(!oevtctr[k][newevt[k][i]['guid']]) {
								obj.unbind(k, newevt[k][i]);
							}
						}
					}
				}
			}

			var tip = tipo.getTip();
			if(tip) {
				tip.html(txt);
				if(typeof setting['tipClass'] == 'string') {
					tip.attr("class", setting['tipClass']);
				}
			}
			obj.attr("title", tmp);
			tipo.show();
			return tipo;
		},

		show_overlay : function (obj, id, html, setting) {
			var tmp = obj.attr("rel");
			obj.attr("rel", '#'+id);
			var overobj = obj.overlay( setting );
			obj.attr("rel", tmp);
			var ovl = obj.overlay();
			if(ovl) {
				var ovlo = ovl.getOverlay();
				if(ovlo) {
					ovlo.html(html);
					ovl.load();
				}
			}
			return ovl;
		},

		bgFrame : function () {
			if(jQuery.browser.msie) {
				var ver = jQuery.browser.version;
				ver = parseInt(ver.replace(/\..+$/,''));
				return (isNaN(ver) || ver <= 6 );
			}
			return false
		},

		parse_ntemplate : function (text, data) {
			for(var k in data) {
				var tof = typeof data[k];
				var rtn = false;
				if(tof == 'string' || tof == 'boolean' || tof == 'number') {
					var regexp = new RegExp('##'+k+'##', 'gim');
					text = text.replace(regexp, data[k]);
					if(tof == 'string') {
						rtn = (data[k] != '');
					} else if(tof == 'boolean') {
						rtn = data[k];
					} else if(tof == 'number') {
						rtn = data[k] > 0;

						var regexp = new RegExp('##CURRENCY:'+k+'##', 'gim');
						text = text.replace(regexp,  $.formatCurrency( data[k] ) );
					}
				} else if(tof == 'undefined') {
					var regexp = new RegExp('##'+k+'##', 'gim');
					text = text.replace(regexp, '');
				}

				if(rtn) {
					var regexp = new RegExp('##IF:'+k+'##', 'gim');
					text = text.replace(regexp, '');
					regexp = new RegExp('##END IF:'+k+'##', 'gim');
					text = text.replace(regexp, '');
				} else {
					var regexp = new RegExp('##IF:'+k+'##.*?##END IF:'+k+'##', 'gim');
					text = text.replace(regexp, '');
				}
			}
			return text;
		},

		escape_reserved : function (text) {
			return text.replace(/[!\"#$%&\'()\*+,\.\/:;<=>?@\[\\\]^`\{|\}~\s]/g, "\\$&");
		},

		is_empty : function (text) { if(text==null) { return true; } else if(text == '') {return true}; },

		cpGetBaseUrl : function ()	{
			var url = window.location.href;
			var reg = new RegExp('^[^:]+://');
			url = url.replace(reg, '' );
			var arr = url.split('/');
			return 'https://'+arr[0]+'/_cpanel';
		},
		cpSendAjax : function (opt) {
			opt = $.extend({
				'show-loading': true,
				'data':'',
				'min-percent':0,
				'max-percent':100,
				'loading-title':'Loading...'
			},opt);

			if(opt['show-loading']) { $.cpPageLoading({'percent': Math.floor(opt['min-percent'] + (opt['max-percent'] * (50-opt['min-percent'])/100)), 'title':opt['loading-title'] }); }

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
					if(opt['show-loading']) { $.cpPageLoading({'percent': Math.floor(opt['min-percent'] + (opt['max-percent'] * (60-opt['min-percent'])/100)), 'title':opt['loading-title'] }); }
					if(typeof(opt['onSend']) == 'function' ) { opt['onSend'](jq, set); }
					if(opt['show-loading']) { $.cpPageLoading({'percent': Math.floor(opt['min-percent'] + (opt['max-percent'] * (70-opt['min-percent'])/100)), 'title':opt['loading-title'] }); }
				},
				'error' : function ( jq, sts, err) {
					var txt = sts;
					if(jq['responseText'] && typeof(jq['responseText']) == 'string') {	txt = jq['responseText']; }
					if(typeof(opt['onError']) == 'function') {
						opt['onError']( err,	txt)
					} else if(txt != 'error') {
						$.cpError(txt, {'title': err});
					}
					if(opt['show-loading']) { $.cpPageLoading({'visible':false, 'title':opt['loading-title']}); }

					if(typeof(opt['onLoaded']) == 'function') { ctn = opt['onLoaded']( ); }
				},
				'dataFilter' : function(res,typ) {
					if(opt['show-loading']) { $.cpPageLoading({'percent': Math.floor(opt['min-percent'] + (opt['max-percent'] * (80-opt['min-percent'])/100)), 'title':opt['loading-title'] }); }
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
					//res['min_percent'] = opt['max-percent'];
					if(typeof(opt['soap-output']) == 'object' ) { res = $.soap_input_opt(res,opt['soap-output']); }
					if(typeof(opt['onData']) == 'function' ) { res = opt['onData'](res); }
					if(opt['show-loading']) { $.cpPageLoading({'percent': Math.floor(opt['min-percent'] + (opt['max-percent'] * (90-opt['min-percent'])/100)), 'title':opt['loading-title'] }); }

					return res;
				},
				'success': function(res, sts) {
					if(typeof(res) == 'string' && res=='SOFTWARE_ERROR') {
						if(typeof(opt['onError']) == 'function') {
							opt['onError']( 'Server Error', res );
						}
						if(opt['show-loading']) { $.cpPageLoading({'visible':false}); }

					} else {
						var ctn = true;
						if(typeof(opt['onComplete']) == 'function') { ctn = opt['onComplete']( res ); }
						if(ctn === false ) {
							if(typeof(opt['onFail']) ==	'function') { opt['onFail']( res );	}
						} else	{
							if(typeof(opt['onSuccess']) ==	'function') { opt['onSuccess']( res );	}
						}

						if(typeof(opt['onPageLoaded']) == 'function') { ctn = opt['onPageLoaded']( ); }


						if(opt['show-loading'] ) {
							if(opt['max-percent'] >= 100) {
								$.cpPageLoading({'visible':false});
							}
						}
					}

					if(typeof(opt['onLoaded']) == 'function') { ctn = opt['onLoaded']( ); }

				}
			}, opt);
			$.ajax(opt);
		}
	});
}) (jQuery);

(function($) {
	$.extend({
		show_div_loading: function(div) {
			var binded = false;
			var evts = $(window).data('events');
			for(var k in evts) {
				if(k=='resize') {
					for(var i=0; i<evts[k].length && !binded; i++) {
						if(evts[k][i]['namespace'] == 'loadingdiv') {
							binded = true;
						}
					}
				}
			}

			if(!binded) {
				$(window).bind('resize.loadingdiv', function () {
					$('.ajaxloader').each(function () {
						var div = $(this).attr('ref');
						var a = $('#'+div); var b = a.offset();
						var d = { left: b.left, top: b.top, width: a.outerWidth(), height: a.outerHeight()};
						if(a.css('display') == 'none' || $(this).css('display') == 'none') {
							$(this).hide();
						} else {
							$(this).show();
							$(this).css({left: d.left+'px', top: d.top+'px', width: d.width+'px', height: d.height+'px'});
						}
					});
				});
			}

			var a = $('#'+div);
			var b = a.offset();
			var d = { left: b.left, top: b.top, width: a.outerWidth(), height: a.outerHeight()};

			var loader = $('.ajaxloader[ref="'+div+'"]');
			if(loader.length <= 0) {
				$('<div class="ajaxloader" ref="'+div+'" style="display:none;"></div>').css({'position': 'absolute', 'z-index': 1000000}).appendTo(document.body);
			}
			loader = $('.ajaxloader[ref="'+div+'"]');
			if(a.css('display') == 'none') {
				loader.hide();
			} else {
				loader.css({left: d.left+'px', top: d.top+'px', width: d.width+'px', height: d.height+'px'});
				loader.fadeIn(300);
			}
		},

		remove_div_loading: function(div) {
			if(typeof(div) == 'undefined') { div=''; }
			$('.ajaxloader').each(
				function () {
					if(div=='' || $(this).attr('ref') == div) {
						$(this).fadeOut(300).css({left: '0px', top: '0px', width: '1px', height: '1px'}).hide();
					}
				}
			);
		}
	});
}) (jQuery);

/* END UTIL FUNCTIONS */

/* COMMON FUNCTIONS */

function isEmpty (inputStr) {
	if ( null == inputStr || "" == inputStr ) {
  	return true;
  }
  return false;
}

/* END COMMON */
