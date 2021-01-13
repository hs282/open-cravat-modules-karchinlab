widgetGenerators['thousandgenomes_south_asian'] = {
	'variant': {
		'width': 250, 
		'height': 200, 
		'function': function (div, row, tabName) {
			var gih_af = getWidgetData(tabName, 'thousandgenomes_south_asian', row, 'gih_af')
			if (gih_af== null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
            addBarComponent(div, row, 'GIH Allele Frequency', 'thousandgenomes_south_asian__gih_af', tabName);
            addBarComponent(div, row, 'PJL Allele Frequency', 'thousandgenomes_south_asian__pjl_af', tabName);
            addBarComponent(div, row, 'BEB Allele Frequency', 'thousandgenomes_south_asian__beb_af', tabName);
            addBarComponent(div, row, 'STU Allele Frequency', 'thousandgenomes_south_asian__stu_af', tabName);
            addBarComponent(div, row, 'ITU Allele Frequency', 'thousandgenomes_south_asian__itu_af', tabName);
		}
	}
}