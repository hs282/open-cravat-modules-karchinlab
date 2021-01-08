widgetGenerators['swissprot_ptm'] = {
	'variant': {
		'width': 880, 
		'height': 180, 
		'function': function (div, row, tabName) {
			var allMappings = getWidgetData(tabName, 'swissprot_ptm', row, 'all');
			if (allMappings == null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
			if (allMappings != undefined && allMappings != null) {
                var results = JSON.parse(allMappings);
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['UniprotKB ID','Crosslink', 'Disulfid Bond','Glycosylation','Initiator Methionine', 'Lipid Groups', 'Modified Residue','Polypeptide', 'Signal Sequence', 'Transit Peptides', 'Pubmed']);
				addEl(table, thead);
				var tbody = getEl('tbody');
                for (var i = 0; i < results.length; i++) {
					var row = results[i];
					var id = row[0];
					var cross = row[1];
					var gly = row[2];
					var init = row[3];
					var lg = row[4];
					var mod = row[5]
					var poly = row[6]
					var ss = row[7]
					var tp = row[8]
					var dis = row[9]
					var pub = row[10]
					var link = `https://www.uniprot.org/uniprot/${id}`
					var link2 = `https://pubmed.ncbi.nlm.nih.gov/${pub}`
					var tr = getWidgetTableTr([link, cross, dis, gly,init, lg, mod, poly, ss, tp, link2],[id, pub]);
					addEl(tbody, tr);
				}
				addEl(div, addEl(table, tbody));
			}
		}
	}
}

