widgetGenerators['thousandgenomes_east_asian'] = {
	'variant': {
		'width': 250, 
		'height': 200, 
		'function': function (div, row, tabName) {
			var chb_af = getWidgetData(tabName, 'thousandgenomes_east_asian', row, 'chb_af')
			if (chb_af== null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
            addGradientStopBarComponent(div, row, 'CHB Allele Frequency', 'thousandgenomes_east_asian__chb_af', tabName);
            addGradientStopBarComponent(div, row, 'JPT Allele Frequency', 'thousandgenomes_east_asian__jpt_af', tabName);
            addGradientStopBarComponent(div, row, 'CHS Allele Frequency', 'thousandgenomes_east_asian__chs_af', tabName);
            addGradientStopBarComponent(div, row, 'CDX Allele Frequency', 'thousandgenomes_east_asian__cdx_af', tabName);
            addGradientStopBarComponent(div, row, 'KHV Allele Frequency', 'thousandgenomes_east_asian__khv_af', tabName);
		}
	}
}