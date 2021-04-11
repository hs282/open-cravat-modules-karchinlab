widgetGenerators['sosamplesummary'] = {
	'info': {
		'name': 'Sequence Ontology by Sample',
		'width': 880, 
		'height': 380, 
		'callserver': true,
        'variables': {},
        'init': function (data) {
            this['variables']['data'] = data;
        },
        'shoulddraw': function () {
            var data = this['variables']['data'];
            if (data == null || data.samples.length == 0) {
                return false;
            } else {
                if (data['samples'].length > 20) {
                    return false;
                } else {
                    return true;
                }
            }
        },
        'beforeresize': function () {
            var contentDiv = this['variables']['div'];
            $(contentDiv).empty();
            contentDiv.style.width = '0px';
            contentDiv.style.height = '0px';
        },
        'onresize': function () {
            var v = this['variables'];
            this['function'](v['div'], v['data']);
        },
		'function': function (div, data) {
			var colorPalette = {
				'Frameshift insertion':'#ff0000', // red
				'Frameshift deletion':'#dc143c', // crimson
				'Stopgain':'#ff4500', // orange red
				'Stoploss':'#ffa500', // orange
				'Missense':'#ffd700', // gold
				'Inframe insertion':'#d2691e', // chocolate
				'Inframe deletion':'#8b4513', // saddle brown
				'Splice site':'#adff2f', // green yellow
				'2k upstream':'#7fffd4', // aqua marine
				'2k downstream':'#00ced1', // dark turquoise
				'3\' UTR':'#00bfff', // deep sky blue
				'5\' UTR':'#ffff00', // yellow
				'Complex substitution':'#0000ff', // blue
				'Synonymous':'#00ff00', // lime
				'Intron':'#00ffff', // aqua
				'Unknown':'#000080', // navy
				'Intergenic':'#008080', // teal
				'frameshift_elongation':'#ff0000', // red
				'frameshift_truncation':'#dc143c', // crimson
				'stop_gained':'#ff4500', // orange red
				'stop_lost':'#ffa500', // orange
				'missense_variant':'#ffd700', // gold
				'inframe_insertion':'#d2691e', // chocolate
				'inframe_deletion':'#8b4513', // saddle brown
				'splice_site_variant':'#adff2f', // green yellow
				'2kb_upstream_variant':'#7fffd4', // aqua marine
				'2kb_downstream_variant':'#00ced1', // dark turquoise
				'3_prime_UTR_variant':'#00bfff', // deep sky blue
				'5_prime_UTR_variant':'#ffff00', // yellow
				'complex_substitution':'#0000ff', // blue
				'synonymous_variant':'#00ff00', // lime
				'intron_variant':'#00ffff', // aqua
				'Unknown':'#000080', // navy
	        };
			if (div != null) {
				emptyElement(div);
			}
            this['variables']['div'] = div;
            this['variables']['data'] = data;
            div.style.position = 'relative';
            div.style.overflowX = 'auto';
            var divWidth = $(div).width();
            $(div).width(divWidth);
            var sdiv = getEl('div');
            sdiv.style.position = 'relative';
            sdiv.style.width = '100%';
            sdiv.style.height = '100%';
            addEl(div, sdiv);
			var chartDiv = getEl('canvas');
            var canvasWidth = data['samples'].length * 30 + 100;
            var canvasHeight = div.clientHeight;
            chartDiv.style.position = 'absolute';
            chartDiv.style.top = '0';
            chartDiv.style.left = '0';
            chartDiv.style.pointerEvents = 'none';
			addEl(sdiv, chartDiv);
			var samples = data['samples'];
            var labelLenCutoff = Math.floor((divWidth - 150) / 30);
            var initDrawNum = 10;
            var origSamples = [];
            var initSamples = [];
            var nextSamples = [];
            for (var i = 0; i < samples.length; i++) {
                var sample = samples[i];
                origSamples.push(sample);
                if (sample.length > labelLenCutoff) {
                    sample = sample.substring(0, 4) + '..' + sample.substring(sample.length - 4, sample.length);
                }
                if (i < initDrawNum) {
                    initSamples.push(sample);
                } else {
                    nextSamples.push(sample);
                }
                samples[i] = sample;
            }
			var sos = data['sos'];
			var socountdata = data['socountdata'];
			var datasets = [];
            var initDatasets = [];
            var nextDatasets = [];
			for (var i = 0; i < sos.length; i++) {
				var so = sos[i];
				row = {};
				var label = so
				var backgroundColor = colorPalette[so];
                var counts = socountdata[so];
                var initDatasetCounts = [];
                var nextDatasetCounts = [];
                for (var j = 0; j < counts.length; j++) {
                    if (j < initDrawNum) {
                        initDatasetCounts.push(counts[j]);
                    } else {
                        nextDatasetCounts.push(counts[j]);
                    }
                }
				row['data'] = socountdata[so];
                initDatasets.push({'label': label, 'backgroundColor': backgroundColor, 'data': initDatasetCounts});
                nextDatasets.push({'label': label, 'backgroundColor': backgroundColor, 'data': nextDatasetCounts});
			}
			var chart = new Chart(chartDiv, {
				type: 'bar',
				data: {
					labels: initSamples,
					datasets: initDatasets
				},
				options: {
					title: {
						display: true,
					},
					tooltips: {
						mode: 'index',
						intersect: false,
                        callbacks: {
                            title: function (tooltipItem) {
                                var title = origSamples[tooltipItem[0].index];
                                return title;
                            }
                        },
					},
                    legend: {
                        position: 'right',
                    },
					responsive: true,
                    responsiveAnimationDuration: 500,
                    maintainAspectRatio: false,
					scales: {
						xAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Samples',
                            },
							stacked: true,
                            ticks: {
                                maxRotation: 90,
                                minRotation: 90,
                            }
						}],
						yAxes: [{
                            scaleLabel: {
                                display: true,
                                labelString: 'Fraction of Sequence Ontology',
                            },
							stacked: true
						}]
					},
				},
			});
            setTimeout(function () {
                for (var j = 0; j < nextSamples.length; j++) {
                    chart.data.labels.push(nextSamples[j]);
                }
                for (var i = 0; i < chart.data.datasets.length; i++) {
                    for (var j = 0; j < nextDatasets[i].data.length; j++) {
                        chart.data.datasets[i].data.push(nextDatasets[i].data[j]);
                    }
                }
                var newWidth = Math.max(divWidth, nextSamples.length * 40 + 300);
                $(sdiv).width(newWidth);
            }, 100);
		}
	}
};
