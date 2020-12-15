widgetGenerators['grasp'] = {
	'variant': {
		'width': 280, 
		'height': 180, 
		'function': function (div, row, tabName) {
			var hits = getWidgetData(tabName, 'grasp', row, 'all');
            if (hits != undefined && hits != null) {
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
            } else {
                var table = getWidgetTableFrame();
                addEl(div, table);
                var thead = getWidgetTableHead(['Pval', 'Phenotype','NHLBI', 'PubMed'],['65px','40%','40%','20%']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                addEl(table, tbody);

                var nhlbiStr = getWidgetData(tabName, 'grasp', row, 'nhlbi');
                var nhlbis = nhlbiStr != null ? nhlbiStr.split('|') : [];
                var pmidStr = getWidgetData(tabName, 'grasp', row, 'pmid');
                var pmids = pmidStr != null ? pmidStr.split('|') : [];
                var phenoValStr = getWidgetData(tabName, 'grasp', row, 'phenotype');
                var phenoVals = phenoValStr != null ? phenoValStr.split('|') : [];
                
                var re = /(.*)\((.*)\)/
                for (var i = 0; i < phenoVals.length; i++) {
                    var phenoVal = phenoVals[i];
                    var match = re.exec(phenoVal);
                    if (match !== null) {
                        var pheno = match[1];
                        var pval = match[2];
                        var nhlbi = nhlbis[i];
                        var pmid = pmids[i];
                        var pmLink = 'https://www.ncbi.nlm.nih.gov/pubmed/'+pmid
                        var tr = getWidgetTableTr([pval, pheno, nhlbi, pmLink], [pmid]);
                        addEl(tbody, tr);
                    }
                }
            }
		}
	}
}
