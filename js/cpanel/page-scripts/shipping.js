
var shipping = {
	err : [],
	is_shipping_config: false,

	start: function() {
		shipping.attachAddButtonEvent();
		shipping.attachEditButtonEvent();
	},

	attachAddButtonEvent: function() {
		if (!$('.add-new-account').length) {
			return;
		}

		$('.add-new-account').click(function(e) {

			var _self = $(this);
			var mod_lib = _self.data('shratemod-lib');
			var carrier_id = _self.data('shratemod-id');

			// get the configs
			var fieldData = shipping_carriers[mod_lib];
			e.preventDefault();
			shipping.addAccount(fieldData, carrier_id);
		});
	},

	attachEditButtonEvent: function() {
		if (!$('.edit-account').length) {
			return;
		}

		$('.edit-account').click(function(e) {
			e.preventDefault();
			var _self = $(this);

			var mod_lib = _self.data('shratemod-lib');
			var carrier_id = _self.data('shratemod-id');
			var fieldData = shipping_carriers[mod_lib];
			var account_id = _self.data('id');

			shipping.editAccount(fieldData, account_id, carrier_id);
		});
	},

	// attach the + add button.
	addAccount: function(fieldData, carrier_id) {
		var content = shipping.generateContent(fieldData);
		shipping.showDialog(content, carrier_id);
		shipping.attachPostcodeChange();
		shipping.attachCountryChange();
	},

	// edit accounts
	editAccount: function(fieldData, account_id, carrier_id) {

		if (!account_id) {
			account_id = $('#accounts').val();
		}
		shipping.getAccountInfomation(account_id, function(data) {
			var content = shipping.generateContent(fieldData, data)
			shipping.showDialog(content, carrier_id);
			shipping.attachPostcodeChange();
			shipping.attachCountryChange();

		});
	},

	// get the account information pertaining to this account.
	getAccountInfomation: function(account_id, callback) {
		$.cpSendAjax({
			'show-loading': false,
			'ajaxfn': 'get_carrier_rate_accounts',
			'soap-input': {account_id : account_id},
			'soap-output': {'ok': false, 'data': [], 'errors': []},
			'onSuccess': function(res) {
				// console.log(res);
				if (!res.ok) { return; }
				// 200 response code
				if( res.data.length > 0 ) {
					callback(res.data[0]);
				} else {
					callback({});
				}
			},
			'onError': function(err,  txt) {
				// all other error codes
			 }
		});
	},

	generateContent: function(fieldData, account_info) {
		var content = '';
		var $account_name_element =  '<input required type="text" class="input input-block-level ninput-body" ref="shrateacc_name">';

		var is_defined_account_info = (typeof account_info !== 'undefined');

		if (is_defined_account_info) {
			$account_name_element =  '<input required type="text" class="input input-block-level ninput-body" ref="shrateacc_name" value="'+ account_info.shrateacc_name + '">';
		}

		content +=  '<div class="row">'+
						'<div class="span3">'+
							'<label>Carrier Account Name</label>'+
							$account_name_element +
						'</div>'+
					'</div>';

		content +='<div class="row">'+
						'<div class="span9">'+
						'<p class="muted"></p>'+
					'</div></div>';

		content += '<div class="row">';
		// fieldData is a global variable declared in the view.
		fieldData.forEach(function(fields) {

			var type = fields.type;
			if (fields.config == 'shrateacc_country') {
				content += '</div><div class="row"><p class="span9 muted">These configs will be used for this shipping method setup.</p>';
			}
			content +=  '<div class="span3">'+
						'<label>'+fields.title+'</label>';

			if (fields.opts) {

				content +=  '<select ' + ((fields.optional) ? '' : 'required') + ' class="input-block-level" ref="'+fields.config+'">';

				fields.opts.forEach(function(opts){
					if (is_defined_account_info && opts.value == account_info[fields.config]) {
						content += '<option value="'+opts.value+'"' + 'selected' +'>'+opts.title+'</option>';
					} else {
						content += '<option value="'+opts.value+'"' + ((opts.value == $.toText(fields.def)) ? 'selected' : '') + '>'+opts.title+'</option>';
					}

				});

				content += '</select>';
			} else {

				if (is_defined_account_info) {
					content +=  '<input ' + ((fields.optional) ? '' : 'required') + ' type="'+type+'" class="input input-block-level" ref="'+fields.config+'" value="'+ account_info[fields.config] +'">';
				} else {
					content +=  '<input ' + ((fields.optional) ? '' : 'required') + ' type="'+type+'" class="input input-block-level" ref="'+fields.config+'" value="'+ $.toText(fields.def) +'">';
				}

			}

			if (fields.config == 'shrateacc_state') {
				content += '</div>';
			}
			content += '</div>';
		});

		content +=  '<div class="span9"><hr></div></div>';

		if (is_defined_account_info && account_info.shrateacc_id) {
			content += '<input type="hidden" value="' + account_info.shrateacc_id + '" ref="shrateacc_id">';
		}

		content = '<form id="shipping-account-form">' + content + '</form>';
		return content;
	},
	validateInputs: function(o) {

		shipping.err = [];
		o.find('input[required], select[required]').each(function(){
			if ($(this).val()=='') {
				shipping.err.push('Required field: '+$(this).parent().find('label').html());
				$(this).focus();
			}
		});
		if (shipping.err.length > 0) {
			return false;
		}
		return true;

	},

	showDialog: function(content, carrier_id) {
		if (!carrier_id) {
			carrier_id = $('input[name=step1]:checked').data('carrier-id');
		}

		var dialog = $.cpDialog({
			'title': 'Shipping Rate Calculation Config',
			'content': content,
			'width': '1000px',
			'onCancel': function (o, data) {
				dialog = null;
			},
			'onOkay': function (o, data) {
				// trigger form submit to validate textboxes.
				if (!shipping.validateInputs(o)) {
					console.log(shipping.err);
					return {error:shipping.err};
				}

				dialog = null;
				// Save our new carrier rate account data immediately so we can prevent users from having to redo this step.
				// Return the
				data.shratemod_id = carrier_id; // set the selected carrier_id.
				$.cpSendAjax({
					'show-loading': false,
					'ajaxfn': 'set_carrier_rate_account',
					'soap-input': data,
					'soap-output': {'ok': false, 'data': 0, 'errors': []},
					'onSuccess': function(res) {

						if (!res.ok) {
							return;
						}

						// This is only for step 2 on wizard.
						if (res.data) {

							if ($('#accounts option[value=' + res.data + ']').length) {
								$('#accounts option[value=' + res.data + ']').text(data.shrateacc_name);
								$('#accounts').val(res.data);
							} else {
								$("#accounts").append($('<option>', {
									value: res.data,
									text: data.shrateacc_name,
									selected: 'selected'
								}));
							}

							if (!$('.edit-shipping-accounts').length) {
								var $edit_button = '<button type="button" class="btn btn-warning edit-shipping-accounts" onclick="shipping.editAccount(fieldData)"><i class="icon-pencil"></i> Edit</button>';
								$('.add-shipping-accounts').before($edit_button);
							}

							// reload the page if it's shipping config page
							if (shipping.is_shipping_config) {
								location.reload();
							}
						}
					},
					'onError': function(err,  txt) { }
				});
			}
		});
	},

	/**
	 * Attach country selector change event.
	 * When AU is selected, it will trigger the keyup event on postcode input.
	 * When !AU is selected, every pickup field will be reverted into a text field.
	 */
	attachCountryChange: function() {
		if (!$('select[ref="shrateacc_country"]').length) {
			return;
		}

		$('select[ref="shrateacc_country"]').change(function() {

			var _self = $(this);

			if (_self.val() == 'AU') {
				$('input[ref="shrateacc_postcode"]').trigger('keyup');
			} else {

				// make sure the suburb selector is a textbox
				var $city_input = $('input[ref="shrateacc_city"]');
				$city_input.show();

				$('.selector_shrateacc_city').remove();
				$('input[ref=shrateacc_state]').prop('readonly', false);

			}
		});

		if ($('input[ref=shrateacc_city]').val() == '') {
			$('select[ref="shrateacc_country"]').trigger('change');
		}
	},

	/**
	 * Attach postcode input keyup event
	 */
	attachPostcodeChange: function() {
		$('input[ref="shrateacc_postcode"]').keyup(function(){

			if ($('select[ref="shrateacc_country"]').val() != 'AU') {
				return;
			}

			var postcode = $(this).val();
			if (postcode.length == 4) {
				var $city_input = $('input[ref="shrateacc_city"]');
				var $city_select = $('select.selector_shrateacc_city');
				var $state_input = $('input[ref="shrateacc_state"]');
				if ($city_input.length && !$city_select.length) {
					$city_select = $('<select ref="shrateacc_city" class="input-block-level selector_shrateacc_city"></select>').change(function(){
						var a = $(this).val().split(/ - /);
						$city_input.val(a[0]);
						$state_input.val($.toText(a[1]));
					}).insertAfter($city_input);
				}
				//
				$city_input.hide();
				$state_input.prop('readonly', true);
				$city_select.find('option').remove();
				$city_select.show().append($('<option value="">Loading...</option>'));
				var url = '/do/get_locate?zip='+encodeURIComponent(postcode);
				$.ajax(url, {
					success: function(data, status, xhr){
						$city_select.find('option').remove();
						$city_select.append($('<option value="">Choose one...</option>')).change();
						var suburbs = data.split('\n');
						for (var i=0; i<suburbs.length; ++i) {
							$city_select.append($('<option></option>').text(suburbs[i]));
						}
						if (suburbs.length == 1) {
							// helper when a postcode only contains a single suburb
							$city_select.prop('selectedIndex', 1).change();
							if (suburbs[0] === '') {
								// invalid postcode
								$city_select.hide();
								$city_input.show();
								$state_input.prop('readonly', false);
							}
						}
					}
				});
			}
		});
	}
};


$(document).ready(shipping.start);
