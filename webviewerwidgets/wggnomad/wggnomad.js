widgetGenerators['gnomad'] = {
	'variant': {
		'width': 280, 
		'height': 280, 
		'function': function (div, row, tabName) {
			addGradientStopBarComponent(div, row, 'Total', 'gnomad__af', tabName);
			addGradientStopBarComponent(div, row, 'African/African Amr', 'gnomad__af_afr', tabName);
			addGradientStopBarComponent(div, row, 'Ashkenazi', 'gnomad__af_asj', tabName);
			addGradientStopBarComponent(div, row, 'East Asn', 'gnomad__af_eas', tabName);
			addGradientStopBarComponent(div, row, 'Finnish Eur', 'gnomad__af_fin', tabName);
			addGradientStopBarComponent(div, row, 'Latino/ADmixed Amr', 'gnomad__af_lat', tabName);
			addGradientStopBarComponent(div, row, 'Non-Finnish Eur', 'gnomad__af_nfe', tabName);
			addGradientStopBarComponent(div, row, 'Other', 'gnomad__af_oth', tabName);
			addGradientStopBarComponent(div, row, 'South Asn', 'gnomad__af_sas', tabName);
		}
	}
}