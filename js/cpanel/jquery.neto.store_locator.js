/* WISHLIST FUNCTIONS */

var nStoreLocatorData = new Object();

(function($) {
	$.extend({ 
		storeLocator_Init: function(param) {
			var defvals = {
				'zip_id': 'geo_zip',
				'country_id': 'geo_country',
				'radius_id': 'geo_radius',
				'limit_id': 'geo_limit',
				
				'button_id': 'geo_search',
				'nearby_id': 'geo_nearby',
				'selector_id': 'geo_location_selector',

				'addr_input': 'geo_addr',
				'category_input': 'geo_category',
				'list_id': 'geo_list',
				
				'map_id': 'geo_map',

				'zoom_country': 4,
				'zoom_suburb': 12,
				'zoom_preset': 12,

				'default_lat': -27.000,
				'default_lng': 133.000,
				'default_country' : '',
				
				'default_radius' : 5,
				'default_limit' : 10,
				
				'item_class' : 'geo_loc_item',
				'list_class' : 'geo_loc_list',
				'info_class' : 'geo_loc_info',
				'highlight_class' : 'geo_highlight',
				
				'marker' : {
					'icon' : '',
					'cursor' : ''
				},
				
				'msg' : {
					'noresult' : 'Sorry. No results found.'
				},
								
				'page' : {
					'result' : '<div class="resultmsg">##count## result(s) found</div>', 
					'header': '<div class="##list_class##">##msg##<br clear="all"><ul>',
					'body': '<li class="##item_class##" ref="##count##">##IF:thumb##<div class="thumb"><img width="40px" src="##thumb##" border="0"></div>##END IF:thumb##'+
						'<a href="javascript:##script##">##name##</a><br>'+
						'<span class="address">##street##, ##city##, ##state## ##zip##</span><br>'+
						'<span class="distance">(##distance##km from your location)</span><br>'+
						'##IF:phone##<span class="contact"><b>PH:</b> ##phone##</span>##END IF:phone##'+
						'##IF:fax##<span class="contact"><b>Fax:</b> ##fax##</span>##END IF:fax##'+
						'##IF:email##<span class="contact"><b>Email:</b> ##email##</span>##END IF:email##'+
						'</li>',
					'footer': '</ul></div>',
					
					'info': '<div class="##info_class##">##IF:thumb##<div class="thumb"><img src="##thumb##" border="0"></div>##END IF:thumb##'+
						'<a href="##url##">##name##</a><br>'+
						'<span class="address">##street##, ##city##, ##state## ##zip##</span><br>'+
						'<span class="distance">(##distance##km from your location)</span><br>'+
						'##IF:phone##<span class="contact"><b>PH:</b> ##phone##</span>##END IF:phone##'+
						'##IF:fax##<span class="contact"><b>Fax:</b> ##fax##</span>##END IF:fax##'+
						'##IF:email##<span class="contact"><b>Email:</b> ##email##</span>##END IF:email##</div>'
				},
								
				'debug': false,
				'showparam': false
			};
			param = $.soap_default_data(param ,defvals);
			
			if(param['showparam']) {
				alert($.js_var_dump(param));
			}
			if(typeof(param['onSetLocation']) != 'function') {
				param['onSetLocation'] = null;
			}
			
			nStoreLocatorData['param'] = param;
			
			nStoreLocatorData['map'] = null;
			nStoreLocatorData['info'] = null;
			nStoreLocatorData['markers'] = [];
			
			nStoreLocatorData['param']['default_country'] = $('#'+param['country_id']).val();
			
			try {
				nStoreLocatorData['map'] = new google.maps.Map(document.getElementById(param['map_id']), {
					zoom: param['zoom_country'],
					center: new google.maps.LatLng(param['default_lat'], param['default_lng']),
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU}
				});
				
				nStoreLocatorData['info'] = new google.maps.InfoWindow();

				var addrinp = [];
				$('[name="'+param['addr_input']+'"]').each(function () {
					var val = $(this).val();
					if(val != '') {
						addrinp.push(val);
					}
				});
				
				$.geoSearchStores(
					$('#'+param['country_id']).val(), 
					$('#'+param['zip_id']).val(),
					addrinp
				);
				
				var btno = $('#'+param['button_id']);
				btno.die('click');
				btno.live('click', function () {
					var bparam = $.getStoreLocatorCache('param');

					var baddrinp = [];
					$('[name="'+bparam['addr_input']+'"]').each(function () {
						var val = $(this).val();
						if(val != '') {
							baddrinp.push(val);
						}
					});

					$.geoSearchStores(
						$('#'+bparam['country_id']).val(), 
						$('#'+bparam['zip_id']).val(), 
						baddrinp
					);
				});
				
				$('#'+param['nearby_id']).live('click', function () {
					$.geoStartSearch();
				});
				
				
			} catch (e) {
				if(param['debug']) {
					alert('Error: Cannot Load Store Locator.');
				}
			}				
		},

		geoGoToLocation: function(country, address) {
			var param = $.getStoreLocatorCache('param');
			
			var opts = { 'region':country };
			var hasaddr = false;
			var hascty = (country == param['default_country']);
			
			if(!address) { address=''; }
			if(address != '') { opts['address'] = address; hasaddr = true; }
			
			try {
				var coder = new google.maps.Geocoder();
				coder.geocode(opts, function (res, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						$.geoSetLocation(res, {'hasaddr':hasaddr, 'country':country, 'search':false});
					} else if(hasaddr) {
						$.geoGoToLocation(country);
					} else if(!hascty) {
						$.geoGoToLocation(param['default_country']);
					}
				});
			} catch (e) {
				if(param['debug']) {
					alert('Error: Cannot Load Store Locator.');
				}
			}				
		},

		geoSearchStores: function(country, zip, address) {
			var param = $.getStoreLocatorCache('param');
			var opts = { 'region':country, 'address':'' };
			
			if(!address) { address=[];}
			if(!zip) { zip='';}
			
			var hasaddr = false;
			var haszip = false;
			var hascty = (country == param['default_country']);
			
			
			for(var i=0; i<address.length; i++) {
			if(address[i] != '') { opts['address'] += address[i]+', '; hasaddr=true; }
			}
			if(zip != '') { opts['address'] += zip; haszip=true; }
			try {
				var coder = new google.maps.Geocoder();
				coder.geocode(opts, function (res, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						$.geoSetLocation(res, {'hasaddr': (hasaddr || haszip), 'country':country, 'search':true});
					} else if(hasaddr) {
						$.geoSearchStores(country, zip);
					} else if(haszip) {
						$.geoSearchStores(country);
					} else if(!hascty) {
						$.geoSearchStores(param['default_country']);
					}
				});
			} catch (e) {
				if(param['debug']) {
					alert('Error: Cannot Load Store Locator.');
				}
			}				
		},

		geoCleartMarkers : function () {
			var param = $.getStoreLocatorCache('param');
			var markers = $.getStoreLocatorCache('markers');
			
			while(markers.length > 0) {
				var mko = markers.pop();
				mko.setMap(null);
			}
			
			var pl = $('#'+param['selector_id']+'_pl');
			if(pl.length) { pl.html(''); pl.hide(); }
		},

		geoSetLocation : function (res, opts) {
			var param = $.getStoreLocatorCache('param');
			var map = $.getStoreLocatorCache('map');
			
			if(res.length > 0) {
				
				var found = -1;
				for(var i=0; found<0 && i<res.length; i++) {
					var acom = res[i].address_components;
					for(var j=0; found<0 && j<acom.length; j++) {
						for(var k=0; found<0 && k<acom[j].types.length; k++) {
							if(acom[j].types[k] == 'country') {
								if(acom[j].short_name.toUpperCase() == opts['country']) {
									found=i;
								}
							}
						}
					}
				}
				
				if(found >= 0) {
					$.geoCleartMarkers();
					
					map.setCenter(res[found].geometry.location);
					if(opts['hasaddr']) { map.setZoom(param['zoom_suburb']); }
					else { map.setZoom(param['zoom_country']); }
					
					if(opts['search']) {
						$.geoStartSearch();
					}
					
					if(typeof(param['onSetLocation']) == 'function') {
						param['onSetLocation'](res[found]);
					}
				}
			}
		},
				
		geoStartSearch : function () {
			var param = $.getStoreLocatorCache('param');
			var map = $.getStoreLocatorCache('map');
			
			var rad = $('#'+param['radius_id']).val();
			rad = parseFloat(rad);
			if(isNaN(rad)) { rad=param['default_radius']; }

			var limit = $('#'+param['limit_id']).val();
			limit = parseInt(limit);
			if(isNaN(limit)) { limit=param['default_limit']; }	
			
			var lat = map.getCenter().lat();
			var lng = map.getCenter().lng();
			
			var cat = [];
			var tmpcat = {};
			$('[name="'+param['category_input']+'"]').each(function () {
				var val = $(this).val();
				if(val != '' && !tmpcat[val]) {
					cat.push(val); tmpcat[val] = true;
				}
			});
			
			var fn = 'store_locator';
			$.do_ajax( fn,
			{ 'proc':'search', 'lat': lat, 'lng': lng, 'rad':rad, 'limit':limit, 'category':cat.join(';')  }, 
				'true',
				{
					'SUCCESS': {
						'def' : { 'count': 0, 'loc': [], 'lat': 0, 'lng': 0, 'rad': 0 },
						'fn' : function (code, data) {

							var param = $.getStoreLocatorCache('param');
							var map = $.getStoreLocatorCache('map');
							var bounds = new google.maps.LatLngBounds();
							
							map.setCenter(new google.maps.LatLng(data['lat'],data['lng']));
							var zoom = param['zoom_preset'];
							if(data['rad'] < 2 ) {
								zoom += 3;
							} else if(data['rad'] < 5 ) {
								zoom += 2;
							} else if(data['rad'] < 10 ) {
								zoom += 1;
							} else if(data['rad'] < 25 ) {
							} else if(data['rad'] < 50 ) {
								zoom -= 1;
							} else if(data['rad'] < 100 ) {
								zoom -= 2;
							} else {
								zoom -= 2+Math.round(data['rad'] / 100);
							}
							if(zoom < 0) { zoom=0; }
							map.setZoom(zoom);

							var listo = $('#'+param['list_id']);
							
							$.geoCleartMarkers();
							var markers = $.getStoreLocatorCache('markers');
							
							var definp = {
								'thumb': '',
								'url': '',
								'phone': '',
								'fax': '',
								'email': '',
								'name': '',
								'street': '',
								'city': '',
								'state': '',
								'zip': '',
								'country': '',
								'distance': 0,
								'lat': 0,
								'lng': 0
							};
							
							var html = '';
							var ctr = 0;
							for(var i=0; i<data['loc'].length; i++) {
								var tmp = $.soap_default_data(data['loc'][i],definp);
								tmp['script'] = '$.geoSelectLocation('+ctr+');';
								
								tmp['info_class'] = param['info_class'];
								tmp['list_class'] = param['list_class'];
								tmp['item_class'] = param['item_class'];
								tmp['count'] = ctr;
								
								html += $.parse_ntemplate(param['page']['body'], tmp);

								var latlng = new google.maps.LatLng(tmp['lat'],tmp['lng']);
								
								var mkopts = {
									map: map,
									position: latlng
								};

								if(tmp['name'] != '') {
									mkopts['title'] = tmp['name'];
								}
								
								if(param['marker']['icon'] != '') {
									mkopts['icon'] = param['marker']['icon'];
								}
								if(param['marker']['cursor'] != '') {
									mkopts['cursor'] = param['marker']['cursor'];
								}
								
								var newMarker = $.geoCreateMarker(mkopts, tmp, ctr);
								
								markers.push(newMarker);
								
								bounds.extend(latlng);
								ctr++;
							}
							
							var pdata = {'count': ctr};
							pdata['info_class'] = param['info_class'];
							pdata['list_class'] = param['list_class'];
							pdata['item_class'] = param['item_class'];
							if(ctr >0) {
								pdata['msg'] = $.parse_ntemplate(param['page']['result'], pdata);
							} else {
								pdata['msg'] = param['msg']['noresult'];
							}

							html = $.parse_ntemplate(param['page']['header'], pdata)+ 
								html +
								$.parse_ntemplate(param['page']['footer'], pdata);
							if(listo.length) {
								listo.html(html);
								listo.show();
								
								var itms = $('.'+param['list_class']+' UL LI.'+param['item_class']);
								itms.die('click');
								itms.live('click', function () {
									$.geoSelectLocation($(this).attr('ref'));
								});
							}
						}
					},
					'ERROR' : { 
						'def' : { 'response': '' },
						'fn' : function (code, data) {  if(param['debug']){ alert(data['response']); } }
					}
			});
		},
		
		geoCreateMarker : function (mkopts, data, ctr) {
			var param = $.getStoreLocatorCache('param');
			var map = $.getStoreLocatorCache('map');
			var info = $.getStoreLocatorCache('info');
			var markers = $.getStoreLocatorCache('markers');
			
			var html = $.parse_ntemplate(param['page']['info'], data);
			
			var marker = new google.maps.Marker(mkopts);
			google.maps.event.addListener(marker, 'click', function(e) {
				$.geoHighLightMarker(ctr);
				info.setContent(html);
				info.open(map, marker);
			});
			
			return marker;
		},

		geoCustAddMarker : function (lat,lng, name) {
			var param = $.getStoreLocatorCache('param');
			var map = $.getStoreLocatorCache('map');
			var markers = $.getStoreLocatorCache('markers');
			
			var bounds = new google.maps.LatLngBounds();
			var latlng = new google.maps.LatLng(lat,lng);
			
			var mkopts = {
				map: map,
				position: latlng
			};

			if(name != '') {
				mkopts['title'] = name;
			}
			
			if(param['marker']['icon'] != '') {
				mkopts['icon'] = param['marker_icon'];
			}
			if(param['marker']['cursor'] != '') {
				mkopts['cursor'] = param['marker']['cursor'];
			}
			
			var newMarker = new google.maps.Marker(mkopts);
			markers.push(newMarker);
			
			bounds.extend(latlng);
		},
		
		geoHighLightMarker : function (id) {
			var param = $.getStoreLocatorCache('param');
			$('.'+param['list_class']+' UL LI.'+param['item_class']).each(function () {
				var ref = $(this).attr('ref');
				if(ref == id) {
					$(this).addClass(param['highlight_class']);
				} else {
					$(this).removeClass(param['highlight_class']);
				}
			});
		},
		
		geoSelectLocation : function ( ind ) {
			var markers = $.getStoreLocatorCache('markers');
			ind = parseInt(ind); if(isNaN(ind)) { ind=-1; }
			if(ind >= 0) {
				google.maps.event.trigger(markers[ind], 'click');
			}
		},
	
		getStoreLocatorCache : function ( id ) {
			if(nStoreLocatorData[id] instanceof Object) {
				return nStoreLocatorData[id];
			} else {
				return {};
			}
		}
	});
}) (jQuery);
/* END WISHLIST FUNCTIONS */