widgetGenerators['revel'] = {
	'variant': {
		'width': 480, 
		'height': 120, 
        'default_hidden': true,
		'function': function (div, row, tabName) {
			var allMappings = getWidgetData(tabName, 'revel', row, 'all');
			if (allMappings == null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
			if (allMappings != undefined && allMappings != null) {
                var results = JSON.parse(allMappings);
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['Transcript', 'Score', 'Rank score']);
				addEl(table, thead);
				var tbody = getEl('tbody');
                for (var i = 0; i < results.length; i++) {
					var row = results[i];
					var transcript = row[0];
					var score = row[1];
					var rankscore = row[2];
					var tr = getWidgetTableTr([transcript, score, rankscore]);
					addEl(tbody, tr);
				}
				addEl(div, addEl(table, tbody));
			}
		}
	}
}
