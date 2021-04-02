widgetGenerators['gnomad3'] = {
	'variant': {
		'width': 280, 
		'height': 280, 
		'function': function (div, row, tabName) {
			addGradientStopBarComponent(div, row, 'Total', 'gnomad3__af', tabName);
			addGradientStopBarComponent(div, row, 'African Amr', 'gnomad3__af_afr', tabName);
			addGradientStopBarComponent(div, row, 'Ashkenazi', 'gnomad3__af_asj', tabName);
			addGradientStopBarComponent(div, row, 'East Asn', 'gnomad3__af_eas', tabName);
			addGradientStopBarComponent(div, row, 'Finn', 'gnomad3__af_fin', tabName);
			addGradientStopBarComponent(div, row, 'Latino/ADmixed Amr', 'gnomad3__af_lat', tabName);
			addGradientStopBarComponent(div, row, 'Non-Finn Eur', 'gnomad3__af_nfe', tabName);
			addGradientStopBarComponent(div, row, 'Other', 'gnomad3__af_oth', tabName);
			addGradientStopBarComponent(div, row, 'South Asn', 'gnomad3__af_sas', tabName);
		}
	}
}