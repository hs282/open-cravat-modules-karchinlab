widgetGenerators['encode_tfbs'] = {
	'variant': {
		'width': 480, 
		'height': 120, 
        'default_hidden': true,
		'function': function (div, row, tabName) {
			var allMappings = getWidgetData(tabName, 'encode_tfbs', row, 'all');
			if (allMappings == null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
			if (allMappings != undefined && allMappings != null) {
                var results = JSON.parse(allMappings);
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['Factor', 'Cell', 'Quality', 'Antibody', 'Study'], ['20%', '20%','15%', '20%', '25%']);
				addEl(table, thead);
				var tbody = getEl('tbody');
                for (var i = 0; i < results.length; i++) {
					var row = results[i];
					var factor= row[4];
					var cell = row[0];
					var quality = row[1];
                    var antibody = row[2];
                    var study = row[3];
					var tr = getWidgetTableTr([factor, cell, quality, antibody, study]);
					addEl(tbody, tr);
				}
				addEl(div, addEl(table, tbody));
			}
		}
	}
}