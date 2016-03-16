(function(ns, $) {
	ns.Items = [];
	var params;
	var tableBody;
	var menuItemNum;

	// Public function to initialise the menu items table
	//
	ns.Init = function(itemArray, opt) {
		menuItemNum = 0;

		params = $.soap_input_opt(opt, {
			hierarchyLength : 3, // Default to 3 as that is the default for new sites
			modalContent: '',
			maxLevels: 8
		});
		ns.Items = itemArray; // Used for debug only

		formatData(itemArray);
		printData(itemArray);
		addEventHandlers();
	};

	ns.OpenModal = function(e, itemId) {
		var menuItem;
		if(!itemId) {
			menuItem = $(this).closest('li');
			itemId = menuItem.attr('cp-menu-item-id');
		}
		else {
			menuItem = $('#list_' + itemId);
		}

		// Create and initialise the modal
		$.cpDialog({
			'show-loading': false,
			'title': 'Settings',
			'content': params.modalContent,
			'width' : 'auto',
			'btn-cancel': 'Close',
			'btn-okay': 'Accept',
			'onOkay': function() {
				var url = $('#item-url').val();
				var qs = $('#item-qs').val();

				// Change all the values in the DOM to those that are set by the user
				$('#menu-item-name-' + itemId).val($('#item-name').val());
				menuItem.attr('cp-url', url);
				menuItem.attr('cp-qs', qs);
				menuItem.attr('cp-class', $('#item-class').val());
				menuItem.attr('cp-visible', $.isChecked($('#item-visible')) ? 'y' : 'n');

				// Update the displayed link
				var urlItem = $('#menu-item-url-' + itemId);
				var displayUrl = createDisplayUrl(url, qs);
				if(displayUrl) {
					urlItem.attr('href', displayUrl);
					urlItem.attr('title', displayUrl);
					urlItem.html(displayUrl);
					urlItem.removeAttr('onClick');
				}

				if($.isChecked($('#item-visible'))) {
					menuItem.find('.visible-setting:first').addClass('website-visible');
					menuItem.find('.relative:first').removeClass('hidden-on-website');
				}
				else {
					menuItem.find('.visible-setting:first').removeClass('website-visible');
					menuItem.find('.relative:first').addClass('hidden-on-website');
				}
			}
		});
		initialiseModal();

		// Add the current data to the modal
		$('#item-name').val($('#menu-item-name-' + itemId).val());
		$('#item-url').val(menuItem.attr('cp-url'));
		$('#item-qs').val(menuItem.attr('cp-qs'));
		$('#item-class').val(menuItem.attr('cp-class'));
		$.setChecked($('#item-visible'), menuItem.attr('cp-visible') == 'y');
	}

	ns.OnSubmit = function() {
		// Get an object of the menu items
		var menuItems = $('.sortable').nestedSortable('toMenuArray', {hierarchyLength: params.hierarchyLength}).sort(compare);

		// Create a hidden field to put the data in
		var input = $('<input id="serialised-menu-items" name="serialised-menu-items" type="hidden" value="" />').val(JSON.stringify(menuItems));

		// Attach the string to the form
		$('form[name=itemForm]').append(input);
	}

	// Private function to format the data
	function formatData(itemArray) {
		itemArray.sort(compare);
		var maxLevel = createProperties(itemArray);
		createTreeStructure(itemArray, maxLevel);
	};

	// Private comparison function
	function compare(first, second) {
		return (first.hierarchy > second.hierarchy) - (first.hierarchy < second.hierarchy);
	};

	// Private function to add extra properties to the item array to help create the tree structure
	function createProperties(itemArray) {
		var maxLevel = 0;

		for (var i in itemArray) {
			var item = itemArray[i];

			// Setup an array to store the items children in
			item.children = [];

			// Create a parent and sort order field on each object to know where they are located in the menu for later
			var level = item.hierarchy.length / params.hierarchyLength;
			var parentHierarchy = item.hierarchy.substring(0, (level - 1) * params.hierarchyLength);

			// Get the menu item's parent
			for (var j in itemArray) {
				if(itemArray[j].hierarchy === parentHierarchy) {
					item.parentId = itemArray[j].menuitem_id;
					break;
				}
			}

			// Get the menu items sort order
			item.sortOrder = parseInt(item.hierarchy.substring((level - 1) * params.hierarchyLength, item.hierarchy.length));
			item.level = level;

			// If the parentId isn't set, set it to 0 (which will be the base of the tree structure)
			if(!item.parentId)
				item.parentId = null;

			// Store the max level for later.
			if(level > maxLevel)
				maxLevel = level;
		}

		return maxLevel;
	};

	// Private function to convert the itemArray into a tree structure instead of being flat
	function createTreeStructure(itemArray, maxLevel) {
		for (var i = maxLevel; i >= 2; i--) {
			var j = 0;
			while (j < itemArray.length) {
				var found = false;

				// Only deal with items on the current level
				if (itemArray[j].level != i) {
					j++;
					continue;
				}

				for (var k in itemArray) {
					if (itemArray[j].parentId == itemArray[k].menuitem_id)
					{
						found = true;
						itemArray[k].children.push(itemArray[j]);
						itemArray.splice(j, 1);
						break;
					}
				}

				if(!found) j++;
			}
		}
	};

	// Private function to print out the initial data
	function printData(itemArray) {

		var treeStructure = $('<ol class="sortable"></ol>');

		for (var i in itemArray) {
			treeStructure.append(printSection(itemArray[i]));
		}

		$('#menu-items').prepend(treeStructure);
	}

	// Private function to print the next branch section of the menu tree (recursive)
	function printSection(item) {
		var text = $('<li id="list_' + menuItemNum + '" cp-menu-item-id="' + menuItemNum + '" cp-url="' + item.url + '" cp-qs="' + item.url_qs + '" cp-visible="' + item.visible + '" cp-class="' + (item.css_class || '') + '"></li>');
		text.append(createSectionPanel(item));

		if(item.children.length > 0) {
			var orderedList = $('<ol></ol>');

			for (var i in item.children) {
				var child = item.children[i];
				orderedList.append(printSection(child));
			}

			text.append(orderedList);
		}

		return text;
	}

	// Creates a panel for a menu item. Used in initialisation and also when adding new items
	function createSectionPanel(item) {
		var displayUrl = createDisplayUrl(item.url, item.url_qs);
		var elementVisible = (item.visible == 'y');

		var panel = $('<div class="relative ' + (elementVisible ? '' : 'hidden-on-website') + '"></div>');
		var row =	$('<div class="row"></div>');

		var menuName = $('<div class="span3 menu-item-label-container"></div>');
		var collapseIcon =	$('<span class="disclose pull-left"><span class="ntooltip" data-toggle="tooltip" title="Collapse Child Menu Items"><i class="icon icon-chevron-down"></i></span></span>');
		var nameInput = $('<input id="menu-item-name-'+ menuItemNum + '" type="text" class="input-block-level menu-name-input" style="width:80%;" name="menu-item-'+ (menuItemNum) + '" value="" maxlength="50" />').val(item.name);
		var nameLabel =	$('<label for="menu-item-name-'+ menuItemNum + '"><i class="icon icon-pencil pull-right"></i></label>');

		menuName.append(collapseIcon).append(nameInput).append(nameLabel);

		var buttons = $('<div class="pull-right"></div>');
		var hiddenIcon = $('<span class="visible-setting ' + (elementVisible ? 'website-visible' : '') + ' ntooltip" data-toggle="tooltip" title="Hidden on Website"><i class="icon icon-eye-close"></i></span>');
		var settingsIcon =	$('<span class="edit-item"><span class="ntooltip" data-toggle="tooltip" title="Menu Item Settings"><i class="icon icon-cog"></i></span></span>');
		var addChildIcon =	$('<span class="ntooltip" data-toggle="tooltip" title="Add Child for this Item"><i class="icon icon-plus"></i></span>');
		var deleteChildIcon =	$('<span class="ntooltip" data-toggle="tooltip" title="Delete Item & All Children"><i class="icon icon-remove"></i></span>');

		buttons.append(hiddenIcon).append(settingsIcon).append(addChildIcon).append(deleteChildIcon);

		var link = $('<div class="span3 pull-right" style="margin-right:180px;"></div>');
		var linkUrl = (displayUrl ? $('<a id="menu-item-url-' + menuItemNum + '" href="' + displayUrl + '" class="overflow-link" title="' + displayUrl + '" target="_blank">' + displayUrl + '</a>') :
				$('<a id="menu-item-url-' + menuItemNum + '" href="#" class="overflow-link edit-item" title="Click here or on the cog to edit settings">Links to...</a>'));

		link.append(linkUrl);

		row.append(menuName).append(buttons).append(link);
		panel.append(row);

		menuItemNum++
		return panel;
	}

	// Create the url to be displayed on the menu item panel
	function createDisplayUrl(url, qs) {
		return $.cpNoHTML(url + ((url && qs) ? ((url.indexOf('?') > -1) ? '&' : '?') : '') + (qs || ''));
	}

	// Creates a brand new section panel with default data
	function createNewSectionPanel() {
		var newItem = $('<li id="list_' + menuItemNum + '" cp-menu-item-id="' + menuItemNum + '"	cp-url="" cp-qs="" cp-visible="y" cp-class="" class="mjs-nestedSortable-leaf"></li>');
		newItem.append(createSectionPanel({ name: 'Click to Edit Name', url: '', visible: 'y' }));

		return newItem;
	}

	// Adds all required event handlers for the menu items interface. Re-runs when a new item is added to the dom
	function addEventHandlers() {
		// Opens the modal
		$('.edit-item').off();
		$('.edit-item').on('click', ns.OpenModal);

		// Changes display to a text box for editing
		$('.relative input').off();
		$('.relative input').on('focus', function() {
			$(this).addClass('is--focused');
		});

		// Changes display back to a label and updates the label text
		$('.relative input').on('blur', function() {
			$(this).removeClass('is--focused');
		});

		// Toggles what the tooltip says when clicked
		$('.disclose').off();
		$('.disclose').on('click', function() {
			// Toggle classes and icons
			$(this).closest('li').toggleClass('mjs-nestedSortable-collapsed').toggleClass('mjs-nestedSortable-expanded');
			$(this).find('i').toggleClass('icon-chevron-down').toggleClass('icon-chevron-right');

			// Toggle tooltip value
			var tooltipVal = $(this).attr('data-original-title');
			if(tooltipVal) {
				if(tooltipVal.indexOf('Collapse') > -1)
					$(this).attr('data-original-title', tooltipVal.replace('Collapse', 'Expand'));
				else
					$(this).attr('data-original-title', tooltipVal.replace('Expand', 'Collapse'));
			}
			else {
				tooltipVal = $(this).attr('title');
				if(tooltipVal.indexOf('Collapse') > -1)
					$(this).attr('title', tooltipVal.replace('Collapse', 'Expand'));
				else
					$(this).attr('title', tooltipVal.replace('Expand', 'Collapse'));
			}

		});

		// Warn user then delete the menu item
		$('.relative .icon-remove').off();
		$('.relative .icon-remove').on('click', function() {
			if(confirm('Are you sure you will to delete this menu item and all its children?')) {
				// If the item has siblings OR the parent ol is the top level ol, only remove the list item.
				if($(this).closest('li').siblings().length > 0 || $(this).closest('ol').attr('class'))
					$(this).closest('li').remove();
				else {
					$(this).closest('ol').parent().removeClass('mjs-nestedSortable-branch mjs-nestedSortable-expanded').addClass('mjs-nestedSortable-leaf');
					$(this).closest('ol').remove();
				}
			}
		});

		// Creates a new panel for a new menu item child
		$('.relative .icon-plus').off();
		$('.relative .icon-plus').on('click', function() {
			// 8 is the maximum depth allowed of a menu (parentsUntil cuts out ol.sortable which is why (maxLevels - 1) is used instead of 8)
			if($(this).parentsUntil('ol.sortable', 'ol').length >= (params.maxLevels - 1)) {
				alert('You can only have an 8 element deep menu');
				return;
			}

			var menuItem = $(this).closest('div.relative');
			var newItem = createNewSectionPanel();

			if(menuItem.siblings().length > 0)
				menuItem.siblings('ol').append(newItem);
			else {
				newItem = $('<ol></ol>').append(newItem);
				menuItem.parent().append(newItem);
				menuItem.parent()
				.addClass('mjs-nestedSortable-branch mjs-nestedSortable-expanded')
				.removeClass('mjs-nestedSortable-leaf');
			}
			addEventHandlers();
			$('.ntooltip').tooltip();
		});

		// Adds a base level menu item
		$('#add-base-item').off();
		$('#add-base-item').on('click', function() {
			var newItem = createNewSectionPanel();
			$('.sortable').append(newItem);
			addEventHandlers();
			$('.ntooltip').tooltip();
		});

		// Add other event handlers that need to be attached here
	}

	// Initialise the settings modal
	function initialiseModal() {
		$.cpGenContentTree('itemLinkForm', {});
		$.cpInitAjaxForm('itemLinkForm');
		$('[name="ad_destination_type"]').change(function(){
			var v = $(this).val();
			$('.cp-ad-type').hide();
			if (v == '') {
				$('.cp-ad-type-url').show();
			} else if (v == 'inventory') {
				$('.cp-ad-type-inventory').show();
			} else if (parseInt(v) > 0) {
				$('.cp-ad-type-content').show();
			} else if (v == 'stloc') {
				$('.cp-ad-type-stloc').show();
			}
		}).change();

		$('[name="ad_content_id"]').change(function(){
			var content_id = $(this).val();
			$.cpSendAjax({
				'show-loading': false,
				'ajaxfn' : 'site_url',
				'soap-input': {content_id:content_id},
				'soap-output': { ok:false, errors:[], request_url:'' },
				'onSuccess': function(res, sts) {
					if (!res.ok) {
					} else {
						$('[name="url"]').val(res['request_url']);
					}
				},
				'onError': function(err,	txt) { }
			});
		});
		$('[name="ad_stloc_id"]').change(function(){
			var stloc_id = $(this).val();
			$.cpSendAjax({
				'show-loading': false,
				'ajaxfn' : 'site_url',
				'soap-input': {stockist_id:stloc_id},
				'soap-output': { ok:false, errors:[], request_url:'' },
				'onSuccess': function(res, sts) {
					if (!res.ok) {
					} else {
						$('[name="url"]').val(res['request_url']);
					}
				},
				'onError': function(err,	txt) { }
			});
		});
		$.cpAddSetValueFn({
			setURLinventory : function (obj, vals) {
				if(vals.length > 0) {
					var row = $.soap_input_opt(vals[0], {
						'id': '',
						'inventory_id': '',
						'name': '',
						'url' : '',
						'sort_order' : '0'
					});
					$('[name="url"]').val(row['url']);
					$('[name="ad_inventory_id"]').val(row['inventory_id']);
					obj.val(row['id']);
				}
			}
		});
	}

})(window.Menus = window.Menus || {}, jQuery);
