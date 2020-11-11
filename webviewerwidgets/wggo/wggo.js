widgetGenerators['go'] = {
	'gene': {
		'width': 480, 
		'height': 200, 
		'word-break':'normal',
		'function': function (div, row, tabName) {
			addInfoLine(div, row, 'Gene Name', 'go__dname', tabName, 66)
			var goid = getWidgetData(tabName, 'go', row, 'id');
			var idls = goid != null ? goid.split(';') : [];
			var goname = getWidgetData(tabName, 'go', row, 'name');
			var namels = goname != null ? goname.split(';') : [];
			var ontol = getWidgetData(tabName, 'go', row, 'aspect');
			var ontolls = ontol != null ? ontol.split(';') : [];
			var table = getWidgetTableFrame();
			addEl(div, table);
			var thead = getWidgetTableHead(['ID', 'GO Name', 'Aspect'],['20%','70%','10%']);
			addEl(table, thead);
			var tbody = getEl('tbody');
			addEl(table, tbody);
			var inTable = [];
			for (var i =0; i<idls.length;i++){
				var iditr = idls[i];
				var nameitr = namels[i];
				var ontolitr = ontolls[i];
				var link = 'https://amigo.geneontology.org/amigo/term/'+iditr;
				if(!inTable.includes(iditr)){
					var tr = getWidgetTableTr([link, nameitr, ontolitr],[iditr]);
					addEl(tbody, tr);
					inTable.push(iditr);
				}
			}
			addEl(div, addEl(table, tbody));
		}
	}
}
