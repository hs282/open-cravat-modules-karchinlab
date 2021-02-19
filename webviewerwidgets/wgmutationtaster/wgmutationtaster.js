widgetGenerators['mutationtaster'] = {
	'variant': {
		'width': 480, 
		'height': 120, 
		'function': function (div, row, tabName) {
			var allMappings = getWidgetData(tabName, 'mutationtaster', row, 'all');
			if (allMappings != undefined && allMappings != null) {
                var results = JSON.parse(allMappings);
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['Transcript ID','Score', 'Rank Score', 'Prediction', 'Model'], ["25%"]);
				addEl(table, thead);
				var tbody = getEl('tbody');
                for (var i = 0; i < results.length; i++) {
					var row = results[i];
                    var transcript = row[0];
					var score = row[1];
					if (score != undefined){
						score = score.toFixed(4)
					}
					var rank = row[2];
					if (rank != undefined){
						rank = rank.toFixed(4);
					}
                    var pred = row[3];
                    var model = row[4]
					var tr = getWidgetTableTr([transcript,score, rank, pred, model]);
					addEl(tbody, tr);
				}
				addEl(div, addEl(table, tbody));
			}
		}
	}
}