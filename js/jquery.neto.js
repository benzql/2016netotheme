/* UTIL FUNCTIONS */
var NETOCurrencySymbol = '$';
(function($) {
	$.extend({		
		setCurrencySymbol :  function (symb) {
			NETOCurrencySymbol = symb;
		},
		formatNumber :  function (num, param) {
			param = $.soap_default_data(param, {'pf':'','dp':0,'sp':''});
			if(param['dp'] <= 0) {
				param['dp'] = 0;
			}
			
			var si = param['pf'];
			if(num <0) {
				num =0-num;
				si = '-'+si;
			}
			
			num = num+'';
			var tmp = num.split('.');
			
			var dec = '';
			if(tmp.length > 1) {
				dec = ''+tmp[1];
				if(dec.length > param['dp']) {
					dec = ''+Math.round(tmp[1]/ Math.pow(10, dec.length-param['dp']) );
				}
			}
			for(var i=dec.length; i<param['dp']; i++) {
				dec += '0';
			}
			if(dec != '') { dec='.'+dec; }
			
			var int = ''+tmp[0];
			var txt=''; var ctr = 0;
			for(var i=int.length-1; i>=0; i--) {
				ctr++;
				txt = (ctr % 3 ==0 && i>0? ',':'')+int.charAt(i)+''+txt;
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
			if(data instanceof Object) {
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
			} else if(data instanceof Array) {
				rtn = '@';
				var ctr = data.length;
				for(var i=0; i<ctr; i++) {
					rtn += ''+$.create_netosd_data_rc(data[ctr], vids, sp);
				}				
			} else {
				rtn = '$';
				var tmp = escape(data);
				rtn += data.length + sp + tmp;
			}
			
			return rtn;
		},
	
		parse_netosd_data : function (data, sp) {
			if(!sp) { sp = '|'; }
			var txt = data.substr(0,5);
			data = data.substr(5);
			if(txt == 'NSD1;') {
				var tmp = $.parse_netosd_data_rc(data, [], sp)
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
								var tmp = $.parse_netosd_data_rc(data, vds, sp)
								data = tmp[0];
								kvdata.push(tmp[1]);
							}
						} else {
							for(var i=0; i<len; i++) {
								var tmpk = $.parse_netosd_data_rc(data, vds, sp)
								data = tmpk[0];
								var tmp = $.parse_netosd_data_rc(data, vds, sp)
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
			
			var code = 'ERROR'
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
		
		do_ajax : function (module, qs, syn, fns) {
			
			if(!(qs instanceof Object)) { qs = {}; }
			
			var qsctr = 0;
			var qstxt = '';
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
			
			$.ajax({
				type: "POST",
				url: "/ajax/"+module,
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
											if(rof == 'true' || rof == 'y' || rof == 'okay' || rof == '1') {
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
			return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
		},
		
		is_empty : function (text) { if(text==null) { return true; } else if(text == '') {return true}; }

		
	});
}) (jQuery);

/* END UTIL FUNCTIONS */

/* WISHLIST FUNCTIONS */

(function($) {
	$.extend({ 
		addToWishList: function(param) {
			var defvals = {
				'class': 'wishlist_toggle',
				'imageon': '[$imageurl$]/stars/star_on.gif',
				'imageoff': '[$imageurl$]/stars/star_off.gif',
				'textclass': 'wishlist_text',
				'htmlon': 'Remove From Wishlist',
				'htmloff': 'Add To Wishlist',
				'tooltip_css': 'whltooltips',
				'fade' : true,
				
				'overlay_class' : 'overlay',
				'overlay' : {
					'api':true,
					'mask': {'color': '#EBECFF', 'loadSpeed': 200, 'opacity':  0.8 },
					'closeOnClick': false
				},
				'tooltip' : {
					'success' : { 
						'effect': 'slide', 'api': true, 
						'delay': 2000, 
						'events': { 'tooltip': 'mouseenter, mouseleave' },
						'tipClass': 'tooltips_msg'
					},
					'fail' : { 
						'effect': 'slide', 'api': true, 
						'delay': 2000, 
						'events': { 'tooltip': 'mouseenter, mouseleave' },
						'tipClass': 'tooltips_error'
					}
				},
				'chooser' : {
					'header' : '<h2>Add/Remove <b>##brand##</b> ##model## From Favourites Lists</h2>'+
						'<table border="0" cellpadding="4" cellspacing="0">',
					'body' : '<tr><td>##button##</td><td>##name##</td></tr>',
					'footer' : '</table>'+
						'<center><a href="javascript:void(0);" onclick="$(\'#wishlisttoggle\').toggle(\'fast\', function(){});">Or Add To A New List</a></center>'+
						'<div id="wishlisttoggle" style="display:none;">'+
							'<table border="0" cellpadding="4" cellspacing="0"><tr>'+
								'<td>New List Name : <input type="text" maxlength="50" size="20" id="##overlay_id##.##input_id##"/></td>'+
							'</tr></table>'+
						'</div>'+
						'<hr><center><button id="##overlay_id##.##button_id##" class="close">Done</button></center>'
				},
				
				'overlay_id' : 'whloverlay',
				'button_id' : 'whlbutton',
				'input_id' : 'whlinput',
				'selector_id' : 'whlselector',
				
				'msg' : {
					'ITEM_ADDED': 'Added to Favourites List \'##name##\'.',
					'ITEM_REMOVED': 'Removed from Favourites List \'##name##\'.',
					'INVALID_SKU': 'Invalid item.',
					'REQUIRE_LOGIN': 'Login required'
				},
				
				'debug': false,
				'showparam': false
			};
			param = $.soap_default_data(param ,defvals);
			
			if(param['showparam']) {
				alert($.js_var_dump(param));
			}
			
			var fn = 'wishlist';
			
			var whlobj = $('.' + param['class']);
			
			$.preload_images([param['imageon'], param['imageoff']]);
			
			var curobj;
			var textobj;
						
			$('body').append('<div id="'+param['overlay_id']+'" class="'+param['overlay_class']+'"/>');
			$('body').append('<div id="'+param['overlay_id']+'tig" style="display:none;"/>');
			
			var overlaytig = $('#'+param['overlay_id']+'tig');
			
			/** Local Call Function **/
			var failFn = function (code, data) {
				if( param['msg'][data['msg']] ) {
					var msg = $.parse_ntemplate(param['msg'][data['msg']], data);
					$.fancybox(msg, {showCloseButton: false});
					setTimeout("$.fancybox.close()", 2000); 
				}
			}

			var listFn = function (code, data) {
				var tmpl = param['chooser'];
				
				var txcols = ['button_id', 'input_id', 'overlay_id'];
				for(var i=0; i<txcols.length; i++) {
					data[txcols[i]] = param[txcols[i]];
				}		
				
				var html = $.parse_ntemplate(tmpl['header'], data);
				for(var ctr=0; ctr<data['items'].length; ctr++) {
					var idata = data['items'][ctr];
					idata['button'] = '<img id="'+param['overlay_id']+'.'+param['selector_id']+ctr+'" '+
						'src="'+(idata['active']=='y'? param['imageon']: param['imageoff'])+'" '+
						'rel="'+idata['id']+'"/>';
					html += $.parse_ntemplate(tmpl['body'], idata);
				}
				html += $.parse_ntemplate(tmpl['footer'], data);
				$.fancybox(html);
							
				var objs = $('img[id^="'+param['overlay_id']+'.'+param['selector_id']+'"]');				
				objs.die("click");
				objs.live("click", function(){
					var imgobj = $(this);	
					var csrc = imgobj.attr("src");
					var cwid = imgobj.attr("rel");
					var sku = data['sku'];
					if (csrc == param['imageon']) {
						$.do_ajax( fn,
						{ 'proc':'RemoveItem', 'sku':data['sku'], 'wishlist':cwid }, 
						true,
						{
							'SUCCESS': {
								'def' : { 'count': 0 },
								'fn' : function (code, data) {
									imgobj.attr("src", param['imageoff']);
								}
							},
							'ERROR' : { 
								'def' : { 'response': '' },
								'fn' : function (code, data) {  if(param['debug']){ alert(data['response']); } }
							}
						} );
			
					} else {
						$.do_ajax( 
						fn,
						{ 'proc':'AddItem', 'sku':data['sku'], 'wishlist':cwid }, 
						true,
						{
							'SUCCESS': {
								'def' : { 'count': 0 },
								'fn' : function (code, data) {
									imgobj.attr("src", param['imageon']);
								}
							},
							'ERROR' : { 
								'def' : { 'response': '' },
								'fn' : function (code, data) {  if(param['debug']){ alert(data['response']); } }
							}
						});	
					}
				});
				
				var btnLdFn = function (textobj) {
					var storesku = data['sku'];  
					$.do_ajax( fn,
					{ 'proc':'GetSKUCount', 'sku':data['sku'] }, 
					true,
					{
						'SUCCESS': {
							'def' : { 'count': 0 },
							'fn' : function (code, data) {
								if(data['count']>0) {
									textobj.replaceWith('<span rel="'+param['textclass']+storesku+'">'+param['htmlon']+'</span>');
								} else {
									textobj.replaceWith('<span rel="'+param['textclass']+storesku+'">'+param['htmloff']+'</span>');
								}
							}
						},
						'ERROR' : { 
							'def' : { 'response': '' },
							'fn' : function (code, data) {  if(param['debug']){ alert(data['response']); } }
						}
					});
				};
								
				var btn = $('#'+param['overlay_id']+'\\.'+param['button_id']);
				btn.unbind('click');
				btn.bind('click', function(e) {
					var wname = $('#'+param['overlay_id']+'\\.'+param['input_id']).val();
					/* alert($.is_empty(wname)+' '+wname); */
					if (!$.is_empty(wname)) {
						$.do_ajax( fn,
						{ 'proc':'AddItem',
							'sku':data['sku'],
							'name':wname,
							'wishlist': -1
						}, 
						true,
						{
							'SUCCESS': {
								'def' : { },
								'fn' : function (code, data) { btnLdFn(textobj); }
							},
							'ERROR' : { 
								'def' : { 'response': '' },
								'fn' : function (code, data) {  if(param['debug']){ alert(data['response']); } }
							}
						});
					} else {
						btnLdFn(textobj);
					}
					
					$.fancybox.close();

				});
		
			};
			/** End Local Call Function **/
			
			whlobj.live("click", function(){
				
				curobj = $(this);
				var sku = curobj.attr("rel");
				textobj =  $('[rel="'+param['textclass']+sku+'"]');
				var chktest = textobj.html();
				var imgobj = this;
				
				if (chktest == param['htmlon']) {
					$.do_ajax(
						fn,
						{'proc':'RemoveItem','sku':sku},
						true,
						{
							'SUCCESS': {
								'def' : { 'name': '', 'msg':'' },
								'fn' : function (code, data) {
									if( param['msg'][data['msg']] ) {
										var msg = $.parse_ntemplate(param['msg'][data['msg']], data);
										$.fancybox(msg, {showCloseButton: false});
										setTimeout("$.fancybox.close()", 2000);
									}
									textobj.replaceWith('<span rel="'+param['textclass']+sku+'">'+param['htmloff']+'</span>');
								} 
							},
							'FAIL': {
								'def' : { 'msg': '' },
								'fn' : failFn
							},
							'LIST': {
								'def' : { 'brand':'', 'sku':'', 'model':'', 'items': [] },
								'fn' : listFn
							},
							'ERROR' : { 
								'def' : { 'response': '' },
								'fn' : function (code, data) {  if(param['debug']){ alert(data['response']); } }
							}
						}
					);
				} else {
					$.do_ajax(
						fn,
						{'proc':'AddItem','sku':sku},
						true,
						{
							'SUCCESS': {
								'def' : { 'name': '', 'msg':'' },
								'fn' : function (code, data) {
									if( param['msg'][data['msg']] ) {
										var msg = $.parse_ntemplate(param['msg'][data['msg']], data);
										$.fancybox(msg, {showCloseButton: false});
										setTimeout("$.fancybox.close()", 2000);
									}
									textobj.replaceWith('<span rel="'+param['textclass']+sku+'">'+param['htmlon']+'</span>');
								}
							},
							'FAIL': {
								'def' : { 'msg': '' },
								'fn' : failFn
							},
							'LIST': {
								'def' : { 'brand':'', 'sku':'', 'model':'', 'items': [] },
								'fn' : listFn
							},
							'ERROR' : { 
								'def' : { 'response': '' },
								'fn' : function (code, data) {  if(param['debug']){ alert(data['response']); } }
							}
						}
					);
				}
			});
		}	
	});
}) (jQuery);
/* END WISHLIST FUNCTIONS */

/* AJAX ADD TO CART */

var NAddToCartData = new Object();

(function($) {
	$.extend({

		addToCartInit : function (param) {
			var defvals = {
				'target_id': 'a2c_display',
				'image_rel': 'itmimg',
				'attributes': 'productextra',
				
				'notifications' : {
					'duration' : 4000,
					'sticky' : false,
					'show_close' : false,
					'show_overlay' : false,
					'centre_on_scroll' : true,
					'hide_on_click' : true
				},
				
				'animate_id': 'a2c_animate',
				'animate_class': 'animate',
				'animate' : {
					'zindex': 10000,
					'resize_duration': 250,
					'opacity_duration': 100
				},
				
				'summary_rels' : {
					'item_count' : 'a2c_item_count',
					'product_total' : 'a2c_sub_total',
					'shipping_total' : 'a2c_ship_total'
				},
		
		
				'cart' : {
					'header': '<div class="thumb_cart"><ul>',
					'body': '<li><div class="left"><a href="##producturl##" ><img src="##image##" alt="##name##" width="50px" height="50px"></a></div>'+
						'<div class="right"><a href="javascript:$.removeCartItem(\'##sku##\');" class="float_right"><img src="/assets/icons/cross.png" alt="Remove From Cart"></a><div class="title"><a href="##producturl##"><b>##qty##</b> x ##name## <i>##extra##</i></a></div>'+
						'<div class="price">Price: $##price##</div></div></li>',
					'footer': '</ul> <br> Total Item(s): <b>##item_count##</b><br />Sub Total: <b>##CURRENCY:product_total##</b><br/> ##IF:product_discount##Discount: <b>##CURRENCY:product_discount##</b><br/>##END IF:product_discount## <button style="margin-top:5px;" type="button" onclick="window.location=\'##checkouturl##\';" title="View Shopping Cart">View Cart</button> <button style="margin-top:5px; margin-left:5px;" type="button" onclick="window.location=\'##checkouturl##&fn=payment\';" title="View Shopping Cart">Checkout Now</button>',
					'empty': '<font class="small">Your shopping cart is empty. Add items to your cart and they will appear here.</font>',
					'successremmessage': '<center>##name## has been removed from your shopping cart.</center>',
					'successaddmessage': '<div class="successaddmessage_image"><img src="##thumb##" alt="##model##" width="60px" height="60px" border="0"/></div><div class="successaddmessage_body">##qty## x ##model## added to cart .. </div>',
					'failmessage': '<center>FAILURE: An error has occurred while processing your cart. Please retry or contact us.</center>'
				},

				'debug': false,
				'showparam': false	
			};
			param = $.soap_default_data(param ,defvals);
			
			if(param['showparam']) {
				alert($.js_var_dump(param));
			}
			
			NAddToCartData['param'] = param;

			var fn = 'addtocart';
			$.do_ajax(
				fn,
				{'proc':'ShowItem'},
				false,
				{
					'SUCCESS': {
						'def' : { 'ind': 0, 'sku': '', 'brand': '', 'name': '', 'price': 0, 'qty': 0, 
							'image': '', 'extra':'', 
							'total': { 'product_total': 0, 'product_discount': 0,  'product_subtotal': 0,
								'shipping_total': 0, 'shipping_discount': 0, 'shipping_cost': 0,
								'grand_total': 0, 'discount_total': 0, 'shipping_method': '',
								'item_count':0 },
							'msg':'' },
						'fn' : function (code, data) {
							$.buildCartItem(data);
						}
					},
					'FAIL': {
						'def' : { 'msg': '' },
						'fn' : function (code, data) {
							if( param['msg'][data['msg']] ) {
								var msg = $.parse_ntemplate(param['msg'][data['msg']], data);
								//$.show_tooltip(curobj, msg, param['tooltip']['fail'], ['mouseenter','mouseover']);
							}
						}
					},
					'ERROR' : { 
						'def' : { 'response': '' },
						'fn' : function (code, data) {  if(param['debug']){ alert(data['response']); } }
					}
				});

		},
		
		getAddToCartParam : function () {
			return NAddToCartData;
		},
		
		addChildCartItem : function (skuo, qtyo) {
			var tmpsku = '';
			var tmpqty = '';
			var qty = '';
			var sku ='';
			var skuclass = skuo.replace(/^sku/,'');			

			var nobj = $.getAddToCartParam();
			
			if(nobj != null) {
				var param = nobj['param'];
		
				var fn = 'addtocart';
				
				var pl = $('#'+param['target_id']);
				var imgobj = $('[rel="'+param['image_rel']+skuclass+'"]');
				var imgsrc = imgobj.attr('src');						
				
				$('body').append('<div id="'+imgobj.attr('rel')+'_shadow" style="display: none; background-image: url(\''+imgsrc+'\'); background-color: #fff; border: solid 1px darkgray; position: static; top: 0px; z-index: 100000;">&nbsp;</div>'); 
 				var aniobj = $('#'+imgobj.attr('rel')+'_shadow');
				  
	 			aniobj.width(imgobj.css('width')).height(imgobj.css('height')).css('top', imgobj.offset().top).css('left', imgobj.offset().left).css('opacity', 0.8).show();
  			aniobj.css('position', 'absolute');
			
			var anparam = {
				'width':1,
				'height':1,
				'top': 0,
				'left': imgobj.offset().left
			};
			
			if(pl.length !== 0) {
				anparam['width'] = pl.innerWidth();
				anparam['height'] = pl.innerHeight();
				anparam['top'] = pl.offset().top;
				anparam['left'] = pl.offset().left;
			} else {
				var tobj = $('[rel="'+param['summary_rels']['item_count']+'"]');
				if(tobj.length !== 0) {
					anparam['top'] = tobj.offset().top;
					anparam['left'] = tobj.offset().left;
				}
			}
			
			if(anparam['width'] <= 0) { anparam['width']=1; }
			if(anparam['height'] <= 0) { anparam['height']=1; }
						      	      
 	     	aniobj.animate
 	     	( 
  				anparam, 
    			{ duration: param['animate']['resize_duration'] }
    		).animate
    		( 
    			{ opacity: 0 }, 
    			param['animate']['opacity_duration'],
      		function() {
						$('input:hidden[class^='+skuclass+']').each(function(){ 
							tmpsku = $(this).attr('id');
							tmpqty = tmpsku.replace(/^sku/,'qty');			
		
							if ($('#'+tmpqty).val() > 0) {
								sku = $('#'+tmpsku).val();
								qty = $('#'+tmpqty).val();
				
								$.do_ajax(
									fn,
									{'proc':'AddItem','sku':sku,'qty':qty},
									false,
									{
									'SUCCESS': {
										'def' : { 'ind': 0, 'sku': '', 'brand': '', 'name': '', 'price': 0, 'qty': 0, 
										'image': '', 'extra':'', 
										'total': { 'product_total': 0, 'product_discount': 0,  'product_subtotal': 0,
											'shipping_total': 0, 'shipping_discount': 0, 'shipping_cost': 0,
											'grand_total': 0, 'discount_total': 0, 'shipping_method': '',
											'item_count':0 },
										'msg':'' },
										'fn' : function (code, data) {
											if(data['image']=='') {
												data['image'] = imgsrc;
											}
											$.buildCartItem(data);
										}
									},
									'FAIL': {
										'def' : { 'msg': '' },
										'fn' : function (code, data) {
											if( param['msg'][data['msg']] ) {
												var msg = $.parse_ntemplate(param['msg'][data['msg']], data);
												//$.show_tooltip(curobj, msg, param['tooltip']['fail'], ['mouseenter','mouseover']);
											}
										}
									},
									'ERROR' : { 
										'def' : { 'response': '' },
										'fn' : function (code, data) {  if(param['debug']){ alert(data['response']); } }
									}
								});
							}
						});
					}
				);
			}
		},
		
		addCartItem : function (skuo, qtyo) {
			var sku = '';
			var qty = '';
			var msgdata = new Array();
			
			skuo = $.escape_reserved(skuo);
			qtyo = $.escape_reserved(qtyo);
			
			var tmpskuo = $("#"+skuo);
			var tmpqtyo = $("#"+qtyo);
			var tmpmodel = $("#"+skuo.replace("sku","model"));
			var tmpthumb = $("#"+skuo.replace("sku","thumb"));	
			
			if(tmpskuo instanceof Object) { sku=tmpskuo.val(); msgdata['sku'] = sku; } else { sku=skuo; }
			if(tmpqtyo instanceof Object) { qty=tmpqtyo.val(); msgdata['qty'] = qty;} else { qty=qtyo; }
			if(tmpmodel instanceof Object) { msgdata['model'] = tmpmodel.val(); } 
			if(tmpthumb instanceof Object) { msgdata['thumb'] = tmpthumb.val(); } 
			
			if(typeof qty != 'number') {
				qty = parseInt(qty);
				if(isNaN(qty)) {qty=1;}
			}
			
			var nobj = $.getAddToCartParam();
			
			if(nobj != null && qty > 0 && sku != '') {
				var param = nobj['param'];
														
				var fn = 'addtocart';
				
				var pl = $('#'+param['target_id']);
				var imgobj = $('[rel="'+param['image_rel']+sku+'"]');
				var imgsrc = imgobj.attr('src');					
				
				$('body').append('<div id="'+imgobj.attr('rel')+'_shadow" style="display: none; background-image: url(\''+imgsrc+'\'); background-color: #fff; border: solid 1px darkgray; position: static; top: 0px; z-index: 100000;">&nbsp;</div>'); 
    		var attr_rel = $.escape_reserved(imgobj.attr('rel'));
    		var aniobj = $('#'+attr_rel+'_shadow');
				  
				aniobj.width(imgobj.css('width')).height(imgobj.css('height')).css('top', imgobj.offset().top).css('left', imgobj.offset().left).css('opacity', 0.5).show();
      	aniobj.css('position', 'absolute');
				      	      
				// get any extra attributes, create a list
				var attributes = {};
				$('[id^="'+param['attributes']+'"]').each(function(index) {
					var ind = $(this).attr("id");
					var rel = $(this).attr("rel");
					ind = parseInt(ind.substr(param['attributes'].length));
					if(!isNaN(ind) && rel==sku) {
						attributes[ind] = $(this).val();
					}
				});
			
				var anparam = {
					'width':1,
					'height':1,
					'top': 0,
					'left': imgobj.offset().left
				};
				if(pl.length !== 0) {
					anparam['width'] = pl.innerWidth();
					anparam['height'] = pl.innerHeight();
					anparam['top'] = pl.offset().top;
					anparam['left'] = pl.offset().left;
				} else {
					var tobj = $('[rel="'+param['summary_rels']['item_count']+'"]');
					if(tobj.length !== 0) {
						anparam['top'] = tobj.offset().top;
						anparam['left'] = tobj.offset().left;
					}
				}
				
				if(anparam['width'] <= 0) { anparam['width']=1; }
				if(anparam['height'] <= 0) { anparam['height']=1; }

				aniobj.animate
 	     	( 
  				anparam, 
      		{ duration: param['animate']['resize_duration'] } 
      	).animate( 
      		{ opacity: 0 }, 
				param['animate']['opacity_duration'],
				function() {
					
					var notification = $.parse_ntemplate(param['cart']['successaddmessage'], msgdata);
					
					$.fancybox(notification, {showCloseButton: param['notifications']['show_close'], overlayShow: param['notifications']['show_overlay'], centerOnScroll: param['notifications']['centre_on_scroll']});
					if (!param['notifications']['sticky']) {
						setTimeout("$.fancybox.close()", param['notifications']['duration']);	
					}
								
					$.do_ajax(
						fn,
						{'proc':'AddItem','sku':sku,'qty':qty, 'attr':attributes},
						true, 
						{
							'SUCCESS': {
								'def' : { 'ind': 0, 'sku': '', 'brand': '', 'name': '', 'price': 0, 'qty': 0, 
									'image': '', 'extra':'', 
									'total': { 'product_total': 0, 'product_discount': 0,  'product_subtotal': 0,
										'shipping_total': 0, 'shipping_discount': 0, 'shipping_cost': 0,
										'grand_total': 0, 'discount_total': 0, 'shipping_method': '',
										'item_count':0 },
									'msg':'' },
								'fn' : function (code, data) {
									if(data['image']=='') {
										data['image'] = imgsrc;
									}
									
									$.buildCartItem(data);
				
									if (!isEmpty(data['discountmessage'])) {
										$.fancybox(data['discountmessage']);
									} 
    						}
							},
							'FAIL': {
								'def' : { 'msg': '' },
								'fn' : function (code, data) {
									if( param['msg'][data['msg']] ) {
										var msg = $.parse_ntemplate(param['msg'][data['msg']], data);
										//$.show_tooltip(curobj, msg, param['tooltip']['fail'], ['mouseenter','mouseover']);
									}
								}
							},
							'ERROR' : { 
								'def' : { 'response': '' },
								'fn' : function (code, data) {  if(param['debug']){ alert(data['response']); } }
							}
						});
				});			
			}
		},
		
		removeCartItem: function(ind) {

			var nobj = $.getAddToCartParam();
			
			if(nobj != null ) {
				var param = nobj['param'];
				var fn = 'addtocart';
				$.do_ajax(
					fn,
					{'proc':'RemoveItem','sku':ind},
					true,
					{
						'SUCCESS': {
							'def' : { 'ind': 0, 'sku': '', 'brand': '', 'name': '', 'price': 0, 'qty': 0, 
								'image': '', 'extra':'', 
								'total': { 'product_total': 0, 'product_discount': 0,  'product_subtotal': 0,
									'shipping_total': 0, 'shipping_discount': 0, 'shipping_cost': 0,
									'grand_total': 0, 'discount_total': 0, 'shipping_method': '',
									'item_count':0 },
								'msg':'' },
							'fn' : function (code, data) {
									$.buildCartItem(data);
									var notification = $.parse_ntemplate(param['cart']['successremmessage'], data['lastitem']);
									$.fancybox(notification, {showCloseButton: param['notifications']['show_close'], overlayShow: param['notifications']['show_overlay']});
									if (!param['notifications']['sticky']) {
										setTimeout("$.fancybox.close()", param['notifications']['duration']); 
									}
							}
						},
						'FAIL': {
							'def' : { 'msg': '' },
							'fn' : function (code, data) {
								if( param['msg'][data['msg']] ) {
									var msg = $.parse_ntemplate(param['msg'][data['msg']], data);
									//$.show_tooltip(curobj, msg, param['tooltip']['fail'], ['mouseenter','mouseover']);
								}
							}
						},
						'ERROR' : { 
							'def' : { 'response': '' },
							'fn' : function (code, data) {  if(param['debug']){ alert(data['response']); } }
						}
					});
			}
		},

  	buildCartItem : function (data) {
    	var nobj = $.getAddToCartParam();
			
		if(nobj != null ) {
			var param = nobj['param'];
			var pl = $('#'+param['cart_id']);

        var html = '';
        if(data['total']['item_count'] > 0) {
  	      html = $.parse_ntemplate(param['cart']['header'], data['total']);
          for(var ctr=0; ctr<data['cartitems'].length; ctr++) {
    	      var idata = data['cartitems'][ctr];
            html += $.parse_ntemplate(param['cart']['body'], idata);
          }
          html += $.parse_ntemplate(param['cart']['footer'], data['total']);
        } else {
          html = $.parse_ntemplate(param['cart']['empty'], data['total']);
        }
        pl.empty();
        pl.html(html);
	
	      for(var k in param['summary_rels']) {
  	      if(param['summary_rels'][k] != '') {
    	      var val = param['summary_rels'][k];
      	    var objs = $('[rel="'+param['summary_rels'][k]+'"]');
            if(objs) {
        	    objs.text(data['total'][k]);
            }
          }
        }
      }
    }
	});
})(jQuery);

/* END AJAX ADD TO CART */

/* BACK IN STOCK NOTIFICATION */
 (function($) {
	$.extend({
		addNotifyBackInStock: function(sku, captchachecksum) {
			var defvals = {
				'email_address': 'from_name',
				'full_name': 'from',
				'captcha_text': 'captcha_text',
				'captcha_checksum': 'captcha_checksum',
				'popup_timeout': 1500,
				'msg' : {
					'CAPTCHA_FAIL': 'Incorrect Validation',
					'ITEM_NOT_FOUND': 'Item Not Found',
					'NOTIFICATION_ADDED': 'Notification Added'
				},
				
				'debug': false,
				'showparam': false
			};
					
			/* get form vars */
			var from_name = $('#'+defvals['email_address']).val();
			var from = $('#'+defvals['full_name']).val();
			var captchatext = $('#'+defvals['captcha_text']).val();
			var fn = 'notifyme';
			
			$.fancybox.showActivity();
			
			$.do_ajax(
				fn,
				{'proc':'Add', 'sku':sku, 'captcha_text':captchatext, 'captcha_checksum': captchachecksum, 'from_name':from_name, 'from':from},
				true,
				{
					'SUCCESS': {
						'def' : { 'ind': 0, 'sku': '', 'url': '', 'brand': '', 'name': '', 'price': 0, 'qty': 0, 
							'image': '', 'extra':'', 
							'total': { 'product_total': '', 'shipping_total': '', 'item_count':0 },
							'msg':'' },
						'fn' : function (code, data) {
							if( defvals['msg'][data['msg']] ) {
								$.fancybox(defvals['msg'][data['msg']]);
								setTimeout("$.fancybox.close()", defvals['popup_timeout']);
								
							}
						}
					},
					'FAIL': {
						'def' : { 'msg': '' },
						'fn' : function (code, data) {
							if( defvals['msg'][data['msg']] ) {
								$.fancybox(defvals['msg'][data['msg']]);
								setTimeout("$.fancybox.close()", defvals['popup_timeout']);
							}
						}
					},
					'ERROR' : { 
						'def' : { 'response': '' },
						'fn' : function (code, data) {  if(param['debug']){ alert(data['response']); } }
					}
			});
		}
	});
})(jQuery);		
/* END BACK IN STOCK NOTIFICATION */

/* MULTIADDRESS CHECKOUT */

(function($) {
	$.extend({
		shipping_radio_button: function() {
			$("input[name$='multi_checkout']").change(function(){
    		if ($("input[name$='multi_checkout']:checked").val() == 'addressbook') {
      	  if( $('#shipping_address_bill').is(":visible") ) {
	      	  $('#shipping_address_bill').hide('slow', function(){});
  				}
  				if( $('#shipping_address_multi').is(":visible") ) {
	      	  $('#shipping_address_multi').hide('slow', function(){});
  				}
      	  $('#shipping_address_book').show('slow', function(){});
      	}
    		else if ($("input[name$='multi_checkout']:checked").val() == 'multiple') {
    			if( $('#shipping_address_bill').is(":visible") ) {
	      	  $('#shipping_address_bill').hide('slow', function(){});
  				}
    			if( $('#shipping_address_book').is(":visible") ) {
	      	  $('#shipping_address_book').hide('slow', function(){});
  				}
    			$('#shipping_address_multi').show('slow', function(){});    			
      	}  
      	else {
      		if( $('#shipping_address_book').is(":visible") ) {
      			$('#shipping_address_book').hide('slow', function(){});
      		}
      		if( $('#shipping_address_multi').is(":visible") ) {
      			$('#shipping_address_multi').hide('slow', function(){});
      		}
      		$('#shipping_address_bill').show('slow', function(){});
      	}
    	});
		}
	});
})(jQuery);

(function($) {
	$.extend({
		shipping_addressbook: function() {
			var overlayid = $(".shipping_address_overlay").overlay({
				api:true,
				mask: {
					color: '#ebecff',
					loadSpeed: 200,
					opacity: 0.8
				},
				closeOnClick: false
			});
			var buttons = $("#address form").submit(function(e) {
				e.preventDefault(); /* stop the form submitting */
				var firstname = $('#ship2_first_name').val();
				var lastname = $('#ship2_last_name').val();
				var company = $('#ship2_company').val();
				var street1 = $('#ship2_street1').val();
				var street2 = $('#ship2_street2').val();
				var zip = $('#ship2_zip').val();
				var city = $('#ship2_city').val();
				var state = $('#ship2_state').val();
				var country = $('#ship2_country').val();
				var phone = $('#ship2_phone').val();
				
				$.ajax({
					type: "POST",
					url: "/cgi-bin/index.cgi",
					data: "tkn=ajax&fn=addressbook&proc=add&ship_first_name="+firstname+"&ship_last_name="+lastname+"&ship_company="+company+"&ship_street1="+street1+"&ship_street2="+street2+"&ship_zip="+zip+"&ship_state="+state+"&ship_country="+country+"&ship_city="+city+"&ship_phone="+phone,
					success: function(msg) {	
						if (/^success/.test(msg)) {
  						/* add this id to all select statements */
							msg = msg.replace(/^success\:\:/, '');
							$('select[id^="ship_address_sel"]').append("<option value=\""+msg+"\">"+firstname+" "+lastname+" ("+zip+")</option>");
						}
					}
				});
			});	
			
			$('select[id^="ship_address_sel"]').change(function() {
				
				var addid = $(this).val();
				if (addid == 'n') {
					$(".shipping_address_overlay").data("overlay").load();
				}
				else if (addid == '') {					
				}
				else {
					$.ajax({
						type: "POST",
						url: "/cgi-bin/index.cgi",
						data: "tkn=ajax&fn=addressbook&proc=query&addid="+addid,
						success: function(msg) {
							if (/^fail/.test(msg)) {
								msg = msg.replace(/^fail\:\:/, '');
								alert("failure");
  						}
  						else if (/^success/.test(msg)) {
  							msg = msg.replace(/^success\:\:/, '');
  							/*blank all the old data*/
  							$('#ship_first_name').val('');
								$('#ship_last_name').val('');
								$('#ship_company').val('');
								$('#ship_street1').val('');
								$('#ship_street2').val('');
								$('#ship_zip').val('');
								$('#ship_city').val('');
								$('#ship_state').val('');
								$('#ship_country').val('');
								$('#ship_phone').val('');
  							
  							var address_array = msg.split('::');
								var a = new Array;
								for (var i in address_array) {
									a =  address_array[i].split(':');
  								if (a[0] && a[1]) {
  									var objid = $('#' + a[0]);
  									objid.val('');
  									if ($("input[name$='multi_checkout']:checked").val() == 'addressbook') {
  										objid.val(a[1]);	
  									}
  								}
  							}
  							updloca('ship');
  						}
  					}
					});
				}
			});
		}
	});
})(jQuery);

/* END MULTIADDRESS CHECKOUT */



/* ADDRESS BOOK */

(function($) {
	$.extend({
		
		add_addressbook_entry: function() {
					
			var fn = 'addressbook';
			var errors = '';
			
			var addrid = $('#addr_id').val();
			var shiptitle = $('#ship_title').val();
			var firstname = $('#ship_first_name').val();
			var lastname = $('#ship_last_name').val();
			var company = $('#ship_company').val();
			var street1 = $('#ship_street1').val();
			var street2 = $('#ship_street2').val();
			var zip = $('#ship_zip').val();
			var city = $('#ship_city').val();
			var state = $('#ship_state').val();
			var country = $('#ship_country').val();
			var phone = $('#ship_phone').val();
						
			if (isEmpty(shiptitle)) { errors += 'Title is required<br />' }; 
			if (isEmpty(firstname)) { errors += 'First Name is required<br />' }; 
			if (isEmpty(lastname)) { errors += 'Last Name is required<br />' };			
			if (isEmpty(street1) && isEmpty(street2)) { errors += 'Street Address is required<br />' };
			if (isEmpty(zip)) { errors += 'Post Code is required<br />' };
			if (isEmpty(city)) { errors += 'City is required<br />' };
			if (isEmpty(state)) { errors += 'State is required<br />' };
			if (isEmpty(country)) { errors += 'Country is required<br />' };
			if (isEmpty(phone)) { errors += 'Phone number is required<br />' };			
			
			if (!isEmpty(errors)) {
				errors = "<center><b>ERRORS DETECTED</b></center><br /><br />" + errors;
				$.fancybox(errors);
				setTimeout("$.fancybox.close()", 5000);
			}	
			else {					
				$.do_ajax(
					fn,
					{'proc':'Add','ship_first_name':firstname,'ship_last_name':lastname, 
												'ship_company':company, 'ship_street1':street1, 'ship_street2': street2,
												'ship_zip':zip, 'ship_state':state, 'ship_country':country, 'ship_city':city,
												'ship_phone':phone, 'addid':addrid, 'ship_title':shiptitle},
					true, 
					{
						'SUCCESS': {
							'def' : { },
							'fn' : function (code, data) {
								if (data['addentry'] == 'y') {
									$('select[id^="addr_id"]').append("<option value=\""+data['addressbook_id']+"\">"+shiptitle+" ("+zip+")</option>");							
									$.fancybox("Address added successfully");
									setTimeout("$.fancybox.close()", 2000);
								}
							}
						},
						'FAIL': {
							'def' : { 'msg': '' },
							'fn' : function (code, data) {
								if( param['msg'][data['msg']] ) {
									var msg = $.parse_ntemplate(param['msg'][data['msg']], data);
								}
							}
						},
						'ERROR' : { 
							'def' : { 'response': '' },
							'fn' : function (code, data) {  if(param['debug']){ alert(data['response']); } }
						}
					});
			}
		},
		
		del_addressbook_entry: function() {
					
			var fn = 'addressbook';
			
			var addrid = $('#addr_id').val();
						
			$.do_ajax(
				fn,
				{'proc':'delete','addid':addrid},
				true, 
				{
					'SUCCESS': {
						'def' : { },
						'fn' : function (code, data) {							
								$('select[id^="addr_id"] :selected').remove(); 
								$('#ship_title').val('');
								$('#ship_first_name').val('');
								$('#ship_last_name').val('');
								$('#ship_company').val('');
								$('#ship_street1').val('');
								$('#ship_street2').val('');
								$('#ship_zip').val('');
								$('#ship_city').val('');
								$('#ship_state').val('');
								$('#ship_country').val('');
								$('#ship_phone').val('');
								$('#addr_id').val('');
								$('#suburb_diship').css("display", "none");
								$('#suburb_mgship').css("display", "inline");	
								$('#suburb_mgship').html('<i>Please enter your city and state below.<\/i>');
								$('#delete_button').attr("disabled", true);	
								$.fancybox("Address removed successfully");
								setTimeout("$.fancybox.close()", 2000);
						}
					},
					'FAIL': {
						'def' : { 'msg': '' },
						'fn' : function (code, data) {
							if( param['msg'][data['msg']] ) {
								var msg = $.parse_ntemplate(param['msg'][data['msg']], data);
							}
						}
					},
					'ERROR' : { 
						'def' : { 'response': '' },
						'fn' : function (code, data) {  if(param['debug']){ alert(data['response']); } }
					}
				});
		},
				
		addressbook_select: function() {
			
			var fn = 'addressbook';
			
			$('select[id^="addr_id"]').change(function() {
				var addid = $(this).val();
				
				if (addid == 'n') {
					$('#ship_title').val('');
					$('#ship_first_name').val('');
					$('#ship_last_name').val('');
					$('#ship_company').val('');
					$('#ship_street1').val('');
					$('#ship_street2').val('');
					$('#ship_zip').val('');
					$('#ship_city').val('');
					$('#ship_state').val('');
					$('#ship_country').val('');
					$('#ship_phone').val('');
					$('#addr_id').val('');
					$('#suburb_diship').css("display", "none");
					$('#suburb_mgship').css("display", "inline");	
					$('#suburb_mgship').html('<i>Please enter your city and state below.<\/i>');	
					$('#delete_button').attr("disabled", true);	
				}
				else {
					$.do_ajax(
					fn,
					{'proc':'Query','addid':addid},
					true, 
					{
						'SUCCESS': {
							'def' : { },
							'fn' : function (code, data) {
								$('#ship_first_name').val('');
								$('#ship_first_name').val(data['ship_first_name']);
								$('#ship_last_name').val('');
								$('#ship_last_name').val(data['ship_last_name']);
								$('#ship_company').val('');
								$('#ship_company').val(data['ship_company']);
								$('#ship_street1').val('');
								$('#ship_street1').val(data['ship_street1']);
								$('#ship_street2').val('');
								$('#ship_street2').val(data['ship_street2']);
								$('#ship_zip').val('');
								$('#ship_zip').val(data['ship_zip']);
								$('#ship_city').val('');
								$('#ship_city').val(data['ship_city']);
								$('#ship_state').val('');
								$('#ship_state').val(data['ship_state']);
								$('#ship_country').val('');
								$('#ship_country').val(data['ship_country']);
								$('#ship_phone').val('');
								$('#ship_phone').val(data['ship_phone']);
								$('#ship_title').val('');
								$('#ship_title').val(data['ship_title']);
								$('#addr_id').val(data['id']);
								$('#delete_button').attr("disabled", false);
  							 							
  							updloca('ship');
							}
						},
						'FAIL': {
							'def' : { 'msg': '' },
							'fn' : function (code, data) {
								if( param['msg'][data['msg']] ) {
									var msg = $.parse_ntemplate(param['msg'][data['msg']], data);
								}
							}
						},
						'ERROR' : { 
							'def' : { 'response': '' },
							'fn' : function (code, data) {  if(param['debug']){ alert(data['response']); } }
						}
					});
				}
			});
		}
	});
})(jQuery);
/* END ADDRESS BOOK */

/* COMMON FUNCTIONS */

function isEmpty (inputStr) {
	if ( null == inputStr || "" == inputStr ) {
  	return true;
  }
  return false;
}

/* END COMMON */
