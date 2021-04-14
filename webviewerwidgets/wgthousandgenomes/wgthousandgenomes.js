widgetGenerators['thousandgenomes'] = {
	'variant': {
		'width': 280, 
		'height': 80, 
		'function': function (div, row, tabName) {
			var af = getWidgetData(tabName, 'thousandgenomes', row, 'af')
			if (af== null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
			addGradientStopBarComponent(div, row, 'Allele Frequency', 'thousandgenomes__af', tabName);
		}
	}
}