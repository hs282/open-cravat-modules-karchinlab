widgetGenerators['civic_gene'] = {
	'gene': {
		'width': 280, 
		'height': 180, 
		'default_hidden': true,
		'function': function (div, row, tabName) {
			var gene = getWidgetData('gene', 'civic_gene', row, 'description');
			if (gene == null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
			div.innerText = gene;
			div.style['word-break'] = 'break-word';
		}
	}
}
