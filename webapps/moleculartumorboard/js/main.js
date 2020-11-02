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
        if (widgetName == 'cgi' || widgetName == 'target2' || widgetName == 'ncbi') {
            divs = getDetailWidgetDivs(level, widgetName, '', maxWidthParent, maxHeightParent, showTitle);
        } else {
            divs = getDetailWidgetDivs(level, widgetName, widgetInfo[widgetName].title, maxWidthParent, maxHeightParent, showTitle);
        }
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
        var span = getEl('span');
        span.textContent = 'No annotation available for ' + widgetInfo[widgetName]['title'];
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
    parentDiv.style.height = '350px';
    var retDivs = showWidget('basepanel', ['base','hgvs'], 'variant', parentDiv);
    var parentDiv = document.querySelector('#contdiv_action');
    parentDiv.style.position = 'relative';
    parentDiv.style.width = sectionWidth + 'px';
    parentDiv.style.maxHeight = '600px';
    parentDiv.style.overflow="auto";
    showWidget('actionpanel', ['base','target', 'civic', 'pharmgkb', 'cancer_genome_interpreter'], 'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_driver');
    showWidget('driverpanel', ['base','cgc', 'cgl', 'chasmplus', 'cancer_hotspots', 'cosmic'], 'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_protein');
    showWidget('proteinpanel', ['base', 'lollipop'], 'variant', parentDiv);
    var parentDiv = document.querySelector('#contdiv_structure');
    showWidget('structurepanel', ['base', 'mupit'], 'variant', parentDiv, null, 'unset', false);
    var parentDiv = document.querySelector('#contdiv_germline');
    showWidget('germlinepanel', ['base', 'clinvar', 'gnomad3', 'thousandgenomes'], 'variant', parentDiv, null, null, false);
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

function getNodataSpan (annotator_name) {
    var span = getEl('span');
    //span.classList.add('nodata');
    span.textContent = 'No annotation for'+ annotator_name + 'available';
    return span;
}

function addInfoLine2 (div, row, col, tabName, headerMinWidth, highlightIfValue) {
    var text = null;
    if (typeof(row) != 'object') {
        text = header;
        header = row;
        headerMinWidth = tabName;
        tabName = col;
    } else {
        text = infomgr.getRowValue(tabName, row, col);
    }
    var color = 'black';
    if (text == undefined || text == '') {
        color = '#cccccc';
    }
    var table = getEl('table');
    table.style.fontSize = '12px';
    table.style.borderCollapse = 'collapse';
    var tr = getEl('tr');
    var td = getEl('td');
    td.className = 'detail-info-line-header';
    if (headerMinWidth != undefined) {
        td.style.minWidth = headerMinWidth;
    }
    var h = getLineHeader(header);
    h.style.color = color;
    addEl(td, h);
    addEl(tr, td);
    td = getEl('td');
    td.className = 'detail-info-line-content';
    var t = getEl('span');
    t.textContent = text;
    t.style.color = color;
    addEl(td, t);
    addEl(tr, td);
    if (highlightIfValue != undefined && highlightIfValue) {
        tr.style.color = '#ff0000';
    }
    addEl(table, tr);
	addEl(div, table);
}

function addInfoLineLink2 (div, header, text, link, trimlen) {
    var span = getEl("span")
    span.textContent = header
	addEl(div, span);
	var spanText = null;
	if (link == undefined || link == null) {
		text = ''; 
		spanText = document.createElement('span');
	} else {
		spanText = document.createElement('a');
		spanText.href = link;
		spanText.target = '_blank';
		if (trimlen > 0) {
			if (text.length > trimlen) {
				spanText.title = text;
				text = text.substring(0, trimlen) + '...';
			}
		}
	}
	addEl(spanText, getTn(text));
	addEl(div, spanText);
	addEl(div, getEl('br'));
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
                addInfoLineLink2(div, hugo + ' (' + getWidgetData(tabName, 'base', row, 'achange') + ')', tabName)
                //addInfoLine(div, transcript + '(' + hugo + ')', getWidgetData(tabName, 'base', row, 'cchange') + ' ' + '(' + getWidgetData(tabName, 'base', row, 'achange') + ')', tabName);
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
            //addInfoLine(div, 'Cytogenetic Location')
                addInfoLine(div, 'Genomic Location',  chrom + ':' + ' '+ getWidgetData(tabName, 'base', row, 'pos') + ' '+ '(GRCh38)', tabName);
            addInfoLine(div, 'Sequence ontology', getWidgetData(tabName, 'base', row, 'so'), tabName);
            if (thous_af > gnomad_af){
                var max_af = thous_af;
            }
            if (gnomad_af > thous_af){
                var max_af = gnomad_af;
            }
            if (max_af == null) {
                addInfoLine(div, '1000g/gnomAD max AF','There is no annotation available')
            }
            else {
                addInfoLine(div, '1000g/gnomAD max AF', max_af);
            }
            var snp = getWidgetData(tabName, 'dbsnp', row, 'snp');
            if (snp == null) {
                addInfoLine(div, 'dbSNP','There is no annotation available');
            }
            else {
                link = 'https://www.ncbi.nlm.nih.gov/snp/' + snp
                addInfoLineLink(div, 'dbSNP', snp, link);
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
                    addInfoLineLink(div, n , '# publications for the variant (' + rsid + ')', link);
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
                        addInfoLineLink2(div,'',  n + ' publications for the variant (' + rsid + ')', link);
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
            if (id == null){
                addInfoLineLink2(div, "No Annotation Available for BRCA")
            }
            else {
                addInfoLineLink2(div, sig + ', ', 'BRCA Exchange', link);
            }
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
                        if (effect == 'Unknown'){
                            addInfoLineLink2(div, 'No annotation for OncoKB available');
                            }
                        else {
                            addInfoLineLink2(div, effect  +', ' + oncogenic +', ', 'OncoKB', link)
                        }
                        
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
            var desc = getWidgetData(tabName, 'ncbigene', row, 'ncbi_desc')
            if (desc == null){
                addInfoLineLink2(div, 'There is no annotation available for NCBI Gene')
            }
            else {
                addInfoLineLink2(div, desc, tabName)
            }
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
            addInfoLine(div, 'Cancer Gene Census', cgc_class + ' with inheritance ' + inheritance + '. Somatic types are ' + tts + '. Germline types are ' + ttg + '.');
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




widgetInfo['clinvar2'] = {'title': ''};
widgetGenerators['clinvar2'] = {
    'variant': {
        'width': 480, 
        'height': 250, 
        'function': function (div, row, tabName) {
            var id = getWidgetData(tabName, 'clinvar', row, 'id');
            var sig = getWidgetData(tabName, 'clinvar', row, 'sig');
            var sdiv = getEl('div');
            var span = getEl('span');
            span.classList.add('detail-info-line-header');
            span.textContent = 'ClinVar significance: ';
            addEl(sdiv, span);
            var span = getEl('span');
            span.classList.add('detail-info-line-content');
            span.textContent = sig;
            addEl(sdiv, span);
            addEl(sdiv, getTn('\xa0'));
            //addInfoLine(div, 'Significance by ClinVar', sig, tabName);
            //var link = '';
            if(id != null){
                link = 'https://www.ncbi.nlm.nih.gov/clinvar/variation/'+id;
                var a = getEl('a');
                a.href = link;
                a.textContent = id;
                sdiv.style.position = 'relative';
                addEl(sdiv, getTn('(ID: '));
                addEl(sdiv, a);
                addEl(sdiv, getTn(')'));
                addEl(div, sdiv);
            } else {
                //id = '';
            }
            //addInfoLineLink(div, 'ClinVar ID', id, link, 10);
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
                vcTissue = JSON.parse(vcTissue);
                var outTable = getEl('table');
                var outTr = getEl('tr');
                var outTd = getEl('td');
                outTd.style.width = '300px';
                addEl(div, addEl(outTable, addEl(outTr, outTd)));
                var table = getWidgetTableFrame();
                var thead = getWidgetTableHead(['Tissue', 'Count'],['85%','15%']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                var tissues = [];
                var counts = [];
                for (var i = 0; i < vcTissue.length; i++) {
                    var tissue = vcTissue[i][0].replace(/_/g, ' ');
                    var count = vcTissue[i][1];
                    var tr = getWidgetTableTr([tissue, count]);
                    addEl(tbody, tr);
                    tissues.push(tissue)
                    labels = tissues.slice(0,10)
                    counts.push(parseInt(count));
                    var data = counts.slice(0, 10);
                }
                addEl(outTd, addEl(table, tbody));
                var outTd = getEl('td');
                outTd.style.width = '900px';
                addEl(outTr, outTd);
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
                div.style.width = 'calc(100% - 20px)';
                var chartDiv = getEl('canvas');
                chartDiv.style.width = 'calc(100% - 40px)';
                chartDiv.style.height = 'calc(100% - 40px)';
                addEl(outTd, chartDiv);
                var chart = new Chart(chartDiv, {
                    type: 'doughnut',
                    data: {
                        datasets: [{
                            data: data,
                            backgroundColor: colors
                        }],
                        labels: labels
                    },
                    options: {
                        responsive: true,
                        responsiveAnimationDuration: 500,
                        maintainAspectRatio: false,
                        legend: {
                            position: 'left'
                        }
                    }
                });
            }
        }
    }
}

widgetInfo['cgi'] = {'title': 'Cancer Genome Interpreter'};
widgetGenerators['cgi'] = {
    'variant': {
        'width': '100%', 
        'height': 'unset', 
        'function': function (div, row, tabName) {
            var assoc = getWidgetData(tabName, 'cancer_genome_interpreter', row, 'association');
            if (assoc == undefined) {
                addInfoLine(div, 'No information in Cancer Genome Interpreter');
            }
            else {
                addInfoLineLink2(div, 'Drug ' + assoc + ', CGI');
            }
            
        }
    }
}

widgetInfo['target2'] = {'title': 'TARGET'};
widgetGenerators['target2'] = {
    'variant': {
        'width': '100%', 
        'height': 'unset', 
        'function': function (div, row,  tabName) {
            var therapy = getWidgetData(tabName, 'target', row, 'therapy');
            var rationale = getWidgetData(tabName, 'target', row, 'rationale');
            if (rationale == null) {
                addInfoLine(div, 'No annotation available for Target');
            }
            else {
                addInfoLine(div, 'TARGET', "Identifies this gene associated with " + therapy + '. The rationale is ' + rationale)
            }
            
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
            divs[1].style.paddingLeft = '0px';
            var generator = widgetGenerators['ncbi']['gene'];
            generator['width'] = 400;
            //var divs = showWidget('ncbi', ['base', 'ncbigene'], 'gene', div, null, 220);
            var divs = showWidget('ncbi', ['base', 'ncbigene'], 'gene', div, 1175, 300);
            divs[0].style.position = 'absolute';
            divs[0].style.top = '180px';
            divs[0].style.left = '0px';
        }
    }
}

widgetInfo['actionpanel'] = {'title': ''};
widgetGenerators['actionpanel'] = {
    'variant': {
        'width': '100%',
        'height': '100%',
        'function': function (div, row, tabName) {
            var generator = widgetGenerators['brca']['variant'];
            generator['width'] = 400;
            var divs = showWidget('brca', ['base'], 'variant', div, null, 220)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            divs[1].style.paddingLeft = '1px';
            var generator = widgetGenerators['oncokb']['variant'];
            generator['width'] = 400;
            var divs = showWidget('oncokb', ['base'], 'variant', div, null, 220)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            divs[1].style.paddingLeft = '1px';
            var divs = showWidget('cgi', ['cancer_genome_interpreter'], 'variant', div, null, 220)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            divs[1].style.paddingLeft = '1px';
            var generator = widgetGenerators['target2']['variant'];
            generator['width'] = '100%';
            var divs = showWidget('target2', ['target'], 'variant', div, null, 220)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            divs[1].style.paddingLeft = '1px';
            var br = getEl("br");
            addEl(div, br);
            var generator = widgetGenerators['litvar']['variant'];
            generator['width'] = 400;
            var divs = showWidget('litvar', ['litvar', 'dbsnp'], 'variant', div, null, 220);
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var br = getEl("br");
            addEl(div, br);
            var divs = showWidget('civic2', ['civic'], 'variant', div, null, 220)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var br = getEl("br");
            addEl(div, br);
            var divs = showWidget('pharmgkb2', ['pharmgkb'], 'variant', div, null, 220)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var br = getEl("br");
            addEl(div, br);
        }
    }
}

widgetInfo['driverpanel'] = {'title': ''};
widgetGenerators['driverpanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var br = getEl("br");
            addEl(div, br);
            var generator = widgetGenerators['cosmic2']['variant'];
            generator['width'] = '100%'
            var divs = showWidget('cosmic2', ['cosmic'], 'variant', div, null, 600);
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var br = getEl("br");
            addEl(div, br);
            var generator = widgetGenerators['chasmplus2']['variant'];
            generator['width'] = '100%'
            var divs = showWidget('chasmplus2', ['base', 'chasmplus'], 'variant', div, null, 220);
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var generator = widgetGenerators['cgc2']['gene'];
            generator['width'] = '100%'
            var divs = showWidget('cgc2', ['base', 'cgc'], 'gene', div, null, 220);
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            divs[1].style.paddingLeft = '1px';
            var generator = widgetGenerators['cgl2']['gene'];
            generator['width'] = '100%'
            var divs = showWidget('cgl2', ['base', 'cgl'], 'gene', div, null, 220);
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            divs[1].style.paddingLeft = '1px';
            var br = getEl("br");
            addEl(div, br);
            var generator = widgetGenerators['cancer_hotspots']['variant'];
            generator['width'] = '100%'
            var divs = showWidget('cancer_hotspots', ['cancer_hotspots'], 'variant', div, null, 220);
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var br = getEl("br");
            addEl(div, br);

        }
    }
}


widgetInfo['proteinpanel'] = {'title': ''};
widgetGenerators['proteinpanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var generator = widgetGenerators['lollipop']['variant'];
            generator['width'] = sectionWidth;
            generator['height'] = 200;
            generator['variables']['hugo'] = '';
            annotData['base']['numsample'] = 1;
            var divs = showWidget('lollipop', ['base'], 'variant', div);
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
        }
    }
}



widgetInfo['structurepanel'] = {'title': ''};
widgetGenerators['structurepanel'] = {
    'variant': {
        'width': sectionWidth,
        'height': 'unset',
        'function': function (div, row, tabName) {
            var br = getEl("br");
            addEl(div, br);
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
            showWidget('mupit2', ['base','mupit'], 'variant', td);
            addEl(tr, td);
            addEl(table, tr);
            addEl(div, table);
            var br = getEl("br");
            addEl(div, br);
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
            showWidget('clinvar2', ['clinvar'], 'variant', td, null, 300);
            addEl(tr, td);
            addEl(table, tr);
            addEl(div, table);
            var br = getEl("br");
            addEl(div, br);
            var table = getEl('table');
            var tr = getEl('tr');
            var td = getEl('th');
            td.style.width = '100px';
            td.textContent = 'gnomADv3';
            td.style.textAlign = 'left';
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
            td.style.textAlign = 'left';
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
            var br = getEl("br");
            addEl(div, br);
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
                    sdiv.textContent = 'No annotation available for MuPIT';
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
