widgetGenerators['omim'] = {
	'variant': {
		'width': 180, 
		'height': 180, 
		'function': function (div, row, tabName) {
			let ids = getWidgetData(tabName, 'omim', row, 'omim_id');
            ids = ids !== null ? ids.split('; ') : [];
			const table = getWidgetTableFrame();
			addEl(div, table);
			const thead = getWidgetTableHead(['Link']);
			addEl(table, thead);
			const tbody = getEl('tbody');
			addEl(table, tbody);
			for (let i=0; i<ids.length; i++){
                let omim = ids[i];
                let link = `https://omim.org/entry/${omim}`;
                let tr = getWidgetTableTr([link],[omim]);
                addEl(tbody, tr);
			addEl(div, addEl(table, tbody));
			}
		}
	}
}
