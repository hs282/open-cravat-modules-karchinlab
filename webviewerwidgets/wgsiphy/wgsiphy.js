widgetGenerators['siphy'] = {
	'variant': {
		'width': 152, 
		'height': 210, 
		'word-break': 'normal',
		'function': function (div, row, tabName) {
			var log = getWidgetData(tabName, 'siphy', row, 'logodds');
			if (log == null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
			addInfoLine(div, 'Score',log , tabName, 25);
			addGradientBarComponent(div, row, 'Rank Score', 'siphy__logodds_rank', tabName);
			var pis = getWidgetData(tabName, 'siphy', row, 'pi');
			var pils = pis != null ? pis.split(';') : [];
			var table = getWidgetTableFrame();
			addEl(div, table);
			var thead = getWidgetTableHead(['Nucleobase', 'Stationary Distribution']);
			addEl(table, thead);
			var tbody = getEl('tbody');
			addEl(table, tbody);
			var bases = ['A', 'C', 'G', 'T']
			for (var i =0; i<pils.length;i++){
				var pi = pils[i]
				var base = bases[i]
				var tr = getWidgetTableTr([base, pi]);
				addEl(tbody, tr);
			}
			addEl(div, addEl(table, tbody));
		}
	}
}
