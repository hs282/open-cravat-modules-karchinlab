widgetGenerators['go'] = {
	'gene': {
		'width': 480, 
		'height': 200, 
		'word-break':'normal',
		'function': function (div, row, tabName) {
			addInfoLine(div, row, 'Gene Name', 'go__dname', tabName, 66)
            var hits = getWidgetData(tabName, 'go', row, 'hits');
            if (hits != null) {
                hits = JSON.parse(hits);
                var table = getWidgetTableFrame();
                addEl(div, table);
                var thead = getWidgetTableHead(['ID', 'GO Name', 'Aspect', 'Reference', 'Evidence']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                addEl(table, tbody);
                var inTable = [];
                for (var i =0; i<hits.length;i++){
                    var hit = hits[i];
                    var iditr = hit[0];
                    var nameitr = hit[1];
                    var ontolitr = hit[2];
                    var link = 'http://amigo.geneontology.org/amigo/term/'+iditr;
                    if(!inTable.includes(iditr)){
                        var tr = getWidgetTableTr([link, nameitr, ontolitr, hit[3], hit[4]],[iditr]);
                        addEl(tbody, tr);
                        inTable.push(iditr);
                    }
                }
                addEl(div, addEl(table, tbody));
            }
		}
	}
}
