widgetGenerators['clinvarsummary'] = {
	'info': {
        'name': 'ClinVar Summary',
		'width': 450, 
        'height': 450, 
        'variables': {},
        'init': function(data) {
            var v = this['variables'];
            var d = infomgr.getData('variant'); 
            var counts = {}
            for (var i = 0; i < d.length; i++) {
                var row = d[i];
                var id = getWidgetData('variant', 'clinvar', row, 'id');
                var sig = getWidgetData('variant', 'clinvar', row, 'sig');
                if (sig != null){
                    if (counts[sig]){
                        counts[sig]++
                    }else{
                        counts[sig] = 1
                    }
                }
            }
            v['counts'] = counts
        },
        'shoulddraw': function () {
            var v = this['variables'];
            var counts = v['counts']
            var data = Object.values(counts)
            if (data.length == 0){
                return false
            }else{
                return true
            }
        },
		'function': function (div, row, tabName) {
            var v = this['variables'];
            var counts = v['counts']
            var data = Object.values(counts)
            var labels = Object.keys(counts)
            div.style.width = 'calc(100% - 37px)';
			var chartDiv = getEl('canvas');
			chartDiv.style.width = 'calc(100% - 20px)';
			chartDiv.style.height = 'calc(100% - 20px)';
			addEl(div, chartDiv);

			var chart = new Chart(chartDiv, {
				type: 'doughnut',
				data: {
					datasets: [{
						data: data,
						backgroundColor: ['#2166AC', '#4393C3', '#92C5DE', '#D1E5F0', '#FDDBC7', '#F4A582', '#D6604D', 'B2182B']
					}],
					labels: labels
				},
				options: {
					responsive: true,
                    responsiveAnimationDuration: 500,
                    maintainAspectRatio: false,
                }
            });
            
        }
    }
}