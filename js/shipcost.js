/** shipping cost popup functions **/
function get_shcost(url) {
	var zip = document.getElementById('zip');
	if(zip) { popup(url+'&ship_zip='+zip.value); }
}

function set_shcost(cost) {
	var obj = document.getElementById('shcost');
	if(obj) { obj.innerHTML = cost; }
}
