widgetGenerators['swissprot_binding'] = {
	'variant': {
		'width': 880, 
		'height': 180, 
		'function': function (div, row, tabName) {
			var allMappings = getWidgetData(tabName, 'swissprot_binding', row, 'all');
			if (allMappings != undefined && allMappings != null) {
                var results = JSON.parse(allMappings);
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['UniprotKB ID','Active Binding Site', 'Binding Site','Calcium Binding Site','DNA Binding Site', 'Metal Ion Binding Site', 'Nucleotide Phosphate Binding Site','Zinc Finger Binding Site', 'Pubmed']);
				addEl(table, thead);
				var tbody = getEl('tbody');
                for (var i = 0; i < results.length; i++) {
					var row = results[i];
					var id = row[0];
					var act = row[1];
					var bind = row[2];
					var ca = row[3];
					var dna = row[4];
					var metal = row[5]
					var np= row[6]
					var zn = row[7]
					var pub = row[8]
					var link = `https://www.uniprot.org/uniprot/${id}`
					var link2 = `https://pubmed.ncbi.nlm.nih.gov/${pub}`
					var tr = getWidgetTableTr([link, act, bind, ca, dna, metal, np, zn, link2],[id, pub]);
					addEl(tbody, tr);
				}
				addEl(div, addEl(table, tbody));
			}
		}
	}
}