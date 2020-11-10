widgetGenerators['polyphen2'] = {
	'variant': {
		'width': 580, 
		'height': 180, 
		'default_hidden': false,
		'function': function (div, row, tabName) {
			let predMap = {
				'D': 'Probably damaging',
				'P': 'Possibly damaging',
				'B': 'Benign',
			}
			var hdivRank = getWidgetData(tabName, 'polyphen2', row, 'hdiv_rank');
			var hvarRank = getWidgetData(tabName, 'polyphen2', row, 'hvar_rank');
			var results = getWidgetData(tabName, 'polyphen2', row, 'results');
            if (results != null) {
                results = JSON.parse(results);
                var table = getWidgetTableFrame();
                addEl(div, table);
                var thead = getWidgetTableHead(['Uniprot', 'HDIV Score','HDIV Rank','HDIV Prediction','HVAR Score','HVAR Rank','HVAR Prediction'],['10%','12%','12%','21%','12%','12%','21%']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                addEl(table, tbody);
                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    var uniprot = result[0];
                    var hdiv_score = result[1];
                    var hdiv_pred = result[2];
                    var hvar_score = result[3];
                    var hvar_pred = result[4];
                    var tr = getWidgetTableTr([uniprot, hdiv_score, hdivRank, predMap[hdiv_pred], hvar_score, hvarRank, predMap[hvar_pred]]);
                    addEl(tbody, tr);
                }
            }
		}
	}
}
