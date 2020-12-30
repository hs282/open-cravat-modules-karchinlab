widgetGenerators['go'] = {
	'gene': {
		'width': 480, 
		'height': 200, 
		'word-break':'normal',
		'function': function (div, row, tabName) {
			var cco = getWidgetData(tabName, 'go', row, 'cco_id');
			var ccols = cco != null ? cco.split(';') : [];
			var cname = getWidgetData(tabName, 'go', row, 'cco_name');
			var cnames = cname != null ? cname.split(';') : [];
			var bpo = getWidgetData(tabName, 'go', row, 'bpo_id');
			var bpols = bpo != null ? bpo.split(';') : [];
			var bname= getWidgetData(tabName, 'go', row, 'bpo_name');
			var bnames = bname != null ? bname.split(';') : [];
			var mfo = getWidgetData(tabName, 'go', row, 'mfo_id')
			var mfols = mfo != null ? mfo.split(';') : [];
			var mname = getWidgetData(tabName, 'go', row, 'mfo_name')
			var mnames = mname != null ? mname.split(';') : [];
			var table = getWidgetTableFrame();
			addEl(div, table);
			var thead = getWidgetTableHead([ 'Biological Process','Cellular Component','Molecular Function']);
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
						var cname_val = ''
					} else{
						ccols_val = ccols[i]
						cname_val = cnames[i]
					}
					
					var link2 = `http://amigo.geneontology.org/amigo/term/${bpols[i]}`;
					if (bpols[i] == undefined){
						link2 = 'http://amigo.geneontology.org/amigo/term/'
						var bpols_val = ''
						var bname_val = ''
					} else{
						bpols_val = bpols[i]
						bname_val = bnames[i]
					}
					var link3 = `http://amigo.geneontology.org/amigo/term/${mfols[i]}`;
					if (mfols[i] == undefined){
						link3 = 'http://amigo.geneontology.org/amigo/term/'
						var mfols_val = ''
						var mname_val = ''
					} else{
						mfols_val = mfols[i]
						mname_val = mnames[i]
					}
					var tr = getWidgetTableTr([link2, link, link3], [bname_val,cname_val,mname_val]);
					addEl(tbody, tr);
				}
			}
		}
	}
