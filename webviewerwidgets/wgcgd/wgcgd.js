widgetGenerators['cgd'] = {
	'gene': {
		'width': 880, 
		'height': 220, 
		'function': function (div, row, tabName) {
			var allMappings = getWidgetData(tabName, 'cgd', row, 'all');
			if (allMappings == null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
			if (allMappings != undefined && allMappings != null) {
                var results = JSON.parse(allMappings);
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['Condition', 'Inheritance', 'Age Group', 'Allelic Conditions', 'Manifestation', 'Intervention', 'More info'], ['15%', '10%', '10%', '20%', '20%', '15%', '10%']);
				addEl(table, thead);
				var tbody = getEl('tbody');
                for (var i = 0; i < results.length; i++) {
					var row = results[i];
					var hgnc = row[0];
					var entrez = row[1];
					var cond = row[2];
					var tr = getWidgetTableTr([hgnc, entrez, cond, row[3], row[4], row[5], row[6]]);
					addEl(tbody, tr);
				}
				addEl(div, addEl(table, tbody));
			}
		}
	}
}