(function($, ns) {
	var timeoutIds = {};
	
	ns.showSearch = function(objectId, id, start) {
		if(!id) { id = 0; }
		if(!start) { start = 0; }
		
		var form = document.itemForm;
		if(objectId == 'show-can-resp') {
			Messaging.cancelClose(objectId);
	
			var canRespPanel = $('#' + objectId + 'pl');
			var backupPanel = $('#shplbk');
			var cannedRespRow = $('#can-row');
			var loadingIcon = $('.cp-loading-icon');
			var date = new Date();
			var timeStamp = date.getFullYear() + '' + date.getMonth() + '' + date.getDay() + '' + date.getHours() + '' + date.getMinutes();
	
			// navigation properties
			var canRespSearchText = $('#can-text').val();
			var canRespType = $('#can-type').val();
			
			var url = '[? print cpJSQuoteNB cp_url(fn=>"_getcres", empty=>"on"); ?]' + 
				'&oid=' + objectId + '&id=' + id + '&type=' + escape(canRespType) + '&kw=' + escape(canRespSearchText) + '&st=' + start + '&ts=' + timeStamp;
			
			loadingIcon.css('display', 'block');
			
			$.cpSendAjax({
				'show-loading': false,
				'ajaxfn' : 'msgcenter_getcanreslist',
				'soap-input': {
					id: id,
					oid: objectId,
					type: escape(canRespType),
					kw: escape(canRespSearchText),
					st: start,
					ts: timeStamp
				},
				'soap-output': { result: '' },
				'onSuccess': function(data) {
						canRespPanel.html(data.result);
						loadingIcon.css('display', 'none');
						canRespPanel.css('display', 'block');
				},
				'onError': function(err,  txt) { }
			});
		}
	}
	
	ns.cancelClose = function(objectId) {
		if(timeoutIds[objectId]) {
			clearTimeout(timeoutIds[objectId]); 
			timeoutIds[objectId]=null;
		}
	}
	
	ns.closeSearch = function(objectId, useTimeout) {
		if(useTimeout) {
			timeoutIds[objectId] = setTimeout('Messaging.closeSearch(\'' + objectId + '\', false)',1000);
		} else {
			// Remove the stored timeout
			Messaging.cancelClose(objectId);
			
			// Close the panel if it exists
			var panel = $('#' + objectId + 'pl');
			if (panel) {
				panel.css('display', 'none');
			}
			
			// Close the backup panel if it exists
			var backupPanel = $('#shplbk');
			if(backupPanel) {
				backupPanel.css('display', 'none');
			}
		}
	}
	
	// Set the subject textbox
	ns.setSubject = function(id, newSubject) {
		var subject = $('[name=message-subject]');
		
		if(subject) {
			subject.val(unescape(newSubject));
		}
	}
	
	// Append the template to the CKEDITOR
	ns.appendTemplate = function(id, text) {
		var editor = CKEDITOR.instances['body'];
		if(editor) {
			if(editor.mode == 'wysiwyg') {
				editor.insertHtml(unescape(text));
				editor.focus();
			} else {
				if(confirm('Sorry. Cannot attach template in source mode.\n\nChange to WYSIWYG mode and attach template?')) {
					editor.setMode('wysiwyg');
					editor.insertHtml(unescape(text));
					editor.focus();
				}
			}
		}
	}
	
	// Empties the CKEDITOR and subject
	ns.clearMessageBox = function() {
		var form = document.itemForm;
		var subject = form['message-subject'];
		
		var editor = CKEDITOR.instances['body'];
		if(editor) {
			editor.setData('');
		}
		
		if(subject) {
			subject.value == '';
		}
		
		Messaging.rmAllAttachments();
	}
	
	// Gets all attachments in the data passed and currently on the form and re-adds them to the form
	ns.setAttachments = function(data) {
		if(!data) {
			data = [];
		}
		
		var files = {};
		var form = document.itemForm;
		var list = [];
		var i = 0, file = form['_doc_file' + i];
		
		while(file) {
			var fileName = file.value;
			if(fileName != '' && !files[fileName]) { 
				list.push(fileName);
				files[fileName]=true;
			}
			i++;
			file = form['_doc_file' + i];
		}
		
		for(i = 0; i < data.length; i++) {
			var fileName = unescape(data[i]);
			if(fileName != '' && !files[fileName]) { 
				list.push(fileName);
				files[fileName] = true;
			}
		}
		
		var attachments = $('#can-res-att');
		if(attachments) {
			var html = '';
			for(i = 0; i < list.length; i++) {
				html += '<span class="filebox">' + list[i] + ' <a href="javascript:void(0);" onClick="Messaging.rmAttachment('+i+')">x</a>' +
					'<input id="file_' + i + '" name="_doc_file" type="hidden" value="' + list[i] + '">' +
					'</span></div>';
			}
			
			attachments.html(html);
		}
		
		var attcontainer = $('#att-container');
		if(list.length > 0) {
			attcontainer.css('display', 'block');
		}
		else {
			attcontainer.css('display', 'none');
		}
		
	}
	
	// Removes all attachments from the form
	ns.rmAllAttachments = function() {
		$('.filebox').remove();
		$('#att-container').css('display', 'none');
	}
	
	ns.rmAttachment = function(index) {
		$('#file_' + index).parent().remove();
		
		if($('#can-res-att').children().length <= 0)
			$('#att-container').css('display', 'none');
	}
	
	ns.setCannedRes = function(objectId, id, data) {
		if(!data) {
			data = {};
		} 
			
		for(var k in data) {
			data[k] = unescape(data[k]);
		}
		
		var defaults = {
			'id' : 0,
			'name' : ''
		};
	
		for(var k in defaults) {
			if(!data[k]) {
				data[k] = defaults[k];
			}
		}
		Messaging.closeSearch(objectId, false);
		
		var cannedId = parseInt(data['id']);
		if(!isNaN(cannedId) && cannedId > 0 ) {
			Messaging.loadCanRes('load-can-resp', id, cannedId);
		}
	}
	
	ns.loadCanRes = function(objectId, id, cannedId) {
		if(objectId == 'load-can-resp') {
			$.cpSendAjax({
				'show-loading': true,
				'ajaxfn' : 'msgcenter_getcanrespbody',
				'soap-input': {
					'id': id,
					'rid': cannedId
				},
				'soap-output': { cr_name: '', cr_body: '', cr_id: '', attachments: {} },
				'onSuccess': function(res) {
					Messaging.setSubject(res.cr_id, res.cr_name);
					Messaging.appendTemplate(res.cr_id, res.cr_body);
					
					if(res.attachments.length > 0) {
						Messaging.setAttachments(res.attachments);
					}
				},
				'onError': function(err,  txt) { }
			});
		}
	}	
	
	ns.noSent = function() {
		if(document.itemForm.page.value != 'submitmsg') {
			return true;
		}
		if(document.itemForm.sent.value>0) {
			document.itemForm.reset();
			document.itemForm.body.value = '';
			return false;
		} else {
			document.itemForm.sent.value++;
			return true;
		}
	}
})(jQuery, window.Messaging = window.Messaging || {});