widgetGenerators['thousandgenomes_ad_mixed_american'] = {
	'variant': {
		'width': 250, 
		'height': 200, 
		'function': function (div, row, tabName) {
			var mxl_af = getWidgetData(tabName, 'thousandgenomes_ad_mixed_american', row, 'mxl_af')
			if (mxl_af== null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
            addBarComponent(div, row, 'MXL Allele Frequency', 'thousandgenomes_ad_mixed_american__mxl_af', tabName);
            addBarComponent(div, row, 'PUR Allele Frequency', 'thousandgenomes_ad_mixed_american__pur_af', tabName);
            addBarComponent(div, row, 'CLM Allele Frequency', 'thousandgenomes_ad_mixed_american__clm_af', tabName);
            addBarComponent(div, row, 'PEL Allele Frequency', 'thousandgenomes_ad_mixed_american__pel_af', tabName);
		}
	}
}