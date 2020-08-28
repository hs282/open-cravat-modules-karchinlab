widgetGenerators['genehancer'] = {
	'variant': {
		'width': 280, 
		'height': 280, 
		'function': function (div, row, tabName) {
			var featureName = getWidgetData(tabName, 'genehancer', row, 'feature_name');
			var targetsStr = getWidgetData(tabName, 'genehancer', row, 'target_genes');
			if (!targetsStr) return
			addInfoLine(div, 'Type', featureName, tabName);
			var targets = targetsStr.split(',')
				.map(tmp=>tmp.split(': '))
				.sort((a,b)=>{parseFloat(b[1])-parseFloat(a[1])})
			var table = getWidgetTableFrame();
			addEl(div, table);
			var thead = getWidgetTableHead(['Target Gene', 'Link Strength']);
			addEl(table, thead);
			var tbody = getEl('tbody');
			addEl(table, tbody);
			for (var [gene, score] of targets){
				var tr = getWidgetTableTr([gene, score]);
				addEl(tbody, tr);
			}
		}
	}
}
