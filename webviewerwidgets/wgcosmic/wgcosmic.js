widgetGenerators['cosmic'] = {
	'variant': {
		'width': 280, 
		'height': 220, 
		'word-break': 'normal',
		'function': function (div, row, tabName) {
			addInfoLine(div, 'ID', getWidgetData(tabName, 'cosmic', row, 'cosmic_id'), tabName, 4);
			addInfoLine(div, 'Variant Count', getWidgetData(tabName, 'cosmic', row, 'variant_count'), tabName);
			addInfoLine(div, 'Transcript', getWidgetData(tabName, 'cosmic', row, 'transcript'), tabName);
			addInfoLine(div, 'Protein Change', getWidgetData(tabName, 'cosmic', row, 'protein_change'), tabName);
			var vcTissue = getWidgetData(tabName, 'cosmic', row, 'variant_count_tissue');
			if (vcTissue != undefined && vcTissue !== null) {
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['Tissue', 'Count'],['85%','15%']);
				addEl(table, thead);
				var tbody = getEl('tbody');
				var toks = vcTissue.split(';');
				var re = /(.*)\((.*)\)/
				for (var i = 0; i < toks.length; i++) {
					var tok = toks[i];
					var match = re.exec(tok);
					if (match !== null) {
						var tissue = match[1].replace(/_/g, " ");
						var count = match[2];
						var tr = getWidgetTableTr([tissue, count]);
						addEl(tbody, tr);
					}
				}
				addEl(div, addEl(table, tbody));
			}
		}
	}
}
