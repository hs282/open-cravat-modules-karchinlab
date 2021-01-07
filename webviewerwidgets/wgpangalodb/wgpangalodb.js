widgetGenerators['pangalodb'] = {
	'gene': {
		'width': 580, 
		'height': 200, 
		'word-break':'normal',
		'function': function (div, row, tabName) {
            var hits = getWidgetData(tabName, 'pangalodb', row, 'hits');
            if (hits != null) {
                hits = JSON.parse(hits);
                var table = getWidgetTableFrame();
                addEl(div, table);
                var thead = getWidgetTableHead(['Cell Type', 'UI', 'Description', 'Germ Layer', 'Organ', 'Sensitivity', 'Specificity']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                addEl(table, tbody);
                var inTable = [];
                for (var i =0; i<hits.length;i++){
                    var hit = hits[i];
                    var cell = hit[0];
                    var ui = hit[1];
                    var desc = hit[2];
                    var germ = hit[3];
                    var organ = hit[4];
                    var sens = hit[5];
                    if (sens != undefined){
                        sens = sens.toFixed(3);
                    }
                    var spec = hit[6];
                    if (spec != undefined){
                        spec = spec.toFixed(3);
                    }
                    var tr = getWidgetTableTr([cell, ui, desc, germ, organ, sens, spec]);
                    addEl(tbody, tr);
                    inTable.push(cell);
                }
                addEl(div, addEl(table, tbody));
            }
		}
	}
}