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
    console.log('@ urlparams=', urlParams)
    var inputChrom = urlParams.get('chrom');
    var inputPos = urlParams.get('pos');
    var inputRef = urlParams.get('ref_base');
    var inputAlt = urlParams.get('alt_base');
    var assembly = urlParams.get('assembly')
    if (assembly == undefined) {
        assembly = 'hg38'
    }
    console.log('@ chrom=', inputChrom, 'assembly=', assembly)
    var inputData = cleanInputData(inputChrom, inputPos, inputRef, inputAlt, assembly);
    console.log('@ inputdata=', inputData)
    return inputData;
}

function cleanInputData (inputChrom, inputPos, inputRef, inputAlt, assembly) {
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
    if (assembly == undefined) {
        assembly = 'hg38'
    }
    if (inputChrom == null || inputPos == null || inputRef == null || inputAlt == null) {
        return null;
    } else {
        return {
            'chrom': inputChrom, 
            'pos': inputPos, 
            'ref': inputRef, 
            'alt': inputAlt, 
            'assembly': assembly};
    }
}

function submitForm () {
    var value = document.querySelector('#input_variant').value;
    var toks = value.split(':');
    if (toks.length != 4 && toks.length != 5) {
        return;
    }
    var chrom = toks[0];
    var pos = toks[1];
    var ref = toks[2];
    var alt = toks[3];
    var inputData = cleanInputData(chrom, pos, ref, alt);
    var assembly = 'hg38'
    if (toks.length == 5) {
        var assembly = toks[4]
    }
    inputData['assembly'] = assembly
    if (inputData != null) {
        showContentDiv();
        submitAnnotate(inputData['chrom'], inputData['pos'], inputData['ref'], 
                inputData['alt'], 'hg38')
        hideSearch();
    }
}

function submitAnnotate (inputChrom, inputPos, inputRef, inputAlt, assembly) {
    if (assembly == undefined) {
        assembly = 'hg38'
    }
    var url = 'annotate';
    var params = {'chrom':inputChrom, 'pos':parseInt(inputPos), 
            'ref_base':inputRef, 'alt_base':inputAlt, 'assembly': assembly};
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
        var dl = getEl('dl')
        addEl(divs[0], dl)
        addDlRow(dl,widgetInfo[widgetName]['title'], 'No annotation available');
        // var span = getEl('span');
        // span.textContent = 'No annotation available for ' + widgetInfo[widgetName]['title'];
        // addEl(divs[1], span);
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
    var parentDiv = document.querySelector('#contdiv_vinfo');
    var retDivs = showWidget('basepanel', ['base'], 'variant', parentDiv);
    var parentDiv = document.querySelector('#contdiv_studies');
    showWidget('studiespanel', ['base'],
         'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_clin');
    showWidget('clinpanel', 
            ['base', 'clinvar', 'clinvar_acmg','clingen','denovo', 'omim','cardioboost', 'cvdkp', 'arrvars', 'pharmgkb','dgi'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_assoc');
    showWidget('assocpanel', ['base','geuvadis', 'gwas_catalog', 'grasp', 'gtex'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_vizualization');
    showWidget('vizualizationpanel', ['base', 'lollipop2'], 'variant', parentDiv);
    var parentDiv = document.querySelector('#contdiv_afreq');
    showWidget('allelefreqpanel', ['base', 'gnomad3', 'thousandgenomes'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_evolution');
    showWidget('evolutionpanel', ['base', 'gnomad3', 'thousandgenomes'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_gene');
    showWidget('genepanel', ['base', 'gnomad3', 'thousandgenomes'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_interactions');
    showWidget('interactionspanel', ['base', 'gnomad3', 'thousandgenomes'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_literature');
    showWidget('literaturepanel', ['base', 'gnomad3', 'thousandgenomes'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_noncoding');
    showWidget('noncodingpanel', ['base', 'gnomad3', 'thousandgenomes'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_prediction');
    showWidget('predictionpanel', ['base', 'gnomad3', 'thousandgenomes'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_functional');
    showWidget('functionalpanel', ['base', 'gnomad3', 'thousandgenomes'], 
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

widgetInfo['base2'] = {
    'title': ''
  };
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
        span.style.fontWeight = '600';
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
        // if (annotData['cgl'] != null && annotData['cgl'].class != null) {
        //   var span = getEl('span');
        //   span.classList.add('cgl_class')
        //   var cl = annotData['cgl'].class;
        //   if (cl == 'Oncogene') {
        //     span.classList.add('cgl_oncogene')
        //   } else if (cl == 'TSG') {
        //     span.classList.add('cgl_tsg')
        //   }
        //   span.textContent = annotData['cgl'].class;
        //   addEl(sdiv, span);
        // }
        var variant_type = null;
        if (nref == 1 && nalt == 1 && ref_base != '-' && alt_base != '-') {
          variant_type = 'single nucleotide variant';
        }
        if (nref > 1 && nalt == 1 && alt_base == '-') {
          variant_type = 'deletion';
        }
        if (nref == 1 && nalt > 1 && ref_base == '-') {
          variant_type = 'insertion';
        }
        if (nref > 1 && nalt > 1) {
          variant_type = 'complex substitution';
        }
        /*var span = getEl('span');
        span.style.marginLeft = '2rem';
        span.textContent = variant_type;
        addEl(sdiv, span);*/
        addEl(div, sdiv);
        addEl(div, getEl('br'));
        var dl = getEl('dl')
        addEl(div, dl)
        addDlRow(dl, 'Variant type', variant_type + ' (' + ref_base + '>' + alt_base + ')')
        /*addInfoLine3(div, 'Variant type', 
                variant_type + ' (' + ref_base + '>' + alt_base + ')');*/
        var variant_length = null;
        if (variant_type == 'single nucleotide variant') {
          variant_length = '1';
        }
        if (variant_type == 'deletion') {
          variant_length = nref;
        }
        if (variant_type == 'insertion' && 'complex substitution') {
          variant_length = nalt;
        }
        //addInfoLine3(div, 'Variant Length', variant_length);
        addDlRow(dl, 'Genomic location', 'chr' + chrom + ':' + getWidgetData(tabName, 'base', row, 'pos') + ' ' + '(genome build GRCh38)', tabName)
        //addInfoLine3(div, 'Genomic location',  'chr' + chrom + ':' + getWidgetData(tabName, 'base', row, 'pos') + ' '+ '(genome build GRCh38)', tabName);
        var so = getWidgetData(tabName, 'base', row, 'so');
        var consequence = '';
        if (so == 'synonymous_variant') {
          consequence = 'synonymous';
        } else {
          consequence = 'nonsynonymous';
        }
        //addInfoLine3(div, 'Variant consequence', consequence + ' (' + so.replace('_', ' ') + ')', tabName);
        addDlRow(dl, 'Variant consequence', consequence + ' (' + so.replace('_', ' ') + ')', tabName)
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
        /*
        if (max_af == null) {
            addDlRow(dl, '1000g/gnomAD max AF','There is no annotation available')
        }
        else {
            addDlRow(dl, '1000g/gnomAD max AF', prettyVal(max_af));
        }
        */
        // if (annotData['cosmic'] != null) {
        //   var a = makeA(annotData['cosmic']['cosmic_id'],
        //     'https://cancer.sanger.ac.uk/cosmic/search?q=' +
        //     annotData['cosmic']['cosmic_id']);
        // } else {
        //   var a = getNoAnnotMsgVariantLevel()
        // }
        // addDlRow(dl, 'COSMIC ID', a)
        var snp = getWidgetData(tabName, 'dbsnp', row, 'rsid');
        if (snp == null) {
          addDlRow(dl, 'dbSNP ID', 'No dbSNP ID is available');
        } else {
          link = 'https://www.ncbi.nlm.nih.gov/snp/' + snp
          var a = makeA(snp, link)
          addDlRow(dl, 'dbSNP ID', a)
        }
        var acc = getWidgetData(tabName, 'uniprot', row, 'acc');
          if (acc == null) {
            addDlRow(dl, 'UniProt Accession Number', 'No annotation available');
          } else {
            link2 = 'https://www.uniprot.org/uniprot/' + acc
            var aa = makeA(acc, link2)
            addDlRow(dl, 'UniProt Accession Number', aa)
      }
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


widgetInfo['clinvar2'] = {
    'title': ''
  };
  widgetGenerators['clinvar2'] = {
    'variant': {
      'width': undefined,
      'height': undefined,
      'function': function (div, row, tabName) {
        div.parentElement.style.paddingBottom = '0'
        var id = getWidgetData(tabName, 'clinvar', row, 'id');
        var sig = getWidgetData(tabName, 'clinvar', row, 'sig');
        var dl = getEl('dl')
        addEl(div, dl)
        //var sdiv = getEl('div');
        //var span = getEl('span');
        //span.classList.add('detail-info-line-header');
        //span.textContent = 'ClinVar significance: ';
        //addEl(sdiv, span);
        //var ssdiv = getEl('div');
        //ssdiv.style.display = 'inline-block';
        //ssdiv.style.position = 'relative';
        //ssdiv.style.left = '6px';
        var span = getEl('span');
        //span.classList.add('detail-info-line-content');
        span.textContent = sig;
        //addEl(ssdiv, span);
        var dd = getEl('div')
        addEl(dd, span)
        //addEl(ssdiv, getTn('\xa0'));
        addEl(dd, getTn('\xa0'));
        var sigLower = sig == undefined ? '' : sig.toLowerCase()
        if (id != null && sigLower != 'not provided' && sigLower != '') {
          link = 'https://www.ncbi.nlm.nih.gov/clinvar/variation/' + id;
          var a = makeA(id, link)
          //sdiv.style.position = 'relative';
          //addEl(ssdiv, getTn('(ID: '));
          //addEl(ssdiv, a);
          //addEl(ssdiv, getTn(')'));
          addEl(dd, getTn('(ID: '));
          addEl(dd, a);
          addEl(dd, getTn(')'));
          addDlRow(dl, 'ClinVar Significance', dd)
          var url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&id=' + id + '&retmode=json'
          fetch(url).then(response => {
            return response.json()
          }).then(response => {
            var trait_set = response['result'][id].trait_set;
            var traitNames = [];
            for (var i = 0; i < trait_set.length; i++) {
              var trait_name = trait_set[i].trait_name
              if (trait_name == 'not provided' ||
                trait_name == 'none provided' ||
                trait_name == 'not specified') {
                continue
              }
              traitNames.push(trait_name)
            }
            traitNames.sort();
            var sdiv = getEl('div')
            sdiv.style.display = 'flex'
            sdiv.style.flexWrap = 'wrap'
            for (var i = 0; i < traitNames.length; i++) {
              var span = getEl('div')
              span.classList.add('clinvar_traitname')
              span.textContent = traitNames[i]
              addEl(sdiv, span)
            }
            //var traitNames = traitNames.join(', ');
            //var span = getEl('span')
            //span.style.wordBreak = 'break-word'
            //span.textContent = traitNames
            //addInfoLine3(div, 'ClinVar conditions', traitNames, 'variant', 184);
            addDlRow(dl, 'ClinVar Conditions', sdiv)
          });
        } else {
          addDlRow(dl, 'ClinVar', getNoAnnotMsgVariantLevel())
        }
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
                a.href = 'https://cancer.sanger.ac.uk/cosmic/search?q=' 
                    + annotData['cosmic']['cosmic_id'];
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
                sdiv.style.minWidth = '400px';
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
    widgetInfo['clingen2'] = {'title': 'ClinGen Gene'};
    widgetGenerators['clingen2'] = {
        'gene': {
            'width': undefined,
            'height': undefined,
            'word-break': 'normal',
            'function': function (div, row, tabName) {
                var title = 'ClinGen Gene'
                var dl = getEl('dl')
                addEl(div, dl)
                var wdiv = getEl('div')
                wdiv.style.display = 'flex'
                wdiv.style.flexWrap = 'wrap'
                var divHeight = '400px';
                var disease = getWidgetData(tabName, 'clingen', row, 'disease');
                console.log(disease);
                if (disease == null) {
                    addDlRow(dl, 'ClinGen Gene', 'No annotation available');
                }
                if (disease != undefined && disease != null) {
                    var diseases = getWidgetData(tabName, 'clingen', row, 'disease').split(';');
                    var classifications = getWidgetData(tabName, 'clingen', row, 'classification').split(';');
                    var links = getWidgetData(tabName, 'clingen', row, 'link').split(';');
                    var mondos = getWidgetData(tabName, 'clingen', row, 'mondo').split(';');
                    var sdiv = getEl('div')
                    sdiv.style.width = '47rem'
                    sdiv.style.maxHeight = '400px'
                    sdiv.style.overflow = 'auto'
                    sdiv.style.marginRight = '5rem'
                    var table = getWidgetTableFrame();
                    addEl(div, table);
                    var thead = getWidgetTableHead(['Disease', 'Classification','ClinGen','Monarch'], ['35%', '30%']);
                    addEl(table, thead);
                    var tbody = getEl('tbody');
                    addEl(table, tbody);
                    for (var i = 0; i < diseases.length; i++) {
                        var disease = diseases[i];
                        var classification = classifications[i];
                        var mondo = mondos[i];
                        var mondo_link = `https://monarchinitiative.org/disease/${mondo}`
                        var link = links[i]
                        var tr = getWidgetTableTr([disease, classification, link, mondo_link]);
                        addEl(tbody, tr);
                        addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
                    }
                    addDlRow(dl, title, wdiv)
                }
                
            }
        }
    }
    widgetInfo['clinvar_acmg'] = {'title': ''};
    widgetGenerators['clinvar_acmg'] = {
        'variant': {
            'width': '100%', 
            'height': 'unset', 
            'function': function (div, row, tabName) {
                var phenotype = getWidgetData(tabName, 'denovo', row, 'PrimaryPhenotype');
                if (phenotype != null){
                console.log(phenotype);
                } else{
                    console.log('hehnjc')
                }
            }
        }
    }
    widgetInfo['denovo'] = {'title': 'Denovo-DB'};
    widgetGenerators['denovo'] = {
        'variant': {
            'width': '100%', 
            'height': 'unset', 
            'function': function (div, row, tabName) {
               
            }
        }
    }
    widgetInfo['cardioboost'] = {'title': 'CardioBoost'};
    widgetGenerators['cardioboost'] = {
        'variant': {
            'width': '100%', 
            'height': 'unset', 
            'function': function (div, row, tabName) {
                var dl = getEl('dl')
                addEl(div, dl)
                var card = getWidgetData(tabName, 'cardioboost', row, 'cardiomyopathy1');
                var card2 = getWidgetData(tabName, 'cardioboost', row, 'cardiomyopathy');
                var arr = getWidgetData(tabName, 'cardioboost', row, 'arrhythmias1');
                var arr2 = getWidgetData(tabName, 'cardioboost', row, 'arrhythmias');
                if (card != null || card != undefined){
                addDlRow(dl, 'CardioBoost Cardiomyopathy Class', card);
                } if (card2 != null || card2 != undefined){
                addDlRow(dl, 'CardioBoost Cardiomyopathy Score', card2);
                } if (arr != null || arr != undefined){
                addDlRow(dl, 'CardioBoost Arrhythmias Class', arr);
                } if (arr2 != null || arr2 != undefined){
                addDlRow(dl, 'CardioBoost Arrhythmias Score', arr2);
                }
                }
            }
        }
        widgetInfo['pharmgkb2'] = {'title': 'PharmGKB'};
        widgetGenerators['pharmgkb2'] = {
            'variant': {
                'width': undefined,
                'height': undefined, 
                'word-break': 'normal',
                'function': function (div, row, tabName) {
                    var title = 'PharmGKB'
                    var dl = getEl('dl')
                    addEl(div, dl)
                    var wdiv = getEl('div')
                    wdiv.style.display = 'flex'
                    wdiv.style.flexWrap = 'wrap'
                    var divHeight = '400px';
                    var chemical = getWidgetData(tabName, 'pharmgkb', row, 'chemicals');
                    var assocs = getWidgetData(tabName, 'pharmgkb', row, 'drug_assoc');
                    if (assocs != undefined && assocs != null) {
                        var pharmId = getWidgetData(tabName, 'pharmgkb', row, 'id');
                        link = 'https://pharmgkb.org/variant/' + pharmId;
                        var a = makeA(pharmId, link)
                        addDlRow(dl, 'PharmGKB Variant', a)
                        // addInfoLineLink(div, 'Variant', pharmId, ``);
                        var sdiv = getEl('div')
                        sdiv.style.width = '84rem'
                        sdiv.style.maxHeight = '400px'
                        sdiv.style.overflow = 'auto'
                        sdiv.style.marginRight = '5rem'
                        var table = getWidgetTableFrame();
                        addEl(div, table);
                        table.style.tableLayout = 'auto';
                        table.style.width = '100%';
                        var thead = getWidgetTableHead(
                            ['Chemicals', 'Description','Category','Significant','Study', 'Notes'], 
                            ['10%',       '30%',     '8%',     '8%',        '8%',   '36%'  ]
                        );
                        addEl(table, thead);
                        var tbody = getEl('tbody');
                        addEl(table, tbody);
                        for (let row of assocs) {
                            var study = row[4];
                            link2 = 'https://pharmgkb.org/variant/' + study;
                            var aa = makeA(study, link2)
                            for (let i=0; i<row[0].length; i++) {
                                console.log(row[0][i])
                                let chemInfo = row[0][i];
                                for (let j=0; j<chemInfo.length; j++) {
                                    console.log(chemInfo[i]);
                            var tr = getWidgetTableTr([chemInfo[i], row[1], row[2], row[3], study, row[5]]);
                            }
                        }
                            addEl(tbody, tr);
                            addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
                            
                        }
                    addDlRow(dl, title, wdiv)
                    
                    }
                }
                }
            }
        widgetInfo['dgi2'] = {'title': 'DGIdb: The Drug Interaction Database'};
        widgetGenerators['dgi2'] = {
            'gene': {
                'width': undefined, 
                'word-break': 'normal',
                'height': undefined, 
                'function': function (div, row, tabName) {
                    var title = 'DGIdb: The Drug Interaction Database'
                    var dl = getEl('dl')
                    addEl(div, dl)
                    var wdiv = getEl('div')
                    wdiv.style.display = 'flex'
                    wdiv.style.flexWrap = 'wrap'
                    var divHeight = '400px';
                    var allMappings = getWidgetData(tabName, 'dgi', row, 'all');
                    if (allMappings != undefined && allMappings != null) {
                        var sdiv = getEl('div')
                        sdiv.style.width = '84rem'
                        sdiv.style.maxHeight = '400px'
                        sdiv.style.overflow = 'auto'
                        sdiv.style.marginRight = '5rem'
                        var table = getWidgetTableFrame();
                        addEl(div, table);
                        table.style.tableLayout = 'auto';
                        table.style.width = '100%';
                        var thead = getWidgetTableHead(['Category','Interaction', 'Drug Name', 'Score', 'ChEMBL ID', 'Pubmed']);
                        addEl(table, thead);
                        var tbody = getEl('tbody');
                        for (var i = 0; i < allMappings.length; i++) {
                            var row = allMappings[i];
                            var cat = row[0];
                            var inter = row[1];
                            var name = row[2];
                            var score = row[3];
                            var chem = row[4];
                            var pubs = row[5].toString();
                            pubs = pubs.split(',')
                            for (var j = 0; j < pubs.length; j++) {
                                var pub = pubs[j];
                            var link = `https://www.ebi.ac.uk/chembl/g/#search_results/compounds/query=${chem}`
                            var link2 = `https://pubmed.ncbi.nlm.nih.gov/${pub}`
                            var tr = getWidgetTableTr([cat, inter, name, score,link,link2],[chem, pub]);
                            addEl(tbody, tr);
                            addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
                        }
                        }
                        addDlRow(dl, title, wdiv)
                    }
                }
            }
        }
    widgetInfo['grasp2'] = {'title': 'GRASP'};
    widgetGenerators['grasp2'] = {
        'variant': {
            'width': '100%', 
            'height': 'unset', 
            'function': function (div, row, tabName) {
                var nh = getWidgetData(tabName, 'grasp', row, 'nhlbi');
                var pmid = getWidgetData(tabName, 'grasp', row, 'pmid');
                var phenotype = getWidgetData(tabName, 'grasp', row, 'phenotype');
            }
            }
        }
    widgetInfo['gtex2'] = {'title': 'GTEX'};
    widgetGenerators['gtex2'] = {
        'variant': {
            'width': 280, 
            'height': 80, 
            'function': function (div, row, tabName) {
                var genes = getWidgetData(tabName, 'gtex', row, 'gtex_gene');
                if (genes == null) {
                    var span = getEl('span');
                    span.classList.add('nodata');
                    addEl(div, addEl(span, getTn('No data')));
                    return;
                }
                var genels = genes != null ? genes.split('|') : [];
                var tissues = getWidgetData(tabName, 'gtex', row, 'gtex_tissue');
                var tissuels = tissues != null ? tissues.split('|') : [];
                var table = getWidgetTableFrame();
                addEl(div, table);
                var thead = getWidgetTableHead(['Target Gene', 'Tissue Type']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                addEl(table, tbody);
                for (var i =0; i<genels.length;i++){
                    var geneitr = genels[i];
                    var tissueitr = tissuels[i];
                    tissueitr = tissueitr.replace("_", " ")
                    var ensLink = 'https://ensembl.org/Homo_sapiens/Gene/Summary?g='+geneitr;
                    var tr = getWidgetTableTr([ensLink, tissueitr],[geneitr]);
                    addEl(tbody, tr);
                }
                addEl(div, addEl(table, tbody));
            }
        }
    }
    // widgetInfo['gwas_catalog2'] = {'title': 'GWAS Catalog'};
    // widgetGenerators['gwas_catalog2'] = {
    //     'variant': {
    //         'width': 380, 
    //         'height': 180, 
    //         'function': function (div, row, tabName) {
    //             var risk = getWidgetData(tabName, 'gwas_catalog', row, 'risk_allele');
    //             console.log(risk);
    //             if (risk == null) {
    //                 var span = getEl('span');
    //                 span.classList.add('nodata');
    //                 addEl(div, addEl(span, getTn('No data')));
    //                 return;
    //             }
    //             addInfoLine(div, 'Risk Allele',risk , tabName);
    //             var riskAllele = getWidgetData(tabName, 'gwas_catalog', row, 'risk_allele');
    //             var altBase = getWidgetData(tabName, 'base', row, 'alt_base');
    //             var riskSpan = $(div).find('.detail-info-line-content')[0].children[0];
    //             if (riskAllele === altBase) {
    //                 $(riskSpan).css('color','red');
    //             }
    //             addInfoLine3(div, 'P-value', getWidgetData(tabName, 'gwas_catalog', row, 'pval'), tabName);
    //             addInfoLine3(div, 'Initial Sample', getWidgetData(tabName, 'gwas_catalog', row, 'init_samp'), tabName);
    //             addInfoLine3(div, 'Replication Sample', getWidgetData(tabName, 'gwas_catalog', row, 'rep_samp'), tabName);
    //             addInfoLine3(div, 'Confidence Interval', getWidgetData(tabName, 'gwas_catalog', row, 'ci'), tabName);
    //         }
    //     }
    // }
    widgetInfo['geuvadis'] = {'title': 'Geuvadis eQTLs'};
    widgetGenerators['geuvadis'] = {
        'variant': {
            'width': 380, 
            'height': 180, 
            'function': function (div, row, tabName) {
                var risk = getWidgetData(tabName, 'geuvadis', row, 'gene');
                addInfoLine3(div, 'Disease', risk, tabName);
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
            var divs = showWidget('base2', ['base', 'dbsnp', 'thousandgenomes', 'gnomad', 'uniprot'], 'variant', div, null, null, false);
            addEl(div, getEl('br'));
        }
    }
}

widgetInfo['studiespanel'] = {'title': ''};
widgetGenerators['studiespanel'] = {
    'variant': {
        'width': null,
        'height': null,
        'function': function (div, row, tabName) {
            var br = getEl("br");
            addEl(div, br);
        }
    }
}

widgetInfo['assocpanel'] = {'title': ''};
widgetGenerators['assocpanel'] = {
    'variant': {
        'width': null,
        'height': null,
        'function': function (div, row, tabName) {
            var dl = getEl('dl')
            addEl(div, dl)
            addEl(div, getEl('br'));
            var risk = getWidgetData(tabName, 'gwas_catalog', row, 'risk_allele');
            if (risk == null || risk == undefined) {
                addDlRow(dl, 'GWAS Catalog Risk', 'No annotation available')
            }else{
            addDlRow(dl, 'GWAS Catalog Risk', risk)
            }
            var riskAllele = getWidgetData(tabName, 'gwas_catalog', row, 'risk_allele');
            if (riskAllele == null || riskAllele == undefined) {
                addDlRow(dl, 'GWAS Catalog Risk Allele', 'No annotation available')
            }else{
            addDlRow(dl, 'GWAS Catalog Risk', riskAllele)
            }
            
            // var altBase = getWidgetData(tabName, 'base', row, 'alt_base');
            // var riskSpan = $(div).find('.detail-info-line-content')[0].children[0];
            // if (riskAllele === altBase) {
            //     $(riskSpan).css('color','red');
            // }
            var pval = getWidgetData(tabName, 'gwas_catalog', row, 'pval');
            if (pval == null || pval == undefined) {
                addDlRow(dl, 'GWAS P-value', 'No annotation available')
            }else{
            addDlRow(dl, 'GWAS P-value', pval);
            }
            var isamp = getWidgetData(tabName, 'gwas_catalog', row, 'init_samp');
            if (isamp == null || isamp == undefined) {
                addDlRow(dl, 'GWAS Initial Sample', 'No annotation available')
            }else{
            addDlRow(dl, 'GWAS Initial Sample', isamp)
            var rsamp = getWidgetData(tabName, 'gwas_catalog', row, 'rep_samp');
            }
            if (rsamp == null || rsamp == undefined) {
                addDlRow(dl, 'GWAS Replication Sample', 'No annotation available')
            }else{
            addDlRow(dl, 'GWAS Replication Sample', rsamp)
            var conf = getWidgetData(tabName, 'gwas_catalog', row, 'ci');
            }if (conf == null || conf == undefined) {
                addDlRow(dl, 'GWAS Replication Sample', 'No annotation available')
            }else{
            addDlRow(dl, 'GWAS Replication Sample', rsamp)
        }
    }
}
}
    


widgetInfo['evolutionpanel'] = {'title': ''};
widgetGenerators['evolutionpanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var br = getEl("br");
            addEl(div, br);
        }
    }
}

widgetInfo['genepanel'] = {'title': ''};
widgetGenerators['genepanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var br = getEl("br");
            addEl(div, br);
        }
    }
}
widgetInfo['interactionspanel'] = {'title': ''};
widgetGenerators['interactionspanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var br = getEl("br");
            addEl(div, br);
        }
    }
}
widgetInfo['literaturepanel'] = {'title': ''};
widgetGenerators['literaturepanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var br = getEl("br");
            addEl(div, br);
        }
    }
}
widgetInfo['noncodingpanel'] = {'title': ''};
widgetGenerators['noncodingpanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var br = getEl("br");
            addEl(div, br);
        }
    }
}
widgetInfo['predictionpanel'] = {'title': ''};
widgetGenerators['predictionpanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var br = getEl("br");
            addEl(div, br);
        }
    }
}
widgetInfo['functionalpanel'] = {'title': ''};
widgetGenerators['functionalpanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var br = getEl("br");
            addEl(div, br);
        }
    }
}
widgetInfo['vizualizationpanel'] = {'title': ''};
widgetGenerators['vizualizationpanel'] = {
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

widgetInfo['clinpanel'] = {'title': ''};
widgetGenerators['clinpanel'] = {
    'variant': {
        'width': null,
        'height': null,
        'function': function (div, row, tabName) {
            var elem = document.getElementsByClassName("content");
            while(elem[0].firstChild) {
                elem[0].removeChild(elem[0].firstChild);
            }
            var elem = document.getElementsByClassName("content2");
            while(elem[0].firstChild) {
                elem[0].removeChild(elem[0].firstChild);
            }
            var divs = showWidget('clinvar2', ['clinvar'], 'variant', div, null, null);
            addEl(div, getEl('br'));
            var dl = getEl('dl')
            addEl(div, dl)
            addEl(div, getEl('br'));
            var ps1 = getWidgetData(tabName, 'clinvar_acmg', row, 'ps1_id');
            var ps1_link = 'https://www.ncbi.nlm.nih.gov/clinvar/variation/' + ps1;
            if (ps1 != null){
            var a = makeA(ps1, ps1_link)
            addDlRow(dl, 'ClinVar ACMG PS1 ID', a);
            } else{
                addDlRow(dl, 'ClinVar ACMG PS1 ID', 'No Annotation Available');
            }
            var pm5 = getWidgetData(tabName, 'clinvar_acmg', row, 'pm5_id');
            if (pm5 != null){
            var pm5_link = 'https://www.ncbi.nlm.nih.gov/clinvar/variation/' + pm5;
            var a = makeA(pm5, pm5_link)
            addDlRow(dl, 'ClinVar ACMG PM5 ID', a)
            }else{
                addDlRow(dl, 'ClinVar ACMG PM5 ID', 'No Annotation Available');
            }
            var dl = getEl('dl')
            addEl(div, dl)
            addEl(div, getEl('br'));
            var phenotype = getWidgetData(tabName, 'denovo', row, 'PrimaryPhenotype');
            var validation = getWidgetData(tabName, 'denovo', row, 'Validation');
            if (phenotype != null){
            addDlRow(dl, 'Denovo-DB Phenotype', phenotype);
            }else{
                addDlRow(dl, 'Denovo-DB Phenotype', 'No Annotation Available');
            }
            if (validation != null){
            addDlRow(dl, 'Denovo-DB Validation', validation);
            }else{
                addDlRow(dl, 'Denovo-DB Validation', 'No Annotation Available');
            }
            var dl = getEl('dl')
            addEl(div, dl)
            let ids = getWidgetData(tabName, 'omim', row, 'omim_id');
            if (ids != null || ids != undefined){
            ids = ids !== null ? ids.split('; ') : [];
            var sdiv = getEl('div')
            sdiv.style.display = 'flex'
            sdiv.style.flexWrap = 'wrap'
            for (let i=0; i<ids.length; i++){
                let link = 'https://omim.org/entry/' + ids[i];
                var a = makeA(ids[i], link);
                var span = getEl('div');
                span.classList.add('omim');
                addEl(span, a)
                addEl(sdiv, span)
            }
                    addDlRow(dl, 'OMIM ID', sdiv);
            }else{
                addDlRow(dl, 'OMIM ID', 'No annotation available');
            }
            addEl(div, getEl('br'));
            var generator = widgetGenerators['clingen2']['gene'];
            var divs = showWidget('clingen2', ['clingen'], 'gene', div, null, null, false);
            var d = document.getElementsByClassName("header");
            d[0].classList.add('cardiovascular');
            // d[0].classList.add('right');
            var span = document.getElementsByClassName("content");
            span[0].classList.add('cardiovascular');
            var spans = getEl('span');
            spans.classList.add('cardio');
            spans.textContent = 'CardioBoost'
            var dl = getEl('dl')
            addEl(span[0], spans)
            addEl(span[0], getEl('br'));
            addEl(span[0], dl)
            addEl(span[0], getEl('br'));
            var card = getWidgetData(tabName, 'cardioboost', row, 'cardiomyopathy1');
            var card2 = getWidgetData(tabName, 'cardioboost', row, 'cardiomyopathy');
            var arr = getWidgetData(tabName, 'cardioboost', row, 'arrhythmias1');
            var arr2 = getWidgetData(tabName, 'cardioboost', row, 'arrhythmias');
            if (card != null || card != undefined){
            addDlRow(dl, 'Cardiomyopathy Class', card);
            } else{
                addDlRow(dl, 'Cardiomyopathy Class', 'No annotation available');
            }
            if (card2 != null || card2 != undefined){
            addDlRow(dl, 'Cardiomyopathy Score', card2);
            } else{
                addDlRow(dl, 'Cardiomyopathy Score', 'No annotation available');
            }
            if (arr != null || arr != undefined){
            addDlRow(dl, 'Arrhythmias Class', arr);
            } else{
                addDlRow(dl, 'Arrhythmias Class', 'No annotation available');
            }
            if (arr2 != null || arr2 != undefined){
            addDlRow(dl, 'Arrhythmias Score', arr2);
            } else{
                addDlRow(dl, 'Arrhythmias Score', 'No annnotation available');
            }
            var span = document.getElementsByClassName("content");
            span[0].classList.add('cardiovascular');
            var spans = getEl('span');
            spans.classList.add('cardio')
            spans.textContent = 'Cardiovascular Disease Knowledge Portal'
            var dl = getEl('dl')
            addEl(span[0], spans)
            addEl(span[0], dl)
            addEl(span[0], getEl('br'));
            var ibs = getWidgetData(tabName, 'cvdkp', row, 'bmi');
            var cad = getWidgetData(tabName, 'cvdkp', row, 'cad');
            var bmi = getWidgetData(tabName, 'cvdkp', row, 'bmi');
            var afib = getWidgetData(tabName, 'cvdkp', row, 'afib');
            var diabetes = getWidgetData(tabName, 'cvdkp', row, 'diabetes');
            if (ibs != null || ibs != undefined){
            addDlRow(dl, 'Irritable Bowl Syndrome', ibs);
            } else{
                addDlRow(dl, 'Irritable Bowl Syndrome', 'No annotation available');
            }
            if (cad != null || cad != undefined){
            addDlRow(dl, 'Coronary Artery Disease', cad);
            } else{
                addDlRow(dl, 'Coronary Artery Disease', 'No annotation available');
            }
            if (bmi != null || bmi != undefined){
            addDlRow(dl, 'BMI and Obesity', bmi);
            } else{
                addDlRow(dl, 'BMI and Obesity', 'No annotation available');
            }
            if (afib != null || afib != undefined){
            addDlRow(dl, 'Atrial Fibrillation', afib);
            } else{
                addDlRow(dl, 'Atrial Fibrillation', 'No annnotation available');
            }
            if (diabetes != null || diabetes != undefined){
                addDlRow(dl, 'Type 2 Diabetes', diabetes);
                } else{
                    addDlRow(dl, 'Type 2 Diabetes', 'No annnotation available');
                }
            var span = document.getElementsByClassName("content");
            span[0].classList.add('cardiovascular');
            var spans = getEl('span');
            spans.classList.add('cardio');
            spans.textContent = 'Arrhythmia Channelopathy Variants'
            var dl = getEl('dl')
            addEl(span[0], spans)
            addEl(span[0], dl)
            addEl(span[0], getEl('br'));
            var lqt = getWidgetData(tabName, 'arrvars', row, 'lqt');
            var brs = getWidgetData(tabName, 'arrvars', row, 'brs');
            var unaff = getWidgetData(tabName, 'arrvars', row, 'unaff');
            var other = getWidgetData(tabName, 'arrvars', row, 'other');
            var bpen = getWidgetData(tabName, 'arrvars', row, 'brs_penetrance');
            var lpen = getWidgetData(tabName, 'arrvars', row, 'lqt_penetrance');
            var func = getWidgetData(tabName, 'arrvars', row, 'functino');
            var bstr = getWidgetData(tabName, 'arrvars', row, 'brs_structure');
            var lstr = getWidgetData(tabName, 'arrvars', row, 'lqt_structure');
            var link = getWidgetData(tabName, 'arrvars', row, 'link');
            if (lqt != null || lqt != undefined){
            addDlRow(dl, 'LQT', ibs);
            } else{
                addDlRow(dl, 'LQT', 'No annotation available');
            }
            if (brs != null || brs != undefined){
                addDlRow(dl, 'BrS', br);
            } else{
                addDlRow(dl, 'BrS', 'No annotation available');
            }
            if (unaff != null || unaff != undefined){
                addDlRow(dl, 'Unaffected', unaff);
            } else{
                addDlRow(dl, 'Unaffected', 'No annotation available');
            }
            if (other != null || other != undefined){
                addDlRow(dl, 'Other', other);
            } else{
                addDlRow(dl, 'Other', 'No annotation available');
            }
            if (bpen != null || bpen != undefined){
                addDlRow(dl, 'BrS Penetrance', bpen);
            } else{
                addDlRow(dl, 'BrS Penetrance', 'No annotation available');
            }
            if (lpen != null || lpen != undefined){
                addDlRow(dl, 'LQT Penetrance', lpen);
            } else{
                addDlRow(dl, 'LQT Penetrance', 'No annotation available');
            }
            if (func != null || func != undefined){
                addDlRow(dl, 'Function', func);
            } else{
                addDlRow(dl, 'Function', 'No annotation available');
            }
            if (bstr != null || bstr != undefined){
                addDlRow(dl, 'BrS Hotspot', bstr);
            } else{
                addDlRow(dl, 'BrS Hotspot', 'No annotation available');
            }
            if (lstr != null || lstr != undefined){
                addDlRow(dl, 'LQT Hotspot', lstr);
            } else{
                addDlRow(dl, 'LQT Hotspot', 'No annotation available');
            }
            if (link != null || link != undefined){
                addDlRow(dl, 'More Information', link);
            } else{
                addDlRow(dl, 'More Information', 'No annotation available');
            }
            var pharm = document.getElementsByClassName("pharm");
            pharm[0].classList.add('cardiovascular');
            var pspan = document.getElementsByClassName("content2");
            pspan[0].classList.add('cardiovascular');
            var dl = getEl('dl')
            addEl(pspan[0], dl)
            var generator = widgetGenerators['pharmgkb2']['variant'];
            var divs = showWidget('pharmgkb2', ['pharmgkb'], 'variant', pspan[0], null, null, false);
            var generator = widgetGenerators['dgi2']['gene'];
            var divs = showWidget('dgi2', ['dgi'], 'gene', pspan[0], null, null, false);
            $(".header").click(function () {
                $header = $(this);
                $content = $header.next();
                $content.slideToggle(500, function () {
                    $header.text(function () {
                        if ($content.is(":visible")){
                            return $(this).attr('arrow down')
                        }
                    });
                    var myDiv = $( "div" );
                    myDiv.clearQueue();
                    myDiv.stop();
                });
            }); 
            $(".pharm").click(function () {
                $header = $(this);
                $content = $header.next();
                $content.slideToggle(500, function () {
                    $header.text(function () {
                        if ($content.is(":visible")){
                            return $(this).attr('arrow down')
                        }
                    });
                    var myDiv = $( "div" );
                    myDiv.clearQueue();
                    myDiv.stop();
                });
            }); 
        }
    }
}
const getHugoAchange = function () {
    return annotData['base']['hugo'] + ' ' + changeAchange3to1(annotData['base']['achange'])
  }
const getNoAnnotMsgVariantLevel = function () {
    return 'No annotation available for ' + getHugoAchange()
  }
  const prettyVal = function (val) {
    if (val == '') {
      return val
    } else if (val < 0.01 && val > -0.01) {
      return val.toExponential(2)
    } else {
      return val.toPrecision(3)
    }
  }
  
  const addDlRow = function (dl, title, content) {
    var ddiv = getEl('div')
    var dt = getEl('dt')
    if (typeof title == 'string') {
      dt.textContent = title
    } else {
      addEl(dt, title)
    }
    var dd = getEl('dd')
    var contentType = typeof content
    if (contentType == 'string') {
      dd.textContent = content
    } else if (contentType == 'number') {
      dd.textContent = '' + content
    } else {
      addEl(dd, content)
    }
    addEl(ddiv, dt)
    addEl(ddiv, dd)
    addEl(dl, ddiv)
  }
  
  const makeA = function (text, url) {
    var a = getEl('a')
    a.href = url
    a.textContent = text
    a.target = '_blank'
    return a
  }
widgetInfo['allelefreqpanel'] = {'title': ''};
widgetGenerators['allelefreqpanel'] = {
    'variant': {
    'width': undefined,
    'height': 'unset',
    'function': function (div, row, tabName) {
        var dl = getEl('dl')
      dl.style.width = 'calc(100% - 1rem)'
      addEl(div, dl)
      div.style.marginTop = '2vh';
      var hugoAchange = getHugoAchange()
      //div.style.overflow = 'unset';
      //var sdiv = getEl('div');
      /*var span = getEl('div');
      span.textContent = 'Allele frequencies';
      addEl(sdiv, span);
      addEl(sdiv, getEl('br'));
      addEl(sdiv, getEl('br'));*/
      //var span = getEl('div');
      //span.classList.add('detail-info-line-header');
      //span.style.width = '130px';
      //span.textContent = 'gnomADv3 allele frequency';
      //span.style.textAlign = 'left';
      //span.style.display = 'inline-block';
      //addEl(sdiv, span);
      /*var td = getEl('div');
      td.style.display = 'inline-block';
      td.style.width = 'calc(100% - 130px)';
      if (annotData['gnomad3'] == null) {
          var span = getEl('span');
          span.textContent = 'No annotation available for ' + hugo + ' ' + achange;
          addEl(td, span);
      } else {
          addBarComponent(td, row, 'Total', 'gnomad3__af', tabName);
          addBarComponent(td, row, 'African/African American', 'gnomad3__af_afr', tabName);
          addBarComponent(td, row, 'Latino/Admixed American', 'gnomad3__af_amr', tabName);
          addBarComponent(td, row, 'Ashkenazi Jewish', 'gnomad3__af_asj', tabName);
          addBarComponent(td, row, 'East Asian', 'gnomad3__af_eas', tabName);
          addBarComponent(td, row, 'Finnish', 'gnomad3__af_fin', tabName);
          addBarComponent(td, row, 'Non-Finnish European', 'gnomad3__af_nfe', tabName);
          addBarComponent(td, row, 'Other', 'gnomad3__af_oth', tabName);
          addBarComponent(td, row, 'South Asian', 'gnomad3__af_sas', tabName);
      }*/
      if (annotData['gnomad3'] == null) {
        var td = getNoAnnotMsgVariantLevel()
        addDlRow(dl, 'gnomADv3 allele frequency', td)
      } else {
        let af = annotData['gnomad3']['af']
        let afr = annotData['gnomad3']['af_afr']
        let asj = annotData['gnomad3']['af_asj']
        let eas = annotData['gnomad3']['af_eas']
        let fin = annotData['gnomad3']['af_fin']
        let amr = annotData['gnomad3']['af_amr']
        let nfe = annotData['gnomad3']['af_nfe']
        let oth = annotData['gnomad3']['af_oth']
        let sas = annotData['gnomad3']['af_sas']
        /*af = 1
        afr = 0.5
        asj = 0.25
        eas = 0.05*/
        var tableData = [af, afr, asj, eas, fin, amr, nfe, oth, sas]
        var barColors = [
          `rgba(255, ${(1 - af) * 255}, ${(1 - af) * 240}, 1)`,
          `rgba(255, ${(1 - afr) * 255}, ${(1 - afr) * 240}, 1)`,
          `rgba(255, ${(1 - asj) * 255}, ${(1 - asj) * 240}, 1)`,
          `rgba(255, ${(1 - eas) * 255}, ${(1 - eas) * 240}, 1)`,
          `rgba(255, ${(1 - fin) * 255}, ${(1 - fin) * 240}, 1)`,
          `rgba(255, ${(1 - amr) * 255}, ${(1 - amr) * 240}, 1)`,
          `rgba(255, ${(1 - nfe) * 255}, ${(1 - nfe) * 240}, 1)`,
          `rgba(255, ${(1 - oth) * 255}, ${(1 - oth) * 240}, 1)`,
          `rgba(255, ${(1 - sas) * 255}, ${(1 - sas) * 240}, 1)`,
        ]
        var labels = [
          'Total',
          'African/African American',
          'Ashkenazi Jewish',
          'East Asian',
          'Finnish',
          'Latino/Admixed American',
          'Non-Finnish European',
          'Other',
          'South Asian',
        ]
        var td = getEl('canvas')
        td.id = 'gnomad3_chart'
        td.style.width = '100%'
        td.style.height = '24rem'
        addDlRow(dl, 'gnomADv3 allele frequency', td)
        var chart = new Chart(td, {
          type: 'horizontalBar',
          data: {
            datasets: [{
              data: tableData,
              backgroundColor: barColors,
            }],
            labels: labels,
          },
          options: {
            animation: {
              onComplete: function () {
                var ctx = this.chart.ctx
                ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, 'normal', Chart.defaults.global.defaultFontFamily)
                ctx.fillStyle = this.chart.config.options.defaultFontColor
                ctx.textAlign = 'center'
                ctx.textBaseline = 'bottom'
                this.data.datasets.forEach(function (dataset) {
                  for (var i = 0; i < dataset.data.length; i++) {
                    var model = dataset._meta[
                      Object.keys(dataset._meta)[0]].data[i]._model;
                    if (dataset.data[i] != undefined) {
                      ctx.fillText(
                        prettyVal(dataset.data[i]),
                        Math.max(model.base + 30, model.x - 20),
                        model.y + 5
                      )
                    }
                  }
                })
              }
            },
            scales: {
              xAxes: [{
                ticks: {
                  max: 1.0,
                  min: 0.0,
                }
              }],
            },
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
        })
      }
      if (annotData['thousandgenomes'] == null) {
        var td = getNoAnnotMsgVariantLevel()
        addDlRow(dl, '1000 Genomes Allele Frequency', td)
      } else {
        let af = annotData['thousandgenomes']['af']
        let amr = annotData['thousandgenomes']['amr_af']
        let afr = annotData['thousandgenomes']['afr_af']
        let eas = annotData['thousandgenomes']['eas_af']
        let eur = annotData['thousandgenomes']['eur_af']
        let sas = annotData['thousandgenomes']['sas_af']
        /*af = 1
        afr = 0.5
        asj = 0.25
        eas = 0.05*/
        var tableData = [af, amr, afr, eas, eur, sas]
        var barColors = [
          `rgba(255, ${(1 - af) * 255}, ${(1 - af) * 240}, 1)`,
          `rgba(255, ${(1 - amr) * 255}, ${(1 - amr) * 240}, 1)`,
          `rgba(255, ${(1 - afr) * 255}, ${(1 - afr) * 240}, 1)`,
          `rgba(255, ${(1 - eas) * 255}, ${(1 - eas) * 240}, 1)`,
          `rgba(255, ${(1 - eur) * 255}, ${(1 - eur) * 240}, 1)`,
          `rgba(255, ${(1 - sas) * 255}, ${(1 - sas) * 240}, 1)`,
        ]
        var labels = [
          'Total',
          'Ad Mixed American',
          'African',
          'East Asian',
          'European',
          'South Asian',
        ]
        var td = getEl('canvas')
        td.id = 'thousandgenomes_chart'
        td.style.width = '100%'
        td.style.height = '17rem'
        addDlRow(dl, '1000 Genomes Allele Frequency', td)
        var chart = new Chart(td, {
          type: 'horizontalBar',
          data: {
            datasets: [{
              data: tableData,
              backgroundColor: barColors,
            }],
            labels: labels,
          },
          options: {
            animation: {
              onComplete: function () {
                var ctx = this.chart.ctx
                ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, 'normal', Chart.defaults.global.defaultFontFamily)
                ctx.fillStyle = this.chart.config.options.defaultFontColor
                ctx.textAlign = 'center'
                ctx.textBaseline = 'bottom'
                this.data.datasets.forEach(function (dataset) {
                  for (var i = 0; i < dataset.data.length; i++) {
                    var model = dataset._meta[
                      Object.keys(dataset._meta)[0]].data[i]._model;
                    if (dataset.data[i] != undefined) {
                      ctx.fillText(
                        prettyVal(dataset.data[i]),
                        Math.max(model.base + 30, model.x - 20),
                        model.y + 5
                      )
                    }
                  }
                })
              }
            },
            scales: {
              xAxes: [{
                ticks: {
                  max: 1.0,
                  min: 0.0,
                }
              }],
            },
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
        })
      }
      //addEl(sdiv, td);
      //addEl(sdiv, getEl('br'));
      //addEl(sdiv, getEl('br'));
      //var span = getEl('div');
      //span.classList.add('detail-info-line-header');
      //span.style.width = '130px';
      //span.textContent = '1000 Genomes allele frequency';
      //span.style.textAlign = 'left';
      //span.style.display = 'inline-block';
      //addEl(sdiv, span);
      /*var td = getEl('div');
      if (annotData['thousandgenomes'] == null) {
          var span = getEl('span');
          span.textContent = 'No annotation available for ' + hugo + ' ' + achange;
          addEl(td, span);
      } else {
          addBarComponent(td, row, 'Total', 'thousandgenomes__af', tabName);
          addBarComponent(td, row, 'African', 'thousandgenomes__afr_af', tabName);
          addBarComponent(td, row, 'American', 'thousandgenomes__amr_af', tabName);
          addBarComponent(td, row, 'East Asian', 'thousandgenomes__eas_af', tabName);
          addBarComponent(td, row, 'European', 'thousandgenomes__eur_af', tabName);
          addBarComponent(td, row, 'South Asian', 'thousandgenomes__sas_af', tabName);
      }
      addDlRow(dl, '1000 Genomes Allele Frequency', td)*/
      //addEl(sdiv, td);
      //addEl(div, sdiv);
      //var br = getEl("br");
      //addEl(div, br);
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
            ':' + inputData['ref'] + ':' + inputData['alt'] + ':' + inputData['assembly']
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
                inputData['ref'], inputData['alt'], inputData['assembly']);
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
