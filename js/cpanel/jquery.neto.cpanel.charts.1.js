/* CHARTS */
(function($) {
	$.extend({		
		create_pie_chart: function (div, graphname, tp, chartdata){
			var fn = 'graphs';
			var nodatamessage = '<div class="pienodatamess">No Data To Display</div>';
			$.show_div_loading(div);
			if (graphname) {
				var proc='getChartData';
				if(tp=='ds') {
					proc='getSpanelData';
				}
				
				if (chartdata instanceof Object) {
					for(var i=0; i<chartdata['series'].length; i++)
						chartdata['series'][i]['y'] = parseInt(chartdata['series'][i]['y']);
					$.remove_div_loading(div);
					if (chartdata['series'].length > 0)
						$.render_pie_chart(div, chartdata);	
					else
						$('#'+div).html(nodatamessage);
				}
				else {
					$.do_ajax(
						fn,
						{'tkn': 'ajax', 'proc': proc, 'graphname': graphname},
						true,
						tp,
						{
							'SUCCESS': {
								'def' : {},
								'fn' : function (code, data) {							
									for(var i=0; i<data['series'].length; i++)
										data['series'][i]['y'] = parseInt(data['series'][i]['y']);
									$.remove_div_loading(div);
									if (data['series'].length > 0) {
										$.render_pie_chart(div, data);	
									}
									else {
										$('#'+div).html(nodatamessage);
									}
								}
							},
							'FAIL': {
								'def' : { 'msg': '' },
								'fn' : function (code, data) {
									if(data['msg']) {
										var msg = $.parse_ntemplate(data['msg']);
										$.remove_div_loading(div);
									}
								}
							},
							'ERROR' : { 
								'def' : { 'response': '' },
								'fn' : function (code, data) {	
									$.remove_div_loading(div);
								}
							}
						});
				}
			}
		},
		
	
		render_pie_chart: function (div, graphdata) {
			var chart = new Highcharts.Chart({
				chart: {
					renderTo: div,
					height: 250, 
					plotBackgroundColor: null,
					plotBorderWidth: null,
					plotShadow: false,
					backgroundColor: "#F7F7F7"
				},
				title: {
					text: null
				},
				credits: {
					enabled: true,
					text: 'Click here to refresh',
					href: 'javascript:$.create_pie_chart("'+div+'", "'+graphdata['chartname']+'")',
					cursor: 'pointer'
				},
				tooltip: {
					formatter: function() {
						return '<b>'+ this.point.name +'</b>: '+ this.y;
					}
				},
				plotOptions: {
					pie: {
						allowPointSelect: true,
						cursor: 'pointer',
						point: {
							events: {
								click: function() {
									location.href = this.options.url;
								}
							}
						},
						dataLabels: {
							enabled: true,
							color: '#000000',
							connectorColor: '#000000',
							formatter: function() {
								return '<b>'+ this.point.name +'</b>: '+ this.y;
							}
						}
					}
				},
				series: [{
					type: 'pie',
					name: div,
					data: graphdata['series']
				}]
			});
		},
		
		create_bar_chart: function (div, graphname, tp, chartdata){
			var fn = 'graphs';
			var nodatamessage = '<div class="barnodatamess">No Data To Display</div>';
			$.show_div_loading(div);
			if (graphname) {
				var proc='getChartData';
				if(tp=='ds') {
					proc='getSpanelData';
				}
				
				if (chartdata instanceof Object) {
					for(var i=0; i<chartdata['series'].length; i++) 
						chartdata['series'][i]['y'] = parseInt(chartdata['series'][i]['y']);
					$.remove_div_loading(div);
					if (chartdata['series'].length > 0) {
						$.render_bar_chart(div, chartdata);	
					}
					else {
						$('#'+div).html(nodatamessage);
					}
				}
				else {
					$.do_ajax(
						fn,
						{'tkn': 'ajax', 'proc': proc , 'graphname': graphname},
						true,
						tp,
						{
							'SUCCESS': {
								'def' : {},
								'fn' : function (code, data) {							
									for(var i=0; i<data['series'].length; i++) 
										data['series'][i]['y'] = parseInt(data['series'][i]['y']);
									$.remove_div_loading(div);
									if (data['series'].length > 0) {
										$.render_bar_chart(div, data);	
									}
									else {
										$('#'+div).html(nodatamessage);
									}
								}
							},
							'FAIL': {
								'def' : { 'msg': '' },
								'fn' : function (code, data) {
									if(data['msg']) {
										var msg = $.parse_ntemplate(data['msg']);
										$.remove_div_loading(div);
									}
								}
							},
							'ERROR' : { 
								'def' : { 'response': '' },
								'fn' : function (code, data) {	
									$.remove_div_loading(div);
								}
							}
						});
				}
			}
		},
		
		render_bar_chart: function (div, graphdata) {
			var chart = new Highcharts.Chart({
				chart: {
					renderTo: div,
					width: graphdata['width'],
					height: graphdata['height'],
					defaultSeriesType: 'bar',
					ignoreHiddenSeries: false,
					backgroundColor: "#F7F7F7"
				},
				title: {
					text: null
				},
				legend: {
					enabled: false
				},
				credits: {
					enabled: true,
					text: 'Click here to refresh',
					href: 'javascript:$.create_bar_chart("'+div+'", "'+graphdata['chartname']+'")',
					cursor: 'pointer'
				},
				tooltip: {
					formatter: function() {
						return '<b>'+ this.point.name +'</b>: '+ this.y;
					}
				},
				plotOptions: {
					bar: {
						cursor: 'pointer',
						groupPadding: 0,
						dataLabels: {
							enabled: false
						},
						point: {
							events: {
								click: function() {
									location.href = this.options.url;
								}
							}
						}
					}	
				},
				xAxis: {
					categories: graphdata['xaxis'],
				 	title: {
						text: null
				 	}
				},
				yAxis: {
					/*min: 0,*/
					title: {
						text: 'Sale Count',
						align: 'high'
			 		}
				},
				series: [{
					data: graphdata['series'] 
				}]
			});
		},
		
		create_column_chart: function (div, graphname, tp, chartdata){
			var fn = 'graphs';
			var nodatamessage = '<div class="columnnodatamess">No Data To Display</div>';
			$.show_div_loading(div);
			if (graphname) {
				var proc='getChartData';
				if(tp=='ds') {
					proc='getSpanelData';
				}
				
				if (chartdata instanceof Object) {
					for(var i=0; i<chartdata['series'].length; i++) 
						for(var j=0; j<chartdata['series'][i]['data'].length; j++) 
							if (chartdata['series'][i]['data'][j] instanceof Object) {
								chartdata['series'][i]['data'][j]['y'] = parseInt(chartdata['series'][i]['data'][j]['y']);
							}
							else {
								chartdata['series'][i]['data'][j] = parseInt(chartdata['series'][i]['data'][j]);
							}
					$.remove_div_loading(div);
					if (chartdata['series'].length > 0) {
						$.render_column_chart(div, chartdata);	
					}
					else {
						$('#'+div).html(nodatamessage);
					}
				}
				else {
					$.do_ajax(
						fn,
						{'tkn': 'ajax', 'proc': proc , 'graphname': graphname},
						true,
						tp,
						{
							'SUCCESS': {
								'def' : {},
								'fn' : function (code, data) {			
									for(var i=0; i<data['series'].length; i++) 
										for(var j=0; j<data['series'][i]['data'].length; j++) 
											if (data['series'][i]['data'][j] instanceof Object) {
												data['series'][i]['data'][j]['y'] = parseInt(data['series'][i]['data'][j]['y']);
											}
											else {
												data['series'][i]['data'][j] = parseInt(data['series'][i]['data'][j]);
											}
									$.remove_div_loading(div);
									if (data['series'].length > 0) {
										$.render_column_chart(div, data);	
									}
									else {
										$('#'+div).html(nodatamessage);
									}
								}
							},
							'FAIL': {
								'def' : { 'msg': '' },
								'fn' : function (code, data) {
									if(data['msg']) {
										var msg = $.parse_ntemplate(data['msg']);
										$.remove_div_loading(div);
									}
								}
							},
							'ERROR' : { 
								'def' : { 'response': '' },
								'fn' : function (code, data) {	
									$.remove_div_loading(div);
								}
							}
						});
				}
			}
		},
	
		render_column_chart : function (div, data) {
			var chart;
			chart = new Highcharts.Chart({
						chart: {
				 			renderTo: div,
							width: data['width'],
							height: data['height'], 
				defaultSeriesType: 'column',
				backgroundColor: "#F7F7F7"					
		 	 		},
						title: {
					 			text: null
		 	 		},
		 			plotOptions: {
				column: {
					cursor: 'pointer',
					groupPadding: 0.1,
					pointPadding: 0,
					dataLabels: {
						enabled: false
					},
					point: {
									events: {
											click: function() {
												location.href = this.options.url;
												}
				 					}
								}
				}
			},
			credits: {
																				enabled: true,
																				text: 'Click here to refresh',
																				href: 'javascript:$.create_column_chart("'+div+'", "'+data['chartname']+'")',
																				cursor: 'pointer'
												},
		 	 		subtitle: {
		 		 			text: null
			 		},
			 		xAxis: [ data['xdata']	],
			 		yAxis: [{ // Primary yAxis
					 		labels: {
										formatter: function() {
								 				if (data['ylabel'] == 'Dollars') { 
									 				return '$'+this.value;
								 			}
								 			else {
								 	 			return this.value;
								 			}
										},
										style: {
								 				fontFamily: 'Arial',
								 				color: '#000000'
										}
					 		},
					 		title: {
										text: data['ylabel'],
										style: {
								 				fontFamily: 'Arial',
								 				color: '#000000'
										}
					 		}
						}],
						tooltip: {
					 		formatter: function() {
										if (data['ylabel'] == 'Dollars') { 
										return '$'+this.y;
									}
									else {
										return this.y;
									}
					 		}
						},
						series: data['series']
		 	});

		var series = chart.series;
		for (var i = 0; i < series.length; i++){
					 		if (series[i].name == 'Shipping Income'){
															 series[i].hide();
									} 
					 	}		 
	 	} 
	
	});
})(jQuery);

/* END CHARTS */
