widgetGenerators['mutpred1'] = {
	'variant': {
		'width': 380, 
		'height': 180, 
		'default_hidden': true,
		'function': function (div, row, tabName) {
			var value = getWidgetData(tabName, 'mutpred1', row, 'mutpred_general_score');
			if (value == null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
			addBarComponent(div, row, 'MutPred Score', 'mutpred1__mutpred_general_score', tabName);
			var top5Mechs = getWidgetData(tabName, 'mutpred1', row, 'mutpred_top5_mechanisms');
			if (top5Mechs == null) {
				addEl(div, addEl(getEl('span'), getTn('N/A')));
			} else {
				var all_mechs = top5Mechs.split('; ');
				var withAtRe = /(.*) at ([A-Z]\d+).*P = (0\.\d+)/;
				var withoutAtRe = /(.*) \(P = (0\.\d+)\)/;
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['Mechanism', 'Location', 'P-value'],['60%','20%','20%']);
				addEl(table, thead);
				var tbody = getEl('tbody');
				for (var i = 0; i < all_mechs.length; i++) {
					var mech = all_mechs[i];
					var withAtMatch = withAtRe.exec(mech);
					var mechName = '';
					var mechLoc = '';
					var pval = '';
					if (withAtMatch != null) {
						mechName = withAtMatch[1];
						mechLoc = withAtMatch[2];
						pval = withAtMatch[3];
					} else {
						var withoutAtMatch = withoutAtRe.exec(mech);
						mechName = withoutAtMatch[1];
						pval = withoutAtMatch[2];
					}
					var tr = getWidgetTableTr([mechName, mechLoc, pval]);
					addEl(tbody, tr);
				}
				addEl(div, addEl(table, tbody));
			}
		}
	}
}
