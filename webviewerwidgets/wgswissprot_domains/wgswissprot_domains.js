widgetGenerators['swissprot_domains'] = {
	'variant': {
		'width': 280, 
		'height': 180, 
		'function': function (div, row, tabName) {
			var allMappings = getWidgetData(tabName, 'swissprot_domains', row, 'all');
			if (allMappings != undefined && allMappings != null) {
                var results = JSON.parse(allMappings);
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['UniprotKB ID','Pubmed']);
				addEl(table, thead);
				var tbody = getEl('tbody');
                for (var i = 0; i < results.length; i++) {
					var row = results[i];
					var id = row[0];
					var pub = row[8]
					var link = `https://www.uniprot.org/uniprot/${id}`
					var link2 = `https://pubmed.ncbi.nlm.nih.gov/${pub}`
					var tr = getWidgetTableTr([link,link2],[id, pub]);
					addEl(tbody, tr);
				}
				addEl(div, addEl(table, tbody));
			}
		}
	}
}