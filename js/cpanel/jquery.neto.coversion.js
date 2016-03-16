/*

QUICK AND DIRTY TO GET DATETIMEPICKER WORKING IN OLD UI

We probably need to move all the util functions used by cpanel/mpanel/spanel/suppliers into this file and call it.

At the moment I have just copied the required functions into this file, not modified other js files.

*/

$.extend({
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
					return true;
				}
				return (parseInt(t) > 0);
			} else if(typeof(t) == 'boolean') {
				return t;
			} else if(typeof(t) == 'number') {
				return t > 0;
			}
			return false;
		},

		cpHTMLSelectBox : function (opt, data) {
			opt = $.soap_input_opt(opt, {
				'name': '',
				'id': '',
				'class': '',
				'style': '',
				'args': '',
				'add_selected' : false,
				'options' : []
			});

			$.cpHTMLParam(opt);

			var sel = {};
			var has_selected = false;
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

			var html = '';
			var curgp = '';
			for(var i=0; i<opt['options'].length; i++) {
				if (typeof opt['options'][i] == 'string') { opt['options'][i] = { title: opt['options'][i], value: opt['options'][i]}; }
				var d = $.soap_input_opt(opt['options'][i], { 'title': '', 'value':'', 'args':'', 'ref':'', 'group':'', 'options' : [] } );
				if(!$.isEmpty(d['group'])) {
					if(d['options'].length > 0) {
						html += '<optgroup label="'+$.cpNoHTML(d['group'])+'">';
						for(var j=0; j<d['options'].length; j++) {
							var g = $.soap_input_opt(d['options'][j], { 'title': '', 'value':'', 'args':'', 'ref':'' } );
							var seled = '';
							if(sel[g['value']] === true) {
								seled = 'selected';
								has_selected = true;
							}
							html += '<option value="'+$.cpNoHTML(g['value'])+'"'+$.cpHTMLParam({'args':g['args'] ,'ref':g['ref']})+' '+seled+'>'+$.cpNoHTML(g['title'])+'</option>';
						}

						html += '</optgroup>';
					}
				} else {
					var seled = '';
					if(sel[d['value']] === true) {
						seled = 'selected';
						has_selected = true;
					}
					html += '<option value="'+$.cpNoHTML(d['value'])+'"'+$.cpHTMLParam({'args':d['args'] ,'ref':d['ref']})+' '+seled+'>'+$.cpNoHTML(d['title'])+'</option>';
				}
			}
			if (opt.add_selected && !has_selected) {
				html = '<option value="'+$.cpNoHTML(opt['value'])+'" selected>'+$.cpNoHTML(opt['value'])+'</option>' + html;
			}
			html = '<select'+$.cpHTMLParam(opt)+'>'+html+'</select>';
			return html;
		},

		soap_input_opt : function(rdata, def , vds) {
			if(!rdata && !(rdata instanceof Object)) { rdata = {};}
			return $.soap_default_data(rdata, def , vds);
		},

		cpHTMLParam : function (opt, data) {
			opt = $.soap_input_opt(opt, {
				'name': '',
				'id': '',
				'class': '',
				'style': '',
				'ref': '',
				'type': '',
				'args': ''
			});

			var args = [];
			var arr = ['id','name','class','style','ref','type','args'];
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

		cpNoHTML : function (txt) {
			if(typeof(txt) != 'string') { txt=''; }
			return txt.replace('<','&lt;').replace('>','&gt;').replace('"','&quot;');
		},

		isEmpty : function (text) {
			if(typeof(text) == 'string') {
				return text.length == 0;
			}
			return true;
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

		cpCheckActivity : function (sess_active, warning_time) {
			warning_time = warning_time || 120; // Default warning time is two minutes
			// create cookie - using local computer clock instead of server time
			$.cpSetActivity(sess_active);
			var dialogVisible = null; var dialogTimeouted = false;
			// here, check the cookie every second
			var chkActTimer = setInterval(function() {
				var param = $.parse_netosd_data($.cookie("ninfo_lastactivity"));
				if(param instanceof Object) {
					var sp = $('.cp-check-remaining');
					var ts = Math.floor($.now()/1000);
					var exp_time = parseInt(param['t']) + parseInt(param['e']);
					var remain_time = exp_time - ts;
					if (remain_time <= 0 && dialogVisible && sp.length) {
						// Display "you are logged out" instead of just logging out
						if(!dialogTimeouted) {
							dialogTimeouted = true;
							$('.cp-check-countdown').hide();
							$('.cp-check-logout').show();
						}
					} else if (remain_time < warning_time) {
						// Display warning
						if (remain_time <= 0) { remain_time = 0; } // Prevent negative remaining time display!
						if(dialogVisible && sp.length) {
							// Update warning
							sp.text(remain_time);
							if(dialogTimeouted) {
								dialogTimeouted = false;
								$('.cp-check-countdown').show();
								$('.cp-check-logout').hide();
							}
						} else {
							// Create warning popup
							dialogTimeouted = remain_time<=0;
							dialogVisible = $.cpDialog({
								'title': 'Your session has been idle',
								'width': '300px',
								'btn-cancel': 'Logout Now',
								'btn-okay': 'I am still here',
								'content': '<span class="cp-check-countdown"'+(dialogTimeouted?' style="display:none;"':'')+'>Press the button to extend your session or you will be logged out in <span class="cp-check-remaining">'+remain_time+'</span> seconds.</span>'+
									'<span class="cp-check-logout"'+(dialogTimeouted?'':' style="display:none;"')+'>You have been logged out!</span>',
								'onCancel' : function (o, data) {
									dialogVisible = null;
									document.location.href = '/_cpanel?item=logout';
								},
								'onOkay': function (o, data) {
									dialogVisible = null;
									if(dialogTimeouted) {
										var w = window.open('/_cpanel?item=logout&fn=popup_login');
										if (!w) {
											document.location.href = '/_cpanel?item=logout&fn=could_not_open_popup';
										}
									} else {
										var opt = $.soap_input_opt(opt, {
											'action': 'get',
											'session': true,
											'database': {},
											'key' : ''
										});
										$.cpSendAjax({
											'show-loading': false,
											'ajaxfn' : 'session_ajax',
											'soap-input': opt,
											'soap-output': { 'ok':false, sess_active:600 },
											'onSuccess': function(res, sts) {
												if (res.ok) {
													sess_active = res.sess_active;
													$.cpSetActivity(sess_active);
													if (dialogVisible) {
														$.cpCloseDialog(dialogVisible, null);
														dialogVisible = null;
													}
												} else {
													$.cpSetActivity(0);
													// If there is an error trying to refresh the session then we have been truly logged out
													var w = window.open('/_cpanel?item=logout&fn=popup_login');
													if (!w) {
														// trying again should bring up the dialog again, where the click event will allow window.open to work
														alert('Could not open popup window to refresh login. Press OK to try again.');
													}
												}
											},
											'onError' : function() {
												$.cpSetActivity(0);
												// If there is an error trying to refresh the session then we have been truly logged out
												document.location.href = '/_cpanel?item=logout&fn=timeout';
											}
										});
									}
								}
							});
						}
					} else if (dialogVisible) {
						// This means session was extended/refreshed in another tab, so we just close the dialog
						$.cpCloseDialog(dialogVisible, null);
						dialogVisible = null;
					}
				} else {
					$.cpSetActivity(sess_active);
				}
			}, 1000);
		},

		cpSetActivity : function(sess_active) {
			$.cookie('ninfo_lastactivity', $.create_netosd_data({t:Math.floor($.now()/1000),e:sess_active}), {path:'/',secure:1});
		},

		cpDialog : function (opt) {
			opt = $.soap_input_opt(opt, {
				'title': '',
				'content': '',
				'width':'',
				'btn-okay': 'Okay',
				'btn-okay-class': 'btn-success',
				'btn-cancel': 'Cancel',
				'btn-cancel-class': '',
				'btn-cancel-icon' : 'icon-remove-sign',
				'btn-close':'Close',
				'other-buttons': [] /* onClick title class icon */
				/* onReady, onActive, onOkay, onCancel, onClose */
			});

			if ( $('div.ninput').length === 0 ) {
				$(window).resize(function() {
					$('div.ninput:visible').move_center();
				});
				$(window).scroll(function() {
					$('div.ninput:visible').move_center();
				});
			}

			var o = $('div.ninput[ninput-status="inactive"]:first').attr({'ninput-status': 'ready' });
			if ( o.length === 0 ) {
				var inpid = $('div.ninput').length+'-'+$.randID();
				o = $('<div class="ninput">'
				+(opt['btn-close']?'<a class="btn-ninput-close"></a>':'')
				+'<div class="ninput-header"></div>'
				+'<div class="ninput-msg"></div>'
				+'<div class="ninput-body"></div>'
				+'<div class="ninput-clear"></div>'
				+'</div>').hide().css({'position': 'absolute'}).attr({'ninput-id': inpid, 'ninput-status': 'ready' }).appendTo(document.body);
			}

			$('div.ninput').attr('cp-scroll-y-offset', window.scrollY);

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
			o.find('.btn-ninput-okay').addClass(opt['btn-okay-class']);
			o.find('.btn-ninput-cancel span:first').html(opt['btn-cancel']);
			o.find('.btn-ninput-cancel').addClass(opt['btn-cancel-class']);

			var selall = o.find('.ninput-body input[type="checkbox"][cp-set-value-selectall]');
			if(selall.length > 0) {
				selall.off('click');
				selall.on('click', function () {
					$.setChecked(o.find('.ninput-body input[type="checkbox"]'), $.isChecked($(this)));
				});
			}

			o.find('.btn-ninput-okay').off('click');
			o.find('.btn-ninput-okay').on('click', function () {
				var okay = true;
				var pr = $(this).parent('.ninput');

				var rtndata = {};
				pr.find('.ninput-body input[type="text"]').each(function() { rtndata[$(this).attr('ref')]=$(this).val(); });
				pr.find('.ninput-body input[type="number"]').each(function() { rtndata[$(this).attr('ref')]=$(this).val(); });
				pr.find('.ninput-body input[type="hidden"]').each(function() { rtndata[$(this).attr('ref')]=$(this).val(); });
				pr.find('.ninput-body input[type="checkbox"]').each(function() { rtndata[$(this).attr('ref')]=( $.isChecked($(this)) ? $(this).val() : null); });
				pr.find('.ninput-body input[type="radio"]:checked').each(function() { rtndata[$(this).attr('ref')]=$(this).val(); });
				pr.find('.ninput-body select').each(function() { rtndata[$(this).attr('ref')]=$(this).val(); });

				var errmsg = '';
				if(typeof(opt['onOkay']) == 'string' && typeof(window[opt['onOkay']]) == 'function') {
					opt['onOkay'] = window[opt['onOkay']];
				}

				if(typeof(opt['onOkay']) == 'function') {
					okay = opt['onOkay'](pr, rtndata);
					if(okay instanceof Object) {
						if(okay['error'] instanceof Array) {
							for(var i=0; i<okay['error'].length; i++) {
								errmsg += '<div class="alert alert-error">'+okay['error'][i]+'</div>';
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
				var pr = $(this).parent('.ninput');
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
			o.move_center().attr({'ninput-status': 'active' }).show().overlay({'visible': true});

			return o;
		},

		cpCloseDialog : function (o, ok) {
			o = o || $('.ninput');
			if (ok === null) {
				o.hide().attr({'ninput-status': 'inactive' }).overlay({'visible': false});
			} else if(ok) {
				o.find('.btn-ninput-okay').click();
			} else {
				o.find('.btn-ninput-close').click();
			}
		},

		randID : function () {
			return Math.floor(Math.random()*1000000);
		}
});

$.fn.extend({
	timepicker : function(opt) {

		if(typeof(opt['format']) != 'string') { opt['format'] = 'HH:ii:ss'; }
		if(typeof(opt['separator']) != 'string') { opt['separator']=' '; }

		return this.each(function() {
			var o = $(this);
			$(this).attr('cp-datetime-picker', 'yes');
			$(this).attr('cp-datetime-format', opt['format']);
			$(this).attr('cp-datetime-separator', opt['separator']);
		});
	},

	overlay: function(opt) {
		opt = $.extend({'visible':true}, opt);

		var z = 100000;

		if ( $('div.noverlay').length === 0 ) {
			$('<div class="noverlay"></div>').hide().css({'z-index': (z-1), left: '0px', top: '0px', opacity: .5, position: 'absolute', backgroundColor: '#000'}).appendTo(document.body);
			$(window).resize(function() {
				var ov = $('div.noverlay:visible');
				ov.css({ width: $(document).width()+'px', height: $(document).height()+'px'});
			});
		}

		var o = $('div.noverlay');
		o.css({width: $(document).width()+'px', height: $(document).height()+'px'});
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

	get_center_pos : function() {
		return {
			'top': Math.round(($(window).height()-$(this).height())/2+$(window).scrollTop()),
			'left': Math.round(($(window).width()-$(this).width())/2)
		};
	},

	move_center : function() {
		var pos = $(this).get_center_pos();

		var scrollYOffset = $(this).attr('cp-scroll-y-offset');
		if (!scrollYOffset) { scrollYOffset = 0; }

		if($(this).height() > $(window).height() - 20) { pos['top'] = 20 + parseInt(scrollYOffset); }
		if($(this).width() > $(window).width() - 20) { pos['left'] = 20; }

		pos['top'] += 'px';
		pos['left'] += 'px';

		$(this).css(pos);
		return this;
	}
});

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
						sela.val((inst.currentHours % 24) >= 12 ? 'pm':'am');
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
				'value': (typeof(inst.currentHours) == 'number'? ((inst.currentHours % 24)>=12? 'pm' : 'am') : ''),
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
				inst.currentHours = (sela.val() == 'pm' && hr < 12? hr+12 : hr );
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
				onSelect.apply((inst.input ? inst.input[0] : null), [dateStr, inst]); // trigger custom callback

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
		$.datepicker.formatTime = function (format, date, settings) {
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
								output += formatNumber('h', (date.getHours() == 12 ? date.getHours() : date.getHours()%12), 2);
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
								output += formatName('a', ( (date.getHours() %24) >=12? 1 : 0),['a','p'], ['am','pm']);
								break;
							case 'A':
								output += formatName('A', ( (date.getHours() %24) >12? 1 : 0),['A','P'], ['AM','PM']);
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
						if(add12 && h <12) { h += 12; }
						h %= 24;
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
					console.error('datepicker._setDateFromField parseDate error', event);
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

// BELOW ARE NEW DEVELOPMENT FUNCTIONS!

/* DATE PICKER AND DATETIME PICKER INCLUDING RELATIVE TIME FUNCTIONS */

$(function(){
	$('.datetime2picker').addClass('date2picker');
	$('.date2picker').focus(function(){
		$(this).showPicker2();
	});
});

$.extend({
	datepicker2 : function() {}
});

$.datepicker2.absoluteSelected = function(dateText, dp) {
	var container = $(dp.dpDiv).closest('.cp-datepicker2-container');
	container.find('.cp-datepicker2-input').val(dateText);
	$('.cp-datepicker2-popup').remove();
}
$.datepicker2.showhideClicked = function() {
	$a = $(this);
	var container = $a.closest('.cp-datepicker2-container');
	container.find('.'+$a.attr('s')).show();
	container.find('.'+$a.attr('h')).hide();
	return false;
}

$.datepicker2.dismissClicked = function() {
	$('.cp-datepicker2-popup').remove();
	return false;
}
$.datepicker2.clearClicked = function() {
	var container = $(this).closest('.cp-datepicker2-container');
	container.find('.cp-datepicker2-input').val('');
	$('.cp-datepicker2-popup').remove();
	return false;
}
$.datepicker2.relativeChanged = function() {
	var container = $(this).closest('.cp-datepicker2-container');
	var num = parseInt(container.find('.time-value').val());
	var unit = container.find('.time-unit').val();
	if (container.find('.time-direction').val() == 'ago') {
		num *= -1;
	}
	var d = new Date();
	switch (unit) {
		case 'hours': d.setHours(d.getHours() + num); break;
		case 'days': d.setDate(d.getDate() + num); break;
		case 'weeks': d.setDate(d.getDate() + num*7); break;
		case 'months': d.setMonth(d.getMonth() + num); break;
		case 'years': d.setFullYear(d.getFullYear() + num); break;
	}
	container.find('.p1').datepicker( "setDate", d );
}
$.datepicker2.relativeOkClicked = function() {
	var container = $(this).closest('.cp-datepicker2-container');
	var inp = container.find('.cp-datepicker2-input');
	var num = container.find('.time-value').val();
	var unit = container.find('.time-unit').val();
	var dir = container.find('.time-direction').val();
	if (num=='1') { unit = unit.replace(/s$/, '') }
	inp.val(num + ' ' + unit + ' ' + dir);
	$('.cp-datepicker2-popup').remove();
	return false;
}

$.fn.extend({
	showPicker2 : function() {
		var inp = $(this);
		var hasTime = inp.hasClass('datetime2picker');
		inp.addClass('cp-datepicker2-input');
		var container = inp.closest('.cp-datepicker2-container');
		if (container.length==0) {
			inp.wrap('<div class="cp-datepicker2-container"></div>');
			container = inp.closest('.cp-datepicker2-container');
		}

		$('.cp-datepicker2-popup').remove();
		var relative_html = '<input size="4" class="time-value v" type="number">'+
			' '+
			'<select class="time-unit v">'+
				(hasTime?'<option>hours</option>':'')+
				'<option selected>days</option>'+
				'<option>weeks</option>'+
				'<option>months</option>'+
				'<option>years</option>'+
			'</select>'+
			' '+
			'<select class="time-direction v">'+
				'<option>ago</option>'+
				'<option>time</option>'+
			'</select>'+
			'<br>'+
			'<button class="btn time-submit"><i class="icon-black icon-ok"></i> OK</button>';
		var datepicker_ui = $('<div class="cp-datepicker2-popup">'+
			'<div class="c c1 p1"><ul class="tabs"><li class="active"><a href="#">Specific Date</a></li><li><a href="#" class="cp-datepicker2-showhide" s="r1" h="p1">Relative Date</a></li></ul></div>'+
			'<div class="c c1 r1"><ul class="tabs"><li><a href="#" class="cp-datepicker2-showhide" s="p1" h="r1">Specific Date</a></li><li class="active"><a href="#">Relative Date</a></li></ul><br>'+relative_html+'</div>'+
			'<button class="btn cp-datepicker2-dismiss">Cancel</button>'+
			'<button class="btn cp-datepicker2-clear">Clear</button>'+
			'</div>');
		var dpOpts = {
			dateFormat: 'dd/mm/yy',
			defaultDate: inp.val(),
			onSelect: $.datepicker2.absoluteSelected
		};
		datepicker_ui.find('.p1').datepicker(dpOpts);
		if (hasTime) {
			datepicker_ui.find('.p1').timepicker({'format': 'hh:iiaa' });
		}
		var m;
		container.append(datepicker_ui);
		if (inp.val() == '' || (m = inp.val().match(/^(\d\d?)[-\/](\d\d?)[-\/](\d{4})/))) {
			datepicker_ui.find('.r1').hide();
			var d = new Date();
			if (m) { d = new Date(m[3], m[2]-1, m[1]); }
			var ddiff = getDaysBetweenDates(new Date(), d);
			datepicker_ui.find('.r1 .time-value').val(Math.abs(ddiff));
			datepicker_ui.find('.r1 .time-direction').val(ddiff>0?'time':'ago');
		} else {
			if (m = inp.val().match(/(\d+) (hour|day|week|month|year)s? (ago|time)/)) {
				datepicker_ui.find('.r1 .time-value').val(m[1]);
				datepicker_ui.find('.r1 .time-unit').val(m[2]+'s');
				datepicker_ui.find('.r1 .time-direction').val(m[3]);
				datepicker_ui.find('.r1 .v').each($.datepicker2.relativeChanged);
			} else {
				datepicker_ui.find('.r1 .time-value').val('1');
			}
			datepicker_ui.find('.p1').hide();
		}
		datepicker_ui.find('.r1 .v').change($.datepicker2.relativeChanged);
		datepicker_ui.find('.cp-datepicker2-showhide').click($.datepicker2.showhideClicked);
		datepicker_ui.find('.cp-datepicker2-dismiss').click($.datepicker2.dismissClicked);
		datepicker_ui.find('.cp-datepicker2-clear').click($.datepicker2.clearClicked);
		datepicker_ui.find('.time-submit').click($.datepicker2.relativeOkClicked);
		return container;
	}
});

function getDaysBetweenDates(d0, d1) {
	var msPerDay = 8.64e7;
	var x0 = new Date(d0);
	var x1 = new Date(d1);
	x0.setHours(12,0,0);
	x1.setHours(12,0,0);
	return Math.round( (x1 - x0) / msPerDay );
}


/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2006, 2014 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// CommonJS
		factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (arguments.length > 1 && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));
