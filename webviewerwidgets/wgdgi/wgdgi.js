widgetGenerators['dgi'] = {
	'variant': {
		'width': 580, 
		'height': 180, 
		'function': function (div, row, tabName) {
			var allMappings = getWidgetData(tabName, 'dgi', row, 'all');
			if (allMappings != undefined && allMappings != null) {
                var results = JSON.parse(allMappings);
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['Category','Interaction', 'Drug Name', 'Score', 'ChEMBL ID', 'Pubmed']);
				addEl(table, thead);
				var tbody = getEl('tbody');
                for (var i = 0; i < results.length; i++) {
					var row = results[i];
					var cat = row[0];
					var inter = row[1];
                    var name = row[2];
                    var score = row[3];
                    var chem = row[4];
                    var pubs = row[5].toString();
                    pubs = pubs.split(',')
                    for (var j = 0; j < pubs.length; j++) {
                        var pub = pubs[j];
					var link = `https://www.ebi.ac.uk/chembl/g/#search_results/compounds/query=${chem}`
					var link2 = `https://pubmed.ncbi.nlm.nih.gov/${pub}`
					var tr = getWidgetTableTr([cat, inter, name, score,link,link2],[chem, pub]);
					addEl(tbody, tr);
				}
                addEl(div, addEl(table, tbody));
                }
			}
		}
	}
}