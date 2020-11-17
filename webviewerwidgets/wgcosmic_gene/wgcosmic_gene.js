widgetGenerators['cosmic_gene'] = {
	'gene': {
		'width': 280, 
		'height': 280, 
		'word-break': 'normal',
		'function': function (div, row, tabName) {
			addInfoLine(div, row, 'Occurrences', 'cosmic_gene__occurrences', tabName);
            var vcTissue = getWidgetData(tabName, 'cosmic_gene', row, 'gene_count');
			if (vcTissue != undefined && vcTissue !== null && typeof(vcTissue) == 'object') {
                var results = JSON.parse(vcTissue);
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['Tissue', 'Count'],['85%','15%']);
				addEl(table, thead);
				var tbody = getEl('tbody');
				for (var i = 0; i < results.length; i++) {
                    var tr = getWidgetTableTr(results[i]);
                    addEl(tbody, tr);
				}
				addEl(div, addEl(table, tbody));
			} else {
                var vcTissue = getWidgetData(tabName, 'cosmic_gene', row, 'gene_count');
                if (vcTissue != undefined && vcTissue !== null) {
                    var table = getWidgetTableFrame();
                    var thead = getWidgetTableHead(['Tissue', 'Count'],['85%','15%']);
                    addEl(table, thead);
                    var tbody = getEl('tbody');
                    var toks = vcTissue.split(';');
                    var re = /(.*)\((.*)\)/
                    for (var i = 0; i < toks.length; i++) {
                        var tok = toks[i];
                        var match = re.exec(tok);
                        if (match !== null) {
                            var tissue = match[1].replace(/_/g, " ");
                            var count = match[2];
                            var tr = getWidgetTableTr([tissue, count]);
                            addEl(tbody, tr);
                        }
                    }
                    addEl(div, addEl(table, tbody));
                }
            }
		}
	}
}
