widgetGenerators['thousandgenomes_european'] = {
	'variant': {
		'width': 250, 
		'height': 200, 
		'function': function (div, row, tabName) {
			var ceu_af = getWidgetData(tabName, 'thousandgenomes_european', row, 'ceu_af')
			if (ceu_af== null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
            addGradientStopBarComponent(div, row, 'CEU Allele Frequency', 'thousandgenomes_european__ceu_af', tabName);
            addGradientStopBarComponent(div, row, 'TSI Allele Frequency', 'thousandgenomes_european__tsi_af', tabName);
            addGradientStopBarComponent(div, row, 'FIN Allele Frequency', 'thousandgenomes_european__fin_af', tabName);
            addGradientStopBarComponent(div, row, 'GBR Allele Frequency', 'thousandgenomes_european__gbr_af', tabName);
            addGradientStopBarComponent(div, row, 'IBS Allele Frequency', 'thousandgenomes_european__ibs_af', tabName);
		}
	}
}