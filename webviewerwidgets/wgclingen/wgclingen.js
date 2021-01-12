widgetGenerators['clingen'] = {
	'gene': {
		'width': 380,
		'height': 120,
		'function': function (div, row, tabName) {
			var disease = getWidgetData(tabName, 'clingen', row, 'disease');
			if (disease == null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
			if (disease != undefined && disease != null) {
				var diseases = getWidgetData(tabName, 'clingen', row, 'disease').split(';');
				var classifications = getWidgetData(tabName, 'clingen', row, 'classification').split(';');
				var links = getWidgetData(tabName, 'clingen', row, 'link').split(';');
				var mondos = getWidgetData(tabName, 'clingen', row, 'mondo').split(';');
				var table = getWidgetTableFrame();
				addEl(div, table);
				var thead = getWidgetTableHead(['Disease', 'Classification','ClinGen','Monarch'],[180,110,45,45]);
				addEl(table, thead);
				var tbody = getEl('tbody');
				addEl(table, tbody);
				for (var i = 0; i < diseases.length; i++) {
					var disease = diseases[i];
					var classification = classifications[i];
					var mondo = mondos[i];
					var mondo_link = `https://monarchinitiative.org/disease/${mondo}`
					var link = links[i]
					var tr = getWidgetTableTr([disease, classification, link, mondo_link]);
					addEl(tbody, tr);
				}
			}
		}
	}
}
