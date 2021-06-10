widgetGenerators['mitomap'] = {
	'variant': {
		'width': 400, 
		'height': 220, 
		'function': function (div, row, tabName) {
            var disease = getWidgetData(tabName, 'mitomap', row, 'disease');
            addInfoLine(div, 'Disease', disease, tabName)
            var status = getWidgetData(tabName, 'mitomap', row, 'status');
            addInfoLine(div, 'Status', status, tabName)
            var score = getWidgetData(tabName, 'mitomap', row, 'score');
            addInfoLine(div, 'MitoTip Score', score, tabName)
            var quartile = getWidgetData(tabName, 'mitomap', row, 'quartile');
            addInfoLine(div, 'Quartile', quartile, tabName)
			let ids = getWidgetData(tabName, 'mitomap', row, 'pubmed');
            ids = ids !== null ? ids.split(',') : [];
			const table = getWidgetTableFrame();
			addEl(div, table);
			const thead = getWidgetTableHead(['PubMed ID']);
			addEl(table, thead);
			const tbody = getEl('tbody');
			addEl(table, tbody);
			for (let i=0; i<ids.length; i++){
                let pub = ids[i];
                let link = `https://www.ncbi.nlm.nih.gov/pubmed/?term=${pub}`;
                let tr = getWidgetTableTr([link],[pub]);
                addEl(tbody, tr);
			addEl(div, addEl(table, tbody));
			}
		}
	}
}