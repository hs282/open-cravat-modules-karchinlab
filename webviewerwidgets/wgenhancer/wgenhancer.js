widgetGenerators['enhancer'] = {
	'info': {
		'name': 'Most Frequenty Mutated Enhancers',
		'width': 380, 
		'height': 380, 
		'callserver': true,
        'default_hidden': false,
        'variables': {},
        'init': function (data) {
            this['variables']['data'] = data;
        },
        'shoulddraw': function () {
            if (this['variables']['data'] == null) {
                return false;
            } else {
                return true;
            }
        },
		'function': function (div, dummy) {
			if (div != null) {
				emptyElement(div);
			}
			div.style.width = 'calc(100% - 37px)';
			var chartDiv = getEl('canvas');
			chartDiv.style.width = 'calc(100% - 20px)';
			chartDiv.style.height = 'calc(100% - 20px)';
			addEl(div, chartDiv);
			var x = [];
			var y = [];
			var hugos = [];
			var data = this['variables']['data'];
            for (var i = 0; i < data.length; i++) {
				var row = data[i];
				var full = row[0].split(':');
				var gid = full[0];
				var hugo = full[1];
				x.push(gid);
				hugos.push(hugo);
				y.push(row[1]);
			}

			var chart = new Chart(chartDiv, {
				type: 'horizontalBar',
				data: {
					labels: x,
					datasets: [
						{
							data: y,
							borderColor: '#000000',
							borderWidth: 0.7,
							hoverBorderColor: '#aaaaaa',
							backgroundColor: '#69a3ef'
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					legend: {display: false},
					scales: {
						xAxes: [{
							scaleLabel: {
								display: true,
								labelString: '% of Bases Impacted',
							},
							ticks: {
								beginAtZero: true,
							}
						}],	
					},
					onClick:function(e){
						var activePoints = chart.getElementsAtEvent(e);
						var gid = activePoints[0]._model.label;
						var selectedIndex = activePoints[0]._index;
						var gene = hugos[selectedIndex];
						window.open('https://www.genecards.org/cgi-bin/carddisp.pl?gene=' + gene + '&keywords=' + gid)
					},
		
					tooltips: {
						callbacks: {
							label: function(tooltipItem, data) {
								var text = 'Click for more information';
								var label = data.datasets[tooltipItem.datasetIndex].label || '';
			
								if (label) {
									label += ': ';
								}
								label += Math.round(tooltipItem.xLabel * 100) / 100;
								label += '%';
								return [label, text];
							}
						},
						backgroundColor: '#ffffff',
						displayColors: false,
						titleFontColor: '#000000',
						titleFontStyle: 'normal',
						bodyFontColor: '#000000',
						borderColor: '#333333',
						borderWidth: 1, 
					}
				}
			});
		}
	}
}
	

