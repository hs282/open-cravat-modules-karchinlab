widgetGenerators['chasmplus'] = {
	'variant': {
		'width': 280, 
		'height': 180, 
        'default_hidden': true,
		'function': function (div, row, tabName) {
			addInfoLine(div, 'Score', getWidgetData(tabName, 'chasmplus', row, 'score'), tabName);
			if(typeof addGradientBarComponent == 'function'){
				addGradientBarComponent(div, row, 'P-value', 'chasmplus__pval', tabName, {'0.01':[255,0,0], '0.05':[255,255,0], '0.050000001':[255,255,255]});
			}
			else{
				addInfoLine(div, row, 'P-value', 'chasmplus__pval', tabName);
			}
			addInfoLine(div, 'Transcript', getWidgetData(tabName, 'chasmplus', row, 'transcript'), tabName);
            var allMappings = getWidgetData(tabName, 'chasmplus', row, 'results');
            if (allMappings != null) {
                var table = getWidgetTableFrame();
                table.style.width = '100%';
                var thead = getWidgetTableHead(['Transcript', 'Score', 
                    'P-value'], ['60%', '20%', '20%']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                var lines = allMappings.split(',')
                for (var i = 0; i < lines.length; i++) {
                    var toks = lines[i].split(':')
                    var transcript = toks[0]
                    var score = toks[1].replace('(', '')
                    var pval = toks[2].replace(')', '')
                    var tr = getWidgetTableTr([transcript, score, pval]);
                    addEl(tbody, tr);
                }
                addEl(div, addEl(table, tbody));
            }
		}
	}
}
