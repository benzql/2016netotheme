function showControl(obj,control) {
	var names= ['main','warehouse','images','shipping','pricing','promotion','accounting','options'];
	for(var i=0; i<names.length; i++) {
		var ctl = document.getElementById(names[i]+'_control');
		var tag = document.getElementById(names[i]+'_tag');
		if(ctl) {
			if(control == names[i]) {

				setCSS(ctl,'controlshowing');
				var css = getCSS(tag);
				if(css == 'reqTag' || css == 'reqTaghover') {
					setCSS(tag,'reqTagshowing');
				} else {
					setCSS(tag,'tagshowing');
				}
			} else {
				setCSS(ctl,'controlhidden');
				var css = getCSS(tag);
				if(css == 'reqTag' || css == 'reqTaghover' || css == 'reqTagshowing' || css == 'reqTagshowinghover') {
					setCSS(tag,'reqTag');
				} else {
					setCSS(tag,'tag');
				}
			}
		}
	}
}

/*************** Main Control Functions ******************/
function upd_lblct(obj, obj2_id) {
	var obj2 = document.getElementById(obj2_id);
	var val = obj.options[obj.selectedIndex].value;
	val = parseInt(val);
	if(!isNaN(val) && val>0) {
		obj2.value = val;
	}
}

function set_lblct(obj, obj2_id) {
	var obj2 = document.getElementById(obj2_id);
	var val = obj.value;
	val = parseInt(val);
	if(isNaN(val) || val<0) { val = 0; }
	var sel = 0;
	for(var i=0; i<obj2.options.length; i++) {
		if(parseInt(obj2.options[i].value) == val) {
			sel=i;
		}
	}
	obj2.selectedIndex=sel;
}

function syn_promotion_info(type,value,start,end) {
	var price = parseFloat(document.itemForm._store_price_0.value);

	if(isNaN(price)) {
		price = 0;
	}

	if(type == '%') {
		price *= 1-(value/100);
	} else {
		price -= value;
	}

	if(price <= 0) {
		price =0;
	}

	document.itemForm._promo_price.value = price;

	var date = start.split('-');
	document.itemForm._promo_start_yr.value = date[0];
	document.itemForm._promo_start_mo.value = date[1];
	document.itemForm._promo_start_da.value = date[2];

	date = end.split('-');
	document.itemForm._promo_end_yr.value = date[0];
	document.itemForm._promo_end_mo.value = date[1];
	document.itemForm._promo_end_da.value = date[2];

}

function setJITDate() {
	var now = new Date();
	document.itemForm._jit_date_yr.value = now.getFullYear();
	document.itemForm._jit_date_mo.value = now.getMonth()+1;
	document.itemForm._jit_date_da.value = now.getDate();
}

function setArrivalDate() {
	var now = new Date();
	document.itemForm._start_date_yr.value = now.getFullYear();
	document.itemForm._start_date_mo.value = now.getMonth()+1;
	document.itemForm._start_date_da.value = now.getDate();
}

function setCubic() {
	var width = document.getElementById('dim_width').value;
	var length = document.getElementById('dim_length').value;
	var height = document.getElementById('dim_height').value;

	var cubic = document.itemForm._cubic;
	cubic.value = Math.round((width*length*height)*1000000.00)/1000000.00;
	if(cubic.value <= 0) {
		cubic.value = '0.00001';
	}
}

function addMLP(gp) {
	var total = document.getElementById('_mpl_total_'+gp);
	var table = document.getElementById('mpl_list_'+gp);
	var minqty = 1;
	var price = 0.00;
	var priceobj = document.getElementById('_store_price_'+gp);
	if(priceobj) { price = priceobj.value; }
	if(total.value>0) {
		var maxobj = document.getElementById('_mpl_max_'+gp+'_'+(total.value-1));
		if(maxobj) { minqty = Math.round(maxobj.value)+1; }
	}
	var row = table.insertRow(-1);
	var cell = row.insertCell(0);
	cell.vAlign = 'middle'; cell.noWrap=true; cell.align="center"; setCSS(cell,'listitem'+(total.value%2));
	cell.innerHTML = '<input type="text" name="_mpl_min_'+gp+'_'+total.value+'" value="'+Math.round(minqty)+'" size="4">';
	cell = row.insertCell(1);
	cell.vAlign = 'middle'; cell.noWrap=true; cell.align="center"; setCSS(cell,'listitem'+(total.value%2));
	cell.innerHTML = '<input type="text" name="_mpl_max_'+gp+'_'+total.value+'" value="'+(Math.round(minqty)+9)+'" size="4">';
	cell = row.insertCell(2);
	cell.vAlign = 'middle'; cell.noWrap=true; cell.align="center"; setCSS(cell,'listitem'+(total.value%2));
	cell.innerHTML = moneysign+'<input type="text" name="_mpl_price_'+gp+'_'+total.value+'" value="'+price+'" size="5">';
	cell = row.insertCell(3);
	cell.vAlign = 'middle'; cell.noWrap=true; cell.align="center"; setCSS(cell,'listitem'+(total.value%2));
	cell.innerHTML = '<input type="button" value="Delete" onClick="removeMLP('+gp+','+total.value+')">';
	total.value++;
	return false;
}

function removeMLP(gp,index) {
	var total = document.getElementById('_mpl_total_'+gp);
	var table = document.getElementById('mpl_list_'+gp);
	for(var i=index; i<total.value-1; i++ ){
		document.getElementById('_mpl_min_'+gp+'_'+i).value = document.getElementById('_mpl_min_'+gp+'_'+(i+1)).value;
		document.getElementById('_mpl_max_'+gp+'_'+i).value = document.getElementById('_mpl_max_'+gp+'_'+(i+1)).value;
		document.getElementById('_mpl_price_'+gp+'_'+i).value = document.getElementById('_mpl_price_'+gp+'_'+(i+1)).value;
	}
	table.deleteRow(-1);
	total.value--;
}

var category_name = new Array();

function changeCategory(obj) {
	var cat_id = obj.options[obj.selectedIndex].value;

	hideChildCatSel(obj);

	// show selected child
	if(obj.selectedIndex > 0) {
		var catsel = document.getElementById("cat"+cat_id);
		if(catsel) {
			catsel.style.visibility = 'visible';
			catsel.style.position = 'static';
		}
	}
}

function hideChildCatSel(obj) {
	// hide all children
	for(var i=0; i<obj.options.length; i++) {
		var cat_id = obj.options[i].value;
		var catsel = document.getElementById("cat"+cat_id);
		if(catsel) {
			if(catsel.style.visibility == 'visible' || catsel.style.visibility == '') {
				catsel.selectedIndex = 0;
				catsel.style.visibility = 'hidden';
				catsel.style.position = 'absolute';
				hideChildCatSel(catsel);
			}
		}
	}
}

function getCurrentCatId(id) {
	var obj = document.getElementById('cat'+id);
	id = '';
	while(obj && obj.selectedIndex>0) {
		id = obj.options[obj.selectedIndex].value;
		obj = document.getElementById('cat'+id);
	}
	return id;
}

function getCurrentCatPath(id) {
	var obj = document.getElementById('cat'+id);
	return getSubCatName(obj);
}

function getSubCatName(obj) {
	if(obj.selectedIndex>0) {
		var name = ' &gt; '+obj.options[obj.selectedIndex].text.replace(/\(\d+\)$/,'');
		var subobj = document.getElementById('cat'+obj.options[obj.selectedIndex].value);
		if(subobj)  {
			name += getSubCatName(subobj);
		}
		return name;
	}
	return '';
}

function addCat(pid) {
	var tmp = document.getElementById('_category').value;
	var cats = tmp.split(';');
	var cat_id = getCurrentCatId(pid);
	if(cat_id) {
		for(var i=0; i<cats.length; i++) {
			if(cats[i] == cat_id) {
				return false;
			}
		}
		document.getElementById('_category').value = cat_id+';'+document.getElementById('_category').value;
		category_name.unshift(getCurrentCatPath(pid));
		showCatList();
	}
	return false;
}

function removeCat(cat_id) {
	var tmp = document.getElementById('_category').value;
	var cats = tmp.split(';');
	var newcats = new Array();
	var newPaths = new Array();
	for(var i=0; i<cats.length; i++) {
		if(cats[i] != cat_id && cats[i] != '') {
			newcats.push(cats[i]);
			newPaths.push(category_name[i]);
		}
	}
	document.getElementById('_category').value = newcats.join(';');
	category_name = newPaths;
	showCatList();
}

function showCatList() {
	var catlist = document.getElementById('category_list');
	var html =
	'<table class="listtable" width="100%" cellpadding="2" cellspacing="0" border="0">'+
	'<tr>'+
	'<td valign="middle" class="listheader" nowrap>Category ID</td>'+
	'<td valign="middle" class="listheader" nowrap>Category Name</td>'+
	'<td valign="middle" class="listheader" nowrap>&nbsp;</td>'+
	'</tr>';

	var tmp = document.getElementById('_category').value;
	var cats = tmp.split(';');
	for(var i=0; i<cats.length; i++) {
		if(cats[i] != '') {
			var s = i%2;
			html +=
			'<tr>'+
			'<td valign="middle" class="listitem'+s+'" align="center" nowrap>'+cats[i]+'</td>'+
			'<td valign="middle" class="listitem'+s+'" >'+(category_name[i]!=''?category_name[i]:'<font color="#CC0000"><b>Invalid</b></font>')+'</td>'+
			'<td valign="middle" class="listitem'+s+'" nowrap><input type="button" value="Delete" onClick="removeCat(\''+cats[i]+'\');"></td>'+
			'</tr>';
		}
	}
	html += '</table>';
	catlist.innerHTML = html;
}

function addAttribute() {
	var table = document.getElementById('att_list');
	var totalatt = document.getElementById('extra_att_total');

	var row = table.insertRow(-1);
	var cell = row.insertCell(0);
	setCSS(cell,'attlist'+totalatt.value%2); cell.noWrap = true;
	cell.innerHTML = '<b>Option Name:</b><input type="text" name="extra_label_'+totalatt.value+'" id="extra_label_'+totalatt.value+'" value="">';
	var cell = row.insertCell(1);
	cell.rowSpan=2; cell.vAlign='top'; setCSS(cell,'attlist'+totalatt.value%2);
	cell.innerHTML = '<input type="button" value="Delete" onClick="deleteAttribute('+totalatt.value+');">';
	row = table.insertRow(-1);
	cell = row.insertCell(0);
	setCSS(cell,'attlist'+totalatt.value%2);
	cell.innerHTML =
	'<table cellpadding="2" cellspacing="0" border="0" class="listtable" id="opt_list_'+totalatt.value+'" width="350px">'+
	'<tr>'+
	'<td class="listheader" colspan="3" nowrap>Default Option:&nbsp;<input type="text" name="extra_name_'+totalatt.value+'_d" id="extra_name_'+totalatt.value+'_d" value="" size="20"> &nbsp;&nbsp; '+
	'Allow Customer To Enter Option From <select onchange="change2TextField(this,'+totalatt.value+')">'+
	'<option value="">Selection Box</option>'+
	'<option value="-TEXT_FIELD-">Text Field</option>'+
	'<option value="-INTEGER_FIELD-">Integer Field</option>'+
	'<option value="-DECIMAL_FIELD-">Decimal Field</option>'+
	'<option value="-CATEGORY_FIELD-">Compatibility Category</option>'+
	'</select>'+
	'</td>'+
	'</tr>'+
	'<tr>'+
	'<td class="listheader">Option Attribute</td>'+
	'<td class="listheader" nowrap>Additional Price / Attribute Value</td>'+
	'<td class="listheader">&nbsp;</td>'+
	'</tr>'+
	'</table>';
	row = table.insertRow(-1);
	cell = row.insertCell(0);
	cell.colSpan=2; cell.align='center'; setCSS(cell,'attlist'+totalatt.value%2); cell.style.padding = '0px 0px 20px 0px';
	cell.innerHTML =
	'<input type="button" value="Add Attribute" onClick="addOption('+totalatt.value+');">'+
	'<input type="hidden" name="extra_opt_total_'+totalatt.value+'" id="extra_opt_total_'+totalatt.value+'" value="0">';
	totalatt.value++;
}

function change2TextField(sel, index) {
	var obj = document.getElementById('extra_name_'+index+'_d');
	if(obj) {
		obj.value = sel.options[sel.selectedIndex].value;
	}
}

function deleteAttribute(att_index) {
	var table = document.getElementById('att_list');
	var totalatt = document.getElementById('extra_att_total');
	for(var i=att_index; i<totalatt.value-1; i++) {
		document.getElementById('extra_label_'+i).value = document.getElementById('extra_label_'+(i+1)).value;
		document.getElementById('extra_name_'+i+'_d').value = document.getElementById('extra_name_'+(i+1)+'_d').value;
		var totalopt = document.getElementById('extra_opt_total_'+i);
		var next_totalopt = document.getElementById('extra_opt_total_'+(i+1));
		if(totalopt.value < next_totalopt.value) {
			for(var j=totalopt.value; j<next_totalopt.value; j++) { addOption(i); }
		} else if(totalopt.value > next_totalopt.value) {
			for(var j=totalopt.value; j>next_totalopt.value; j--) { deleteOption(i,j-1); }
		}

		for(var j=0; j<totalopt.value; j++) {
			document.getElementById('extra_name_'+i+'_'+j).value = document.getElementById('extra_name_'+(i+1)+'_'+j).value;
			document.getElementById('extra_price_'+i+'_'+j).value = document.getElementById('extra_price_'+(i+1)+'_'+j).value;
		}
	}
	table.deleteRow(-1);
	table.deleteRow(-1);
	table.deleteRow(-1);
	totalatt.value--;
}

function addOption(att_index) {
	var table = document.getElementById('opt_list_'+att_index);
	var totalopt = document.getElementById('extra_opt_total_'+att_index);

	var row = table.insertRow(-1);
	var cell = row.insertCell(0);
	setCSS(cell,'listitem'+totalopt.value%2);  cell.align = 'left';
	cell.innerHTML = '<input type="text" name="extra_name_'+att_index+'_'+totalopt.value+'" id="extra_name_'+att_index+'_'+totalopt.value+'" value="" size="20">';
	cell = row.insertCell(1);
	setCSS(cell,'listitem'+totalopt.value%2); cell.noWrap = true;  cell.align = 'left';
	cell.innerHTML = moneysign+'<input type="text" name="extra_price_'+att_index+'_'+totalopt.value+'" id="extra_price_'+att_index+'_'+totalopt.value+'" value="0" size="5">';
	cell = row.insertCell(2);
	setCSS(cell,'listitem'+totalopt.value%2);  cell.align = 'left';
	cell.innerHTML = '<input type="button" value="Delete" onClick="deleteOption('+att_index+','+totalopt.value+');">';
	totalopt.value++;
}

function deleteOption(att_index, opt_index) {
	var table = document.getElementById('opt_list_'+att_index);
	var totalopt = document.getElementById('extra_opt_total_'+att_index);
	for(var i=opt_index; i<totalopt.value-1; i++) {
		document.getElementById('extra_name_'+att_index+'_'+i).value = document.getElementById('extra_name_'+att_index+'_'+(i+1)).value;
		document.getElementById('extra_price_'+att_index+'_'+i).value = document.getElementById('extra_price_'+att_index+'_'+(i+1)).value;
	}
	table.deleteRow(-1);
	totalopt.value--;
}


/*************** Main Control Functions ******************/

/*************** Description Control Functions ******************/
function deleteArtist(index) {
	var total = document.getElementById('_artist_total');
	var table = document.getElementById('artist_list');
	for(var i=index; i<total.value-1; i++ ){
		document.getElementById('_artist_'+i).value = document.getElementById('_artist_'+(i+1)).value;
	}
	table.deleteRow(-1);
	total.value--;
}

function addArtist() {
	var total = document.getElementById('_artist_total');
	var table = document.getElementById('artist_list');
	var row = table.insertRow(-1);
	var cell = row.insertCell(0);
	cell.innerHTML = '<input type="text" size="30"  name="_artist_'+total.value+'" id="_artist_'+total.value+'" value="">';
	cell = row.insertCell(1);
	cell.innerHTML = '<input type="button" value="Delete" onClick="deleteArtist('+total.value+')">';
	total.value++;
	return false;
}
/*************** Description Control Functions ******************/

/*************** Promotion Control Functions ******************/
function getSKU(objid) {
	var win = window.open('/cgi-bin/suppliers/index.cgi?empty=on&item=addProduct&objid='+objid,'AddProduct','width=500,height=400,scrollbars=yes,resizable=yes');
	win.focus();
}

function addProduct(objid, sku, brand, model) {
	var total = document.getElementById('_'+objid+'_total');
	var table = document.getElementById(objid+'_list');
	var row = table.insertRow(-1);
	var cell = row.insertCell(0);
	setCSS(cell,'listitem'+(total.value%2));
	cell.innerHTML = sku;
	cell = row.insertCell(1);
	setCSS(cell,'listitem'+(total.value%2));
	cell.innerHTML = brand;
	cell = row.insertCell(2);
	setCSS(cell,'listitem'+(total.value%2));
	cell.innerHTML = model;
	cell = row.insertCell(3);
	setCSS(cell,'listitem'+(total.value%2));
	cell.innerHTML = '<input type="button" value="Delete" onClick="removeProduct(\''+objid+'\','+total.value+')"><input type="hidden" name="_'+objid+'_'+total.value+'" id="_'+objid+'_'+total.value+'" value="'+sku+'">';
	total.value++;
	return false;
}

function removeProduct(objid, index) {
	var total = document.getElementById('_'+objid+'_total');
	var table = document.getElementById(objid+'_list');
	for(var i=index; i<total.value-1; i++ ){
		table.rows[i+1].cells[0].innerHTML = table.rows[i+2].cells[0].innerHTML;
		table.rows[i+1].cells[1].innerHTML = table.rows[i+2].cells[1].innerHTML;
		table.rows[i+1].cells[2].innerHTML = table.rows[i+2].cells[2].innerHTML;
		document.getElementById('_'+objid+'_'+i).value = document.getElementById('_'+objid+'_'+(i+1)).value;
	}
	table.deleteRow(total.value);
	total.value--;
}
/*************** Product Groups *******************/
function getPrdGrp() {
	var win = window.open('/cgi-bin/suppliers/index.cgi?empty=on&item=addProductGrp','AddPrdGrp','width=500,height=400,scrollbars=yes,resizable=yes');
	win.focus();
}

function addProductGrp( id, stripe, name, description) {
	var row,cell0,cell1;
	document.getElementById('itm_gp_id').value=id;
	var table = document.getElementById('productgrp');
	if ( table.rows.length < 2 ) {
		row = table.insertRow(-1);
		cell0 = row.insertCell(0);
		cell1 = row.insertCell(1);
		cell2 = row.insertCell(2);
	} else {
		row = table.rows[1];
		cell0 = row.cells[0];
		cell1 = row.cells[1];
		cell2 = row.cells[2];
	}
	setCSS(cell0,'listitem'+stripe);
	cell0.innerHTML = name;
	setCSS(cell1,'listitem'+stripe);
	cell1.innerHTML = description;
	setCSS(cell2,'listitem'+stripe);
	cell2.innerHTML = '<input type="button" value="Delete" onClick="removeProductGrp();"/>';
	return false;
}

function removeProductGrp() {
	document.getElementById('itm_gp_id').value='';
	var table = document.getElementById('productgrp');
	table.deleteRow(1);
	return true;
}

/*************** Product Job *******************/
function getItmJob() {
	var win = window.open('/cgi-bin/suppliers/index.cgi?empty=on&item=addItemJob','addItemJob','width=500,height=400,scrollbars=yes,resizable=yes');
	win.focus();
}

function addItmJob( id, code, name, description) {
	var row,cell0,cell1,cell2,cell3;
	document.getElementById('job_id').value=id;
	var table = document.getElementById('productjobtbl');
	if ( table.rows.length < 2 ) {
		row = table.insertRow(-1);
		cell0 = row.insertCell(0);
		cell1 = row.insertCell(1);
		cell2 = row.insertCell(2);
		cell3 = row.insertCell(3);
	} else {
		row = table.rows[1];
		cell0 = row.cells[0];
		cell1 = row.cells[1];
		cell2 = row.cells[2];
		cell3 = row.cells[3];
	}
	setCSS(cell0,'listitem0');
	cell0.innerHTML = code;
	setCSS(cell1,'listitem0');
	cell1.innerHTML = name;
	setCSS(cell2,'listitem0');
	cell2.innerHTML = description;
	setCSS(cell3,'listitem0');
	cell3.innerHTML = '<input type="button" value="Delete" onClick="removeItmJob();"/>';
	return false;
}

function removeItmJob() {
	document.getElementById('job_id').value='';
	var table = document.getElementById('productjobtbl');
	table.deleteRow(1);
	return true;
}


/*************** Promotion Control Functions ******************/

function getLocation(objid) {
	var win = window.open('/cgi-bin/suppliers/index.cgi?empty=on&item=addLoc&nb=1&fn=addLoc&objid='+objid,'addLoc','width=500,height=400,scrollbars=yes,resizable=yes');
	win.focus();
}

function addLoc(objid, loc_id, lref,wref,type) {
	var total = document.getElementById('_'+objid+'_total');
	var found=false;
	for(var i=0; i<total.value; i++) { if(document.itemForm['_'+objid+'_'+i].value==loc_id) { found=true;}}

	if(!found) {
		var table = document.getElementById(objid+'_list');
		var row = table.insertRow(-1);
		var cell = row.insertCell(0);
		setCSS(cell,'listitem'+(total.value%2)); cell.noWarp=true;
		cell.innerHTML = '<input type="text" name="_loc_pri_'+total.value+'" value="" size="2" maxlength="2"/>';
		cell = row.insertCell(1);
		setCSS(cell,'listitem'+(total.value%2));
		cell.innerHTML = lref+' <font class="small">('+wref+')</font>';
		cell = row.insertCell(2);
		setCSS(cell,'listitem'+(total.value%2)); cell.noWarp=true;
		cell.innerHTML = type;
		cell = row.insertCell(3);
		setCSS(cell,'listitem'+(total.value%2)); cell.noWarp=true;
		cell.innerHTML = '<input type="hidden" name="_loc_'+total.value+'" value="'+loc_id+'"/>'+
		'<select name="_loc_typ_'+total.value+'"><option value="">Temporary</option>'+
		'<option value="pick" selected>Pick</option>'+
		'<option value="bulk">Bulk</option></select>';
		cell = row.insertCell(4);
		setCSS(cell,'listitem'+(total.value%2)); cell.noWarp=true; cell.align='center';
		cell.innerHTML = '-';
		cell = row.insertCell(5);
		setCSS(cell,'listitem'+(total.value%2)); cell.noWarp=true
		cell.innerHTML = '<a class="tiny" href="javascript:gotoLoc(\''+loc_id+'\',\'adjust\');">Adjust</a> | '+
		'<a class="tiny" href="javascript:gotoLoc(\''+loc_id+'\',\'count\');">Stock Take</a>';
		total.value++;
	}
	return false;
}

function getParent(objid) {
	var win = window.open('/cgi-bin/suppliers/index.cgi?empty=on&item=addProduct&nb=1&fn=changeParent&objid='+objid,'changeParent','width=500,height=400,scrollbars=yes,resizable=yes');
	win.focus();
}

function changeParent(objid, sku, brand, model) {
	var obj = document.getElementById(objid);
	if(obj) { obj.value = sku; }
	return false;
}

function addBuild() {
	var total = document.getElementById('_build_total');
	var table = document.getElementById('build_list');
	var row = table.insertRow(-1);
	var cell = row.insertCell(-1);
	cell.vAlign = 'middle';  setCSS(cell,'listitem'+(total.value%2));
	cell.innerHTML = '<input type="number" name="_build_asm_'+total.value+'" id="_build_asm_'+total.value+'" value="1" size="5" min="0" onchange="changedQtyBuild('+total.value+')">';
	var cell = row.insertCell(-1);
	cell.vAlign = 'middle';  setCSS(cell,'listitem'+(total.value%2));
	cell.innerHTML = '<input type="number" name="_build_asmmin_'+total.value+'" id="_build_asmmin_'+total.value+'" value="1" size="5" min="0" onchange="changedMinBuild('+total.value+')">';
	var cell = row.insertCell(-1);
	cell.vAlign = 'middle';  setCSS(cell,'listitem'+(total.value%2));
	cell.innerHTML = '<input type="number" name="_build_asmmax_'+total.value+'" id="_build_asmmax_'+total.value+'" value="" size="5" min="0" onchange="changedMaxBuild('+total.value+')">';
	cell = row.insertCell(-1);
	cell.vAlign = 'middle';  setCSS(cell,'listitem'+(total.value%2));
	cell.innerHTML = '<input type="text" name="_build_'+total.value+'" id="_build_'+total.value+'" value="" size="20" onfocus="noClSe(\'shsku\')" onkeyup="shSe(\'shsku\','+total.value+')" onblur="clSe(\'shsku\',true)">';
	cell = row.insertCell(-1);
	cell.vAlign = 'middle';  setCSS(cell,'listitem'+(total.value%2));
	cell.id = 'buildname'+total.value;
	cell.innerHTML = '&nbsp;';
	cell = row.insertCell(-1);
	cell.vAlign = 'middle'; cell.noWarp=true;  setCSS(cell,'listitem'+(total.value%2));
	cell.innerHTML = '$<input type="text" name="_build_pr_'+total.value+'" id="_build_pr_'+total.value+'" value="" size="5">';
	var cell = row.insertCell(-1);
	cell.vAlign = 'middle';  setCSS(cell,'listitem'+(total.value%2));
	cell.innerHTML = '<input type="text" name="_build_group_'+total.value+'" id="_build_group_'+total.value+'" value="0" size="5">';
	cell = row.insertCell(-1);
	cell.align="center"; cell.vAlign = 'middle';  setCSS(cell,'listitem'+(total.value%2));
	cell.innerHTML = '<button class="btn btn-small" onClick="removeBuild('+total.value+'); return false;"><i class="icon-remove-sign"></i></button>';
	total.value++;
	updateBuildGroup();
	return false;
}

function changedQtyBuild(rownum) {
}

function changedMinBuild(rownum) {
}

function changedMaxBuild(rownum) {
	// when the value is empty string some browsers set it to '0' before setting to '1', therefore without this timeout the up/down arrows wont work (keeps overriding to empty string)
	setTimeout(function () {
		var $inp = $('input[name="_build_asmmax_'+rownum+'"]');
		if ($inp.val() == '0') { $inp.val('') }
	}, 100);
}

/* START BUNDLING GROUPS */

$(function() { updateBuildGroup(); });

function updateBuildGroup() {
	$('input[name^="_build_group"]').each(function(){
		var $inp = $(this);
		var inp_id = $inp.attr('id');
		var v = parseInt($inp.val()) || '0';
		//console.log('updateBuildGroup', v);
		var $select = $('<select></select>').attr({'name': $inp.attr('name'), 'class':'cp-product-build-group'});
		$select.append('<option value="0">(no group)</option>');
		if (v != "0") {
			$select.append($('<option>(...)</option>').attr('value', v));
		}
		$inp.after($select);
		$inp.remove();
		$select.attr({'id': $inp.attr('id')});
		$select.after($('<button class="btn btn-small btn-edit pull-right"><i class="icon-edit icon-small"></i></button>').click(editBuildGroup));
		$select.val(v).change(changedBuildGroup);
		$select.parent().find('.btn-edit')[parseInt(v)>0 ? 'show' : 'hide']();
	});
	refreshBuildGroups();
}

function refreshBuildGroups() {
	var $selects = $('.cp-product-build-group');
	var sortedids = [];
	var i;
	var groups = {};
	for (i=0; i<INVENTORY_BUNDLES_GROUP.length; ++i) {
		groups[INVENTORY_BUNDLES_GROUP[i].assemble_group_id] = INVENTORY_BUNDLES_GROUP[i];
	}
	$selects.each(function(){
		var v = $(this).val();
		if (v != "0" && sortedids.indexOf(v) == -1) {
			sortedids.push(v);
		}
	});
	sortedids.sort(function (a, b) {
		var an = (''+groups[a]['assemble_group_name']).toLowerCase();
		var bn = (''+groups[b]['assemble_group_name']).toLowerCase();
		//console.log('sortedids.sort', an, bn);
		return an > bn ? 1 : bn > an ? -1 : 0;
	});
	sortedids.push('new');
	for (i=0; i<INVENTORY_BUNDLES_GROUP.length; ++i) {
		var v = INVENTORY_BUNDLES_GROUP[i].assemble_group_id;
		if (sortedids.indexOf(v) == -1) {
			sortedids.push(v);
		}
	}
	$selects.each(function(){
		var v = $(this).val();
		$(this).find('option[value!="0"]').remove();
		for (i=0; i<sortedids.length; ++i) {
			var id = sortedids[i];
			//console.log('adding to select', $(this).attr('name'), id, groups[id]);
			var g = groups[id];
			if (id == 'new') {$(this).append($('<option value="spacer">-----</option>'))}
			if (!g) { g = {assemble_group_name:(id=='new' ? 'Create new group...' : 'Unknown '+id)} };
			$(this).append($('<option></option>').attr({value:id}).html(g.assemble_group_name));
			if (id == 'new') {$(this).append($('<option value="spacer">-----</option>'))}
		}
		$(this).val(v);
	});
}

function changedBuildGroup() {
	if ($(this).val() == 'new') {
		$.cpAjaxPopup({'tkn':'productmgr', 'fn':'bundle_groups', 'show-loading': true, 'param': { input_id: $(this).attr('name'), group_id: $(this).val() }, onCancel: cancelNewGroup, onComplete: submitNewGroup});
	} else {
		refreshBuildGroups();
	}
	$(this).parent().find('.btn-edit')[parseInt($(this).val())>0 ? 'show' : 'hide']();

}

function submitNewGroup($parent_ninput, rtndata) {
	//console.log('submitNewGroup', arguments);
}

function createdNewGroup(input_id, new_id) {
	//console.log('createdNewGroup', input_id, new_id, INVENTORY_BUNDLES_GROUP);
	$('select[name="'+input_id+'"]').append($('<option>...</option>').attr({value:new_id})).val(new_id);
	refreshBuildGroups();
	$('select[name="'+input_id+'"]').change();
}

function cancelNewGroup($parent_ninput) {
	//console.log('cancelNewGroup', $parent_ninput);
	var input_id = $parent_ninput.find('input[name="input_id"]').val();
	//console.log('cancelNewGroup setting ', $parent_ninput.find('input[name="input_id"]'));
	$('select[name="'+input_id+'"]').val('0');
}

function editBuildGroup() {
	var $select = $(this).parent().find('select');
	$.cpAjaxPopup({'tkn':'productmgr', 'fn':'bundle_groups', 'show-loading': true, 'param': { input_id: $select.attr('name'), group_id: $select.val() }, onCancel: cancelEditGroup});
	return false;
}

function cancelEditGroup($parent_ninput) {
}

function addBundlingPriceGroupMapping(mapfm, mapto) {
	var n = parseInt($('#count_bundlingPriceGroupMapping').val()) + 1;
	$('#count_bundlingPriceGroupMapping').val(n.toString());
	var $tr = $('<div class="bundling-price-group-mapping-item"><select name="pg_map'+n+'_fm" ref="pg_map'+n+'_fm"></select> &rarr; <select name="pg_map'+n+'_to" ref="pg_map'+n+'_to"></select> <button class="btn btn-small delete-group-mapping"><i class="icon-remove-sign"></button></div>');
	$tr.find('select').each(function() {
		$(this).append('<option value="">Choose one...</option>');
		for (var i=0; i<INVENTORY_PRICE_GROUPS.length; ++i) {
			var $opt = $('<option></option>').attr('value', INVENTORY_PRICE_GROUPS[i].group_id).text(INVENTORY_PRICE_GROUPS[i].group_name);
			if ($(this).attr('name').match(/fm$/) && mapfm==INVENTORY_PRICE_GROUPS[i].group_id) {
				$opt.prop('selected', true);
			}
			if ($(this).attr('name').match(/to$/) && mapto==INVENTORY_PRICE_GROUPS[i].group_id) {
				$opt.prop('selected', true);
			}
			$(this).append($opt);
		}
	});
	$tr.find('.delete-group-mapping').click(function() {
		$(this).closest('.bundling-price-group-mapping-item').slideUp('fast', function(){$(this).remove()});
		return false;
	});
	if (!mapfm) { $tr.hide(); }
	$('.bundling-price-group-mappings').append($tr);
	$tr.slideDown('fast');
}

function forcePopupDismiss(selector, infiniteLoopProtect) {
	if (!infiniteLoopProtect) infiniteLoopProtect = 0;
	if ($(selector).length > 0) {
		$(selector).closest('.nalert').remove();
	} else if (infiniteLoopProtect < 100) {
		//console.log('forcePopupDismiss: waiting for it to appear for killing!');
		setTimeout(forcePopupDismiss, 40, selector, infiniteLoopProtect+1);
	}
}

/* END BUNDLING GROUPS */

function removeBuild(index) {
	var total = document.getElementById('_build_total');
	var tnum = parseInt(total.value);
	var table = document.getElementById('build_list');
	for(var i=parseInt(index); i<tnum-1; i++ ){
		document.getElementById('buildname'+i).innerHTML = document.getElementById('buildname'+(i+1)).innerHTML;
		document.getElementById('_build_asm_'+i).value = document.getElementById('_build_asm_'+(i+1)).value;
		document.getElementById('_build_asmmin_'+i).value = document.getElementById('_build_asmmin_'+(i+1)).value;
		document.getElementById('_build_asmmax_'+i).value = document.getElementById('_build_asmmax_'+(i+1)).value;
		document.getElementById('_build_'+i).value = document.getElementById('_build_'+(i+1)).value;
		document.getElementById('_build_pr_'+i).value = document.getElementById('_build_pr_'+(i+1)).value;
		document.getElementById('_build_group_'+i).value = document.getElementById('_build_group_'+(i+1)).value;
	}
	var tmp = tnum - 1;
	var tr = $('#_build_'+tmp+'').closest('tr');
	tr.find('input').remove();
	tr.find('select').remove(); 
//	tr.find('button').remove(); 
	tr.hide();
	// There was a bug with Firefox here when removing the button elements!?
	// Whether through removing explicitly or through deleting the table row.
//	table.deleteRow(tnum);
	total.value = tmp;
}

function calGST(gst, isinc) {
	var inc_o = document.getElementById('gst_inc');
	var exc_o = document.getElementById('gst_exc');
	var tot_o = document.getElementById('gst_total');
	var inc = parseFloat(inc_o.value); if(isNaN(inc)) { inc= 0; }
	var exc = parseFloat(exc_o.value); if(isNaN(exc)) { exc= 0; }
	if(isinc) {
		exc = inc / gst;
		exc = Math.round(exc * 100) / 100;
		exc_o.value = exc;
	} else {
		inc = exc * gst;
		inc = Math.round(inc * 100) / 100;
		inc_o.value = inc;
	}
	var tot = Math.round((inc - exc)* 100) / 100;
	tot_o.value = tot;
}

function createNewVariation() {
	$.cpAjaxPopup({'tkn':'productmgr', 'fn':'create_variation', 'show-loading': true, 'param': { parent_sku: $('input[name="sku"]').val() }, onCancel: cancelNewVariation, onComplete: submitNewVariation})
}

function submitNewVariation() {
}

function cancelNewVariation() {
}

function checkCreateVariation() {
	//console.log('checkCreateVariation', arguments);
	return false;
}




function removeSpec(sku,itmspec_id,itmspecval_id,row_id){
	var f = document.itemForm;
	if(sku !="" && itmspec_id !="" && itmspecval_id !=""){

		$.cpSendAjax(
		{
			'fn' : "specs_mgr",
			'tkn' : "specs",
			'show-loading': true,
			'ajaxfn' : 'search',
			'soap-input': {'action':'delete_spec','sku':sku,'itmspec_id': itmspec_id,'itmspecval_id':itmspecval_id},
			'onSuccess': function(res, sts) {
				if(/<div style=\'display:none;\'>error<\/div>/.test(res['content'])){
					$.cpDialog({'title': res['title'], 'btn-cancel': 'Close','btn-okay': '',
					'content': res['content']});
				}else{
					$("tr#spec_"+row_id).hide();
				}

			},
			'onError': function(err,  txt) { }
		}
		);
	}




}


/**** SPECIFICS ****/

$(function(){
	var fm = $('FORM[name="'+$.escape_reserved("itemForm")+'"]');

	fm.find('input.nsearchinput[type="text"]').each(function() {

		if( !$(this).cpIsInited('search-input') ) {

			var selid = $(this).prop('id');

			/* And nowrap span to fix issue for icons going to the next line*/
			var nsp = $('<div class="cp-searchinput-wrapper" style="white-space:nowrap; display: inline-block"></div>').insertAfter($(this));
			nsp.append($(this));
			nsp.addClass($(this).attr('class'));

			if($.isEmpty(selid)) {
				selid = $(this).prop('name');

				if(!$.isEmpty(selid)) {
					$(this).prop('id',selid);
				}
			}
			if(!$.isEmpty(selid)) {

				$(this).after('<a class="nsearchinput-lnk" cp-search-id="'+selid+'" href="javascript:void(0);"><i class="icon-search"></i></a>');
				$(this).after('<div class="nsearchinput-pl" cp-search-id="'+selid+'"></div>');

				var nd = $('div.'+$.escape_reserved('nsearchinput-pl')+'[cp-search-id="'+$.escape_reserved(selid)+'"]');


				//add attribute 'cp-popup-width' to set width of the popup. // cp-popup-width = '300'
				var pwidth = '';
				if(typeof($(this).attr('cp-popup-width')) != 'undefined'){
					pwidth = $(this).attr('cp-popup-width');
				}


				nd.hide().css({'position': 'absolute','z-index':'10000'});

				var nl = $('a.'+$.escape_reserved('nsearchinput-lnk')+'[cp-search-id="'+$.escape_reserved(selid)+'"]');
				var padding = 4;
				nl.css({'margin-left': ((0-padding)-20)+'px'});

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

	$.cpAddSetValueFn({
		setSpecs : function (obj, vals) {
			$("#spec_value").val("");
			for(var i=0; i<vals.length ; i++) {
				var row = $.soap_input_opt(vals[i], {
					'id' : '',
					'name' : ''
				});
				if(row['id']){
					$("#spec_name").val(row['name']);
					$("#spec_value").trigger("focus");
				}
			}

		},
		setSpecsVal : function (obj, vals) {
			for(var i=0; i<vals.length; i++) {
				var row = $.soap_input_opt(vals[i], {
					'id' : '',
					'name' : ''
				});
				if(row['id']){
					$("#spec_value").val(row['name']);

				}
			}

		}
	});


	$("#add_spec").click(function(){
		var f = document.itemForm;
		var spec_name = f['spec_name'].value;
		var spec_value = f['spec_value'].value;
		var sku = f['sku'].value;
		var spec_total = f['spec_total'].value;
		if(spec_value !="" && spec_value !=""){
			$.cpSendAjax(
			{
				'fn' : "specs_mgr",
				'tkn' : "specs",
				'show-loading': true,
				'ajaxfn' : 'search',
				'soap-input': {'action':'add_spec','sku':sku,'spec_name': spec_name,'spec_value':spec_value,'spec_total':spec_total},
				'onSuccess': function(res, sts) {

					if(/<div style=\'display:none;\'>error<\/div>/.test(res['content'])){
						$.cpDialog({'title': res['title'], 'btn-cancel': 'Close','btn-okay': '',
						'content': res['content']});
					}else{
						$("#lsspeclist").append(res['content']);
						f['spec_total'].value = parseInt(f['spec_total'].value) + 1;
						f['spec_name'].value='';
						f['spec_value'].value='';

					}

				},
				'onError': function(err,  txt) { }
			}
			);
		}
	});
});

