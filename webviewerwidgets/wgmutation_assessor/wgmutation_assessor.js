widgetGenerators['mutation_assessor'] = {
	'variant': {
		'width': 480, 
		'height': 120, 
		'function': function (div, row, tabName) {
			var allMappings = getWidgetData(tabName, 'mutation_assessor', row, 'all');
			if (allMappings != undefined && allMappings != null) {
                var results = JSON.parse(allMappings);
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['Transcript', 'Score', 'Rank Score', 'Functional Impact'], ["25%"]);
				addEl(table, thead);
				var tbody = getEl('tbody');
                for (var i = 0; i < results.length; i++) {
					var row = results[i];
                    var transcript = row[0];
					var score = row[2];
                    var rank = row[3];
                    var pred = row[1]
					var tr = getWidgetTableTr([transcript, score, rank, pred]);
					addEl(tbody, tr);
				}
				addEl(div, addEl(table, tbody));
			}
		}
	}
}
