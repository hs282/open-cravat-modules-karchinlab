widgetGenerators['ensembl_regulatory_build'] = {
	'variant': {
		'width': 320, 
		'height': 70, 
		'function': function (div, row, tabName) {
            var id = getWidgetData(tabName, 'ensembl_regulatory_build', row, 'ensr');
            if (id == null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
            var region = getWidgetData(tabName, 'ensembl_regulatory_build', row, 'region');
            addInfoLine(div, 'Regulatory Feature', region, tabName);
			var link = '';
			if(id != null){
				link = 'http://www.ensembl.org/Homo_sapiens/Regulation/Context?db=core;fdb=funcgen;rf=' + id;
			}
			else{
				id = '';
            }
            addInfoLineLink(div, 'Ensembl ID', id, link, 15);
        }
    }
}