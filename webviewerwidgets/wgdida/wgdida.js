widgetGenerators['dida'] = {
	'variant': {
		'width': 820, 
		'height': 180, 
		'function': function (div, row, tabName) {
			var comb = [];
			for (var j = 0; j < infomgr.datas.variant.length; j++) {
				var p = infomgr.datas.variant[j][11];
				var hugo = infomgr.datas.variant[j][7];
				var full = hugo + ';' + p;
				var wild = hugo + ';' + 'wild type';
				comb.push(full);
				comb.push(wild);
			}
			var geneA = getWidgetData(tabName, 'base', row, 'hugo');
			var Achange = getWidgetData(tabName, 'base', row, 'achange');
            var allMappings = getWidgetData(tabName, 'dida', row, 'all');
			if (allMappings != undefined && allMappings != null) {
                var results = JSON.parse(allMappings);
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['','Gene','Allele 1 Prot Chng', 'Allele 2 Prot Chng', 'ID', 'Disease', 'Oligogenic Effect', 'Gene Relationship', 'Familial Evidence', 'Functional Evidence', 'Bio Distance', 'PubMed'], ['5%', '7%', '10%', '10%', '5%', '10%','9%', '15%','7%', '9%'])//['5%','5%', '10%', '10%', '5%','10%', '10%', '10%', '10%', '10%', '10%', '5%']);
				addEl(table, thead);
				var tbody = getEl('tbody');
                for (var i = 0; i < results.length; i++) {
					var row = results[i];
					var id = row[0];
                    var geneB = row[4];
                    var Bchange1 = row[5];
                    var Bchange2 = row[6];
                    var Achange2 = row[7];
                    var name = row[1];
                    var effect = row[2];
					var relation = row[3];
					var fam = row[8];
					var funct = row[9];
					var dist = row[10];
					var pub = row[11];
					var link = `http://dida.ibsquare.be/detail/?dc=${id}`
					var link2 = `https://pubmed.ncbi.nlm.nih.gov/?term=${pub}`
					var tr = getWidgetTableTr(['Gene A',geneA, Achange, Achange2, link, name, effect, relation, fam, funct, dist, link2], [id, pub]);
					var tr2 = getWidgetTableTr(['Gene B',geneB, Bchange1, Bchange2])
					var td = tr.getElementsByTagName("td")[4];
					td.rowSpan = '2';
					var td2 = tr.getElementsByTagName("td")[5];
					td2.rowSpan = '2';
					var td3 = tr.getElementsByTagName("td")[6];
					td3.rowSpan = '2';
					var td4 = tr.getElementsByTagName("td")[7];
					td4.rowSpan = '2';
					var td5 = tr.getElementsByTagName("td")[8];
					td5.rowSpan = '2';
					var td6 = tr.getElementsByTagName("td")[9];
					td6.rowSpan = '2';
					var td7 = tr.getElementsByTagName("td")[10];
					td7.rowSpan = '2';
					var td8 = tr.getElementsByTagName("td")[11];
					td8.rowSpan = '2';
					var Acheck = geneA + ';' + Achange;
					var Acheck2 = geneA + ';' + Achange2;
					var Bcheck = geneB + ';' + Bchange1;
					var Bcheck2 = geneB + ';' + Bchange2;
					if (comb.includes(Acheck) && comb.includes(Bcheck) && comb.includes(Acheck2) && comb.includes(Bcheck2)){
						var color = 'yellow';
						var color2 = 'yellow';
					} else{
						color = 'E0E0E0';
						color2 = 'white';
					}
					$(tr).children().eq(0).css("background-color",color);
					$(tr).children().eq(1).css("background-color",color);
					$(tr).children().eq(2).css("background-color",color);
					$(tr).children().eq(3).css("background-color",color);
					$(tr2).children().eq(0).css("background-color",color2);
					$(tr2).children().eq(1).css("background-color",color2);
					$(tr2).children().eq(2).css("background-color",color2);
					$(tr2).children().eq(3).css("background-color",color2);
					addEl(tbody, tr);
					addEl(tbody, tr2);
					var text = 'The combination of variants in two distinct genes, known as a digenic combination, are causative for the disease and effect'
				}
				addEl(div, addEl(table, tbody));
				addInfoLine(div, '**','Yellow highlight indicates that the full digenic variant set is present');
                }
			}
		}
	}