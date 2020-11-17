widgetGenerators['interpro'] = {
	'variant': {
		'width': 520, 
		'height': 140, 
		'word-break': 'normal',
		'function': function (div, row, tabName) {
			var hits = getWidgetData(tabName, 'interpro', row, 'all')
            if (hits != undefined && hits != null) {
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
            } else {
                var acc = getWidgetData(tabName, 'interpro', row, 'uniprot_acc');
                var accls = acc != null ? acc.split(';') : [];
                var dom = getWidgetData(tabName, 'interpro', row, 'domain');
                var domls = dom != null ? dom.split(';') : [];
                var enst = getWidgetData(tabName, 'interpro', row, 'ensembl_transcriptid')
                var enstls = enst != null ? enst.split(';') : [];
                var table = getWidgetTableFrame();
                addEl(div, table);
                var thead = getWidgetTableHead(['Domain', 'UniProt', 'Ensembl', 'Link'],['55%','13%','22%','10%']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                addEl(table, tbody);
                for (let i=0; i<accls.length; i++){
                        var link = 'https://www.ebi.ac.uk/interpro/protein/'+accls[i];
                        var tr = getWidgetTableTr([domls[i], accls[i], enstls[i], link]);
                        addEl(tbody, tr);
                }
            }
		}
	}
}
