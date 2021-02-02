var CLOSURE_NO_DEPS = true;
var annotData = null;
var mqMaxMatch = window.matchMedia('(max-width: 1024px)');
var mqMinMatch = window.matchMedia('(min-width: 1024px)');

function mqMaxMatchHandler (e) {
    if (e.matches) {
        var iframe = document.querySelector('#mupitiframe');
        var chrom = iframe.getAttribute('chrom');
        var pos = iframe.getAttribute('pos');
        iframe.src = location.protocol + '//www.cravat.us/MuPIT_Interactive?gm=' + chrom + ':' + pos + '&embed=true&showrightpanel=false';
    }
}

function mqMinMatchHandler (e) {
    if (e.matches) {
        var iframe = document.querySelector('#mupitiframe');
        var chrom = iframe.getAttribute('chrom');
        var pos = iframe.getAttribute('pos');
        iframe.src = location.protocol + '//www.cravat.us/MuPIT_Interactive?gm=' + chrom + ':' + pos + '&embed=true';
    }
}

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
        submitAnnotate(inputData['chrom'], inputData['pos'], inputData['ref'], 
                inputData['alt']);
        hideSearch();
    }
}

function submitAnnotate (inputChrom, inputPos, inputRef, inputAlt) {
    var url = 'annotate';
    var params = {'chrom':inputChrom, 'pos':parseInt(inputPos), 
            'ref_base':inputRef, 'alt_base':inputAlt};
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
        if (widgetName == 'ncbi') {
            divs = getDetailWidgetDivs(level, widgetName, '', maxWidthParent, 
                    maxHeightParent, showTitle);
        } else {
            divs = getDetailWidgetDivs(level, widgetName, widgetInfo[widgetName].title, 
                    maxWidthParent, maxHeightParent, showTitle);
        }
    } else {
        if ('variant' in generator) {
            divs = getDetailWidgetDivs('variant', widgetName, widgetInfo[widgetName].title, 
                    maxWidthParent, maxHeightParent, showTitle);
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
    } else {
        if (level == 'gene') {
            data['base__hugo'] = annotData['crx'].hugo;
        }
        var ret = widgetGenerators[widgetName][level]['function'](
                divs[1], data, 'variant', true); // last true is to highlight if value exists.
    }
    addEl(parentDiv, divs[0]);
    return divs;
}

function showSectionTitles() {
    document.querySelectorAll('.container_titlediv').forEach(elem => {
        elem.classList.remove('hidden');
    });
}

function showAnnotation (response) {
    document.querySelectorAll('.detailcontainerdiv').forEach(function (el) {
        $(el).empty();
    });
    hideSpinner();
    showSectionTitles();
    var parentDiv = document.querySelector('#contdiv_vannot');
    var retDivs = showWidget('basepanel', ['base'], 'variant', parentDiv);
    var parentDiv = document.querySelector('#contdiv_action');
    showWidget('actionpanel', ['base','target', 'civic', 'pharmgkb', 
            'cancer_genome_interpreter', 'litvar'], 'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_diseasecausing');
    showWidget('diseasecausingpanel', 
            ['base', 'clinvar', 'gnomad3', 'thousandgenomes', 'revel'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_driver');
    showWidget('driverpanel', ['base','cgc', 'cgl', 'chasmplus', 'cancer_hotspots', 'cosmic'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_protein');
    showWidget('proteinpanel', ['base', 'lollipop2'], 'variant', parentDiv);
    //var parentDiv = document.querySelector('#contdiv_structure');
    //showWidget('structurepanel', ['base', 'mupit'], 'variant', parentDiv, null, 
    //        'unset', false);
    var parentDiv = document.querySelector('#contdiv_germline');
    showWidget('germlinepanel', ['base', 'clinvar', 'gnomad3', 'thousandgenomes'], 
            'variant', parentDiv, null, null, false);
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
            $.getScript('/result/widgetfile/' + widgetName + '/' + 
                    widgetName + '.js', function () {
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
    span.textContent = 'No annotation for'+ annotator_name + 'available';
    return span;
}

function addInfoLine2 (div, row, col, tabName, headerMinWidth, highlightIfValue) {
    var span = getEl("span")
    span.textContent = header
	addEl(div, span);
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

function addInfoLine3 (div, row, header, col, tabName, headerMinWidth, highlightIfValue) {
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
    var sdiv = getEl('div');
    var td = getEl('span');
    td.className = 'detail-info-line-header';
    if (headerMinWidth != undefined) {
        td.style.minWidth = headerMinWidth;
    }
    var h = getLineHeader(header);
    h.style.color = color;
    addEl(td, h);
    addEl(sdiv, td);
    td = getEl('span');
    td.className = 'detail-info-line-content';
    var t = getEl('span');
    t.textContent = text;
    t.style.color = color;
    addEl(td, t);
    addEl(sdiv, td);
    if (highlightIfValue != undefined && highlightIfValue) {
        sdiv.style.color = '#ff0000';
    }
	addEl(div, sdiv);
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

function changeAchange3to1 (achange) {
    if (achange.startsWith('p.')) {
        achange = achange.substring(2);
    }
    var aa3to1 = {'Ala': 'A', 'Cys': 'C', 'Asp': 'D', 'Glu': 'E', 'Phe': 'F', 'Gly': 'G', 'His': 'H', 'Ile': 'I', 'Leu': 'L', 'Met': 'M', 'Asn': 'N', 'Pro': 'P', 'Gln': 'Q', 'Arg': 'R', 'Ser': 'S', 'Thr': 'T', 'Val': 'V', 'Trp': 'W', 'Tyr': 'Y'};
    var aa3s = Object.keys(aa3to1);
    for (var i = 0; i < aa3s.length; i++) {
        achange = achange.replace(aa3s[i], aa3to1[aa3s[i]]);
    }
    return achange;
}

var widgetInfo = {};
var widgetGenerators = {};

widgetInfo['base2'] = {'title': ''};
widgetGenerators['base2'] = {
    'variant': {
        'width': undefined, 
        'height': undefined, 
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
            var span = getEl('span');
            span.classList.add('detail-info-line-header');
            span.style.fontSize = '2rem';
            span.textContent = hugo;
            addEl(div, span);
            var span = getEl('span');
            span.style.fontSize = '2rem';
            span.classList.add('detail-info-line-content');
            var achange = getWidgetData(tabName, 'base', row, 'achange');
            achange = changeAchange3to1(achange);
            span.textContent = ' ' + achange;
            addEl(div, span);
            addEl(div, getEl('br'));
            var sdiv = getEl('div');
            if (annotData['cgl'].class != null) {
                var span = getEl('span');
                span.textContent = annotData['cgl'].class;
                addEl(sdiv, span);
            }
            var variant_type = null;
            if (nref==1 && nalt==1 && ref_base != '-' && alt_base != '-'){
                variant_type = 'single nucleotide variant';
            }
            if (nref > 1 && nalt == 1 && alt_base == '-'){
                variant_type = 'deletion';
            }
            if (nref == 1 && nalt > 1 && ref_base == '-'){
                variant_type = 'insertion';
            }
            if (nref > 1 && nalt > 1){
                variant_type = 'complex substitution';
            }
            /*var span = getEl('span');
            span.style.marginLeft = '2rem';
            span.textContent = variant_type;
            addEl(sdiv, span);*/
            addEl(div, sdiv);
            addEl(div, getEl('br'));
            addInfoLine3(div, 'Variant type', 
                    variant_type + ' (' + ref_base + '>' + alt_base + ')');
            var variant_length = null;
            if (variant_type == 'single nucleotide variant'){
                variant_length = '1';
            }
            if (variant_type == 'deletion'){
                variant_length = nref;
            }
            if (variant_type == 'insertion' && 'complex substitution'){
                variant_length = nalt;
            }
            //addInfoLine3(div, 'Variant Length', variant_length);
            addInfoLine3(div, 'Genomic location',  'chr' + chrom + ':' + getWidgetData(tabName, 'base', row, 'pos') + ' '+ '(genome build GRCh38)', tabName);
            var so = getWidgetData(tabName, 'base', row, 'so');
            var consequence = '';
            if (so == 'synonymous_variant') {
                consequence = 'synonymous';
            } else {
                consequence = 'nonsynonymous';
            }
            addInfoLine3(div, 'Variant consequence', consequence + ' (' + so.replace('_', ' ') + ')', tabName);
            var max_af = null;
            if (thous_af != undefined && gnomad_af != undefined) {
                if (thous_af > gnomad_af) {
                    max_af = thous_af;
                } else {
                    max_af = gnomad_af;
                }
            } else if (thous_af != undefined && gnomad_af == undefined) {
                max_af = thous_af;
            } else if (thous_af == undefined && gnomad_af != undefined) {
                max_af = gnomad_af;
            }
            if (max_af == null) {
                addInfoLine3(div, '1000g/gnomAD max AF','There is no annotation available')
            }
            else {
                addInfoLine3(div, '1000g/gnomAD max AF', max_af);
            }
            var snp = getWidgetData(tabName, 'dbsnp', row, 'rsid');
            if (snp == null) {
                addInfoLine3(div, 'dbSNP ID','No dbSNP ID is available');
            } else {
                link = 'https://www.ncbi.nlm.nih.gov/snp/' + snp
                addInfoLineLink(div, 'dbSNP ID', snp, link);
            }
            var sdiv = getEl('div')
            var span = getEl('span')
            span.textContent = 'Hallmarks of Cancer: '
            span.classList.add('detail-info-line-header')
            addEl(sdiv, span)
            var span = getEl('span')
            span.id = 'hallmarks_func_summary'
            span.style.color = 'gray'
            span.textContent = 'Fetching data...'
            addEl(sdiv, span)
            addEl(div, sdiv)
            var link = '/webapps/moleculartumorboard/hallmarks?hugo=' + hugo
            fetch(link).then(data=>{return data.json()}).then(response=>{
                let span = document.querySelector('#hallmarks_func_summary')
                span.textContent = response['func_summary']
                span.style.color = 'black'
                let parentEl = span.parentElement
                let a = getEl('a')
                a.href = 'https://cancer.sanger.ac.uk/cosmic/census-page/' + hugo
                a.target = '_blank'
                a.textContent = ' \u{1f517}'
                a.style.textDecoration = 'none'
                addEl(parentEl, a)
            })
        }
    }
}



widgetInfo['litvar'] = {'title': 'Publications for this mutation (LitVar)'};
widgetGenerators['litvar'] = {
    'variant': {
        'width': undefined, 
        'height': undefined, 
        'variables': {
            'rsids2pmids': {},
        },
        'word-break': 'break-word',
        'function': function (div, row, tabName) {
            var widgetName = 'litvar';
            var v = widgetGenerators[widgetName][tabName]['variables'];
            var rsid = getWidgetData(tabName, 'dbsnp', row, 'rsid');
            if (rsid == null) {
                return;
            }
            var n = v['rsids2pmids'][rsid];
            var link = 'https://www.ncbi.nlm.nih.gov/CBBresearch/Lu/Demo/LitVar/#!?query=' + rsid;
            if (n != undefined) {
                addInfoLineLink(div, n , '# publications for the variant (' + rsid + ')', link);
            } else {
                var url = 'litvar?rsid=' + rsid
                var xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == XMLHttpRequest.DONE) {
                        if (xhr.status == 200) {
                            var response = JSON.parse(xhr.responseText);
                            n = response['n']
                            v['rsids2pmids'][rsid] = n;
                            addInfoLineLink2(div, '',  
                                    n + ' publications for the variant (' + rsid + ')', link);
                        }
                    }
                }
                xhr.send();
            }
        }
    }
}

widgetInfo['brca'] = {'title': 'BRCA mutation classification (BRCA Exchange)'};
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

widgetInfo['oncokb'] = {'title': 'Mutation Actionability (OncoKB)'};
widgetGenerators['oncokb'] = {
    'variant': {
        'width': undefined,
        'height': undefined,
        'word-break': 'break-word',
        'function': function (div, row, tabName) {
            var levelDic = {'LEVEL_1': 'L1', 'LEVEL_2':'L2', 'LEVEL_R1':'L2', 
                    'LEVEL_3A':'L3', 'LEVEL_R2':'L3',
                    'LEVEL_3B':'L4', 'LEVEL_4':'L5'}
            var levelNum = {'L1':1, 'L2':2, 'L3':3, 'L4':4, 'L5':5}
            var levelNumToLevel = {1:'L1', 2:'L2', 3:'L3', 4:'L4', 5:'L5'}
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
                        if (response.notoken == true) {
                            var sdiv = getEl('div');
                            var span = getEl('span');
                            span.textContent = 'No OncoKB data was obtained (add OncoKB token and click save to obtain OncoKB annotation:\xa0'
                            addEl(sdiv, span);
                            var ip = getEl('input');
                            ip.type = 'text';
                            ip.style.fontSize = '10px';
                            addEl(sdiv, ip);
                            var btn = getEl('button');
                            btn.style.fontSize = '10px';
                            btn.textContent = 'Save';
                            addEl(sdiv, btn);
                            var span = getEl('span');
                            span.textContent = ').';
                            addEl(sdiv, span);
                            addEl(div, sdiv);
                            btn.addEventListener('click', function (evt) {
                                var token = ip.value;
                                fetch('/webapps/moleculartumorboard/saveoncokbtoken?token=' + token)
                                .then(data=>{return data.json()})
                                .then(response=>{
                                    if (response.result == 'success') {
                                        location.reload();
                                    }
                                });
                            });
                        } else {
                            var effect = response.mutationEffect.knownEffect
                            var oncogenic = response.oncogenic
                            var hugo = response.query.hugoSymbol
                            var achange = changeAchange3to1(annotData['base']['achange']);
                            var link = 'https://www.oncokb.org/gene/' + hugo + '/' + achange + '?refGenome=GRCh38';
                            if (effect == 'Unknown'){
                                addInfoLineLink2(div, 'No annotation for OncoKB available');
                                }
                            else {
                                const minLevelNum = Math.min(...response.treatments.map(
                                        t => levelNum[levelDic[t.level]]))
                                const minLevel = levelNumToLevel[minLevelNum]
                                var treatments = response.treatments;
                                var ssdiv = getEl('div');
                                ssdiv.style.display = 'flex';
                                ssdiv.style.flexWrap = 'wrap';
                                var sssdiv = getEl('div');
                                sssdiv.style.display = 'flex';
                                //sssdiv.style.width = '100%';
                                var s4div = getEl('div');
                                s4div.style.display = 'flex';
                                s4div.style.flexDirection = 'column';
                                var span = getEl('span');
                                span.textContent = minLevel;
                                span.style.fontSize = '7rem';
                                addEl(s4div, span);
                                var span = getEl('span');
                                span.textContent = effect;
                                addEl(s4div, span);
                                var span = getEl('span');
                                span.textContent = oncogenic;
                                addEl(s4div, span);
                                addEl(sssdiv, s4div);
                                var img = getEl('img');
                                img.src = 'LOE.jpeg';
                                img.style.width = '100%';
                                img.style.maxWidth = '600px';
                                img.style.maxHeight = '30rem';
                                addEl(sssdiv, img);
                                addEl(ssdiv, sssdiv);
                                addEl(div, ssdiv);
                                // Drug table
                                var sdiv = getEl('div');
                                sdiv.style.height = '30rem';
                                sdiv.style.overflow = 'auto';
                                sdiv.style.maxWidth = '600px';
                                addEl(ssdiv, sdiv);
                                var table = getEl('table');
                                var thead = getEl('thead');
                                var tr = getEl('tr');
                                tr.style.textAlign = 'left';
                                var th = getEl('th');
                                th.style.borderBottom = '1px solid gray';
                                th.textContent = 'Drug';
                                addEl(tr, th);
                                var th = getEl('th');
                                th.style.borderBottom = '1px solid gray';
                                th.textContent = 'Cancer';
                                addEl(tr, th);
                                var th = getEl('th');
                                th.style.borderBottom = '1px solid gray';
                                th.textContent = 'LOE';
                                addEl(tr, th);
                                addEl(thead, tr);
                                addEl(table, thead);
                                var tbody = getEl('tbody');
                                var maxI = treatments.length - 1;
                                var d_c_ls = [];
                                for (var i = 0; i < treatments.length; i++) {
                                    var t = treatments[i];
                                    var drugs = t.drugs;
                                    var c = t.levelAssociatedCancerType;
                                    var cancer = c.mainType.name;
                                    var level = t.level;
                                    // LOE conversion
                                    if (level == 'LEVEL_1') {
                                        level = 'L1'
                                    } else if (level == 'LEVEL_2' || level == 'LEVEL_R1') {
                                        level = 'L2'
                                    } else if (level == 'LEVEL_3A' || level == 'LEVEL_R2') {
                                        level = 'L3'
                                    } else if (level == 'LEVEL_3B') {
                                        level = 'L4'
                                    } else if (level == 'LEVEL_4') {
                                        level = 'L5'
                                    }
                                    var maxJ = drugs.length - 1;
                                    for (var j = 0; j < drugs.length; j++) {
                                        var d = drugs[j];
                                        var drug = d.drugName;
                                        var d_c_l = drug + '_' + cancer + '_' + level;
                                        if (d_c_ls.indexOf(d_c_l) >= 0) {
                                            continue;
                                        } else {
                                            d_c_ls.push(d_c_l);
                                        }
                                        var tr = getEl('tr');
                                        var td = getEl('td');
                                        if (i == maxI && j == maxJ) {
                                            td.style.borderBottom = '1px solid gray';
                                        }
                                        td.textContent = drug;
                                        addEl(tr, td);
                                        var td = getEl('td');
                                        if (i == maxI && j == maxJ) {
                                            td.style.borderBottom = '1px solid gray';
                                        }
                                        td.textContent = cancer;
                                        addEl(tr, td);
                                        var td = getEl('td');
                                        if (i == maxI && j == maxJ) {
                                            td.style.borderBottom = '1px solid gray';
                                        }
                                        td.textContent = level;
                                        addEl(tr, td);
                                        addEl(tbody, tr);
                                    }
                                }
                                addEl(table, tbody);
                                addEl(sdiv, table);
                                // Title link
                                var titleEl = div.parentElement.firstChild.querySelector('legend');
                                var title = titleEl.textContent;
                                titleEl.textContent = '';
                                var a = getEl('a');
                                a.href = link;
                                a.target = '_blank';
                                a.textContent = title;
                                addEl(titleEl, a);
                            }
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
        'height': undefined, 
        'word-break': 'break-word',
        'function': function (div, row, tabName) {
            var desc = getWidgetData(tabName, 'ncbigene', row, 'ncbi_desc')
            if (desc == null){
                addInfoLineLink2(div, 'There is no annotation available for NCBI Gene')
            }
            else {
                addInfoLineLink2(div, desc, tabName)
            }
            var hugo = getWidgetData(tabName, 'base', row, 'hugo');
        }
    }
}

widgetInfo['cgc2'] = {'title': 'Relation to tumor and tissue types (Cancer Gene Census)'};
widgetGenerators['cgc2'] = {
    'gene': {
        'width': undefined,
        'height': undefined, 
        'word-break': 'break-word',
        'function': function (div, row, tabName) {
            var cgc_class = getWidgetData(tabName, 'cgc', row, 'class');
            var inheritance = getWidgetData(tabName, 'cgc', row, 'inheritance');
            var tts = getWidgetData(tabName, 'cgc', row, 'tts');
            var ttg = getWidgetData(tabName, 'cgc', row, 'ttg');
            addInfoLineLink2(div, cgc_class + ' with inheritance ' + inheritance + '. Somatic types are ' + tts + '. Germline types are ' + ttg + '.');
        }
    }
}

widgetInfo['cgl2'] = {'title': 'Oncogenes and tumor suppressor genes (Cancer Gene Landscape)'};
widgetGenerators['cgl2'] = {
    'gene': {
        'width': '100%', 
        'height': 200, 
        'function': function (div, row, tabName) {
            addInfoLineLink2(div, 'Identified as '+  getWidgetData(tabName, 'cgl', row, 'class') + '.', tabName);
        }
    }
}

widgetInfo['chasmplus2'] = {'title': 'Cancer driver prediction for missense mutations (CHASMplus)'};
widgetGenerators['chasmplus2'] = {
    'variant': {
        'width': '540', 
        'height': 500, 
        'function': function (div, row, tabName) {
            var pvalue = getWidgetData(tabName, 'chasmplus', row, 'pval');
            addBarComponent2(div, row, 'Score (p-value=' + pvalue + ')', 'chasmplus__score', tabName, 200, true, 0.75, 'Passenger', 'Driver');
        }
    }
}


widgetInfo['civic2'] = {'title': 'Clinical Interpretation (CIVIC)'};
widgetGenerators['civic2'] = {
    'variant': {
        'width': undefined,
        'height': undefined,
        'function': function (div, row, tabName) {
            var score = getWidgetData(tabName, 'civic', row, 'clinical_a_score');
            var description = getWidgetData(tabName, 'civic', row, 'description');
            //addInfoLine3(div, 'Clinical Actionability Score', score, tabName);
            addInfoLine3(div, 'Description', description, tabName);
            }

        }
    }

widgetInfo['pharmgkb2'] = {'title': 'Drug response (PharmGKB)'};
widgetGenerators['pharmgkb2'] = {
    'variant': {
        'width': undefined,
        'height': undefined,
        'function': function (div, row, tabName) {
            addInfoLine3(div, 'PharmGKB', getWidgetData(tabName, 'pharmgkb', row, 'notes'))
        }
    }
}




widgetInfo['clinvar2'] = {'title': ''};
widgetGenerators['clinvar2'] = {
    'variant': {
        'width': undefined, 
        'height': undefined, 
        'function': function (div, row, tabName) {
            var id = getWidgetData(tabName, 'clinvar', row, 'id');
            var sig = getWidgetData(tabName, 'clinvar', row, 'sig');
            var sdiv = getEl('div');
            var span = getEl('span');
            span.classList.add('detail-info-line-header');
            span.textContent = 'ClinVar significance: ';
            addEl(sdiv, span);
            var ssdiv = getEl('div');
            ssdiv.style.display = 'inline-block';
            ssdiv.style.position = 'relative';
            ssdiv.style.left = '6px';
            var span = getEl('span');
            span.classList.add('detail-info-line-content');
            span.textContent = sig;
            addEl(ssdiv, span);
            addEl(ssdiv, getTn('\xa0'));
            if(id != null){
                link = 'https://www.ncbi.nlm.nih.gov/clinvar/variation/'+id;
                var a = getEl('a');
                a.href = link;
                a.textContent = id;
                sdiv.style.position = 'relative';
                addEl(ssdiv, getTn('(ID: '));
                addEl(ssdiv, a);
                addEl(ssdiv, getTn(')'));
            }
            addEl(sdiv, ssdiv);
            addEl(div, sdiv);
            var url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&id=' + id + '&retmode=json'
            fetch(url).then(response=>{return response.json()}).then(response=>{
                var trait_set = response['result'][id].trait_set;
                var traitNames = [];
                for (var i = 0; i < trait_set.length; i++) {
                    traitNames.push(trait_set[i].trait_name);
                }
                traitNames.sort();
                var traitNames = traitNames.join(', ');
                addInfoLine3(div, 'ClinVar conditions', traitNames, 'variant', 184);
            });
        }
    }
}

widgetInfo['cosmic2'] = {'title': 'Catalog of somatic mutations in cancer (COSMIC)'};
widgetGenerators['cosmic2'] = {
    'variant': {
        'width': undefined,
        'height': undefined,
        'word-break': 'normal',
        'function': function (div, row, tabName) {
            div.style.display = 'flex';
            var divHeight = '400px';
            var vcTissue = getWidgetData(tabName, 'cosmic', row, 'variant_count_tissue');
            if (vcTissue != undefined && vcTissue !== null) {
                if (typeof(vcTissue) == 'string') {
                    var toks = vcTissue.split(';')
                    var vcTissue = [];
                    for (var i = 0; i < toks.length; i++) {
                        var toks2 = toks[i].split('(')
                        var tissue = toks2[0];
                        var count = parseInt(toks2[1].split(')')[0]);
                        vcTissue.push([tissue, count]);
                    }
                    for (var i = 0; i < vcTissue.length - 1; i++) {
                        for (var j = i + 1; j < vcTissue.length; j++) {
                            if (vcTissue[i][1] < vcTissue[j][1]) {
                                var tmp = vcTissue[i];
                                vcTissue[i] = vcTissue[j];
                                vcTissue[j] = tmp;
                            }
                        }
                    }
                }
                var sdiv = getEl('div');
                sdiv.style.maxHeight = '400px';
                sdiv.style.overflow = 'auto';
                var table = getWidgetTableFrame();
                table.style.width = 'calc(100% - 1px)';
                table.style.fontSize = '14px';
                var thead = getWidgetTableHead(['Tissue', 'Count'],['85%','15%']);
                addEl(table, thead);
                var titleEl = div.parentElement.firstChild.querySelector('legend');
                var title = titleEl.textContent;
                titleEl.textContent = '';
                var a = getEl('a');
                a.href = 'https://cancer.sanger.ac.uk/cosmic/search?q=' + annotData['cosmic']['cosmic_id'];
                a.target = '_blank';
                a.textContent = title;
                addEl(titleEl, a);
                var tbody = getEl('tbody');
                var tissues = [];
                var counts = [];
                for (var i = 0; i < vcTissue.length; i++) {
                    var tissue = vcTissue[i][0].replace(/_/g, ' ');
                    var count = vcTissue[i][1];
                    var tr = getWidgetTableTr([tissue, count]);
                    if (count > 25) {
                        tr.style.backgroundColor = 'rgba(254, 202, 202, 255)';
                    }
                    addEl(tbody, tr);
                    if (tissue == 'breast' || tissue == 'urinary_tract') {
                        continue;
                    }
                    tissues.push(tissue)
                    counts.push(parseInt(count));
                }
                var labels = tissues.slice(0, 10)
                var data = counts.slice(0, 10);
                addEl(div, addEl(sdiv, addEl(table, tbody)));
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
                var sdiv = getEl('div');
                sdiv.style.overflow = 'auto';
                //sdiv.style.width = 'calc(100% - 400px)';
                sdiv.style.minWidth = '600px';
                sdiv.style.height = '400px';
                var chartDiv = getEl('canvas');
                chartDiv.width = '1000';
                chartDiv.height = '1000';
                addEl(sdiv, chartDiv);
                addEl(div, sdiv);
                var chart = new Chart(chartDiv, {
                    type: 'pie',
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
                            display: false,
                            position: 'right',
                        },
                        plugins: {
                            labels: {
                                render: 'label',
                                fontColor: '#000000',
                                overlap: false,
                                outsidePadding: 4,
                            }
                        },
                    },
                });
            }
        }
    }
}

widgetInfo['cgi'] = {'title': 'Therapeutically actionable alterations (Cancer Genome Interpreter)'};
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

widgetInfo['target2'] = {'title': 'Treatment in pediatric cancer (TARGET)'};
widgetGenerators['target2'] = {
    'variant': {
        'width': undefined,
        'height': undefined,
        'word-break': 'break-word',
        'function': function (div, row,  tabName) {
            var therapy = getWidgetData(tabName, 'target', row, 'therapy');
            var rationale = getWidgetData(tabName, 'target', row, 'rationale');
            if (rationale == null) {
                addInfoLine3(div, 'No annotation available for Target');
            }
            else {
                addInfoLineLink2(div, "Identifies this gene associated with " + therapy + '. The rationale is ' + rationale)
            }
            
            }
        }
    }


widgetInfo['basepanel'] = {'title': ''};
widgetGenerators['basepanel'] = {
    'variant': {
        'width': '100%',
        'height': '100%',
        'function': function (div, row, tabName) {
            var generator = widgetGenerators['base2']['variant'];
            var divs = showWidget('base2', ['base', 'dbsnp', 'thousandgenomes', 'gnomad'], 'variant', div, null, null, false);
            var generator = widgetGenerators['ncbi']['gene'];
            var divs = showWidget('ncbi', ['base', 'ncbigene'], 'gene', div, null, null);
            addEl(div, getEl('br'));
        }
    }
}

widgetInfo['actionpanel'] = {'title': ''};
widgetGenerators['actionpanel'] = {
    'variant': {
        'width': '100%',
        'height': '100%',
        'function': function (div, row, tabName) {
            var br = getEl("br");
            addEl(div, br);
            var generator = widgetGenerators['oncokb']['variant'];
            var divs = showWidget('oncokb', ['base'], 'variant', div, null, null)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            divs[1].style.paddingLeft = '1px';
            divs[0].style.width = '92vw';
            var br = getEl("br");
            addEl(div, br);
            var divs = showWidget('cgi', ['cancer_genome_interpreter'], 'variant', div, null, null)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            divs[1].style.paddingLeft = '1px';
            var br = getEl("br");
            addEl(div, br);
            /*
            var generator = widgetGenerators['target2']['variant'];
            generator['width'] = '100%';
            var divs = showWidget('target2', ['target'], 'variant', div, null, null)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            divs[1].style.paddingLeft = '1px';
            divs[0].style.width = '92vw';
            var br = getEl("br");
            addEl(div, br);
            */
            var generator = widgetGenerators['litvar']['variant'];
            var divs = showWidget('litvar', ['litvar', 'dbsnp'], 'variant', div, null, null);
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            divs[0].style.width = '92vw';
            var br = getEl("br");
            addEl(div, br);
            var divs = showWidget('civic2', ['civic'], 'variant', div, null, null)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            divs[0].style.width = '92vw';
            var br = getEl("br");
            addEl(div, br);
            var divs = showWidget('pharmgkb2', ['pharmgkb'], 'variant', div, null, 220)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            divs[0].style.width = '92vw';
            var br = getEl("br");
            addEl(div, br);
            var generator = widgetGenerators['brca']['variant'];
            var divs = showWidget('brca', ['base'], 'variant', div, null, 220)
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            divs[1].style.paddingLeft = '1px';
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
            var divs = showWidget('cosmic2', ['cosmic'], 'variant', div, null, null);
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var br = getEl("br");
            //addEl(div, br);
            var generator = widgetGenerators['cancer_hotspots2']['variant'];
            generator['width'] = '100%'
            var divs = showWidget('cancer_hotspots2', ['cancer_hotspots'], 'variant', div, 450, 220);
            //divs[0].style.position = 'relative';
            //divs[0].style.top = '0px';
            //divs[0].style.left = '0px';
            divs[0].querySelector('div legend').textContent = 
                    'Hotspot mutation per cancer type (Cancer Hotspots)';
            var br = getEl("br");
            addEl(div, br);
            var generator = widgetGenerators['chasmplus2']['variant'];
            generator['width'] = '100%'
            var divs = showWidget('chasmplus2', ['base', 'chasmplus'], 'variant', div, null, 220);
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var br = getEl("br");
            addEl(div, br);
            /*
            var generator = widgetGenerators['cgc2']['gene'];
            generator['width'] = '100%'
            var divs = showWidget('cgc2', ['base', 'cgc'], 'gene', div, null, null);
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            divs[1].style.paddingLeft = '1px';
            divs[0].style.width = '92vw';
            var br = getEl("br");
            addEl(div, br);
            */
        }
    }
}


widgetInfo['proteinpanel'] = {'title': ''};
widgetGenerators['proteinpanel'] = {
    'variant': {
        'width': undefined,
        'height': undefined,
        'function': function (div, row, tabName) {
            var generator = widgetGenerators['lollipop2']['variant'];
            generator['width'] = 'calc(100% - 1vw)';
            generator['height'] = 260;
            generator['variables']['hugo'] = '';
            annotData['base']['numsample'] = 1;
            var divs = showWidget('lollipop2', ['base'], 'variant', div);
            divs[0].style.position = 'relative';
            divs[0].style.top = '0px';
            divs[0].style.left = '0px';
            var generator = widgetGenerators['mupit2']['variant'];
            var height = null;
            showWidget('mupit2', ['base','mupit'], 'variant', div);
        }
    }
}



widgetInfo['structurepanel'] = {'title': ''};
widgetGenerators['structurepanel'] = {
    'variant': {
        'width': undefined,
        'height': 'unset',
        'function': function (div, row, tabName) {
            div.style.overflow = 'unset';
            var generator = widgetGenerators['mupit2']['variant'];
            var height = null;
            showWidget('mupit2', ['base','mupit'], 'variant', div);
        }
    }
}

widgetInfo['diseasecausingpanel'] = {'title': ''};
widgetGenerators['diseasecausingpanel'] = {
    'variant': {
        'width': undefined,
        'height': 'unset',
        'function': function (div, row, tabName) {
            div.style.overflow = 'unset';
            showWidget('clinvar2', ['clinvar'], 'variant', div, null, null);
            addEl(div, getEl('br'));
            var sdiv = getEl('div');
            sdiv.textContent = 'REVEL score';
            sdiv.classList.add('detail-info-line-header');
            addEl(div, sdiv);
            addBarComponent2(div, row, null, 'revel__score', tabName, 200, true, 0.75, 'Benign', 'Pathogenic');
        }
    }
}

widgetInfo['germlinepanel'] = {'title': ''};
widgetGenerators['germlinepanel'] = {
    'variant': {
        'width': undefined,
        'height': 'unset',
        'function': function (div, row, tabName) {
            div.style.marginTop = '2vh';
            var hugo = annotData['base']['hugo'];
            var achange = changeAchange3to1(annotData['base']['achange']);
            div.style.overflow = 'unset';
            var sdiv = getEl('div');
            /*var span = getEl('div');
            span.textContent = 'Allele frequencies';
            addEl(sdiv, span);
            addEl(sdiv, getEl('br'));
            addEl(sdiv, getEl('br'));*/
            var span = getEl('div');
            span.classList.add('detail-info-line-header');
            //span.style.width = '130px';
            span.textContent = 'gnomADv3 allele frequency';
            //span.style.textAlign = 'left';
            //span.style.display = 'inline-block';
            addEl(sdiv, span);
            var td = getEl('div');
            td.style.display = 'inline-block';
            td.style.width = 'calc(100% - 130px)';
            if (annotData['gnomad3'] == null) {
                var span = getEl('span');
                span.textContent = 'No annotation available for ' + hugo + ' ' + achange;
                addEl(td, span);
            } else {
                addBarComponent(td, row, 'Total', 'gnomad3__af', tabName);
                addBarComponent(td, row, 'African', 'gnomad3__af_afr', tabName);
                addBarComponent(td, row, 'American', 'gnomad3__af_amr', tabName);
                addBarComponent(td, row, 'Ashkenazi', 'gnomad3__af_asj', tabName);
                addBarComponent(td, row, 'East Asn', 'gnomad3__af_eas', tabName);
                addBarComponent(td, row, 'Finn', 'gnomad3__af_fin', tabName);
                addBarComponent(td, row, 'Non-Finn Eur', 'gnomad3__af_nfe', tabName);
                addBarComponent(td, row, 'Other', 'gnomad3__af_oth', tabName);
                addBarComponent(td, row, 'South Asn', 'gnomad3__af_sas', tabName);
            }
            addEl(sdiv, td);
            addEl(sdiv, getEl('br'));
            addEl(sdiv, getEl('br'));
            var span = getEl('div');
            span.classList.add('detail-info-line-header');
            //span.style.width = '130px';
            span.textContent = '1000 Genomes allele frequency';
            //span.style.textAlign = 'left';
            //span.style.display = 'inline-block';
            addEl(sdiv, span);
            var td = getEl('div');
            if (annotData['thousandgenomes'] == null) {
                var span = getEl('span');
                span.textContent = 'No annotation available for ' + hugo + ' ' + achange;
                addEl(td, span);
            } else {
                addBarComponent(td, row, 'Total', 'thousandgenomes__af', tabName);
                addBarComponent(td, row, 'African', 'thousandgenomes__afr_af', tabName);
                addBarComponent(td, row, 'American', 'thousandgenomes__amr_af', tabName);
                addBarComponent(td, row, 'East Asn', 'thousandgenomes__eas_af', tabName);
                addBarComponent(td, row, 'European', 'thousandgenomes__eur_af', tabName);
                addBarComponent(td, row, 'South Asn', 'thousandgenomes__sas_af', tabName);
            }
            addEl(sdiv, td);
            addEl(div, sdiv);
            var br = getEl("br");
            addEl(div, br);
        }
    }
}



widgetInfo['mupit2'] = {'title': ''};
widgetGenerators['mupit2'] = {
	'variant': {
		'width': '100%', 
		'height': undefined,
		'function': function (div, row, tabName) {
            var chrom = getWidgetData(tabName, 'base', row, 'chrom');
            var pos = getWidgetData(tabName, 'base', row, 'pos');
            var url = location.protocol + '//www.cravat.us/MuPIT_Interactive/rest/showstructure/check?pos=' + chrom + ':' + pos;
            var iframe = getEl('iframe');
            iframe.id = 'mupitiframe';
            iframe.setAttribute('crossorigin', 'anonymous');
            iframe.setAttribute('chrom', chrom);
            iframe.setAttribute('pos', pos);
            iframe.style.width = '100%';
            iframe.style.height = '500px';
            iframe.style.border = '0px';
            addEl(div, iframe);
            $.get(url).done(function (response) {
                if (response.hit == true) {
                    if (window.innerWidth > 1024) {
                        url = location.protocol + '//www.cravat.us/MuPIT_Interactive?gm=' + chrom + ':' + pos + '&embed=true';
                    } else {
                        url = location.protocol + '//www.cravat.us/MuPIT_Interactive?gm=' + chrom + ':' + pos + '&embed=true&showrightpanel=false';
                    }
                    iframe.src = url;
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

widgetInfo['cancer_hotspots2'] = {'title': 'Hotspot mutation per cancer type (Cancer Hotspots)'};
widgetGenerators['cancer_hotspots2'] = {
	variant: {
		width: 180, 
		height: 180, 
		cancerTypes: [
			'adrenagland', 'ampullaofvater', 'billarytract', 'bladder', 
			'blood', 'bone', 'bowel', 'breast', 'cervix', 'csnbrain', 
			'esophagussstomach', 'eye', 'headandneck', 'kidney', 'liver', 
			'lung', 'lymph', 'ovaryandfallopiantube', 'pancreas', 'penis', 
			'peritoneum', 'prostate', 'skin', 'softtissue', 'testis', 'unk', 
			'uterus'
		],
		function: function (div, row, tabName) {
            let samples = getWidgetData(tabName, 'cancer_hotspots', row, 'samples');
            if (samples == null) {
                var span = getEl('span');
                span.classList.add('nodata');
				addEl(div, addEl(span, getTn('No data')));
                return;
			}
            if (samples != undefined && samples != null && samples.indexOf('[[') == 0) {
                if (!samples) {
                    return;
                }
                samples = JSON.parse(samples);
                samples.sort(function(a, b) {
                    return a[1] - b[1];
                });
                const table = getWidgetTableFrame();
                addEl(div, table);
                const thead = getWidgetTableHead(['Cancer Type','Count']);
                addEl(table, thead);
                const tbody = getEl('tbody');
                addEl(table, tbody);
                for (var i = 0; i < samples.length; i++) {
                    let tr = getWidgetTableTr(samples[i]);
                    addEl(tbody, tr);
                }
            } else {
                let samples = getWidgetData(tabName, 'cancer_hotspots', row, 'samples');
                if (!samples) {
                    return;
                }
                samples.sort(function(a, b) {
                    return b[1] - a[1];
                });
                const table = getWidgetTableFrame();
                addEl(div, table);
                const thead = getWidgetTableHead(['Cancer Type','Count']);
                addEl(table, thead);
                const tbody = getEl('tbody');
                addEl(table, tbody);
                for (var i = 0; i < samples.length; i++) {
                    let tr = getWidgetTableTr(samples[i]);
                    if (samples[i][1] > 25) {
                        tr.style.backgroundColor = 'rgba(254, 202, 202, 255)';
                    }
                    addEl(tbody, tr);
                }
            }
		}
	}
}

function writeToVariantArea (inputData) {
    var value = inputData['chrom'] + ':' + inputData['pos'] + 
            ':' + inputData['ref'] + ':' + inputData['alt'];
    document.querySelector('#input_variant').value = value;
}

function hideSpinner () {
    document.querySelector('#spinnerdiv').style.display = 'none';
}

function showSpinner () {
    document.querySelector('#spinnerdiv').style.display = 'flex';
}

function processUrl () {
    var inputData = getInputDataFromUrl();
    if (inputData != null) {
        writeToVariantArea(inputData);
        submitAnnotate(inputData['chrom'], inputData['pos'], 
                inputData['ref'], inputData['alt']);
    }
}

function setupEvents () {
    document.querySelector('#input_variant').addEventListener('keyup', function (evt) {
        evt.stopPropagation();
        if (evt.keyCode == 13) {
            document.querySelector('#input_submit').click();
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
    mqMaxMatch.addListener(mqMaxMatchHandler);
    mqMinMatch.addListener(mqMinMatchHandler);
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
