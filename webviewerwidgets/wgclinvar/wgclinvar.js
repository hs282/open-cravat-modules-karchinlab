widgetGenerators['clinvar'] = {
	'variant': {
		'width': 450, 
		'height': 150, 
		'function': function (div, row, tabName) {
            var id = getWidgetData(tabName, 'clinvar', row, 'id');
            if (id == null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
            var sig = getWidgetData(tabName, 'clinvar', row, 'sig');
            var revstat = getWidgetData(tabName, 'clinvar', row, 'rev_stat');
            addInfoLine(div, 'Significance', sig, tabName);
            addInfoLine(div, 'Review Status', revstat, tabName);
			var link = '';
			if(id != null){
				link = 'https://www.ncbi.nlm.nih.gov/clinvar/variation/'+id;
			}
			else{
				id = '';
            }
            addInfoLineLink(div, 'ClinVar ID', id, link, 10);
            var diseases = getWidgetData(tabName, 'clinvar', row, 'disease_names');
            var refs = getWidgetData(tabName, 'clinvar', row, 'disease_refs');
			var diseasels = diseases != null ? diseases.split('|') : [];
			var refsls = refs != null ? refs.split('|') : [];
			disease_objls = []
			for (var i=0;i<refsls.length;i++){
				if (refsls[i] == '.'){
					refsls[i] = null;
				}
				else{
					disease_objls.push(linkify(diseasels[i], refsls[i]))
				}
			}
			var table = getWidgetTableFrame();
			addEl(div, table);
			var thead = getWidgetTableHead(['Disease', 'Database'],
										   ['70%','30%']);
			addEl(table, thead);
			var tbody = getEl('tbody');
			addEl(table, tbody);
			for (var j=0;j<disease_objls.length;j++){
				for (var ref in disease_objls[j].refs){
                    var link = disease_objls[j].refs[ref];
					var tr = getWidgetTableTr([disease_objls[j].name,link], [ref]);
					addEl(tbody, tr);
				}
			addEl(div, addEl(table, tbody));
			}

            //Returns a disease object with dictionary of db references
            function linkify(disease, db_id){
                var idls = db_id.split(',');
                var links = {};
                for (var i=0;i<idls.length;i++){
                    var link = ''
                    if(idls[i].startsWith('MedGen')){
                        link = 'https://www.ncbi.nlm.nih.gov/medgen/'+idls[i].slice(idls[i].indexOf(':')+1);
                        links.MedGen = link;
                    }
                    else if(idls[i].startsWith('OMIM')){
                        link = 'https://www.omim.org/entry/'+idls[i].slice(idls[i].indexOf(':')+1);
                        links.OMIM = link;
                    }
                    else if(idls[i].startsWith('EFO')){
                        link = 'https://www.ebi.ac.uk/ols/ontologies/efo/terms?short_form='+idls[i].slice(idls[i].indexOf(':')+1).replace(' ','_');
                        links.EFO = link;
                    }
                    else if(idls[i].startsWith('Human')){
                        link = 'https://www.human-phenotype-ontology.org/hpoweb/showterm?id='+idls[i].slice(idls[i].indexOf(':')+1);
                        links.HPO = link;
                    }
                    else if(idls[i].startsWith('Gene')){
                        link = 'https://www.ncbi.nlm.nih.gov/gene/'+idls[i].slice(idls[i].indexOf(':')+1);
                        links.Gene = link;
                    }
                    else if(idls[i].startsWith('Orphanet')){
                        link = 'https://www.orpha.net/consor/cgi-bin/OC_Exp.php?lng=EN&Expert='+idls[i].slice(idls[i].indexOf(':')+6);
                        links.Orphanet = link;
                    }
                    else if(idls[i].startsWith('MeSH')){
                        link = 'https://meshb.nlm.nih.gov/record/ui?ui='+idls[i].slice(idls[i].indexOf(':')+1);
                        links.MeSH = link;
                    }
                    else if(idls[i].startsWith('SNOMED')){
                        link = 'https://browser.ihtsdotools.org/?perspective=full&conceptId1='+idls[i].slice(idls[i].indexOf(':')+1)+'&edition=en-edition&release=v20180731&server=https://browser.ihtsdotools.org/api/v1/snomed&langRefset=900000000000509007';
                        links.SNOMED_CT = link;
                    }
                }
                return disease_obj = {
                    name: disease,
                    refs: links
                };
            }
		}
	}
}
