widgetGenerators['biogrid'] = {
	'gene': {
		'width': 480, 
		'height': 180, 
		'function': function (div, row, tabName) {
			var value = getWidgetData(tabName, 'biogrid', row, 'id');
			if (value == null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
            var id = getWidgetData(tabName, 'biogrid', row, 'id');
            var hugo = getWidgetData(tabName, 'base', row, 'hugo');
            var acts = getWidgetData(tabName, 'biogrid', row, 'acts');
            var head = 'BioGRID';
            if (hugo != null) {
                var head = hugo+' BioGRID'
            }
			var link = '';
			if(id != null) {
				link = 'https://thebiogrid.org/'+id;
			}
			else {
				id = '';
            }
            addInfoLineLink(div, head, id, link);
			var allMappings = getWidgetData(tabName, 'biogrid', row, 'all');
            if (allMappings != undefined && allMappings != null) {
                var results = JSON.parse(allMappings);
                var table = getWidgetTableFrame();
                addEl(div, table);
                var thead = getWidgetTableHead(['Interactors', 'Interaction Detection Method', 'Interaction Type', 'PubMed', 'Interaction ID'], ['18%', '25%']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                addEl(table, tbody);
                for (var i=0;i<results.length;i++){
                    var row = results[i];
                    var act = row[0];
                    var method = row[1];
                    var pub = row[2]
                    var publink = 'https://pubmed.ncbi.nlm.nih.gov/' + pub;
                    var types = row[3];
                    var interactid = row[4];
                    var interlink = 'https://thebiogrid.org/interaction/' + interactid;
                    var tr = getWidgetTableTr([act, method, types, publink, interlink], [pub, interactid]);
                    addEl(tbody, tr);
                    }
                }
                addEl(div, addEl(table, tbody));
            }
		}
	}
