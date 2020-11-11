widgetGenerators['vest'] = {
	'variant': {
		'width': 280, 
		'height': 180, 
		'default_hidden': true,
		'function': function (div, row, tabName) {
			var allMappings = getWidgetData(tabName, 'vest', row, 'all_results');
			if (allMappings == null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
			} else {
                if(typeof addGradientBarComponent == 'function'){
                    addGradientBarComponent(div, row, 'VEST p-value', 'vest__pval', tabName, colors={'0.0':[255,0,0],'0.05':[255,230,230],'1.0':[255,255,255]});
                }
                else{
                    addBarComponent(div, row, 'VEST p-value', 'vest__pval', tabName);
                }
                var results = JSON.parse(allMappings);
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['Transcript', 'Score', 'P-value']);
				addEl(table, thead);
				var tbody = getEl('tbody');
                for (var i = 0; i < results.length; i++) {
					var row = results[i];
					var transcript = row[0];
					var score = row[1].toFixed(3);
					var pvalue = row[2].toFixed(4);
					var tr = getWidgetTableTr([transcript, score, pvalue]);
					addEl(tbody, tr);
				}
				addEl(div, addEl(table, tbody));
			}
		}
	},
	'gene': {
		'width': 280, 
		'height': 80, 
		'default_hidden': true,
		'function': function (div, row, tabName) {
			addInfoLine(div, row, 'Max score', 'vest__max_score', tabName);
			addInfoLine(div, row, 'Mean score', 'vest__mean_score', tabName);
			addInfoLine(div, row, 'Gene p-value', 'vest__gene_pval', tabName);
		}
	}
}
