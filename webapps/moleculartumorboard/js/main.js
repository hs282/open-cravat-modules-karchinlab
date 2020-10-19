var CLOSURE_NO_DEPS = true;
var annotData = null;
var sectionWidth = 1200;

function getInputDataFromUrl () {
    var urlParams = new URLSearchParams(window.location.search);
    var inputChrom = urlParams.get('chrom');
    var inputPos = urlParams.get('pos');
    var inputRef = urlParams.get('ref_base');
    var inputAlt = urlParams.get('alt_base');
    var inputData = cleanInputData(inputChrom, inputPos, inputRef, inputAlt);
    return inputData;
}

function cleanInputData (inputChrom, inputPos, inputRef, inputAlt) {
    if (inputChrom == '') {
        inputChrom = null;
    }
    if (inputPos == '') {
        inputPos = null;
    }
    if (inputRef == '') {
        inputRef = null;
    }
    if (inputAlt == '') {
        inputAlt = null;
    }
    if (inputChrom == null || inputPos == null || inputRef == null || inputAlt == null) {
        return null;
    } else {
        return {'chrom': inputChrom, 'pos': inputPos, 'ref': inputRef, 'alt': inputAlt};
    }
}

function submitForm () {
    var value = document.querySelector('#input_variant').value;
    var toks = value.split(':');
    if (toks.length != 4) {
        return;
    }
    var chrom = toks[0];
    var pos = toks[1];
    var ref = toks[2];
    var alt = toks[3];
    var inputData = cleanInputData(chrom, pos, ref, alt);
    if (inputData != null) {
        showContentDiv();
        submitAnnotate(inputData['chrom'], inputData['pos'], inputData['ref'], inputData['alt']);
        hideSearch();
    }
}

function submitAnnotate (inputChrom, inputPos, inputRef, inputAlt) {
    var url = 'annotate';
    var params = {'chrom':inputChrom, 'pos':parseInt(inputPos), 'ref_base':inputRef, 'alt_base':inputAlt};
    $.ajax({
        type: 'POST',
        url: url,
        data: params,
        success: function (response) {
            annotData = response;
            annotData['base'] = annotData['crx'];
            showAnnotation(response);
        }
    });
}

function getModulesData (moduleNames) {
    var data = {};
    for (var i = 0; i < moduleNames.length; i++) {
        var moduleName = moduleNames[i];
        var moduleData = annotData[moduleName];
        if (moduleData == null) {
            continue;
        }
        var moduleDataKeys = Object.keys(moduleData);
        for (var j = 0; j < moduleDataKeys.length; j++) {
            var key = moduleDataKeys[j];
            var value = moduleData[key];
            data[moduleName + '__' + key] = value;
        }
    }
    return data;
}

function showWidget (widgetName, moduleNames, level, parentDiv, maxWidth, maxHeight, showTitle) {
    var generator = widgetGenerators[widgetName];
    var divs = null;
    var maxWidthParent = null;
    var maxHeightParent = null;
    if (maxWidth != undefined || maxWidth != null) {
        generator[level]['width'] = null;
        generator[level]['max-width'] = maxWidth;
        maxWidthParent = maxWidth + 30;
    }
    if (maxHeight != undefined || maxHeight != null) {
        generator[level]['height'] = null;
        generator[level]['max-height'] = maxHeight;
        maxHeightParent = maxHeight + 30;
    }
    if (level != undefined) {
        divs = getDetailWidgetDivs(level, widgetName, widgetInfo[widgetName].title, maxWidthParent, maxHeightParent, showTitle);
    } else {
        if ('variant' in generator) {
            divs = getDetailWidgetDivs('variant', widgetName, widgetInfo[widgetName].title, maxWidthParent, maxHeightParent, showTitle);
            level = 'variant';
        } else if ('gene' in generator) {
            divs = getDetailWidgetDivs('gene', widgetName, widgetInfo[widgetName].title, maxWidthParent, maxHeightParent, showTitle);
            level = 'gene';
        }
    }
    var data = getModulesData(moduleNames);
    if (Object.keys(data).length == 0) {
        var span = getNodataSpan();
        span.style.paddingLeft = '7px';
        addEl(divs[1], span);
        //var ret = widgetGenerators[widgetName][level]['function'](divs[1], data, 'variant', true); // last true is to highlight if value exists.
    } else {
        if (level == 'gene') {
            data['base__hugo'] = annotData['crx'].hugo;
        }
        var ret = widgetGenerators[widgetName][level]['function'](divs[1], data, 'variant', true); // last true is to highlight if value exists.
    }
    addEl(parentDiv, divs[0]);
    return divs;
}

function showAnnotation (response) {
    document.querySelectorAll('.detailcontainerdiv').forEach(function (el) {
        $(el).empty();
    });
    hideSpinner();
    var parentDiv = document.querySelector('#contdiv_vannot');
    parentDiv.style.position = 'relative';
    parentDiv.style.width = sectionWidth + 'px';
    parentDiv.style.height = '560px';
    showWidget('basepanel', ['base','lollipop', 'hgvs'], 'variant', parentDiv);
    var parentDiv = document.querySelector('#contdiv_action');
    parentDiv.style.position = 'relative';
    parentDiv.style.width = sectionWidth + 'px';
    parentDiv.style.height = '300px';
    parentDiv.style.overflow="auto";
    showWidget('actionpanel', ['base','target', 'civic', 'pharmgkb', 'cancer_genome_interpreter'], 'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_driver');
    parentDiv.style.position = 'relative';
    parentDiv.style.width = sectionWidth + 'px';
    parentDiv.style.height = '400px';
    parentDiv.style.overflow="auto";
    showWidget('driverpanel', ['base','cgc', 'cgl', 'mutpanning', 'chasmplus'], 'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_hotspots');
    parentDiv.style.position = 'relative';
    showWidget('hotspotspanel', ['base', 'cancer_hotspots', 'cosmic'], 'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_af');
    showWidget('poppanel', ['base', 'gnomad', 'thousandgenomes', 'gnomad3'], 'variant', parentDiv);
    var parentDiv = document.querySelector('#contdiv_pathways');
    showWidget('pathwayspanel', ['base', 'ndex'], 'variant', parentDiv, null, 'unset', false);
    var parentDiv = document.querySelector('#contdiv_structure');
    showWidget('structurepanel', ['base', 'mupit'], 'variant', parentDiv, null, 'unset', false);
    var parentDiv = document.querySelector('#contdiv_germline');
    showWidget('germlinepanel', ['base', 'clinvar'], 'variant', parentDiv, null, null, false);
}

function getWidgets (callback, callbackArgs) {
    $.get('/result/service/widgetlist', {}).done(function (jsonResponseData) {
        var tmpWidgets = jsonResponseData;
        var widgetLoadCount = 0;
        for (var i = 0; i < tmpWidgets.length; i++) {
            var tmpWidget = tmpWidgets[i];
            var widgetName = tmpWidget['name'];
            var widgetNameNoWg = widgetName.substring(2);
            widgetInfo[widgetNameNoWg] = tmpWidget;
            $.getScript('/result/widgetfile/' + widgetName + '/' + widgetName + '.js', function () {
                widgetLoadCount += 1;
                if (widgetLoadCount == tmpWidgets.length) {
                    if (callback != null) {
                        callback(callbackArgs);
                    }
                }
            });
        }
    });
}

function getNodataSpan () {
    var span = getEl('span');
    span.classList.add('nodata');
    span.textContent = 'No annotation available';
    return span;
}

var widgetInfo = {};
var widgetGenerators = {};

widgetInfo['base2'] = {'title': ''};
widgetGenerators['base2'] = {
	'variant': {
		'width': 580, 
		'height': 200, 
		'function': function (div, row, tabName) {
            var hugo = getWidgetData(tabName, 'base', row, 'hugo');
            var transcript = getWidgetData(tabName, 'base', row, 'transcript');
            var nref = getWidgetData(tabName, 'base', row, 'ref_base').length;
            var ref_base = getWidgetData(tabName, 'base', row, 'ref_base')
            var alt_base = getWidgetData(tabName, 'base', row, 'alt_base')
            var nalt = getWidgetData(tabName, 'base', row, 'alt_base').length;
            var chrom = getWidgetData(tabName, 'base', row, 'chrom');
            var chrom = chrom.substring(3)
            var thous_af = getWidgetData(tabName, 'thousandgenomes', row, 'af');
            var gnomad_af = getWidgetData(tabName, 'gnomad', row, 'af')
            addInfoLine(div, transcript + '(' + hugo + ')', getWidgetData(tabName, 'base', row, 'cchange') + ' ' + '(' + getWidgetData(tabName, 'base', row, 'achange') + ')', tabName);
            if (nref==1 && nalt==1 && ref_base != '-' && alt_base != '-'){
                var variant_type = 'single nucleotide variant';
            }
            if (nref > 1 && nalt == 1 && alt_base == '-'){
                var variant_type = 'deletion';
            }
            if (nref == 1 && nalt > 1 && ref_base == '-'){
                var variant_type = 'insertion';
            }
            if (nref > 1 && nalt > 1){
                var variant_type = 'complex substitution';
            }
            addEl(div, getEl('br'));
            addInfoLine(div, 'Variant type', variant_type);
            if (variant_type == 'single nucleotide variant'){
                var variant_length = '1';
            }
            if (variant_type == 'deletion'){
                var variant_length = nref;
            }
            if (variant_type == 'insertion' && 'complex substitution'){
                var variant_length = nalt;
            }
            addInfoLine(div, 'Variant Length', variant_length);
            addInfoLine(div, 'Cytogenetic Location')
            addInfoLine(div, 'Genomic Location',  chrom + ':' + ' '+ getWidgetData(tabName, 'base', row, 'pos') + ' '+ '(GRCh38)', tabName);
            addInfoLine(div, 'Sequence ontology', getWidgetData(tabName, 'base', row, 'so'), tabName);
            if (thous_af > gnomad_af){
                var max_af = thous_af;
            }
            if (gnomad_af > thous_af){
                var max_af = gnomad_af;
            }
                addInfoLine(div, '1000g/gnomAD max AF', max_af);
            addInfoLine(div, 'dbSNP', getWidgetData(tabName, 'dbsnp', row, 'snp'));
        }
    }
}

widgetInfo['base3'] = {'title': 'All mappings'};
widgetGenerators['base3'] = {
	'variant': {
		'width': 580, 
		'height': 200, 
		'function': function (div, row, tabName) {
        var allMappings = null;
        allMappings = getWidgetData(tabName, 'base', row, 'all_mappings');
        allMappings = JSON.parse(allMappings);
        var table = getWidgetTableFrame();
        table.style.tableLayout = 'auto';
        table.style.width = '100%';
        var thead = getWidgetTableHead(['Gene', 'HGVS'])
        addEl(table, thead);
        var tbody = getEl('tbody');
        var hugos = Object.keys(allMappings);
        for (var i = 0; i < hugos.length; i++) {
            var hugo = hugos[i];
            var uniprot_ds = allMappings[hugo];
            for (var j = 0; j < uniprot_ds.length; j++) {
                var uniprot_d = uniprot_ds[j];
                var aachange = uniprot_d[1];
                var transcript = uniprot_d[3];
                var hgvs = transcript + ':' + aachange
                if (aachange == ""){
                    continue;
                }
                    var tr = getWidgetTableTr([getWidgetData(tabName, 'base', row, 'hugo'), hgvs]);
                    addEl(tbody, tr);
                    addEl(div, addEl(table, tbody));
                }
            }
        }
    }
}


widgetInfo['litvar'] = {'title': 'LitVar'};
widgetGenerators['litvar'] = {
	'variant': {
		'width': 580, 
		'height': 200, 
        'variables': {
            'rsids2pmids': {},
        },
		'function': function (div, row, tabName) {
            var widgetName = 'litvar';
			var v = widgetGenerators[widgetName][tabName]['variables'];
            var rsid = getWidgetData(tabName, 'dbsnp', row, 'snp');
            if (rsid == null) {
                return;
            }
            var n = v['rsids2pmids'][rsid];
            var link = 'https://www.ncbi.nlm.nih.gov/CBBresearch/Lu/Demo/LitVar/#!?query=' + rsid;
            if (n != undefined) {
                addInfoLineLink(
                    div, 
                    '# publications for the variant (' + rsid + ')', 
                    n, 
                    link,
                    tabName
                );
            } else {
                var url = 'https://www.ncbi.nlm.nih.gov/research/bionlp/litvar/api/v1/public/rsids2pmids?rsids=' + rsid;
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == XMLHttpRequest.DONE) {
                        if (xhr.status == 200) {
                            var response = JSON.parse(xhr.responseText);
                            if (response.length == 0) {
                                n = 0;
                            } else {
                                n = response[0]['pmids'].length;
                            }
                            v['rsids2pmids'][rsid] = n;
                            addInfoLineLink(
                                div, 
                                '# publications for the variant (' + rsid + ')', 
                                n, 
                                link,
                                tabName
                            );
                        }
                    }
                };
                xhr.send();
            }
            return;
		}
	},
}

widgetInfo['brca'] = {'title': ''};
widgetGenerators['brca'] = {
	'variant': {
		'width': 580, 
        'height': 200, 
		'function': function (div, row, tabName) {
            var widgetName = 'brca';
			var v = widgetGenerators[widgetName][tabName]['variables'];
            var chrom = getWidgetData(tabName, 'base', row, 'chrom');
            var pos = getWidgetData(tabName, 'base', row, 'pos')
            var ref_base = getWidgetData(tabName, 'base', row, 'ref_base')
            var alt_base = getWidgetData(tabName, 'base', row, 'alt_base')
            var search_term = chrom + ':g.' + pos + ':' + ref_base + '>' + alt_base
            var url = 'https://brcaexchange.org/backend/data/?format=json&search_term=' + search_term + '&include=Variant_in_ENIGMA';
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    if (xhr.status == 200) {
                        var response = JSON.parse(xhr.responseText);
                        id = response.data.id
                        link = 'https://brcaexchange.org/variant/' + id
                        sig = response.data.Clinical_significance_ENIGMA
                        addInfoLineLink(div,sig, 'BRCA Exchange', link);
                        
                        
                        }
                };
             }
             xhr.send();
         return;
		}
	},
}

widgetInfo['oncokb'] = {'title': ''};
widgetGenerators['oncokb'] = {
	'variant': {
		'width': 580, 
        'height': 200, 
		'function': function (div, row, tabName) {
            var widgetName = 'brca';
			var v = widgetGenerators[widgetName][tabName]['variables'];
            var chrom = getWidgetData(tabName, 'base', row, 'chrom');
            var pos = getWidgetData(tabName, 'base', row, 'pos')
            var ref = getWidgetData(tabName, 'base', row, 'ref_base')
            var alt = getWidgetData(tabName, 'base', row, 'alt_base')
            var search_term = chrom + '%2C'+pos + '2%C' + pos+'2%C' +ref+'2%C' +alt
            var genome = '&referenceGenome=GRCh37'
            var url = 'oncokb?chrom=' + chrom +'&start=' + pos + '&end=' + pos + '&ref_base=' + ref + '&alt_base=' + alt;
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    if (xhr.status == 200) {
                        var response = JSON.parse(xhr.responseText);
                        effect = response.mutationEffect.knownEffect
                        oncogenic = response.oncogenic
                        hugo = response.query.hugoSymbol
                        link = 'https://www.oncokb.org/gene/' + hugo
                        addInfoLineLink(div, effect  +', ' + oncogenic, 'oncoKB', link)
                        }
                };
             }
             xhr.send();
         return;
		}
	},
}


widgetInfo['ncbi'] = {'title': ''};
widgetGenerators['ncbi'] = {
	'gene': {
		'width': '100%', 
		'height': 200, 
		'function': function (div, row, tabName) {
            addInfoLine(
                div, 
                'NCBI Gene', 
                getWidgetData(tabName, 'ncbigene', row, 'ncbi_desc'), 
                tabName
            );
        }
    }
}

widgetInfo['cgc2'] = {'title': ''};
widgetGenerators['cgc2'] = {
	'gene': {
		'width': '700', 
		'height': 200, 
		'function': function (div, row, tabName) {
            var cgc_class = getWidgetData(tabName, 'cgc', row, 'class');
            var inheritance = getWidgetData(tabName, 'cgc', row, 'inheritance');
            var tts = getWidgetData(tabName, 'cgc', row, 'tts');
            var ttg = getWidgetData(tabName, 'cgc', row, 'ttg');
            addInfoLine(div, 'Cancer Gene Consensus', cgc_class + ' with inheritance ' + inheritance + '. Somatic types are ' + tts + '. Germline types are ' + ttg + '.');
        }
    }
}

widgetInfo['cgl2'] = {'title': ''};
widgetGenerators['cgl2'] = {
	'gene': {
		'width': '100%', 
		'height': 200, 
		'function': function (div, row, tabName) {
        addInfoLine(div, 'Cancer Gene Landscape', 'Identified as '+  getWidgetData(tabName, 'cgl', row, 'class') + '.', tabName);
        }
    }
}

widgetInfo['chasmplus2'] = {'title': 'Chasmplus'};
widgetGenerators['chasmplus2'] = {
    'variant': {
		'width': '540', 
		'height': 500, 
		'function': function (div, row, tabName) {
        addInfoLine(div, 'score', getWidgetData(tabName, 'chasmplus', row, 'score'), tabName);
        addInfoLine(div, 'p-value', getWidgetData(tabName, 'chasmplus', row, 'pval'), tabName);
        }
    }
}

widgetInfo['mutpanning'] = {'title': 'MutPanning'};
widgetGenerators['mutpanning'] = {
    'gene': {
		'width': '540', 
		'height': 'unset', 
		'function': function (div, row, tabName) {
        addInfoLine(div, 'Number of Cancer Types', getWidgetData(tabName, 'mutpanning', row, 'No_Cancer_Types'), tabName);
        addInfoLine(div, 'Mutation Frequency', getWidgetData(tabName, 'mutpanning', row, 'Max_Frequency'), tabName);
        var literature = getWidgetData(tabName, 'mutpanning', row, 'Supporting_Literature');
        if (literature == "Yes"){
            var ids= getWidgetData(tabName, 'mutpanning', row, 'Tumorportal') +  '; ' + getWidgetData(tabName, 'mutpanning', row, 'TCGA_Marker_Papers') + '; ' + getWidgetData(tabName, 'mutpanning', row, 'Bailey_Database') + '; ' + getWidgetData(tabName, 'mutpanning', row, 'dNdS_Study');
            var ids = ids;
            ids = ids !== null ? ids.split('; ') : [];
            const table = getWidgetTableFrame();
            addEl(div, table);
            const thead = getWidgetTableHead(['Supporting Literature', 'Link']);
            addEl(table, thead);
            const tbody = getEl('tbody');
            addEl(table, tbody);
            for (let i=0; i<ids.length; i++){
                var mut= ids[i];
                var link = `https://pubmed.ncbi.nlm.nih.gov/${mut}`;
                var titles = "Tumorportal, TCGA_Marker_Papers, Bailey_Database, dNdS_Study";
                titles = titles !== null ? titles.split(', ') : []; 
            for (let i=0; i<ids.length; i++);{
                var name = titles[i];
                let tr = getWidgetTableTr([name, link],[mut]);
                addEl(tbody, tr);
                addEl(div, addEl(table, tbody)); 
                 }
            }
        }  
    }
} 
}

widgetInfo['civic2'] = {'title': 'CIVIC'};
widgetGenerators['civic2'] = {
    'variant': {
		'width': '100%', 
		'height': 'unset', 
		'function': function (div, row, tabName) {
            var score = getWidgetData(tabName, 'civic', row, 'clinical_a_score');
            var description = getWidgetData(tabName, 'civic', row, 'description');
            addInfoLine(div, 'Clinical Actionability Score', score, tabName);
            addInfoLine(div, 'Description', description, tabName);
        }
    }
}

widgetInfo['pharmgkb2'] = {'title': 'PharmGKB'};
widgetGenerators['pharmgkb2'] = {
    'variant': {
		'width': '100%', 
		'height': 'unset', 
		'function': function (div, row, tabName) {
            addInfoLine(div, 'PharmGKB', getWidgetData(tabName, 'pharmgkb', row, 'notes'))
        }
    }
}


widgetInfo['clinvar2'] = {'title': 'ClinVar'};
widgetGenerators['clinvar2'] = {
	'variant': {
		'width': 480, 
		'height': 250, 
		'function': function (div, row, tabName) {
			var id = getWidgetData(tabName, 'clinvar', row, 'id');
            var sig = getWidgetData(tabName, 'clinvar', row, 'sig');
            addInfoLine(div, 'Significance', sig, tabName);
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
			var thead = getWidgetTableHead(['Disease', 'Database', 'Link'],
										   ['70%','20%','10%']);
			addEl(table, thead);
			var tbody = getEl('tbody');
			addEl(table, tbody);
			for (var j=0;j<disease_objls.length;j++){
				for (var ref in disease_objls[j].refs){
					var link = disease_objls[j].refs[ref];
					var tr = getWidgetTableTr([disease_objls[j].name, ref, link]);
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






widgetInfo['cosmic2'] = {'title': 'COSMIC'};
widgetGenerators['cosmic2'] = {
	'variant': {
		'width': '100%', 
		'height': 'unset', 
		'word-break': 'normal',
		'function': function (div, row, tabName) {
			var vcTissue = getWidgetData(tabName, 'cosmic', row, 'variant_count_tissue');
			if (vcTissue != undefined && vcTissue !== null) {
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['Tissue', 'Count'],['85%','15%']);
				addEl(table, thead);
				var tbody = getEl('tbody');
				var toks = vcTissue.split(';');
				var re = /(.*)\((.*)\)/
                var tissues = [];
                var counts = [];
				for (var i = 0; i < toks.length; i++) {
					var tok = toks[i];
					var match = re.exec(tok);
					if (match !== null) {
						var tissue = match[1].replace(/_/g, " ");
						var count = match[2];
						var tr = getWidgetTableTr([tissue, count]);
						addEl(tbody, tr);
                        tissues.push(tissue)
                        counts.push(parseInt(count));
					}
				}
				addEl(div, addEl(table, tbody));
                var colors = [
                    '#008080', // teal
                    '#ffd700', // gold
                    '#00ff00', // lime
                    '#ff0000', // red
                    '#dc143c', // crimson
                    '#d2691e', // chocolate
                    '#8b4513', // saddle brown
                    '#0000ff', // blue
                    '#ff4500', // orange red
                    '#ffa500', // orange
                    '#adff2f', // green yellow
                    '#7fffd4', // aqua marine
                    '#00ced1', // dark turquoise
                    '#00bfff', // deep sky blue
                    '#ffff00', // yellow
                    '#00ffff', // aqua
                    '#000080', // navy
                ];
            div.style.width = 'calc(100% - 37px)';
            var chartDiv = getEl('canvas');
            chartDiv.style.width = 'calc(100% - 20px)';
			chartDiv.style.height = 'calc(100% - 20px)';
            addEl(div, chartDiv);
                var chart = new Chart(chartDiv, {
                    type: 'doughnut',
				data: {
					datasets: [{
						data: counts,
						backgroundColor: colors
					}],
					labels: tissues
				},
                    options: {
                        responsive: true,
                        responsiveAnimationDuration: 500,
                        maintainAspectRatio: false,
                        }
                    }
                    
                )}
                
            }
        }
    }

widgetInfo['cgi'] = {'title': ''};
widgetGenerators['cgi'] = {
    'variant': {
		'width': '100%', 
		'height': 'unset', 
		'function': function (div, row, tabName) {
            addInfoLine(div, 'Association', 'Drug ' + getWidgetData(tabName, 'cancer_genome_interpreter', row, 'association') + ', CGI')
        }
    }
}

widgetInfo['target2'] = {'title': ''};
widgetGenerators['target2'] = {
    'variant': {
		'width': '100%', 
		'height': 'unset', 
		'function': function (div, row, tabName) {
            var therapy = getWidgetData(tabName, 'target', row, 'therapy');
            var rationale = getWidgetData(tabName, 'target', row, 'rationale');
            addInfoLine(div, 'TARGET', "Identifies this gene associated with " + therapy + '. The rationale is ' + rationale)
        }
    }
}


widgetInfo['basepanel'] = {'title': ''};
widgetGenerators['basepanel'] = {
    'variant': {
        'width': sectionWidth,
        'height': undefined,
        'function': function (div, row, tabName) {
            var generator = widgetGenerators['base2']['variant'];
            generator['width'] = 450;
            var divs = showWidget('base2', ['base', 'dbsnp', 'thousandgenomes', 'gnomad'], 'variant', div, null, 220);
            divs[0].style.position = 'absolute';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var generator = widgetGenerators['base3']['variant'];
            generator['width'] = 400;
            var divs = showWidget('base3', ['base'], 'variant', div, null, 125);
            divs[0].style.position = 'absolute';
            divs[0].style.top = '0px';
            divs[0].style.left = '470px';
            var generator = widgetGenerators['litvar']['variant'];
            generator['width'] = 400;
            var divs = showWidget('litvar', ['base', 'litvar', 'dbsnp'], 'variant', div, null, 220);
            divs[0].style.position = 'absolute';
            divs[0].style.top = '150px';
            divs[0].style.left = '470px';
            var generator = widgetGenerators['lollipop']['variant'];
            generator['width'] = sectionWidth;
            generator['height'] = 200;
            generator['variables']['hugo'] = '';
            annotData['base']['numsample'] = 1;
            var divs = showWidget('lollipop', ['base'], 'variant', div);
            divs[0].style.position = 'absolute';
            divs[0].style.top = '250px';
            divs[0].style.left = '0px';
            var generator = widgetGenerators['ncbi']['gene'];
            generator['width'] = 400;
            //var divs = showWidget('ncbi', ['base', 'ncbigene'], 'gene', div, null, 220);
            var divs = showWidget('ncbigene', ['base', 'ncbigene'], 'gene', div, 1175, 300);
            divs[0].style.position = 'absolute';
            divs[0].style.top = '440px';
            divs[0].style.left = '0px';
        }
    }
}

widgetInfo['actionpanel'] = {'title': ''};
widgetGenerators['actionpanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var generator = widgetGenerators['brca']['variant'];
            generator['width'] = 400;
            var divs = showWidget('brca', ['base'], 'variant', div, null, 220)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var table = getEl('table');
            var tr = getEl('tr');
            var td = getEl('td');
            var generator = widgetGenerators['oncokb']['variant'];
            generator['width'] = 400;
            var divs = showWidget('oncokb', ['base'], 'variant', div, null, 220)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var table = getEl('table');
            var tr = getEl('tr');
            var td = getEl('td');
            td.style.position = 'relative';
            var divs = showWidget('cgi', ['cancer_genome_interpreter'], 'variant', div, null, 220)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var table = getEl('table');
            var tr = getEl('tr');
            var td = getEl('td');
            var generator = widgetGenerators['brca']['variant'];
            generator['width'] = 400;
            var divs = showWidget('target2', ['target'], 'variant', div, null, 220)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var table = getEl('table');
            var tr = getEl('tr');
            var td = getEl('td');
            var divs = showWidget('civic2', ['civic'], 'variant', div, null, 220)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var table = getEl('table');
            var tr = getEl('tr');
            var td = getEl('td');
            var divs = showWidget('pharmgkb2', ['pharmgkb'], 'variant', div, null, 220)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var table = getEl('table');
            var tr = getEl('tr');
            var td = getEl('td');
            addEl(div, table);
        }
    }
}



widgetInfo['driverpanel'] = {'title': ''};
widgetGenerators['driverpanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var generator = widgetGenerators['cgc2']['gene'];
            generator['width'] = '100%'
            var divs = showWidget('cgc2', ['base', 'cgc'], 'gene', div, null, 220);
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var generator = widgetGenerators['cgl2']['gene'];
            generator['width'] = '100%'
            var divs = showWidget('cgl2', ['base', 'cgl'], 'gene', div, null, 220);
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var generator = widgetGenerators['chasmplus2']['variant'];
            generator['width'] = '100%'
            var divs = showWidget('chasmplus2', ['base', 'chasmplus'], 'variant', div, null, 220);
            divs[0].style.position = 'absolute';
            divs[0].style.top = '110px';
            divs[0].style.left = '8px';
            var generator = widgetGenerators['mutpanning']['gene'];
            generator['width'] = '100%'
            var divs = showWidget('mutpanning', ['base', 'mutpanning'], 'gene', div, 500, 500);
            divs[0].style.position = 'absolute';
            divs[0].style.top = '200px';
            divs[0].style.left = '8px';
        }
    }
}

widgetInfo['hotspotspanel'] = {'title': ''};
widgetGenerators['hotspotspanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var generator = widgetGenerators['cosmic2']['variant'];
            generator['width'] = '100%'
            var divs = showWidget('cosmic2', ['base', 'cosmic'], 'variant', div, null, 220);
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var generator = widgetGenerators['cancer_hotspots']['variant'];
            generator['width'] = '100%'
            var divs = showWidget('cancer_hotspots', ['base', 'cancer_hotspots'], 'variant', div, null, 220);
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
        }
    }
}


widgetInfo['poppanel'] = {'title': ''};
widgetGenerators['poppanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var table = getEl('table');
            var tr = getEl('tr');
            var td = getEl('th');
            td.style.width = '100px';
            td.textContent = 'gnomADv2';
            addEl(tr, td);
            var td = getEl('td');
            addBarComponent(td, row, 'Total', 'gnomad__af', tabName);
            addBarComponent(td, row, 'African', 'gnomad__af_afr', tabName);
            addBarComponent(td, row, 'American', 'gnomad__af_amr', tabName);
            addBarComponent(td, row, 'Ashkenazi', 'gnomad__af_asj', tabName);
            addBarComponent(td, row, 'East Asn', 'gnomad__af_eas', tabName);
            addBarComponent(td, row, 'Finn', 'gnomad__af_fin', tabName);
            addBarComponent(td, row, 'Non-Finn Eur', 'gnomad__af_nfe', tabName);
            addBarComponent(td, row, 'Other', 'gnomad__af_oth', tabName);
            addBarComponent(td, row, 'South Asn', 'gnomad__af_sas', tabName);
            addEl(tr, td);
            addEl(table, tr);
            var tr = getEl('tr');
            var td = getEl('th');
            td.style.width = '100px';
            td.textContent = 'gnomADv3';
            addEl(tr, td);
            var td = getEl('td');
            addBarComponent(td, row, 'Total', 'gnomad3__af', tabName);
            addBarComponent(td, row, 'African', 'gnomad3__af_afr', tabName);
            addBarComponent(td, row, 'American', 'gnomad3__af_amr', tabName);
            addBarComponent(td, row, 'Ashkenazi', 'gnomad3__af_asj', tabName);
            addBarComponent(td, row, 'East Asn', 'gnomad3__af_eas', tabName);
            addBarComponent(td, row, 'Finn', 'gnomad3__af_fin', tabName);
            addBarComponent(td, row, 'Non-Finn Eur', 'gnomad3__af_nfe', tabName);
            addBarComponent(td, row, 'Other', 'gnomad3__af_oth', tabName);
            addBarComponent(td, row, 'South Asn', 'gnomad3__af_sas', tabName);
            addEl(tr, td);
            addEl(table, tr);
            var tr = getEl('tr');
            var td = getEl('th');
            td.textContent = '1000 Genomes';
            addEl(tr, td);
            var td = getEl('td');
            addBarComponent(td, row, 'Total', 'thousandgenomes__af', tabName);
            addBarComponent(td, row, 'African', 'thousandgenomes__afr_af', tabName);
            addBarComponent(td, row, 'American', 'thousandgenomes__amr_af', tabName);
            addBarComponent(td, row, 'East Asn', 'thousandgenomes__eas_af', tabName);
            addBarComponent(td, row, 'European', 'thousandgenomes__eur_af', tabName);
            addBarComponent(td, row, 'South Asn', 'thousandgenomes__sas_af', tabName);
            addEl(table, addEl(tr, td));
            addEl(div, table);
        }
    }
}



widgetInfo['pathwayspanel'] = {'title': ''};
widgetGenerators['pathwayspanel'] = {
    'variant': {
        'width': sectionWidth,
        'height': 'unset',
        'function': function (div, row, tabName) {
            div.style.overflow = 'unset';
            var table = getEl('table');
            var tr = getEl('tr');
            var td = getEl('td');
            td.style.width = sectionWidth + 'px';
            var generator = widgetGenerators['ndex']['gene'];
            var setHeight = null;
            if (row['ndex__networkid'] != undefined) {
                td.style.height = '605px';
                setHeight = 560;
            } else {
                setHeight = 50;
            }
            generator['height'] = setHeight;
            generator['width'] = sectionWidth - 7;
            showWidget('ndex', ['ndex'], 'gene', td, null);
            addEl(tr, td);
            addEl(table, tr);
            addEl(div, table);
        }
    }
}

widgetInfo['structurepanel'] = {'title': ''};
widgetGenerators['structurepanel'] = {
    'variant': {
        'width': sectionWidth,
        'height': 'unset',
        'function': function (div, row, tabName) {
            div.style.overflow = 'unset';
            var table = getEl('table');
            var tr = getEl('tr');
            var td = getEl('td');
            td.style.width = sectionWidth + 'px';
            var generator = widgetGenerators['mupit2']['variant'];
            generator['width'] = sectionWidth;
            var height = null;
            if (row['mupit__link'] != undefined) {
                td.style.height = '605px';
                height = 560;
            } else {
                height = 50;
            }
            generator['height'] = height;
            generator['width'] = sectionWidth - 7;
            showWidget('mupit2', ['base', 'mupit'], 'variant', td);
            addEl(tr, td);
            addEl(table, tr);
            addEl(div, table);
        }
    }
}



widgetInfo['germlinepanel'] = {'title': ''};
widgetGenerators['germlinepanel'] = {
    'variant': {
        'width': sectionWidth,
        'height': 'unset',
        'function': function (div, row, tabName) {
            div.style.overflow = 'unset';
            var table = getEl('table');
            var tr = getEl('tr');
            var td = getEl('td');
            td.style.width = sectionWidth + 'px';
            showWidget('clinvar2', ['clinvar'], 'variant', td, null, 250);
            addEl(tr, td);
            addEl(table, tr);
            addEl(div, table);
        }
    }
}



widgetInfo['mupit2'] = {'title': 'MuPIT'};
widgetGenerators['mupit2'] = {
	'variant': {
		'width': 600, 
		'height': 500, 
		'function': function (div, row, tabName) {
            var chrom = getWidgetData(tabName, 'base', row, 'chrom');
            var pos = getWidgetData(tabName, 'base', row, 'pos');
            var url = location.protocol + '//www.cravat.us/MuPIT_Interactive/rest/showstructure/check?pos=' + chrom + ':' + pos;
            var iframe = getEl('iframe');
            iframe.style.position = 'absolute';
            iframe.style.top = '15px';
            iframe.style.left = '0px';
            iframe.style.width = '100%';
            iframe.style.height = '500px';
            iframe.style.border = '0px';
            addEl(div, iframe);
            $.get(url).done(function (response) {
                if (response.hit == true) {
                    iframe.src = location.protocol + '//www.cravat.us/MuPIT_Interactive?gm=' + chrom + ':' + pos + '&embed=true';
                } else {
                    iframe.parentElement.removeChild(iframe);
                    var sdiv = getEl('div');
                    sdiv.textContent = 'No annotation available';
                    sdiv.style.paddingLeft = '7px';
                    sdiv.style.color = '#cccccc';
                    addEl(div, sdiv);
                    div.parentElement.style.height = '50px';
                }
            });
		}
	}
}
function writeToVariantArea (inputData) {
    var value = inputData['chrom'] + ':' + inputData['pos'] + ':' + inputData['ref'] + ':' + inputData['alt'];
    document.querySelector('#input_variant').value = value;
}

function hideSpinner () {
    document.querySelector('#spinnerdiv').style.display = 'none';
}

function showSpinner () {
    document.querySelector('#spinnerdiv').style.display = 'block';
}

function processUrl () {
    var inputData = getInputDataFromUrl();
    if (inputData != null) {
        writeToVariantArea(inputData);
        submitAnnotate(inputData['chrom'], inputData['pos'], inputData['ref'], inputData['alt']);
    }
}

function setupEvents () {
    document.querySelector('#input_variant').addEventListener('keyup', function (evt) {
        evt.stopPropagation();
        if (evt.keyCode == 13) {
            document.querySelector('#input_submit').click();
            //submitForm();
        }
    });
}

function showSearch () {
    document.querySelector('#inputdiv').style.display = 'block';
}

function hideSearch () {
    document.querySelector('#inputdiv').style.display = 'none';
}

function showContentDiv () {
    document.querySelector('#detaildiv_variant').style.display = 'block';
}

function hideContentDiv () {
    document.querySelector('#detaildiv_variant').style.display = 'none';
}

function toggleSearch () {
    var display = document.querySelector('#inputdiv').style.display;
    if (display == 'none') {
        showSearch();
    } else if (display == 'block') {
        hideSearch();
    }
}

function onClickSearch () {
    toggleSearch();
}

function run () {
    var params = new URLSearchParams(window.location.search);
    if (params.get('chrom') != null && params.get('pos') != null && params.get('ref_base') != null && params.get('alt_base') != null) {
        showSpinner();
        hideSearch();
        setupEvents();
        getWidgets(processUrl, null);
    } else {
        hideSpinner();
        hideContentDiv();
        showSearch();
        setupEvents();
        getWidgets(null, null);
    }
}

window.onload = function () {
    run();
}
