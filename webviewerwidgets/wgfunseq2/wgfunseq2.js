widgetGenerators['funseq2'] = {
	'variant': {
		'width': 600, 
		'height': 150, 
		'function': function (div, row, tabName) {
			var allMappings = getWidgetData(tabName, 'funseq2', row, 'all');
			if (allMappings != undefined && allMappings != null) {
                var results = JSON.parse(allMappings);
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['HOT Region', 'Motif Analysis','Transcription Factor', 'Motif name', 'Alternate Score', 'Reference Score', 'Score']);
				addEl(table, thead);
				var tbody = getEl('tbody');
                for (var i = 0; i < results.length; i++) {
					var row = results[i];
					var hot = row[0];
					var type = row[1];
					var tf = row[2];
                    var mot = row[3];
					var alt = row[4];
					if (alt != ''){
						alt = Number(alt).toFixed(3);
					}
					var ref = row[5];
					if (ref != ''){
						ref = Number(ref).toFixed(3);
					}
					var score =row[6];
					if (score != '' && score.length > 1){
						score =  Number(score).toFixed(4);
					}
					var tr = getWidgetTableTr([hot, type, tf, mot, alt, ref, score]);
					addEl(tbody, tr);
				}
				addEl(div, addEl(table, tbody));
			}
		}
	}
}