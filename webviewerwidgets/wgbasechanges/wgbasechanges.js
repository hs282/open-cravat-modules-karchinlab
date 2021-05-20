var widgetName = 'basechanges';
widgetGenerators[widgetName] = {
	'info': {
		'name': 'Base Changes',
		'width': 600, 
		'height': 380, 
		'function': function (div) {
			if (div != null) {
				emptyElement(div);
            }
            div.style.width = 'calc(100% - 37px)';
			var chartDiv = getEl('canvas');
			chartDiv.style.width = 'calc(100% - 20px)';
			chartDiv.style.height = 'calc(100% - 20px)';
			addEl(div, chartDiv);
            var d = infomgr.getData('variant'); 
            account = 0;
            agcount = 0;
            gacount = 0;
            cacount = 0;
            tacount = 0;
            gccount = 0;
            cgcount = 0;
            tgcount = 0;
            atcount = 0;
            gtcount = 0;
            ctcount = 0;
            tccount = 0;
			for (var i = 0; i < d.length; i++) {
				var row = d[i]; 
                var refs = getWidgetData('variant', 'base', row, 'ref_base');
                var alts = getWidgetData('variant', 'base', row, 'alt_base');
                for (var j = 0; j < refs.length; j++) {
                    var ref = refs[j];
                    for (var k = 0; k < alts.length; k++){
                        alt = alts[k];
                        if (ref == 'A' && alt == 'G'){
                            agcount = agcount +1;
                        }else if (ref == 'G' && alt == 'A'){
                            gacount = gacount + 1;
                        }else if (ref == 'C' && alt == 'A'){
                            cacount = cacount + 1
                        }else if (ref == 'T' && alt == 'A'){
                            tacount = tacount + 1;
                        }else if (ref == 'A' && alt == 'C'){
                            account = account + 1;
                        }else if (ref == 'G' && alt == 'C'){
                            gccount = gccount + 1;
                        }else if (ref == 'C' && alt == 'G'){
                            cgcount = cgcount + 1
                        }else if (ref == 'T' && alt == 'G'){
                            tgcount = tgcount + 1;
                        }else if (ref == 'A' && alt == 'T'){
                            atcount = atcount + 1
                        }else if (ref == 'G' && alt == 'T'){
                            gtcount = gtcount + 1;
                        }else if (ref == 'C' && alt == 'T'){
                            ctcount = ctcount + 1 
                        }else if (ref == 'T' && alt == 'C'){
                            tccount = tccount + 1;
                        }
                    }
                }
            }
            one = [];
            two = [];
            three = [];
            one.push(agcount, gacount, cacount, tacount);
            two.push(account, gccount, cgcount, tgcount);
            three.push(atcount, gtcount, ctcount, tccount);
			var chart = new Chart(chartDiv, {
				type: 'bar',
				data: {
                    labels: ["A", 'G', 'C', 'T'],
                    datasets: [
                        {  
                            backgroundColor: [
                                '#FDDBC7',
                                '#D1E5F0',
                                '#D1E5F0',
                                '#D1E5F0'
                            ],
                            data: one,
                        },
                        {
                            backgroundColor: [
                                '#4393C3',
                                '#4393C3',
                                '#FDDBC7',
                                '#FDDBC7'
                            ],
                            data: two,
                        },
                        {
                            backgroundColor: [
                                '#D6604D',
                                '#D6604D',
                                '#D6604D',
                                '#4393C3'
                            ],
                            data: three,
                        },
                    ]
                },options: {
                    legend: {
                        display: true,
                        labels: {
                                generateLabels: function(chart) {
                                   var labels = chart.data.labels;
                                   var dataset = chart.data.datasets[0];
                                   var colors = ["#D1E5F0", "#FDDBC7", '#4393C3', "#D6604D"];
                                   var legend = labels.map(function(label, index) {
                                      return {
                                         datasetIndex: 0,
                                         fillStyle: colors[index],
                                         strokeStyle: dataset.borderColor && dataset.borderColor[index],
                                         lineWidth: dataset.borderWidth,
                                         text: label
                                      }
                                   });
                                   return legend;
                                }
                        },
                        position: 'right',
                    },
					responsive: true,
                    responsiveAnimationDuration: 500,
                    maintainAspectRatio: false,
					scales: {
						xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Reference Base',
                            },
                        }],
						yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Frequency of Alternative Base',
                            },
						}]
                    },
				},
            });
        }
    }
}
