widgetGenerators['mutpred1'] = {
	'variant': {
		'width': 450, 
		'height': 180, 
		'default_hidden': true,
		'function': function (div, row, tabName) {
			var value = getWidgetData(tabName, 'mutpred1', row, 'mutpred_general_score');
			if (value == null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
			addBarComponent(div, row, 'MutPred Score', 'mutpred1__mutpred_general_score', tabName);
			var allMappings = getWidgetData(tabName, 'mutpred1', row, 'mutpred_top5_mechanisms');
			if (allMappings != undefined && allMappings != null) {
                var results = JSON.parse(allMappings);
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(["Transcript", "Mechanism", "Location","P-value", "Score", "Rank Score"],["25%", '20%']);
				addEl(table, thead);
                var tbody = getEl('tbody');
                var withAtRe = /at ([A-Z]\d+)/;
                for (var i = 0; i < results.length; i++) {
                    var row = results[i];
                    var location = ''
					var id = row[0];
					var mechname = row[2];
					var ca = row[3];
					var dna = row[4];
                    var metal = row[5]
                    var withAtMatch = withAtRe.exec(mechname);
                    if (withAtMatch != null) {
                        location =  withAtMatch[0]
                        mechname = mechname.replace(location, '')
                    }

					var tr = getWidgetTableTr([id,mechname,location, ca, dna, metal]);
					addEl(tbody, tr);
				}
				addEl(div, addEl(table, tbody));
			}
		}
	}
}



