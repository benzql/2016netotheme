function parseCDate(date, ref) {
	var d;
	if(!ref) { d = new Date(); } 
	else { d=ref }

	switch(date.toUpperCase()) {
		case '': 
		case '--': 
		case '0000-0-0': 
		case '0000-00-00': 
		case 'TODAY': return new Date(d.getFullYear(), d.getMonth(), d.getDate());
		case 'FDW': return new Date(d.getFullYear(), d.getMonth(), d.getDate()-d.getDay());
		case 'LDW': return new Date(d.getFullYear(), d.getMonth(), d.getDate()+6-d.getDay());
		case 'FDM': return new Date(d.getFullYear(), d.getMonth(), 1);
		case 'LDM': return new Date(d.getFullYear(), d.getMonth()+1, 0);
		case 'FDY': return new Date(d.getFullYear(), 0, 1);
		case 'LDY': return new Date(d.getFullYear(), 12, 0);
		case 'FDFY': return new Date(d.getFullYear()-(d.getMonth()>5?0:1), 6, 1);
		case 'LDFY': return new Date(d.getFullYear()+(d.getMonth()>5?1:0), 6, 0);
		default:
			var yr=d.getFullYear(); var mo=1; var da=1;
			var tk = date.split(' ',2); 
			if(tk.length>0) {
				var tk = date.split('-',3);
				if(tk[0]=='') {} else if(tk[0].indexOf('0') == 0) { tk[0]=tk[0].substring(1); }
				if(tk[1]=='') {} else if(tk[1].indexOf('0') == 0) { tk[1]=tk[1].substring(1); }
				if(tk[2]=='') {} else if(tk[2].indexOf('0') == 0) { tk[2]=tk[2].substring(1); }
				if(tk[0]) {var t = parseInt(tk[0]); if(!isNaN(t)){ if(t<100) { yr=t+(Math.floor(yr/100)*100); } else if(t<1000) { yr=t+(Math.floor(yr/1000)*1000); } else { yr=t; } }}
				if(tk[1]) {var t = parseInt(tk[1]); if(!isNaN(t)){mo = t-1;}}
				if(tk[2]) {var t = parseInt(tk[2]); if(!isNaN(t)){da = t;}}
			}
			return new Date(yr, mo, da);
	}
}

function cmpDate(d1, d2) {
	if(d1.getFullYear()==d2.getFullYear() && d1.getMonth()==d2.getMonth() && d1.getDate()==d2.getDate()) { return 0; }
	else if(d1.getFullYear()>d2.getFullYear() || (d1.getFullYear()==d2.getFullYear() && d1.getMonth()>d2.getMonth()) ||
		(d1.getFullYear()==d2.getFullYear() && d1.getMonth()==d2.getMonth() && d1.getDate()>d2.getDate())) { return 1;}
	return -1;
}

function getCDate(id,def,fc) {
	var obj,objm,objd, ymd=false;
	
	if(id instanceof Array) {
		if(id[0]) { obj = document.getElementById(id[0]); }
		if(id[1]) { objm = document.getElementById(id[1]); }
		if(id[2]) { objd = document.getElementById(id[2]); }
		ymd=true;
	} else {
		obj = document.getElementById(id);
	}
	
	if(obj) {
		if(!def) { def='TODAY'; }
		var w = window.open('','CDateWindow','height=250,width=250,top='+((screen.height - 240)/2)+',left='+((screen.width - 244)/2)+',resizable=no,toolbar=no,status=no,menubar=no,scrollbars=no,directories=no');
		var da = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
		var mon = ['January', 'February', 'March', 'April', 'May', 'June', 'July','August', 'September', 'October', 'November', 'December'];
		var odate;
		if(ymd) {
			if(obj.value == '' && objm.value == '' && objd.value=='') {
				odate = obj.value;
			} else {
				odate = obj.value+'-'+objm.value+'-'+objd.value;
			}
		} else {
			odate = obj.value;
		}
		var od = parseCDate(odate);
		var cd = parseCDate(fc || odate==''?def: odate);
		var html = 
'<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">'+
'<html><head>'+
'<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">'+
'<title>Date</title>'+
'<link rel="stylesheet" type="text/css" href="'+getHost()+'/assets/calendar/calender.css">'+
'%3Cscript language="javascript" type="text/javascript"%3E';
		if(ymd) {
			html += 
'function postback(v) { var p=window.opener; if(p){ if(p.setCDateYMD) { p.setCDateYMD(%27'+obj.id+'%27,%27'+(objm?objm.id : '')+'%27,%27'+(objd?objd.id : '')+'%27,v); } } this.close(); } '+
'function gotodate(y,m,d) { var p=window.opener; if(p){ if(p.getCDateYMD) { p.getCDateYMD(%27'+obj.id+'%27,%27'+(objm?objm.id : '')+'%27,%27'+(objd?objd.id : '')+'%27,y+%27-%27+m+%27-%27+d,true); } } } ';
		} else {
			html += 
'function postback(v) { var p=window.opener; if(p){ if(p.setCDate) { p.setCDate(%27'+obj.id+'%27,v); } } this.close(); } '+
'function gotodate(y,m,d) { var p=window.opener; if(p){ if(p.getCDate) { p.getCDate(%27'+obj.id+'%27,y+%27-%27+m+%27-%27+d,true); } } } ';
		}
		html += 
'%3C/script%3E'+
'</head>'+
'<body>'+
'<table class="catbl" width="245px" border="0" cellspacing="4" cellpadding="4" align="center">'+
'<tr><td class="cattl" colspan="'+da.length+'"><table width="100%" border="0" cellspacing="0" cellpadding="0"><tr>'+
	'<td width="1%"><a href="javascript:gotodate('+(cd.getFullYear()-(cd.getMonth()==0? 1:0))+','+(cd.getMonth()==0? 12:cd.getMonth())+',1);"><img src="'+getHost()+'/assets/calendar/callarrow.gif"></a></td>'+
	'<td align="center">'+mon[cd.getMonth()]+' '+cd.getFullYear()+'</td>'+
	'<td width="1%"><a href="javascript:gotodate('+cd.getFullYear()+','+(cd.getMonth()+2)+',1);"><img src="'+getHost()+'/assets/calendar/calrarrow.gif"></a></td>'+
	'</tr></table></td></tr>';
		html += '<tr>';
		for(var i=0; i<da.length;i++) { html += '<td class="cahdr">'+da[i]+'</td>'; }
		html += '</tr>';
	
		var done = false;
		var fd = parseCDate('FDM',cd);
		var ld = parseCDate('LDM',cd);
		var td = parseCDate('TODAY');
		var xd = (fd.getDay()==0? new Date(fd.getFullYear(),fd.getMonth(),fd.getDate()) : parseCDate('FDW',fd));
		var wk=0;
		while(!done) {
			html += '<tr>';
			for(var i=0; i<da.length;i++) {
				var st=''; var out=false;
				if(cmpDate(xd,fd)<0 || cmpDate(xd,ld)>0) { out=true;st='daoutrange'; } else { st='dainrange'; }
				if(obj.value!='' && cmpDate(xd,od)==0) { st +=' dacurrent'; } else if(cmpDate(xd,td)==0) { st +=' datoday'; } else if(!out && cmpDate(xd,td)<0) { st +=' dapasted'; }
				if(!out && i==0) { st +=' daholiday'; }
				html += '<td class="'+st+'"><a href="javascript:postback(%27'+xd.getFullYear()+'-'+(xd.getMonth()+1)+'-'+xd.getDate()+'%27)">'+xd.getDate()+'</a></td>';
				xd.setDate(xd.getDate()+1);
				if(cmpDate(xd,ld)>0) { done = true; }
			}
			html += '</tr>';
			wk++;
		}		
		for(var i=wk; i<=5; i++) { html += '<tr><td colspan="'+da.length+'">&nbsp;</td></tr>'; }
		html += '</table>'+
		'<table class="catbl" width="245px" border="0" cellspacing="4" cellpadding="4" align="center"><tr><td>'+
		'<select onChange="if(this.selectedIndex>0) postback(this.options[this.selectedIndex].value);">'+
		'<option value="">More Date...</option>'+
		'<option value="">Set date to empty</option>'+
		'<option value="TODAY">Today</option>'+
		'<option value="FDW">First day of current week</option>'+
		'<option value="LDW">Last day of current week</option>'+
		'<option value="FDM">First day of current month</option>'+
		'<option value="LDM">Last day of current month</option>'+
		'<option value="FDY">First day of current year</option>'+
		'<option value="LDY">Last day of current year</option>'+
		'<option value="FDFY">First day of current financial year</option>'+
		'<option value="LDFY">Last day of current financial year</option>'+
		'</select>'
		'</td></tr></table>'+
		'</body>';
		
		w.document.write(unescape(html));
		w.document.close();
		w.focus();
	}
}

function getCDateYMD(idy,idm,idd,def,fc) {
	getCDate(new Array(idy,idm,idd),def,fc);
}

function setCDate(id,date) {
	var obj = document.getElementById(id);
	if(obj) {
		if(date != '') { var d= parseCDate(date); date =d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
		obj.value= date;
		obj.focus();
		if(obj.select) {obj.select();}
	}
}

function setCDateYMD(idy,idm,idd,date) {
	var objy = document.getElementById(idy);
	var objm = document.getElementById(idm);
	var objd = document.getElementById(idd);
	if(date != '') { 
		var d= parseCDate(date);
		if(objy) { objy.value= d.getFullYear(); }
		if(objm) { objm.value= (d.getMonth()+1); }
		if(objd) { objd.value= d.getDate(); }
	} else {
		if(objy) { objy.value=''; }
		if(objm) { objm.value=''; }
		if(objd) { objd.value=''; }
	}
}
