widgetGenerators['go'] = {
	'gene': {
		'width': 480, 
		'height': 200, 
		'word-break':'normal',
		'function': function (div, row, tabName) {
			var cco = getWidgetData(tabName, 'go', row, 'cco_');
			var ccols = cco != null ? cco.split(';') : [];
			var bpo = getWidgetData(tabName, 'go', row, 'bpo_');
			var bpols = bpo != null ? bpo.split(';') : [];
			var mfo = getWidgetData(tabName, 'go', row, 'mfo_')
			var mfols = mfo != null ? mfo.split(';') : [];
			var table = getWidgetTableFrame();
			addEl(div, table);
			var thead = getWidgetTableHead([ 'Biological Process','Cellular Component', 'Molecular Function']);
			addEl(table, thead);
			var tbody = getEl('tbody');
			addEl(table, tbody);
			if (ccols.length > bpols.length){
				var max = ccols.length
			}
			else if (bpols.length > ccols.length){
				max = bpols.length
			}
			else if (mfols.length > bpols.length){
				max =  mfols.length
			}
			else if (mfols.length > ccols.length){
				max = mfols.length
			}	
			else if (ccols.length > mfols.length){
				max = ccols.length
			}
			else if (bpols.length > mfols.length){
				max = bpols.length
			}
					for (let i=0; i<max; i++){
					var link = `http://amigo.geneontology.org/amigo/term/${ccols[i]}`;
					if (ccols[i] == undefined){
						link = 'http://amigo.geneontology.org/amigo/term/'
						var ccols_val = ''
					} else{
						ccols_val = ccols[i]
					}
					
					var link2 = `http://amigo.geneontology.org/amigo/term/${bpols[i]}`;
					if (bpols[i] == undefined){
						link2 = 'http://amigo.geneontology.org/amigo/term/'
						var bpols_val = ''
					} else{
						bpols_val = bpols[i]
					}
					var link3 = `http://amigo.geneontology.org/amigo/term/${mfols[i]}`;
					if (mfols[i] == undefined){
						link3 = 'http://amigo.geneontology.org/amigo/term/'
						var mfols_val = ''
					} else{
						mfols_val = mfols[i]
					}
					var tr = getWidgetTableTr([link2, link, link3], [bpols_val,ccols_val,mfols_val]);
					addEl(tbody, tr);
				}
			}
		}
	}
