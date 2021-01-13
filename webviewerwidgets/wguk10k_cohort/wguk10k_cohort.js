widgetGenerators['uk10k_cohort'] = {
	'variant': {
		'width': 280, 
		'height': 130, 
		'function': function (div, row, tabName) {
			var ac = getWidgetData(tabName, 'uk10k_cohort', row, 'uk10k_twins_ac');
			if (ac== null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
			addBarComponent(div, row, 'Twins Alternative Allele Frequency', 'uk10k_cohort__uk10k_twins_af', tabName);
			addBarComponent(div, row, 'ALSPAC Alternative Allele Frequency', 'uk10k_cohort__uk10k_alspac_af', tabName);
		}
	}
}
