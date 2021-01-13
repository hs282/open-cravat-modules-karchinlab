widgetGenerators['ccre_screen'] = {
	'variant': {
		'width': 420, 
		'height': 90, 
		'function': function (div, row, tabName) {
            var e_id = getWidgetData(tabName, 'ccre_screen', row, 'acc_e');
            if (e_id == null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
            var d_id = getWidgetData(tabName, 'ccre_screen', row, 'acc_d');
            var group = getWidgetData(tabName, 'ccre_screen', row, '_group');
            var bound = getWidgetData(tabName, 'ccre_screen', row, 'bound');
            addInfoLine(div, 'Classification', group, tabName);
            addInfoLine(div, 'CTCF Bound', bound, tabName);
			var link = '';
			if(e_id != null){
				link = 'https://screen.encodeproject.org/search/?q='+e_id + '&assembly=GRCh38';
			}
			else{
				e_id = '';
            }
            addInfoLineLink(div, 'cCRE Accession ID', e_id, link, 13);
        }
    }
}