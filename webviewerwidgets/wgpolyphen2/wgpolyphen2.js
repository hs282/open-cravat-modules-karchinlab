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
			var results = getWidgetData(tabName, 'polyphen2', row, 'all');
            if (results != undefined && results != null) {
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
            } else {
                let predMap = {
                    'D': 'Probably damaging',
                    'P': 'Possibly damaging',
                    'B': 'Benign',
                }
                let hdivRank = getWidgetData(tabName, 'polyphen2', row, 'hdiv_rank');
                let hvarRank = getWidgetData(tabName, 'polyphen2', row, 'hvar_rank');
                let string_vals = {}
                string_vals.uniprot = getWidgetData(tabName, 'polyphen2', row, 'uniprot');
                string_vals.hdiv_score = getWidgetData(tabName, 'polyphen2', row, 'hdiv_score');
                string_vals.hvar_score = getWidgetData(tabName, 'polyphen2', row, 'hvar_score');
                string_vals.hdiv_pred = getWidgetData(tabName, 'polyphen2', row, 'hdiv_pred');
                string_vals.hvar_pred = getWidgetData(tabName, 'polyphen2', row, 'hvar_pred');
                if (string_vals.uniprot === null) return;
                let list_vals = {};
                for (let [n, sv] of Object.entries(string_vals)) {
                    list_vals[n] = sv.split(';');
                }
                console.log(list_vals);
                let entries = [];
                for (let i=0; i<list_vals.uniprot.length; i++) {
                    var entry = {}
                    for (let [n,l] of Object.entries(list_vals)) {
                        entry[n] = l[i];
                    }
                    entries.push(entry);
                }
                var table = getWidgetTableFrame();
                addEl(div, table);
                var thead = getWidgetTableHead(['Uniprot', 'HDIV Score','HDIV Rank','HDIV Prediction','HVAR Score','HVAR Rank','HVAR Prediction'],['10%','12%','12%','21%','12%','12%','21%']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                addEl(table, tbody);
                for (let entry of entries) {
                    var tr = getWidgetTableTr([entry.uniprot, entry.hdiv_score, hdivRank, predMap[entry.hdiv_pred], entry.hvar_score, hvarRank, predMap[entry.hvar_pred]]);
                    addEl(tbody, tr);
                }
            }
		}
	}
}
