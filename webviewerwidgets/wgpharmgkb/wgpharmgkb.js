widgetGenerators['pharmgkb'] = {
	'variant': {
		'width': 280, 
		'height': 180, 
		'function': function (div, row, tabName) {
			var chemical = getWidgetData(tabName, 'pharmgkb', row, 'chemical');
			var chemsDiv = getEl('div');
			addEl(div, chemsDiv);
			var titleSpan = getEl('span');
			addEl(chemsDiv, titleSpan);
			addEl(titleSpan, getTn('Chemicals: '));
			titleSpan.style['font-weight'] = 'bold';
			if (chemical != undefined && chemical != null) {
				var chemicals = JSON.parse(chemical);
				for (let i=0; i<chemicals.length; i++) {
                    var row = chemicals[i];
					var curchem = row[0];
					var curid = row[1];
					var url = `https://pharmgkb.org/chemical/${curid}`;
					var link = getEl('a');
					addEl(chemsDiv, link);
					link.href = url;
					link.target = '_blank';
					addEl(link, getTn(curchem));
					if (i + 1 < chemicals.length) {
						addEl(chemsDiv, getTn(', '));
					}
				}
			} else {
                var chemical = getWidgetData(tabName, 'pharmgkb', row, 'chemical');
                var chemid = getWidgetData(tabName, 'pharmgkb', row, 'chemid');
                var chemsDiv = getEl('div');
                addEl(div, chemsDiv);
                var titleSpan = getEl('span');
                addEl(chemsDiv, titleSpan);
                addEl(titleSpan, getTn('Chemicals: '));
                titleSpan.style['font-weight'] = 'bold';
                if (chemical && chemid) {
                    var chemicals = chemical.split(';');
                    var chemids = chemid.split(';');
                    for (let i=0; i<chemicals.length; i++) {
                        var curchem = chemicals[i];
                        var curid = chemids[i];
                        var url = `https://pharmgkb.org/chemical/${curid}`;
                        var link = getEl('a');
                        addEl(chemsDiv, link);
                        link.href = url;
                        link.target = '_blank';
                        addEl(link, getTn(curchem));
                        if (i + 1 < chemicals.length) {
                            addEl(chemsDiv, getTn(', '));
                        }
                    }
                }
            }
			addInfoLine(div, 'Description', getWidgetData(tabName, 'pharmgkb', row, 'sentence'), tabName);
		}
	}
}
