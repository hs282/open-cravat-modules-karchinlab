widgetGenerators['haploreg_asn'] = {
	'variant': {
		'width': 380, 
		'height': 200, 
		'function': function (div, row, tabName) {
			if (infomgr.getColumnNo('variant', 'base__hugo')) {
				var snps = getWidgetData(tabName, 'haploreg_asn', row, 'all');
				if (snps) {
                    snps = JSON.parse(snps);
					var table = getWidgetTableFrame();
                    table.style.tableLayout = 'auto';
					table.style.width = '100%';
					var thead = getWidgetTableHead(['rsID', 'R\u00b2', 'D\''], ['50%', '25%', '25%']);
					addEl(table, thead);
					var tbody = getEl('tbody');
					for (var i=0; i<snps.length; i++) {
						var tr = getWidgetTableTr(snps[i]);
						addEl(tbody, tr);
					}
					addEl(div, addEl(table, tbody));
				}
			}
		}
	}
}
