widgetGenerators['hpo'] = {
	'gene': {
		'width': 380, 
		'height': 220, 
		'function': function (div, row, tabName) {
			var allMappings = getWidgetData(tabName, 'hpo', row, 'all');
			if (allMappings != undefined && allMappings != null) {
                var results = JSON.parse(allMappings);
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(["HPO ID", "HPO Term"], ['30%']);
				addEl(table, thead);
				var tbody = getEl('tbody');
                for (var i = 0; i < results.length; i++) {
					var row = results[i];
                    var id = row[0];
                    var term = row[1]
                    var link = 'https://hpo.jax.org/app/browse/term/' + id;
					var tr = getWidgetTableTr([link, term], [id]);
					addEl(tbody, tr);
				}
				addEl(div, addEl(table, tbody));
			}else{
				var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
		}
	}
}