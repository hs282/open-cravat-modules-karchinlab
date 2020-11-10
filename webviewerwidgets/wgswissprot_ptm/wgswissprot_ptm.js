widgetGenerators['swissprot_ptm'] = {
	'variant': {
		'width': 180, 
		'height': 180, 
		'function': function (div, row, tabName) {
            console.log("hello")
			let ids = getWidgetData(tabName, 'swissprot_ptm', row, 'pubmed');
            ids = ids !== null ? ids.split(',') : [];
			const table = getWidgetTableFrame();
			addEl(div, table);
			const thead = getWidgetTableHead(['Link']);
			addEl(table, thead);
			const tbody = getEl('tbody');
			addEl(table, tbody);
			for (let i=0; i<ids.length; i++){
                let pubmed = ids[i];
                let link = `https://pubmed.ncbi.nlm.nih.gov/${pubmed}`;
                let tr = getWidgetTableTr([link],[pubmed]);
                addEl(tbody, tr);
			addEl(div, addEl(table, tbody));
			}
		}
	}
}
