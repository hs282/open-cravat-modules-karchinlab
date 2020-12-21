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
			// var hdivRank = getWidgetData(tabName, 'polyphen2', row, 'hdiv_rank');
			// var hvarRank = getWidgetData(tabName, 'polyphen2', row, 'hvar_rank');
			var results = getWidgetData(tabName, 'polyphen2', row, 'all');
            if (results != undefined && results != null) {
                results = JSON.parse(results);
                var table = getWidgetTableFrame();
                addEl(div, table);
                var thead = getWidgetTableHead(['Transcript','Uniprot', 'HDIV Score','HDIV Rank','HDIV Prediction','HVAR Score','HVAR Rank','HVAR Prediction'],["20%"]);
                addEl(table, thead);
                var tbody = getEl('tbody');
                addEl(table, tbody);
                for (var i = 0; i < results.length; i++) {
                    var result = results[i];
                    console.log(result[3], result[6])
                    var transcript = result[0]
                    var uniprot = result[1];
                    var hdiv_score = result[2];
                    var hdivRank = result[3]
                    var hdiv_pred = result[4];
                    var hvarRank = result[6]
                    var hvar_score = result[5];
                    var hvar_pred = result[7];
                    var tr = getWidgetTableTr([transcript, uniprot, hdiv_score, hdivRank, predMap[hdiv_pred], hvar_score, hvarRank, predMap[hvar_pred]]);
                    addEl(tbody, tr);
                }
            }
        }
    }
}

