widgetGenerators['grasp'] = {
	'variant': {
		'width': 280, 
		'height': 180, 
		'function': function (div, row, tabName) {
			var hits = getWidgetData(tabName, 'grasp', row, 'results');
            if (hits != null) {
                hits = JSON.parse(hits);
                var table = getWidgetTableFrame();
                addEl(div, table);
                var thead = getWidgetTableHead(['Pval', 'Phenotype','NHLBI', 'PubMed'],['65px','40%','40%','20%']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                addEl(table, tbody);
                for (var i = 0; i < hits.length; i++) {
                    var hit = hits[i];
                    var pheno = hit[2];
                    var pval = hit[3];
                    var nhlbi = hit[0];
                    var pmid = hit[1];
                    var pmLink = 'https://www.ncbi.nlm.nih.gov/pubmed/'+pmid
                    var tr = getWidgetTableTr([pval, pheno, nhlbi, pmLink], [pmid]);
                    addEl(tbody, tr);
                }
            }
		}
	}
}
