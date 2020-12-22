widgetGenerators['sift'] = {
	'variant': {
		'width': 580, 
		'height': 180, 
		'function': function (div, row, tabName) {
			var allMappings = getWidgetData(tabName, 'sift', row, 'all');
            console.log(allMappings)
			if (allMappings != undefined && allMappings != null) {
                var results = JSON.parse(allMappings);
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['Transcript', 'Prediction', 'Confidence', 'Score', 'Rank Score', 'Median Info', 'Seqs at Position'],['20%']);
				addEl(table, thead);
				var tbody = getEl('tbody');
                for (var i = 0; i < results.length; i++) {
					var row = results[i];
					var trans = row[0];
					var score = row[1];
					var pred = row[2];
					var rank = row[3];
					var med = row[4];
					var conf = row[5]
					var seqs = row[6]
					var tr = getWidgetTableTr([trans, pred,conf,score, rank, med, seqs]);
					addEl(tbody, tr);
				}
				addEl(div, addEl(table, tbody));
			}
		}
	}
}