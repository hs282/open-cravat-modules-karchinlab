widgetGenerators['gnomad_gene'] = {
	'gene': {
		'width': 840, 
		'height': 150, 
		'function': function (div, row, tabName) {
			var results = getWidgetData(tabName, 'gnomad_gene', row, 'all_results');
            if (results != null) {
                results = JSON.parse(results);
                var table = getWidgetTableFrame();
                addEl(div, table);
                var thead = getWidgetTableHead(['Transcript','Obv/Exp LoF','Obv/Exp Mis','Obv/Exp Syn','LoF Z-Score','Mis Z-Score','Syn Z-Score','pLI','pRec','pNull'],['20%']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                addEl(table, tbody);
                for (var i=0; i < results.length; i++) {
                    var row = results[i];
                    var tr = getWidgetTableTr(row);
                    addEl(tbody, tr);
                }
                addEl(div, addEl(table, tbody));
            }
		}
	}
}
