function TopMenu(name) {
	this.name = name;
	
	this.open = function (bindex) {
		var i=0;
		var menuhead = document.getElementById(this.name+'_head_'+i);
		while(menuhead) {
			var menubody = document.getElementById(this.name+'_body_'+i);
			if(i==bindex) {
				setCSS(menuhead,'main_open')
				var obj = document.getElementById(this.name+'_sp_'+i);
				if(obj) { obj.innerHTML = '&nbsp;'; }
				obj = document.getElementById(this.name+'_sp_'+(i+1));
				if(obj) { obj.innerHTML = '&nbsp;'; }
				if(menubody) {
					this.show(menubody);
				}
			} else {
				setCSS(menuhead,'main')
				var obj = document.getElementById(this.name+'_sp_'+i);
				if(obj && bindex+1!=i) { obj.innerHTML = '|'; }
				obj = document.getElementById(this.name+'_sp_'+(i+1));
				if(obj) { obj.innerHTML = '|'; }
				if(menubody) {
					this.hide(menubody);
				}
			}
			
			i++;
			menuhead = document.getElementById(this.name+'_head_'+i);
		}
	}
	
	
	this.show = function (menubody) {
		menubody.style.display = 'block';
	}

	this.hide = function (menubody) {
		menubody.style.display = 'none';
	}
}