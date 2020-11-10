widgetGenerators['interpro'] = {
	'variant': {
		'width': 520, 
		'height': 140, 
		'word-break': 'normal',
		'function': function (div, row, tabName) {
			var hits = getWidgetData(tabName, 'interpro', row, 'hits')
            if (hits != null) {
                hits = JSON.parse(hits);
                var table = getWidgetTableFrame();
                addEl(div, table);
                var thead = getWidgetTableHead(['Domain', 'UniProt', 'Ensembl', 'Link'],['55%','13%','22%','10%']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                addEl(table, tbody);
                for (let i=0; i<hits.length; i++){
                    var hit = hits[i];
                    var link = 'https://www.ebi.ac.uk/interpro/protein/'+hit[1];
                    var tr = getWidgetTableTr([hit[0], hit[1], hit[2], link]);
                    addEl(tbody, tr);
                }
            }
		}
	}
}
