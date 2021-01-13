widgetGenerators['mirbase'] = {
	'variant': {
		'width': 320, 
		'height': 120, 
		'function': function (div, row, tabName) {
            var id = getWidgetData(tabName, 'mirbase', row, 'id');
            if (id == null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
            var name = getWidgetData(tabName, 'mirbase', row, 'name');
            var trans = getWidgetData(tabName, 'mirbase', row, 'transcript');
            var derive = getWidgetData(tabName, 'mirbase', row, 'derives_from');
            
			var link = '';
			if(id != null){
				link = 'http://www.mirbase.org/cgi-bin/mirna_entry.pl?acc=' + id;
			}
			else{
				id = '';
            }
            addInfoLineLink(div, 'Ensembl ID', id, link, 15);
            addInfoLine(div, 'Transcript', trans, tabName);
            addInfoLine(div, 'Name', name, tabName);
            addInfoLine(div, 'Derives From', derive, tabName);
            
        }
    }
}