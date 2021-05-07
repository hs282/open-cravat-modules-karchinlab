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
        divs[0].style.height = 'unset'
        addEl(divs[0], dl)
        addDlRow(dl,widgetInfo[widgetName]['title'], getNoAnnotMsgVariantLevel());
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
    var parentDiv = document.querySelector('#contdiv_gene');
    showWidget('genepanel', ['base', 'ncbigene', 'ess_gene', 'gnomad_gene', 'go', 'loftool', 'prec', 'phi', 'interpro', 'pangalodb'],
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
    showWidget('evolutionpanel', ['base', 'rvis', 'ghis', 'go','aloft', 'gerp', 'linsight', 'phastcons', 'phylop','siphy'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_studies');
    showWidget('studiespanel', ['base', 'mavedb'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_interactions');
    showWidget('interactionspanel', ['base', 'biogrid', 'ndex', 'ndex_chd','ndex_signor','intact'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_literature');
    showWidget('literaturepanel', ['base', 'litvar', 'dbsnp'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_noncoding');
    showWidget('noncodingpanel', ['base', 'ccre_screen', 'encode_tfbs', 'genehancer', 'vista_enhancer','ensembl_regulatory_build', 'trinity','segway', 'javierre_promoters'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_prediction');
    showWidget('predictionpanel', ['base', 'dann_coding', 'fathmm_xf_coding', 'revel', 'lrt', 'fathmm_mkl', 'metalr', 'metasvm', 'mutation_assessor', 'mutpred1', 'mutationtaster','polyphen2', 'provean', 'sift'], 
            'variant', parentDiv, null, null, false);
    var parentDiv = document.querySelector('#contdiv_functional');
    showWidget('functionalpanel', ['base', 'swissprot_binding', 'swissprot_domains', 'swissprot_ptm'], 
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

const getNoAnnotMsgGeneLevel = function () {
    return 'No annotation available for ' + annotData['base']['hugo']
  }
  
//   const getNoAnnotMsgVariantLevel = function () {
//     return 'No annotation available for ' + getHugoAchange()
//   }

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
const getCirclePoint = function (centerx, centery, radius, angle) {
    let x = centerx + Math.cos(angle / 180 * Math.PI) * radius
    let y = centery + Math.sin(angle / 180 * Math.PI) * radius
    let xy = {
      x: x,
      y: y
    }
    return xy
}
const drawDialFragment = function (
    centerx, centery, radius1, radius2, angle0, angle1, fill, stroke) {
    let angleDiff = angle1 - angle0
    sub = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    xy = getCirclePoint(centerx, centery, radius1, angle0)
    d = `M ${xy.x} ${xy.y}`
    xy = getCirclePoint(centerx, centery, radius1, angle1)
    if (angleDiff < 180) {
      d += ` A ${radius1} ${radius1} 0 0 1 ${xy.x} ${xy.y}`
    } else {
      d += ` A ${radius1} ${radius1} 0 1 1 ${xy.x} ${xy.y}`
    }
    xy = getCirclePoint(centerx, centery, radius2, angle1)
    d += ` L ${xy.x} ${xy.y}`
    xy = getCirclePoint(centerx, centery, radius2, angle0)
    if (angleDiff < 180) {
      d += ` A ${radius2} ${radius2} 0 0 0 ${xy.x} ${xy.y}`
    } else {
      d += ` A ${radius2} ${radius2} 0 1 0 ${xy.x} ${xy.y}`
    }
    xy = getCirclePoint(centerx, centery, radius1, angle0)
    d += ` L ${xy.x} ${xy.y}`
    sub.setAttributeNS(null, 'fill', fill)
    sub.setAttributeNS(null, 'stroke', stroke)
    sub.setAttributeNS(null, 'd', d)
    return sub
}
const drawDialGraph = function (title, value, threshold) {
    let el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.style.width = '6rem'
    el.style.height = '6rem'
    let centerx = 50
    let centery = 50
    let radius1 = 40
    let radius2 = 30
    let angle0 = 135
    let angle1 = 405
    let angleRange = angle1 - angle0
    let dotradius = 5
    let angleAdd = value * angleRange
    let angle = angle0 + angleAdd
    let thresholdAngle = threshold * angleRange + angle0
    // Needle
    let sub = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    let xy = getCirclePoint(centerx, centery, dotradius, angle - 90)
    let points = '' + xy.x + ',' + xy.y
    xy = getCirclePoint(centerx, centery, radius2, angle)
    let pointXy = xy
    points += ' ' + xy.x + ',' + xy.y
    xy = getCirclePoint(centerx, centery, dotradius, angle + 90)
    points += ' ' + xy.x + ',' + xy.y
    sub.setAttributeNS(null, 'points', points)
    if (value < threshold) {
      sub.setAttributeNS(null, 'stroke', 'black')
      sub.setAttributeNS(null, 'fill', 'black')
    } else {
      sub.setAttributeNS(null, 'stroke', '#ff5555')
      sub.setAttributeNS(null, 'fill', '#ff5555')
    }
    el.appendChild(sub)
    // Dot
    sub = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    sub.setAttributeNS(null, 'cx', centerx)
    sub.setAttributeNS(null, 'cy', centery)
    sub.setAttributeNS(null, 'r', dotradius)
    sub.setAttributeNS(null, 'r', dotradius)
    if (value < threshold) {
      sub.setAttributeNS(null, 'stroke', 'black')
      sub.setAttributeNS(null, 'fill', '#ffffff')
    } else {
      sub.setAttributeNS(null, 'stroke', 'black')
      sub.setAttributeNS(null, 'fill', '#ffffff')
    }
    el.appendChild(sub)
    // Circle
    if (value < threshold) {
      el.appendChild(
        drawDialFragment(
          centerx, centery, radius1, radius2, angle0, angle, '#ffaaaa', 'black'))
      el.appendChild(
        drawDialFragment(
          centerx, centery, radius1, radius2, angle, thresholdAngle, '#ffffff', 'black'))
      el.appendChild(
        drawDialFragment(
          centerx, centery, radius1, radius2, thresholdAngle, angle1, '#aaaaaa', 'black'))
    } else {
      el.appendChild(
        drawDialFragment(
          centerx, centery, radius1, radius2, angle0, thresholdAngle, '#ffaaaa', 'black'))
      el.appendChild(
        drawDialFragment(
          centerx, centery, radius1, radius2, thresholdAngle, angle, '#ff5555', 'black'))
      el.appendChild(
        drawDialFragment(
          centerx, centery, radius1, radius2, angle, angle1, '#aaaaaa', 'black'))
    }
    return el
  }
const getDialWidget = function (title, value, threshold) {
    var sdiv = getEl('div');
    sdiv.classList.add('dialdiv')
    var svg = drawDialGraph(title, value, threshold)
    addEl(sdiv, svg)
    var ssdiv = getEl('div')
    var sssdiv = getEl('div')
    sssdiv.textContent = title
    addEl(ssdiv, sssdiv)
    sssdiv = getEl('div')
    sssdiv.textContent = prettyVal(value)
    addEl(ssdiv, sssdiv)
    addEl(sdiv, ssdiv)
    return sdiv
}
const getDialWidget2 = function (title, value, threshold, score) {
    var sdiv = getEl('div');
    sdiv.classList.add('dialdiv2')
    var svg = drawDialGraph(title, value, threshold)
    addEl(sdiv, svg)
    var ssdiv = getEl('div')
    var sssdiv = getEl('div')
    sssdiv.textContent = title
    addEl(ssdiv, sssdiv)
    sssdiv = getEl('div')
    var span = getEl('span');
    span.textContent = prettyVal(value);
    span.style.fontSize = '1.250rem'
    addEl(sssdiv, span)
    var sspan = getEl('span')
    sspan.textContent = ' rankscore'
    sspan.style.fontSize = '0.75rem'
    addEl(sssdiv, sspan)
    addEl(ssdiv, sssdiv)
    sssdiv = getEl('div')
    var span = getEl('span');
    span.textContent = prettyVal(score)
    span.style.fontSize = '1rem'
    addEl(sssdiv, span)
    var sspan = getEl('span')
    sspan.textContent = ' score'
    sspan.style.fontSize = '0.75rem'
    addEl(sssdiv, sspan)
    addEl(ssdiv, sssdiv)
    addEl(sdiv, ssdiv)
    return sdiv
}
const predWidget = function (title, value) {
    var sdiv = getEl('div');
    sdiv.classList.add('preddiv')
    var ssdiv = getEl('div')
    var sssdiv = getEl('div')
    sssdiv.textContent = title
    addEl(ssdiv, sssdiv)
    sssdiv = getEl('div')
    sssdiv.textContent = value
    if (isNaN(value) == false && value != null){
        sssdiv.textContent = prettyVal(value)
    }else{
        sssdiv.textContent = value
    }
    addEl(ssdiv, sssdiv)
    addEl(sdiv, ssdiv)
    return sdiv
}
const contentWidget = function (title, value) {
    var sdiv = getEl('div');
    sdiv.classList.add('contentdiv')
    var ssdiv = getEl('div')
    var sssdiv = getEl('div')
    sssdiv.textContent = title
    addEl(ssdiv, sssdiv)
    sssdiv = getEl('div')
    sssdiv.textContent = value
    if (isNaN(value) == false && value != null){
        sssdiv.textContent = prettyVal(value)
    }else{
        sssdiv.textContent = value
    }
    addEl(ssdiv, sssdiv)
    addEl(sdiv, ssdiv)
    return sdiv
}
const baseWidget = function (title, value) {
    var sdiv = getEl('div');
    sdiv.classList.add('basediv')
    var ssdiv = getEl('div')
    var sssdiv = getEl('div')
    sssdiv.textContent = title
    addEl(ssdiv, sssdiv)
    sssdiv = getEl('div')
    sssdiv.textContent = value
    addEl(ssdiv, sssdiv)
    addEl(sdiv, ssdiv)
    return sdiv
}

const baseWidgetlink = function (title, value, link) {
    var sdiv = getEl('div');
    sdiv.classList.add('basediv')
    var ssdiv = getEl('div')
    var sssdiv = getEl('div')
    sssdiv.textContent = title
    addEl(ssdiv, sssdiv)
    sssdiv = getEl('div')
    var a = makeA(value, link)
    a.classList.add('linkclass')
    addEl(sssdiv, a)
    addEl(ssdiv, sssdiv)
    addEl(sdiv, ssdiv)
    return sdiv
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
        var vdiv = getEl('div')
        var span = getEl('span');
        span.classList.add('detail-info-line-header');
        span.style.fontSize = '1.25rem';
        span.style.fontWeight = '600';
        span.textContent = hugo;
        addEl(vdiv, span);
        var span = getEl('span');
        span.style.fontSize = '1.25rem';
        span.style.wor = '10px';
        span.classList.add('basehugo');
        var achange = getWidgetData(tabName, 'base', row, 'achange');
        achange = changeAchange3to1(achange);
        span.textContent = '\n' + achange;
        addEl(vdiv, span)
        addEl(div, getEl('br'));
        var sdiv = getEl('div');
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
        addEl(div, sdiv);
        addEl(div, getEl('br'));
        var dl = getEl('dl')
        addEl(div, dl)
        var wdiv = getEl('div')
        wdiv.style.display = 'flex'
        wdiv.style.flexWrap = 'wrap'
        // var table = getEl('table');
        // table.setAttribute("id", "basetable");
        var tbody = getEl('tbody');
        var sdiv = getEl('div');
        // var sdiv = getEl('div')
        // sdiv.style.maxwidth = '95rem'
        // sdiv.style.maxHeight = '100%'
        // sdiv.style.overflow = 'auto'
        sdiv.style.display = 'flex'
        sdiv.style.flexWrap = 'wrap'
        // var tr = document.createElement('tr');
        // var ssdiv = getEl('div')
        var variantinfo = baseWidget('Variant Type', variant_type + ' (' + ref_base + '>' + alt_base + ')')
        addEl(sdiv, variantinfo)
        // addDlRow(dl, '', variantinfo)
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
        // addDlRow(dl, 'Genomic location', 'chr' + chrom + ':' + getWidgetData(tabName, 'base', row, 'pos') + ' ' + '(genome build GRCh38)', tabName)
        var genomic_location = baseWidget('Genomic location', 'chr' + chrom + ':' + getWidgetData(tabName, 'base', row, 'pos') + ' ' + '(genome build GRCh38)')
        var so = getWidgetData(tabName, 'base', row, 'so');
        var consequence = '';
        if (so == 'synonymous_variant') {
          consequence = 'synonymous';
        } else {
          consequence = 'nonsynonymous';
        }
        // addDlRow(dl, 'Variant consequence', consequence + ' (' + so.replace('_', ' ') + ')', tabName)
        var consequences = baseWidget('Variant consequence', consequence + ' (' + so.replace('_', ' ') + ')')
        addEl(sdiv, consequences)
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
        var snp = getWidgetData(tabName, 'dbsnp', row, 'rsid');
        if (snp == null) {
        //   addDlRow(dl, 'dbSNP ID', 'No dbSNP ID is available');
          var dbsnp = baseWidget('dbSNP ID', 'No dbSNP ID is available')
        } else {
            link = 'https://www.ncbi.nlm.nih.gov/snp/' + snp
            var dbsnp = baseWidgetlink('dbSNP ID', snp, link)
        }
        var acc = getWidgetData(tabName, 'uniprot', row, 'acc');
          if (acc == null) {
            // addDlRow(dl, 'UniProt Accession Number', 'No annotation available');
            var uniprot = predWidget('UniProt Accession Number', getNoAnnotMsgVariantLevel())
          } else {
            link2 = 'https://www.uniprot.org/uniprot/' + acc
            // var aa = makeA(acc, link2)
            var aa = getEl('a');
            aa.href = link2
            aa.textContent = acc
            var u = getEl('div')
            // aa.classList.add('linkclass')
            
            var uniprot = baseWidgetlink('UniProt Accession Number', acc, link2)
            }
        // var td = document.createElement('td');
        // addEl(td, variantinfo)
        // addEl(tr, td);
        // var td = document.createElement('td');
        // addEl(tr, td);
        // addEl(td, genomic_location)
        // var td = document.createElement('td');
        // addEl(tr, td);
        // addEl(td, consequences)
        // var td = document.createElement('td');
        // addEl(tr, td);
        // addEl(td, dbsnp)
        // var td = document.createElement('td');
        // addEl(tr, td);
        // addEl(td, uniprot)
        // addEl(tbody, tr);
        // addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
        addDlRow(dl, vdiv, sdiv)
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

widgetInfo['ncbi'] = {
    'title': ''
  };
  widgetGenerators['ncbi'] = {
    'gene': {
      'width': '100%',
      'height': undefined,
      'word-break': 'break-word',
      'function': function (div, row, tabName) {
        var hugo = getWidgetData(tabName, 'base', row, 'hugo');
        var dl = getEl('dl')
        addEl(div, dl)
        var desc = getWidgetData(tabName, 'ncbigene', row, 'ncbi_desc')
        if (desc != undefined || desc != null){
        desc = desc.split(/\[.*\]$/)[0]
        }
        if (desc == null) {
          addDlRow(dl, 'NCBI Gene Summary', getNoAnnotMsgGeneLevel())
        } else {
          addDlRow(dl, 'NCBI Gene Summary', desc)
        }
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
widgetInfo['siphy2'] = {'title': 'SiPhy'};
widgetGenerators['siphy2'] = {
	'variant': {
		'width': undefined, 
		'height': undefined, 
		'word-break': 'normal',
		'function': function (div, row, tabName) {
            var title = 'SiPhy'
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            wdiv.style.display = 'flex'
            wdiv.style.flexWrap = 'wrap'
            var divHeight = '400px';
			var log = getWidgetData(tabName, 'siphy', row, 'logodds');
            var rank = getWidgetData(tabName, 'siphy', row, 'logodds_rank');
            if (rank != null || rank != undefined){
            var sdiv = getDialWidget2('SiPhy', annotData['siphy']['logodds_rank'], .75, log)
            }else{
                var sdiv = `No annotation is available for ${annotData["base"]["hugo"]} ${annotData["base"]["achange"]}`
            }
            addDlRow(dl, 'SiPhy', sdiv);
			// addGradientBarComponent(div, row, 'Rank Score', 'siphy__logodds_rank', tabName);
			var pis = getWidgetData(tabName, 'siphy', row, 'pi');
            var pils = pis != null ? pis.split(';') : [];
            var sdiv = getEl('div')
            sdiv.style.width = '47rem'
            sdiv.style.maxHeight = '400px'
            sdiv.style.overflow = 'auto'
            sdiv.style.marginRight = '5rem'
            var table = getWidgetTableFrame();
            table.setAttribute("id", "newtable");
			addEl(div, table);
			var thead = getWidgetTableHead(['Nucleobase', 'Stationary Distribution']);
			addEl(table, thead);
			var tbody = getEl('tbody');
			addEl(table, tbody);
			var bases = ['A', 'C', 'G', 'T']
			for (var i =0; i<pils.length;i++){
				var pi = pils[i]
				var base = bases[i]
				var tr = getWidgetTableTr([base, pi]);
                addEl(tbody, tr);
                addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
				}
			addDlRow(dl, '', wdiv)
		}
	}
}
widgetInfo['aloft2'] = {'title': 'Aloft'};
widgetGenerators['aloft2'] = {
	'variant': {
		'width': undefined, 
		'height': undefined, 
		'function': function (div, row, tabName) {
            var title = 'Aloft'
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            // wdiv.style.display = 'flex'
            // wdiv.style.flexWrap = 'wrap'
            // var divHeight = '250px';
            var title = getEl('div')
            title.textContent = 'ALoFT'
            title.classList.add('tooltip')
            var img = document.createElement("img");
            img.src = "desc.png";
            img.classList.add('infoimg')
            title.appendChild(img);
            var spans = getEl('span')
            spans.textContent = 'ALoFT provides extensive annotations to putative loss-of-function variants (LoF) in protein-coding genes including functional, evolutionary and network features.'
            spans.classList.add('tooltiptext')
			var allMappings = getWidgetData(tabName, 'aloft', row, 'all');
			if (allMappings != undefined && allMappings != null) {
                var sdiv = getEl('div')
                sdiv.style.width = '80rem'
                sdiv.style.maxHeight = '250px'
                sdiv.style.minHeight = '120px'
                // sdiv.style.overflow = 'auto'
                sdiv.style.marginRight = '5rem'
                var table = getWidgetTableFrame();
                table.setAttribute("id", "newtable");
				var thead = getWidgetTableHead(['Transcript', 'Transcripts Affected', 'Tolerated Probability', 'Recessive Probability', 'Dominant Probability', 'Classification', 'Confidence']);
				addEl(table, thead);
				var tbody = getEl('tbody');
                for (var i = 0; i < allMappings.length; i++) {
					var row = allMappings[i];
					var transcript = row[0];
					var affect = row[1];
					var tolerated = row[2];
                    var recessive = row[3];
                    var dominant = row[4];
                    var pred = row[5];
                    var conf = row[6];
					var tr = getWidgetTableTr([transcript, affect, tolerated, recessive, dominant, pred, conf]);
                    addEl(tbody, tr);
                    addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
				}
				addDlRow(dl, addEl(title, spans), wdiv)
			}else{
                addDlRow(dl, addEl(title, spans), getNoAnnotMsgVariantLevel())
            }
            
		}
	}
}

widgetInfo['clinvar2'] = {
    'title': 'ClinVar'
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
        var span = getEl('span');
        span.textContent = sig;
        var dd = getEl('div')
        addEl(dd, span)
        addEl(dd, getTn('\xa0'));
        var sigLower = sig == undefined ? '' : sig.toLowerCase()
        if (id != null && sigLower != 'not provided' 
            && sigLower != '' && sigLower != 'association not found') {
          link = 'https://www.ncbi.nlm.nih.gov/clinvar/variation/' + id;
          var a = makeA(id, link)
          a.classList.add('linkclass');
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
            addDlRow(dl, 'ClinVar Conditions', sdiv)
        });
        }else {
          addDlRow(dl, 'ClinVar', getNoAnnotMsgVariantLevel())
        }
      }
    }
  }


widgetInfo['clinvar_acmg'] = {
'title': 'ClinVar ACMG'
};
widgetGenerators['clinvar_acmg'] = {
'variant': {
    'width': undefined,
    'height': undefined,
    'function': function (div, row, tabName) {
    div.parentElement.style.paddingBottom = '0'
    var ps1 = getWidgetData(tabName, 'clinvar_acmg', row, 'ps1_id');
    var pm5 = getWidgetData(tabName, 'clinvar_acmg', row, 'pm5_id');
    var dl = getEl('dl')
    addEl(div, dl)
    if (ps1 != null) {
        var link = 'https://www.ncbi.nlm.nih.gov/clinvar/variation/' + ps1;
        var a = makeA(ps1, link)
        a.classList.add('linkclass')
        addDlRow(dl, 'ClinVar ACMG PS1 ID', a)
        var url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&id=' + ps1 + '&retmode=json'
        fetch(url).then(response => {
        return response.json()
        }).then(response => {
        var trait_set = response['result'][ps1].trait_set;
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
        addDlRow(dl, 'ClinVar ACMG PS1 Conditions', sdiv)
    });
    }else if (pm5 != null){
            var link = 'https://www.ncbi.nlm.nih.gov/clinvar/variation/' + pm5;
            var a = makeA(pm5, link)
            a.classList.add('linkclass')
            addDlRow(dl, 'ClinVar ACMG PM5 ID', a)
            var url = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=clinvar&id=' + pm5 + '&retmode=json'
            fetch(url).then(response => {
            return response.json()
            }).then(response => {
            var trait_set = response['result'][pm5].trait_set;
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
            addDlRow(dl, 'ClinVar ACMG PM5 Conditions', sdiv)
        });
    }else {
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
            // wdiv.style.display = 'flex'
            // wdiv.style.flexWrap = 'wrap'
            // var divHeight = '400px';
            var disease = getWidgetData(tabName, 'clingen', row, 'disease');
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
                sdiv.style.maxHeight = '200px'
                sdiv.style.overflow = 'auto'
                sdiv.style.marginRight = '5rem'
                var table = getWidgetTableFrame();
                table.setAttribute("id", "newtable");
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
                    // link.classList.add('linkclass')
                    // mondo_link.classList.add('linkclass')
                    var tr = getWidgetTableTr2([disease, classification, link, mondo_link]);
                    addEl(tbody, tr);
                    addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
                }
                addDlRow(dl, title, wdiv)
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
                a.classList.add('linkclass');
                addDlRow(dl, 'PharmGKB Variant', a)
                // addInfoLineLink(div, 'Variant', pharmId, ``);
                var sdiv = getEl('div')
                sdiv.style.width = '84rem'
                sdiv.style.maxHeight = '250px'
                sdiv.style.overflow = 'auto'
                sdiv.style.marginRight = '5rem'
                var table = getWidgetTableFrame();
                table.setAttribute("id", "newtable");
                
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
                        let chemInfo = row[0][i];
                        for (let j=0; j<chemInfo.length; j++) {
                    var tr = getWidgetTableTr2([chemInfo[i], row[1], row[2], row[3], study, row[5]]);
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
            var divHeight = '250px';
            var allMappings = getWidgetData(tabName, 'dgi', row, 'all');
            if (allMappings != undefined && allMappings != null) {
                var sdiv = getEl('div')
                sdiv.style.width = '84rem'
                sdiv.style.maxHeight = '250px'
                sdiv.style.overflow = 'auto'
                sdiv.style.marginRight = '5rem'
                var table = getWidgetTableFrame();
                table.setAttribute("id", "newtable");
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
                    var tr = getWidgetTableTr2([cat, inter, name, score,link,link2],[chem, pub]);
                    addEl(tbody, tr);
                    addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
                }
                }
                addDlRow(dl, title, wdiv)
            }
        }
    }
}
widgetInfo['gwas_catalog2'] = {'title': 'GWAS Catalog'};
widgetGenerators['gwas_catalog2'] = {
    'variant': {
        'width': undefined, 
        'height': undefined, 
        'function': function (div, row, tabName) {
            var title = 'GWAS Catalog'
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            var risk = getWidgetData(tabName, 'gwas_catalog', row, 'risk_allele');
            var riskAllele = getWidgetData(tabName, 'gwas_catalog', row, 'risk_allele');
            var pval = getWidgetData(tabName, 'gwas_catalog', row, 'pval');
            var isamp = getWidgetData(tabName, 'gwas_catalog', row, 'init_samp');
            var rsamp = getWidgetData(tabName, 'gwas_catalog', row, 'rep_samp');
            var conf = getWidgetData(tabName, 'gwas_catalog', row, 'ci');
            var table = getWidgetTableFrame();
            table.setAttribute("id", "newtable");
            addEl(div, table);
            var thead = getWidgetTableHead(['Risk Allele', 'P-value', 'Initial Sample', 'Replication Sample', 'Confidence Interval']);
            addEl(table, thead);
            var tbody = getEl('tbody');
            addEl(table, tbody);
            var sdiv = getEl('div')
            sdiv.style.width = '80rem'
            sdiv.style.maxHeight = '150px'
            sdiv.style.overflow = 'auto'
            sdiv.style.marginRight = '5rem'
            var tr = getWidgetTableTr2([riskAllele, pval, isamp, rsamp, conf]);
            addEl(tbody, tr);
            addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
            
            addDlRow(dl, title, wdiv)
        }
    }
}
widgetInfo['grasp2'] = {'title': 'GRASP'};
widgetGenerators['grasp2'] = {
    'variant': {
        'width': undefined, 
        'height': undefined, 
        'function': function (div, row, tabName) {
            var title = 'GRASP'
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            wdiv.style.display = 'flex'
            wdiv.style.flexWrap = 'wrap'
            // var divHeight = '400px';
            var hits = getWidgetData(tabName, 'grasp', row, 'all');
            if (hits != undefined && hits != null) {
                var sdiv = getEl('div')
                sdiv.style.width = '70rem'
                sdiv.style.maxHeight = '150px'
                sdiv.style.overflow = 'auto'
                sdiv.style.marginRight = '5rem'
                var table = getWidgetTableFrame();
                table.setAttribute("id", "newtable");
                addEl(div, table);
                var thead = getWidgetTableHead(['Pval', 'Phenotype','NHLBI', 'PubMed']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                addEl(table, tbody);
                for (var i = 0; i < hits.length; i++) {
                    var hit = hits[i];
                    var pheno = hit[2];
                    var pval = hit[3];
                    var nhlbi = hit[0];
                    var pmid = hit[1];
                    var pmLink = 'https://www.ncbi.nlm.nih.gov/pubmed/'+pmid
                    var tr = getWidgetTableTr2([pval, pheno, nhlbi, pmLink], [pmid]);
                    addEl(tbody, tr);
                    addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
                }
                addDlRow(dl, title, wdiv)
            }
        }
    }
}
widgetInfo['gtex2'] = {'title': 'GTEX'};
widgetGenerators['gtex2'] = {
    'variant': {
        'width': undefined, 
        'height': undefined, 
        'function': function (div, row, tabName) {
            var title = 'GTEX'
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            var genes = getWidgetData(tabName, 'gtex', row, 'gtex_gene');
            var genels = genes != null ? genes.split('|') : [];
            var tissues = getWidgetData(tabName, 'gtex', row, 'gtex_tissue');
            var tissuels = tissues != null ? tissues.split('|') : [];
            var table = getWidgetTableFrame();
            table.setAttribute("id", "newtable");
            addEl(div, table);
            var thead = getWidgetTableHead(['Target Gene', 'Tissue Type']);
            addEl(table, thead);
            var tbody = getEl('tbody');
            addEl(table, tbody);
            var sdiv = getEl('div')
            sdiv.style.width = '50rem'
            sdiv.style.maxHeight = '150px'
            sdiv.style.overflow = 'auto'
            sdiv.style.marginRight = '5rem'
            for (var i =0; i<genels.length;i++){
                var geneitr = genels[i];
                var tissueitr = tissuels[i];
                tissueitr = tissueitr.replace("_", " ")
                var ensLink = 'https://ensembl.org/Homo_sapiens/Gene/Summary?g='+geneitr;
                var tr = getWidgetTableTr2([ensLink, tissueitr],[geneitr]);
                addEl(tbody, tr);
                addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
            }
            addDlRow(dl, title, wdiv)
        }
    }
}

widgetInfo['rvis2'] = {'title': 'RVIS'};
widgetGenerators['rvis2'] = {
    'variant': {
        'width': undefined, 
        'height': undefined, 
        'function': function (div, row, tabName) {
            var title = 'RVIS'
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            var evs = getWidgetData(tabName, 'rvis', row, 'rvis_evs');
            if (evs != null || evs != undefined){
                evs = prettyVal(evs)
            }
            var exac = getWidgetData(tabName, 'rvis', row, 'rvis_exac');
            if (exac != null || exac != undefined){
                exac = prettyVal(exac)
            }
            var perc_evs = getWidgetData(tabName, 'rvis', row, 'rvis_perc_evs');
            if (perc_evs != null || perc_evs != undefined){
                perc_evs = prettyVal(perc_evs)
            }
            var perc_exac = getWidgetData(tabName, 'rvis', row, 'rvis_perc_exac');
            if (perc_exac != null || perc_exac != undefined){
                perc_exac = prettyVal(perc_exac)
            }
            var pvalue = getWidgetData(tabName, 'rvis', row, 'rvis_fdr_exac');
            if (pvalue != null || pvalue != undefined){
                pvalue = prettyVal(pvalue)
            }
            var table = getWidgetTableFrame();
            table.setAttribute("id", "newtable");
            addEl(div, table);
            var thead = getWidgetTableHead(['Score', 'Percentile Rank', 'ExAC-based RVIS', 'ExAC-based Percentile', 'FDR p-value' ]);
            addEl(table, thead);
            var tbody = getEl('tbody');
            addEl(table, tbody);
            var sdiv = getEl('div')
            sdiv.style.width = '80rem'
            sdiv.style.maxHeight = '150px'
            sdiv.style.overflow = 'auto'
            sdiv.style.marginRight = '5rem'
            var tr = getWidgetTableTr2([evs, exac, perc_evs, perc_exac, pvalue]);
            addEl(tbody, tr);
            addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
            addDlRow(dl, title, wdiv)
        }
    }
}

widgetInfo['gnomad_gene2'] = {'title': 'gnomAD Gene'};
widgetGenerators['gnomad_gene2'] = {
	'gene': {
		'width': undefined, 
        'height': undefined, 
        'word-break': 'normal',
		'function': function (div, row, tabName) {
            var title = 'gnomAD Gene'
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            wdiv.style.display = 'flex'
            wdiv.style.flexWrap = 'wrap'
            var divHeight = '250px';
			var results = getWidgetData(tabName, 'gnomad_gene', row, 'all');
            if (results != undefined && results != null && typeof(results)=='object') {
                var table = getWidgetTableFrame();
                table.setAttribute("id", "newtable");
                addEl(div, table);
                var thead = getWidgetTableHead(['Transcript','Obv/Exp LoF','Obv/Exp Mis','Obv/Exp Syn','LoF Z-Score','Mis Z-Score','Syn Z-Score','pLI','pRec','pNull'],['15%']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                addEl(table, tbody);
                var sdiv = getEl('div')
                sdiv.style.width = '72vw'
                sdiv.style.maxHeight = '15vw'
                sdiv.style.overflow = 'auto'
                sdiv.style.marginRight = '5rem'
                for (var i=0; i < results.length; i++) {
                    var row = results[i];
                    var tr = getWidgetTableTr(row);
                    addEl(tbody, tr);
                    addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
                }
                addDlRow(dl, title, wdiv)
            } else {
                var trx = getWidgetData(tabName, 'gnomad_gene', row, 'transcript');
                var trxls = trx != null ? trx.split(';') : [];
                var oelof = getWidgetData(tabName, 'gnomad_gene', row, 'oe_lof');
                var oelofls = oelof != null ? oelof.split(';').map(Number) : [];
                var oemis = getWidgetData(tabName, 'gnomad_gene', row, 'oe_mis');
                var oemisls = oemis != null ? oemis.split(';').map(Number) : [];
                var oesyn = getWidgetData(tabName, 'gnomad_gene', row, 'oe_syn');
                var oesynls = oesyn != null ? oesyn.split(';').map(Number) : [];
                var lofz = getWidgetData(tabName, 'gnomad_gene', row, 'lof_z');
                var lofzls = lofz != null ? lofz.split(';').map(Number) : [];
                var misz = getWidgetData(tabName, 'gnomad_gene', row, 'mis_z');
                var miszls = misz != null ? misz.split(';').map(Number) : [];
                var synz = getWidgetData(tabName, 'gnomad_gene', row, 'syn_z');
                var synzls = synz != null ? synz.split(';').map(Number) : [];
                var pli = getWidgetData(tabName, 'gnomad_gene', row, 'pLI');
                var plils = pli != null ? pli.split(';').map(Number) : [];
                var prec = getWidgetData(tabName, 'gnomad_gene', row, 'pRec');
                var precls = prec != null ? prec.split(';').map(Number) : [];
                var pnull = getWidgetData(tabName, 'gnomad_gene', row, 'pNull');
                var pnullls = pnull != null ? pnull.split(';').map(Number) : [];
                var table = getWidgetTableFrame();
                addEl(div, table);
                var thead = getWidgetTableHead(['Transcript','Obv/Exp LoF','Obv/Exp Mis','Obv/Exp Syn','LoF Z-Score','Mis Z-Score','Syn Z-Score','pLI','pRec','pNull'],['20%']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                addEl(table, tbody);
                var sdiv = getEl('div')
                sdiv.style.width = '47rem'
                sdiv.style.maxHeight = '400px'
                sdiv.style.overflow = 'auto'
                sdiv.style.marginRight = '5rem'
                for(var i=0;i<trxls.length;i++){
                    var tr = getWidgetTableTr([trxls[i],oelofls[i],oemisls[i],oesynls[i],lofzls[i],miszls[i],synzls[i],plils[i],precls[i],pnullls[i]]);
                    addEl(tbody, tr);
                    addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
                }
                addDlRow(dl, title, wdiv)
            }
		}
	}
}
widgetInfo['go2'] = {'title': 'Gene Ontology'};
widgetGenerators['go2'] = {
	'gene': {
		'width': undefined, 
		'height': undefined, 
        'word-break': 'normal',
		'function': function (div, row, tabName) {
            var title = 'Gene Ontology'
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
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
            table.setAttribute("id", "newtable");
			addEl(div, table);
			var thead = getWidgetTableHead([ 'Biological Process','Cellular Component','Molecular Function']);
			addEl(table, thead);
			var tbody = getEl('tbody');
            addEl(table, tbody);
            var sdiv = getEl('div')
            sdiv.style.width = '72vw'
            sdiv.style.maxHeight = '25vw'
            sdiv.style.overflow = 'auto'
            sdiv.style.marginRight = '5rem'
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
            var tr = getWidgetTableTr2([link2, link, link3], [bname_val,cname_val,mname_val]);
            addEl(tbody, tr);
            addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
            }
            addDlRow(dl, title, wdiv)
		}
	}
}
widgetInfo['interpro2'] = {'title': 'Interpro'}
widgetGenerators['interpro2'] = {
	'variant': {
		'width':undefined, 
		'height': undefined, 
		'function': function (div, row, tabName) {
            var title = 'InterPro'
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            var hits = getWidgetData(tabName, 'interpro', row, 'all')
            if (hits != undefined && hits != null && typeof(hits)=='object') {
                var table = getWidgetTableFrame();
                table.setAttribute("id", "newtable")
                addEl(div, table);
                var thead = getWidgetTableHead(['Domain', 'UniProt', 'Ensembl', 'Link'],['55%','13%','22%','10%']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                addEl(table, tbody);
                var sdiv = getEl('div')
                sdiv.style.width = '80rem'
                sdiv.style.maxHeight = '250px';
                for (let i=0; i<hits.length; i++){
                    var hit = hits[i];
                    var link = 'https://www.ebi.ac.uk/interpro/protein/'+hit[1];
                    var tr = getWidgetTableTr2([hit[0], hit[1], hit[2], link]);
                    addEl(tbody, tr);
                    addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
                }
                addDlRow(dl, title, wdiv)
            }
		}
	}
}
widgetInfo['biogrid2'] = {'title': 'BioGRID'}
widgetGenerators['biogrid2'] = {
	'gene': {
		'width': undefined, 
		'height': undefined, 
		'function': function (div, row, tabName) {
            var title = 'BioGRID Interactors'
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            var divHeight = '400px';
			var value = getWidgetData(tabName, 'biogrid', row, 'id');
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
                var a = makeA(id, link);
                a.classList.add('linkclass')
                addDlRow(dl, 'BioGRID ID', a)
			}
			else {
				addDlRow(dl, 'BioGRID ID', getNoAnnotMsgGeneLevel())
			}
            
			var actsls = acts != null ? acts.split(';') : [];
            if (actsls.length > 0) {
                var sdiv = getEl('div');
                sdiv.style.display = 'flex'
                sdiv.style.flexWrap = 'wrap'
                for (var j=0;j<actsls.length;j++){
                    var span = getEl('div')
                    span.classList.add('clinvar_traitname')
                    span.textContent = actsls[j]
                    addEl(sdiv, span);
                }
                addDlRow(dl, title, sdiv)
            }
		}
	}
}
widgetInfo['intact2'] = {'title': 'IntAct'}
widgetGenerators['intact2'] = {
	'gene': {
		'width': undefined, 
		'height': undefined, 
		'function': function (div, row, tabName) {
            var title = 'IntAct Interactors'
            var dl = getEl('dl')
            addEl(div, dl)
			var value = getWidgetData(tabName, 'intact', row, 'acts');
			var hugo = getWidgetData(tabName, 'base', row, 'hugo');
			if (hugo) {
                link = 'https://www.ebi.ac.uk/intact/query/geneName:'+hugo;
                var a = makeA(title, link)
                a.classList.add('linkclass');
			}
			var acts = getWidgetData(tabName, 'intact', row, 'acts');
			var actsls = acts != null ? acts.split(';') : [];
            var sdiv = getEl('div')
            sdiv.style.display = 'flex'
            sdiv.style.flexWrap = 'wrap'
			for (var j=0;j<actsls.length;j++){
                var span = getEl('div')
                span.classList.add('clinvar_traitname')
                span.textContent = actsls[j]
                addEl(sdiv, span);
            }
            addDlRow(dl, a, sdiv)
		}
	}
}
widgetInfo['litvar'] = {
    'title': 'LitVar'
  };
  widgetGenerators['litvar'] = {
    'variant': {
      'width': undefined,
      'height': undefined,
      'variables': {
        'rsids2pmids': {},
      },
      'word-break': 'break-word',
      'function': function (div, row, tabName) {
        var dl = getEl('dl')
        addEl(div, dl)
        var title = 'Publications for this mutation (LitVar)'
        var widgetName = 'litvar';
        var v = widgetGenerators[widgetName][tabName]['variables'];
        var rsid = getWidgetData(tabName, 'dbsnp', row, 'rsid');
        if (rsid == null) {
          addDlRow(dl, title, getNoAnnotMsgVariantLevel())
          return;
        }
        var n = v['rsids2pmids'][rsid];
        var link = 'https://www.ncbi.nlm.nih.gov/CBBresearch/Lu/Demo/LitVar/#!?query=' + rsid;
        if (n != undefined) {
          //addInfoLineLink(div, n , '# publications for the variant (' + rsid + ')', link);
          if (n == 0) {
            var a = getNoAnnotMsgVariantLevel()
          } else if (n == 1) {
            var a = makeA(n + ' publication for the variant (' + rsid + ')', link)
          } else {
            var a = makeA(n + ' publications for the variant (' + rsid + ')', link)
          }
          addDlRow(dl, title, a)
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
                //addInfoLineLink2(div, '',  
                //        n + ' publications for the variant (' + rsid + ')', link);
                if (n == 0) {
                  var a = getNoAnnotMsgVariantLevel()
                } else if (n == 1) {
                  var a = makeA(
                    n + ' publication for the variant (' + rsid + ')', link)
                    a.classList.add('linkclass')
                } else {
                  var a = makeA(
                    n + ' publications for the variant (' + rsid + ')', link)
                    a.classList.add('linkclass')
                }
                
                addDlRow(dl, 'Publication(s) for this mutation (LitVar)', a)
              }
            }
          }
          xhr.send();
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
            var divs = showWidget('base2', ['base', 'dbsnp', 'thousandgenomes', 'gnomad', 'uniprot'], 'variant', div, null, null, false);
            addEl(div, getEl('br'));
        }
    }
}
widgetInfo['phastcons3'] = {
    'title': 'Phast Cons'
  };
  widgetGenerators['phastcons3'] = {
    'variant': {
      'width': undefined,
      'height': undefined,
      'word-break': 'break-word',
      'function': function (div, row, tabName) {
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            wdiv.style.display = 'flex'
            wdiv.style.flexWrap = 'wrap'
            var dials = [];
            var vert_r = getWidgetData(tabName, 'phastcons', row, 'phastcons100_vert_r');
            var vert= getWidgetData(tabName, 'phastcons', row, 'phastcons100_vert');
            if (vert_r != null || vert_r != undefined){
                var v = getDialWidget2('Vertebrate', annotData['phastcons']['phastcons100_vert_r'], .75, vert)
            }else{
                var v = `No annotation is available for ${annotData["base"]["hugo"]} ${annotData["base"]["achange"]}`
            } 
            dials.push(v);
            var mamm_r = getWidgetData(tabName, 'phastcons', row, 'phastcons30_mamm_r');
            var mamm = getWidgetData(tabName, 'phastcons', row, 'phastcons30_mamm');
            if (mamm_r != null || mamm_r != undefined){
                var m = getDialWidget2('Mammalian', annotData['phastcons']['phastcons30_mamm_r'], .75, mamm)
            }else{
                var m = `No annotation is available for ${annotData["base"]["hugo"]} ${annotData["base"]["achange"]}`
            } 
            dials.push(m);
            var table = getWidgetTableFrame();
            table.setAttribute("id", "phylop");
            var tbody = getEl('tbody');
            var sdiv = getEl('div');
            var sdiv = getEl('div')
            sdiv.style.width = '40rem'
            var tr = document.createElement('tr');
            for (var i = 0; i < dials.length; i++) {
                var dial = dials[i];
                var td = document.createElement('td');
                addEl(tr, td);
                addEl(td, dial)
                addEl(tbody, tr);
                }
            var title = getEl('div')
            title.textContent = 'Phast Cons'
            title.classList.add('tooltip')
            var span = getEl('span')
            span.textContent = 'hello'
            span.classList.add('tooltiptext')
            addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
            addDlRow(dl, addEl(title, span), wdiv)
            }
        }
    }
widgetInfo['phylop2'] = {
    'title': 'PhyloP'
  };
  widgetGenerators['phylop2'] = {
    'variant': {
      'width': undefined,
      'height': undefined,
      'word-break': 'normal',
      'function': function (div, row, tabName) {
        var dl = getEl('dl')
        addEl(div, dl)
        var wdiv = getEl('div')
        wdiv.style.display = 'flex'
        wdiv.style.flexWrap = 'wrap'
        var dials = [];
        var vert_r = getWidgetData(tabName, 'phylop', row, 'phylop100_vert_r');
        var vert = getWidgetData(tabName, 'phylop', row, 'phylop100_vert');
        if (vert_r != null || vert_r != undefined){
            var v = getDialWidget2('Vertebrate', annotData['phylop']['phylop100_vert_r'], 1.00, vert)
        }else{
            var v = `No annotation is available for ${annotData["base"]["hugo"]} ${annotData["base"]["achange"]}`
        } 
        dials.push(v);
        var mamm_r = getWidgetData(tabName, 'phylop', row, 'phylop30_mamm_r');
        var mamm = getWidgetData(tabName, 'phylop', row, 'phylop30_mamm');
        if (mamm_r != null || mamm_r != undefined){
            var m = getDialWidget2('Mammalian', annotData['phylop']['phylop30_mamm_r'], .75, mamm)
        }else{
            var m = `No annotation is available for ${annotData["base"]["hugo"]} ${annotData["base"]["achange"]}`
        } 
        dials.push(m);
        var prim_r = getWidgetData(tabName, 'phylop', row, 'phylop17_primate_r');
        var prim = getWidgetData(tabName, 'phylop', row, 'phylop17_primate');
        if (prim_r != null || prim_r != undefined){
            var p = getDialWidget2('Primate', annotData['phylop']['phylop17_primate_r'], .90, prim)
        }else{
            var p = `No annotation is available for ${annotData["base"]["hugo"]} ${annotData["base"]["achange"]}`
        }
        dials.push(p);
        var table = getWidgetTableFrame();
        table.setAttribute("id", "phylop");
        var tbody = getEl('tbody');
        var sdiv = getEl('div');
        var sdiv = getEl('div')
        sdiv.style.width = '60rem'
        var tr = document.createElement('tr');
        for (var i = 0; i < dials.length; i++) {
            var dial = dials[i];
            var td = document.createElement('td');
            addEl(tr, td);
            addEl(td, dial)
            addEl(tbody, tr);
            }
        addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
        addDlRow(dl, 'PhyloP', wdiv)
        }
    }
}
widgetInfo['ccre_screen2'] = {'title': 'Candidate cis_Regulatory Elements by ENCODE (SCREEN)'};
widgetGenerators['ccre_screen2'] = {
	'variant': {
		'width': undefined, 
		'height': undefined, 
		'function': function (div, row, tabName) {
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            wdiv.style.display = 'flex'
            wdiv.style.flexWrap = 'wrap'
            var divHeight = '400px';
            var e_id = getWidgetData(tabName, 'ccre_screen', row, 'acc_e');
            var group = getWidgetData(tabName, 'ccre_screen', row, '_group');
            var bound = getWidgetData(tabName, 'ccre_screen', row, 'bound');
            link = 'https://screen.encodeproject.org/search/?q='+e_id + '&assembly=GRCh38';
            var table = getWidgetTableFrame();
            table.setAttribute("id", "newtable");
			addEl(div, table);
			var thead = getWidgetTableHead(['Classification', 'CTCF Bound','cCRE Accession ID']);
			addEl(table, thead);
            var tbody = getEl('tbody');
            addEl(table, tbody);
            var sdiv = getEl('div')
            sdiv.style.width = '80rem'
            sdiv.style.display = 'flex'
            sdiv.style.flexWrap = 'wrap'
            var tr = getWidgetTableTr2([group, bound, link], [e_id]);
            addEl(tbody, tr);
            addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
            addDlRow(dl, "Candidate cis_Regulatory Elements by ENCODE (SCREEN)", wdiv)
            }
        }
    }

widgetInfo['encode_tfbs2'] = {'title': 'ENCODE TFBS'};
widgetGenerators['encode_tfbs2'] = {
	'variant': {
		'width': undefined, 
		'height': undefined, 
		'function': function (div, row, tabName) {
            var dl = getEl('dl')
            addEl(div, dl)
            var title = 'ENCODE TFBS';
            var wdiv = getEl('div')
            var allMappings = getWidgetData(tabName, 'encode_tfbs', row, 'all');
			if (allMappings != undefined && allMappings != null) {
				var table = getWidgetTableFrame();
				var thead = getWidgetTableHead(['Factor', 'Cell', 'Quality', 'Antibody', 'Study'], ['20%', '20%','15%', '20%', '25%']);
				addEl(table, thead);
				var tbody = getEl('tbody');
                var sdiv = getEl('div')
                
                for (var i = 0; i < allMappings.length; i++) {
					var row = allMappings[i];
					var factor= row[4];
					var cell = row[0];
					var quality = row[1];
                    var antibody = row[2];
                    var study = row[3];
					var tr = getWidgetTableTr([factor, cell, quality, antibody, study]);
					addEl(tbody, tr);
                    addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
				}
                addDlRow(dl, title, wdiv)
				addEl(div, addEl(table, tbody));
			}
		}
	}
}
widgetInfo['genehancer2'] = {'title': 'GeneHancer'};
widgetGenerators['genehancer2'] = {
	'variant': {
		'width': undefined, 
		'height': undefined, 
		'function': function (div, row, tabName) {
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            wdiv.style.display = 'flex'
            wdiv.style.flexWrap = 'wrap'
            
			var featureName = getWidgetData(tabName, 'genehancer', row, 'feature_name');
			var targetsStr = getWidgetData(tabName, 'genehancer', row, 'target_genes');
			if (!targetsStr) return
			addDlRow(dl, 'GeneHancer Type', featureName);
			var targets = targetsStr.split(',')
				.map(tmp=>tmp.split(': '))
				.sort((a,b)=>{parseFloat(b[1])-parseFloat(a[1])})
            var table = getWidgetTableFrame();
            table.setAttribute("id", "newtable");
			addEl(div, table);
			var thead = getWidgetTableHead(['Target Gene', 'Link Strength']);
			addEl(table, thead);
            var tbody = getEl('tbody');
            addEl(table, tbody);
            var sdiv = getEl('div')
            sdiv.style.width = '80rem'
            sdiv.style.display = 'flex'
            sdiv.style.flexWrap = 'wrap'
            sdiv.style.maxHeight = '200px'
			for (var [gene, score] of targets){
				var tr = getWidgetTableTr([gene, score]);
                addEl(tbody, tr);
                addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
            }
            addDlRow(dl, "GeneHancer", wdiv)
		}
	}
}
widgetInfo['swissprot_binding2'] = {'title': 'Swiss-Prot Binding'};
widgetGenerators['swissprot_binding2'] = {
	'variant': {
		'width': undefined, 
		'height': undefined, 
		'function': function (div, row, tabName) {
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            wdiv.style.display = 'flex'
            wdiv.style.flexWrap = 'wrap'
            var divHeight = '400px';
			var allMappings = getWidgetData(tabName, 'swissprot_binding', row, 'all');
			if (allMappings != undefined && allMappings != null) {
                var table = getWidgetTableFrame();
                table.setAttribute("id", "newtable");
				var thead = getWidgetTableHead(['UniprotKB ID','Active Binding Site', 'Binding Site','Calcium Binding Site','DNA Binding Site', 'Metal Ion Binding Site', 'Nucleotide Phosphate Binding Site','Zinc Finger Binding Site', 'Pubmed']);
				addEl(table, thead);
                var tbody = getEl('tbody');
                var sdiv = getEl('div')
                sdiv.style.width = '80rem'
                sdiv.style.display = 'flex'
                sdiv.style.flexWrap = 'wrap'
                for (var i = 0; i < allMappings.length; i++) {
					var row = allMappings[i];
					var id = row[0];
					var act = row[1];
					var bind = row[2];
					var ca = row[3];
					var dna = row[4];
					var metal = row[5]
					var np= row[6]
					var zn = row[7]
					var pub = row[8]
					var link = `https://www.uniprot.org/uniprot/${id}`
					var link2 = `https://pubmed.ncbi.nlm.nih.gov/${pub}`
					var tr = getWidgetTableTr2([link, act, bind, ca, dna, metal, np, zn, link2],[id, pub]);
                    addEl(tbody, tr);
                    addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
				}
				addDlRow(dl, 'Swiss-Prot Binding', wdiv)
			}
		}
	}
}


widgetInfo['ess_gene2'] = {'title': 'Essential Genes'};
widgetGenerators['ess_gene2'] = {
	'gene': {
		'width': undefined, 
		'height': undefined, 
		'function': function (div, row, tabName) {
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            wdiv.style.display = 'flex'
            wdiv.style.flexWrap = 'wrap'
            var table = getWidgetTableFrame();
            table.setAttribute("id", "newtable");
            var thead = getWidgetTableHead(['Essential', 'CRISPR', 'CRISPR2', 'Gene Trap', 'Indespensibility Score', 'Indespensibility Prediction']);
            addEl(table, thead);
            var tbody = getEl('tbody');
            var sdiv = getEl('div')
            sdiv.style.width = '72vw'
            sdiv.style.maxHeight = '15vw'
            sdiv.style.display = 'flex'
            sdiv.style.flexWrap = 'wrap'
            var ess = getWidgetData(tabName, 'ess_gene', row, 'ess_gene');
            if (ess == 'E'){
                ess = 'Essential'
            }else if (ess == 'N'){
                ess = 'Non-essential'
            }
            var crisp = getWidgetData(tabName, 'ess_gene', row, 'ess_gene_crispr');
            if (crisp == 'E'){
                crisp = 'Essential'
            }else if (crisp == 'N'){
                crisp = 'Non-essential phenotype-changing'
            }
            var crisp2 = getWidgetData(tabName, 'ess_gene', row, 'ess_gene_crispr2');
            if (crisp2 == 'E'){
                crisp2 = 'Essential'
            }else if (crisp2 == 'N'){
                crisp2 = 'Non-essential phenotype-changing'
            }else if (crisp2 == 'S'){
                crisp2 = 'context-Specific essential'
            }
            var trap = getWidgetData(tabName, 'ess_gene', row, 'ess_gene_gene_trap');
            if (trap == 'E'){
                trap = 'Essential'
            }else if (trap == 'N'){
                trap = 'Non-essential phenotype-changing'
            }else if (trap == 'H'){
                trap = 'HAP1-Specific essential'
            }else if (trap == 'K'){
                trap = 'KBM7-Specific essential'
            }
            var score = getWidgetData(tabName, 'ess_gene', row, 'indispensability_score');
            var pred = getWidgetData(tabName, 'ess_gene', row, 'indispensability_pred');
            if (pred == 'E'){
                pred = 'Essential'
            }else if (pred == 'N'){
                pred = 'Loss-of-function tolerant'
            }
            if (score != undefined || score != null){
                score = Number(score)
                score = prettyVal(score)
                var tr = getWidgetTableTr([ess, crisp, crisp2, trap, score, pred]);
                addEl(tbody, tr);
            }
            addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
            addDlRow(dl, 'Essential Genes', wdiv)
			}
		}
	}

widgetInfo['swissprot_domains2'] = {'title': 'Swiss-Prot Domains'};
widgetGenerators['swissprot_domains2'] = {
	'variant': {
		'width': undefined, 
		'height': undefined, 
		'function': function (div, row, tabName) {
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
			var allMappings = getWidgetData(tabName, 'swissprot_domains', row, 'all');
			if (allMappings != undefined && allMappings != null) {
                // var results = JSON.parse(allMappings);
                var table = getWidgetTableFrame();
                table.setAttribute("id", "newtable");
				var thead = getWidgetTableHead(['UniprotKB ID','Pubmed']);
				addEl(table, thead);
                var tbody = getEl('tbody');
               
                for (var i = 0; i < allMappings.length; i++) {
                    var sdiv = getEl('div')
                    sdiv.style.width = '40rem'
                    sdiv.style.display = 'flex'
                    sdiv.style.flexWrap = 'wrap'
                    sdiv.style.maxHeight = '250px'
					var row = allMappings[i];
					var id = row[0];
					var pub = row[8]
					var link = `https://www.uniprot.org/uniprot/${id}`
					var link2 = `https://pubmed.ncbi.nlm.nih.gov/${pub}`
					var tr = getWidgetTableTr2([link,link2],[id, pub]);
					addEl(tbody, tr);
                    addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
				}
				addDlRow(dl, 'Swiss-Prot Domains', wdiv)
			}
		}
	}
}


widgetInfo['arrvars'] = {'title': 'Arrythmia Channelopathy Variants'};
widgetGenerators['arrvars'] = {
	'variant': {
		'width': undefined, 
		'height': undefined, 
		'function': function (div, row, tabName) {
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            var lqt = getWidgetData(tabName, 'arrvars', row, 'lqt');
            var brs = getWidgetData(tabName, 'arrvars', row, 'brs');
            var unaff = getWidgetData(tabName, 'arrvars', row, 'unaff');
            var other = getWidgetData(tabName, 'arrvars', row, 'other');
            var bpen = getWidgetData(tabName, 'arrvars', row, 'brs_penetrance');
            var lpen = getWidgetData(tabName, 'arrvars', row, 'lqt_penetrance');
            var func = getWidgetData(tabName, 'arrvars', row, 'function');
            var bstr = getWidgetData(tabName, 'arrvars', row, 'brs_structure');
            var lstr = getWidgetData(tabName, 'arrvars', row, 'lqt_structure');
            var link = getWidgetData(tabName, 'arrvars', row, 'link');
			if (lqt != undefined && lqt != null) {
                var table = getWidgetTableFrame();
                table.setAttribute("id", "newtable");
				var thead = getWidgetTableHead(['LQT', 'BrS', 'Function', 'LQT Hotspot', 'BrS Hotspot', 'Unaffected', 'Other', 'BrS Penetrance', 'LQT Penetrance', 'More Information']);
				addEl(table, thead);
                var tbody = getEl('tbody');
                var sdiv = getEl('div')
                sdiv.style.width = '80rem'
                sdiv.style.display = 'flex'
                sdiv.style.flexWrap = 'wrap'
                var tr = getWidgetTableTr([lqt, brs, func, lstr,bstr, unaff, other, bpen, lpen, link]);
                addEl(tbody, tr);
                addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
				}
                addDlRow(dl, 'Arrythmia Channelopathy Variants', wdiv)
			}
        }
    }
widgetInfo['cvdkp'] = {'title': 'Cardiovascular Disease Knowledge Portal'};
widgetGenerators['cvdkp'] = {
    'variant': {
        'width': undefined, 
        'height': undefined, 
        'function': function (div, row, tabName) {
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            var ibs = getWidgetData(tabName, 'cvdkp', row, 'ibs');
            if (ibs != undefined){
                ibs = prettyVal(ibs)
            }
            var cad = getWidgetData(tabName, 'cvdkp', row, 'cad');
            if (cad != undefined){
                cad = prettyVal(cad)
            }
            var bmi = getWidgetData(tabName, 'cvdkp', row, 'bmi');
            if (bmi != undefined){
                bmi = prettyVal(bmi)
            }
            var afib = getWidgetData(tabName, 'cvdkp', row, 'afib');
            if (afib != undefined){
                afib = prettyVal(afib)
            }
            var diabetes = getWidgetData(tabName, 'cvdkp', row, 'diabetes');
            if (diabetes != undefined){
                diabetes = prettyVal(diabetes)
            }
            var table = getWidgetTableFrame();
            table.setAttribute("id", "newtable");
            var thead = getWidgetTableHead(['IBS', 'CAD', 'BMI', 'Atrial Fibrillation', 'TYpe 2 Diabetes']);
            addEl(table, thead);
            var tbody = getEl('tbody');
            var sdiv = getEl('div')
            sdiv.style.width = '80rem'
            sdiv.style.display = 'flex'
            sdiv.style.flexWrap = 'wrap'
            var tr = getWidgetTableTr([ibs, cad, bmi, afib, diabetes]);
            addEl(tbody, tr);
            addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
            addDlRow(dl, 'Cardiovascular Disease Knowledge Portal', wdiv)
        }
    }
}

widgetInfo['cardioboost'] = {'title': 'CardioBoost'};
widgetGenerators['cardioboost'] = {
    'variant': {
        'width': undefined, 
        'height': undefined, 
        'function': function (div, row, tabName) {
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            var card = getWidgetData(tabName, 'cardioboost', row, 'cardiomyopathy1');
            if (card != undefined){
                card = prettyVal(card)
            }
            var card2 = getWidgetData(tabName, 'cardioboost', row, 'cardiomyopathy');
            var arr = getWidgetData(tabName, 'cardioboost', row, 'arrhythmias1');
            var arr2 = getWidgetData(tabName, 'cardioboost', row, 'arrhythmias');
            
            if (arr2 != undefined){
                arr2 = prettyVal(arr2)
            }
            var table = getWidgetTableFrame();
            table.setAttribute("id", "newtable");
            var thead = getWidgetTableHead(['Cradiomyopathy Score', 'Cardiomyopathy Class', 'Arrhythmia Score', 'Arrhythmia Class']);
            addEl(table, thead);
            var tbody = getEl('tbody');
            var sdiv = getEl('div')
            sdiv.style.width = '80rem'
            sdiv.style.display = 'flex'
            sdiv.style.flexWrap = 'wrap'
            var tr = getWidgetTableTr([card, card2, arr2, arr]);
            addEl(tbody, tr);
            addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
            addDlRow(dl, 'CardioBoost', wdiv)
        }
     }
}

widgetInfo['swissprot_ptm2'] = {'title': 'Swiss-Prot PTM'};
widgetGenerators['swissprot_ptm2'] = {
	'variant': {
		'width': undefined, 
		'height': undefined, 
		'function': function (div, row, tabName) {
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
			var allMappings = getWidgetData(tabName, 'swissprot_ptm', row, 'all');
			if (allMappings != undefined && allMappings != null) {
                var table = getWidgetTableFrame();
                table.setAttribute("id", "newtable");
				var thead = getWidgetTableHead(['UniprotKB ID','Crosslink', 'Disulfid Bond','Glycosylation','Initiator Methionine', 'Lipid Groups', 'Modified Residue','Polypeptide', 'Signal Sequence', 'Transit Peptides', 'Pubmed']);
				addEl(table, thead);
                var tbody = getEl('tbody');
                var sdiv = getEl('div')
                sdiv.style.width = '80rem'
                sdiv.style.display = 'flex'
                sdiv.style.flexWrap = 'wrap'
                for (var i = 0; i < allMappings.length; i++) {
					var row = allMappings[i];
					var id = row[0];
					var cross = row[1];
					var gly = row[2];
					var init = row[3];
					var lg = row[4];
					var mod = row[5]
					var poly = row[6]
					var ss = row[7]
					var tp = row[8]
					var dis = row[9]
					var pub = row[10]
					var link = `https://www.uniprot.org/uniprot/${id}`
					var link2 = `https://pubmed.ncbi.nlm.nih.gov/${pub}`
					var tr = getWidgetTableTr2([link, cross, dis, gly,init, lg, mod, poly, ss, tp, link2],[id, pub]);
                    addEl(tbody, tr);
                    addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
				}
				addDlRow(dl, 'Swiss-Prot PTM', wdiv)
			}
		}
	}
}

widgetInfo['gerp2'] = {'title': 'GERP++'};
widgetGenerators['gerp2'] = {
	'variant': {
		'width': undefined, 
		'height': undefined, 
		'function': function (div, row, tabName) {
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            wdiv.style.display = 'flex'
            wdiv.style.flexWrap = 'wrap'
            var table = getEl('table');
            table.setAttribute("id", "phylop");
            var tbody = getEl('tbody');
            var sdiv = getEl('div');
            var sdiv = getEl('div')
            sdiv.style.width = '40rem'
            var tr = document.createElement('tr');
            var rs = getWidgetData(tabName, 'gerp', row, 'gerp_rs');
            var rank = getWidgetData(tabName, 'gerp', row, 'gerp_rs_rank');
            if (rank != null || rank != undefined){
                var ssdiv = getDialWidget2('GERP++', annotData['gerp']['gerp_rs_rank'], .75, rs)
            }else{
                var ssdiv = `No annotation is available for ${annotData["base"]["hugo"]} ${annotData["base"]["achange"]}`
            }
            var nr = getWidgetData(tabName, 'gerp', row, 'gerp_nr');
            if (nr != null || nr != undefined){
                var gerp = contentWidget('GERP++ Neutral Rate', nr)
            }else{
                var gerp = contentWidget('GERP++ Neutral Rate', getNoAnnotMsgVariantLevel())
            }
            var td = document.createElement('td');
            addEl(tr, td);
            addEl(td, ssdiv)
            var td = document.createElement('td');
            addEl(tr, td);
            addEl(td, gerp)
            addEl(tbody, tr);
            addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
            addDlRow(dl, 'GERP++', wdiv)
		}
	}
}
widgetInfo['prec2'] = {'title': 'P(rec)'};
widgetGenerators['prec2'] = {
	'variant': {
		'width': undefined, 
		'height': undefined, 
		'function': function (div, row, tabName) {
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            wdiv.style.display = 'flex'
            wdiv.style.flexWrap = 'wrap'
            var table = getEl('table');
            table.setAttribute("id", "phylop");
            var tbody = getEl('tbody');
            var sdiv = getEl('div');
            var sdiv = getEl('div')
            sdiv.style.width = '40rem'
            var tr = document.createElement('tr')
            var prec = getWidgetData(tabName, 'prec',row, 'prec');
            if (prec != null || prec != undefined){
                var ssdiv = getDialWidget('Score', annotData['prec']['prec'], 1.00)
            }else{
                var ssdiv = `No annotation is available for ${annotData["base"]["hugo"]} ${annotData["base"]["achange"]}`
            }
            // addDlRow(dl, 'P(rec) Score', sdiv);
            var stat = getWidgetData(tabName, 'prec', row, 'stat')
            if (stat != null || stat != undefined){
                // addDlRow(dl, 'P(rec) Known Status', stat)
                var stats = contentWidget('Known Status', stat)
            }else{
                var stats = contentWidget('Known Status', getNoAnnotMsgVariantLevel())
            }
            var td = document.createElement('td');
            addEl(tr, td);
            addEl(td, ssdiv)
            var td = document.createElement('td');
            addEl(tr, td);
            addEl(td, stats)
            addEl(tbody, tr);
            addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
            addDlRow(dl, 'P(rec)', wdiv)
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
widgetInfo['genepanel'] = {'title': ''};
widgetGenerators['genepanel'] = {
    'variant': {
        'width': 'unset',
        'height': 'unset',
        'function': function (div, row, tabName) {
            var dl = getEl('dl')
            dl.style.width = 'calc(100% - 1rem)'
            addEl(div, dl)
            div.style.marginTop = '2vh';
            var generator = widgetGenerators['ncbi']['gene'];
            var divs = showWidget('ncbi', ['base', 'ncbigene'], 'gene', div, null, null);
            var dl = getEl('dl')
            addEl(div, dl)
            var divs = showWidget('ess_gene2', ['ess_gene'], 'gene', div, null, null, false);
            addEl(div, getEl('br'))
            var divs = showWidget('gnomad_gene2', ['gnomad_gene'], 'gene', div, null, null, false);
            addEl(div, getEl('br'));
            var divs = showWidget('go2', ['go'], 'gene', div, null, null, false);
            var dl = getEl('dl')
            addEl(div, dl)
            addEl(div, getEl('br'))
            var score = getWidgetData(tabName, 'loftool', row, 'loftool_score');
            if (score != null || score != undefined){
                var sdiv = getDialWidget('Score', annotData['loftool']['loftool_score'], 1.00)
            } else {
                var sdiv = `No annotation is available for ${annotData["base"]["hugo"]} ${annotData["base"]["achange"]}`
            }
            addDlRow(dl, 'LoFtool', sdiv);
            addEl(div, getEl('br'))
            var divs = showWidget('prec2', ['prec'], 'variant', div, null, null,false);

            addEl(div, getEl('br'));
            var divs = showWidget('interpro2', ['interpro'], 'variant', div, null, null, false);
        }   
    }
}

widgetInfo['assocpanel'] = {'title': ''};
widgetGenerators['assocpanel'] = {
    'variant': {
        'width': undefined,
        'height': undefined,
        'function': function (div, row, tabName) {
            var dl = getEl('dl')
            dl.style.width = 'calc(100% - 1rem)'
            addEl(div, dl)
            div.style.marginTop = '2vh';
            addEl(div, getEl('br'));
            var risk = getWidgetData(tabName, 'geuvadis', row, 'gene');
            if (risk != null || risk != undefined){
                var sdiv = getEl('div')
                sdiv.style.display = 'flex'
                sdiv.style.flexWrap = 'wrap'
                var span = getEl('div');
                span.classList.add('clinvar_traitname');
                span.textContent = risk
                // addEl(span, risk)
                addEl(sdiv, span)
            addDlRow(dl, 'Geuvadis eQTLs Target Gene', sdiv);
            } else{
                addDlRow(dl, 'Geuvadis eQTLs Target Gene', getNoAnnotMsgVariantLevel())
            }
            var dl = getEl('dl')
            addEl(div, dl)
            
            
        addEl(div, getEl('br'));
        var divs = showWidget('gwas_catalog2', ['gwas_catalog'], 'variant', div, null, null, false);
        var divs = showWidget('grasp2', ['grasp'], 'variant', div, null, null, false);
        var divs = showWidget('gtex2', ['gtex'], 'variant', div, null, null, false);
        }
    }
}
widgetInfo['evolutionpanel'] = {'title': ''};
widgetGenerators['evolutionpanel'] = {
    'variant': {
        'width': undefined,
        'height': undefined,
        'function': function (div, row, tabName) {
            var dl = getEl('dl')
            dl.style.width = 'calc(100% - 1rem)'
            addEl(div, dl)
            div.style.marginTop = '2vh';
            addEl(div, getEl('br'))
            var divs = showWidget('gerp2', ['gerp'], 'variant', div, null, null, false);
            var dl = getEl('dl')
            addEl(div, dl)
            var divs = showWidget('rvis2', ['rvis'], 'variant', div, null, null, false);
            if (annotData['ghis'] != null) {
              var sdiv = getDialWidget('GHIS Score', annotData['ghis']['ghis'], 1.00)
            } else {
              var sdiv = `No annotation is available for ${annotData["base"]["hugo"]} ${annotData["base"]["achange"]}`
            }
            addDlRow(dl, 'GHIS Score', sdiv)
            var divs = showWidget('aloft2', ['aloft'], 'variant', div, null, null, false);
            
            addEl(div, getEl('br'))
            var dl = getEl('dl')
            addEl(div, dl)
            addEl(div, getEl('br'))
            var value = getWidgetData(tabName, 'linsight', row, 'value');
            if (value != null || value != undefined){
                var sdiv = getDialWidget('LINSIGHT Score', annotData['linsight']['value'], 1.00)
            }else{
                var sdiv = `No annotation is available for ${annotData["base"]["hugo"]} ${annotData["base"]["achange"]}`
            }
            addDlRow(dl, 'LINSIGHT', sdiv);
            
            var dl = getEl('dl')
            addEl(div, dl)
            addEl(div, getEl('br'))
            var divs = showWidget('phastcons3', ['phastcons'], 'variant', div, null, null, false);
            var dl = getEl('dl')
            addEl(div, dl)
            addEl(div, getEl('br'))
            var divs = showWidget('phylop2', ['phylop'], 'variant', div, null, null,false);
            addEl(div, getEl('br'));
            var divs = showWidget('siphy2', ['siphy'], 'variant', div, null, null, false);
        }
    }
}

widgetInfo['studiespanel'] = {'title': ''};
widgetGenerators['studiespanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            addEl(div, getEl('br'))
            var dl = getEl('dl')
            dl.style.width = 'calc(100% - 1rem)'
            addEl(div, dl)
            div.style.marginTop = '2vh';
            
           
            var score = getWidgetData(tabName, 'mavedb', row, 'score')
            if (score != null || score != undefined){
                score = prettyVal(score)
            }
            var acc = getWidgetData(tabName, 'mavedb', row, 'accession')
            if (acc != null || acc != undefined){
                var link = 'https://www.mavedb.org/scoreset/' + acc;
                var a = makeA(acc, link);
                a.classList.add('linkclass');
                var sdiv = getEl('div')
                sdiv.style.display = 'flex'
                sdiv.style.flexWrap = 'wrap'
                var span = getEl('div')
                span.classList.add('clinvar_traitname')
                span.textContent = score
                addEl(sdiv, span)
                var span = getEl('div')
                span.classList.add('clinvar_traitname')
                addEl(span, a)
                addEl(sdiv, span)
                addDlRow(dl, 'MaveDB Score and Set', sdiv);
            }else{
                addDlRow(dl, 'MaveDB Score and Set', getNoAnnotMsgVariantLevel())
            }
            
            addEl(div, getEl('br'))
        }
    }
}
widgetInfo['interactionspanel'] = {'title': ''};
widgetGenerators['interactionspanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var dl = getEl('dl')
            dl.style.width = 'calc(100% - 1rem)'
            addEl(div, dl)
            div.style.marginTop = '2vh';
            addEl(div, getEl('br'))
            var divs = showWidget('biogrid2', ['biogrid'], 'gene', div, null, null, false);
            addEl(div, getEl('br'))
            var divs = showWidget('intact2', ['intact'], 'gene', div, null, null, false);
            var sdiv = getEl('div')
            var wdiv = getEl('div')
            sdiv.style.display = 'flex'
            sdiv.style.flexWrap = 'wrap'
            var button = document.createElement('button');
            button.onclick = function(){ndex()};  
            button.innerHTML = 'NDEx NCI Cancer Pathways';
            button.id = "ndex";
            button.classList.add("ndexbutton");
            sdiv.appendChild(button);
            addEl(wdiv, sdiv)
            addEl(wdiv, getEl('br'))
            var sdiv = getEl('div')
            sdiv.style.display = 'flex'
            sdiv.style.flexWrap = 'wrap'
            var button2 = document.createElement('button');
            button2.onclick = function(){ndex_chd()}; 
            button2.innerHTML = 'NDEx Congenital Heart Disease';
            button2.id = "chd";
            button2.classList.add("ndexbutton");
            sdiv.appendChild(button2);
            addEl(wdiv, sdiv)
            addEl(wdiv, getEl('br'))
            var sdiv = getEl('div')
            sdiv.style.display = 'flex'
            sdiv.style.flexWrap = 'wrap'
            var button3 = document.createElement('button');
            button3.onclick = function(){ndex_signor()}; 
            button3.innerHTML = 'NDEx SIGNOR';
            button3.id = "sig";
            button3.classList.add("ndexbutton");
            sdiv.appendChild(button3);
            addEl(wdiv, sdiv)
            var divs = showWidget('ndex', ['ndex'], 'gene', div, null, null, false);
            divs[0].style.width = undefined;
            divs[0].style.position = 'relative';
            addDlRow(dl, wdiv, divs[0])
            function ndex() {
                dl.innerHTML = ''
                var divs = showWidget('ndex', ['ndex'], 'gene', div, null, null, false);
                divs[0].style.position = 'relative';
                divs[0].style.width = undefined;
                addEl(wdiv, sdiv)
                addDlRow(dl, wdiv, divs[0])
            }
            function ndex_chd() {
                dl.innerHTML = ''
                var divs = showWidget('ndex_chd', ['ndex_chd'], 'gene', div, null, null, false);
                divs[0].style.position = 'relative';
                // divs[0].style.height = ;
                addEl(wdiv, sdiv)
                addDlRow(dl, wdiv, divs[0])
            }
            function ndex_signor() {
                dl.innerHTML = ''
                var divs = showWidget('ndex_signor', ['ndex_signor'], 'gene', div, null, null, false);
                divs[0].style.position = 'relative';
                addEl(wdiv, sdiv)
                addDlRow(dl, wdiv, divs[0])
            }
        }
    }
}
widgetInfo['literaturepanel'] = {'title': ''};
widgetGenerators['literaturepanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var dl = getEl('dl')
            dl.style.width = 'calc(100% - 1rem)'
            addEl(div, dl)
            div.style.marginTop = '2vh';
            addEl(div, getEl('br'))
            var divs = showWidget('litvar', ['litvar', 'dbsnp'], 'variant', div, null, null, false);
        }
    }
}
widgetInfo['noncodingpanel'] = {'title': ''};
widgetGenerators['noncodingpanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var dl = getEl('dl')
            dl.style.width = 'calc(100% - 1rem)'
            addEl(div, dl)
            div.style.marginTop = '2vh';
            var br = getEl("br");
            addEl(div, br);
            var divs = showWidget('ccre_screen2', ['ccre_screen'], 'variant', div, null, null, false);
            var br = getEl("br");
            addEl(div, br);
            var divs = showWidget('encode_tfbs2', ['encode_tfbs'], 'variant', div, null, null, false);
            var divs = showWidget('genehancer2', ['genehancer'], 'variant', div, null, null, false);
            var regions = getWidgetData(tabName, 'javierre_promoters', row, 'regions')
            if (regions != null || regions != undefined){
                addDlRow(dl, 'Promoter IR Regions', regions)
            }else{
                addDlRow(dl, 'Promoter IR Regions', getNoAnnotMsgVariantLevel())
            }
            var dl = getEl('dl')
            addEl(div, dl)
            var br = getEl("br");
            addEl(div, br);
            var sdiv = getEl('div')
            sdiv.style.display = 'flex'
            sdiv.style.flexWrap = 'wrap'
            var element = getWidgetData(tabName, 'vista_enhancer', row, 'element');
            if (element != null || element != undefined){
                element = element.replace('element ', '')
                var link = 'https://enhancer.lbl.gov/cgi-bin/imagedb3.pl?form=presentation&show=1&experiment_id=' + element + '&organism_id=1';
                var a = makeA('element ' + element, link);
                a.classList.add('linkclass');
                var features = getWidgetData(tabName, 'vista_enhancer', row, 'features');
                var span = getEl('div')
                span.classList.add('clinvar_traitname')
                span.textContent = features
                addEl(sdiv, span)
                var span = getEl('div')
                span.classList.add('clinvar_traitname')
                addEl(span, a)
                addEl(sdiv, span)
                addDlRow(dl, 'VISTA Enhancer Browser Element', sdiv)
            }else{
                addDlRow(dl, 'VISTA Enhancer Browser Element', getNoAnnotMsgVariantLevel());
            }
            var dl = getEl('dl')
            addEl(div, dl)
            addEl(div, getEl('br'));
            var id = getWidgetData(tabName, 'ensembl_regulatory_build', row, 'ensr');
            var region = getWidgetData(tabName, 'ensembl_regulatory_build', row, 'region');
            var sdiv = getEl('div')
            sdiv.style.display = 'flex'
            sdiv.style.flexWrap = 'wrap'
			var link = '';
			if(id != null){
                link = 'http://www.ensembl.org/Homo_sapiens/Regulation/Context?db=core;fdb=funcgen;rf=' + id;
                var a = makeA(id, link);
                a.classList.add('linkclass');
            }
            if (region != null || region != undefined){
                var span = getEl('div')
                span.classList.add('clinvar_traitname')
                span.textContent = region
                addEl(sdiv, span)
                var span = getEl('div')
                span.classList.add('clinvar_traitname')
                addEl(span, a)
                addEl(sdiv, span)
                addDlRow(dl, 'Ensembl Regulatory Build', sdiv)
            }else{
                addDlRow(dl, 'Ensembl Regulatory Build', getNoAnnotMsgVariantLevel())
            }
            var dl = getEl('dl')
            addEl(div, dl)
            addEl(div, getEl('br'));
            var rnaedit = getWidgetData(tabName, 'trinity', row, 'Rnaedit');
            if (rnaedit != null || rnaedit != undefined){
                addDlRow(dl, 'Trinity CTAT RNA Editing Database', rnaedit);
            }else{
                addDlRow(dl, 'Trinity CTAT RNA Editing Database', getNoAnnotMsgVariantLevel())
            }
            var dl = getEl('dl')
            addEl(div, dl)
            addEl(div, getEl('br'));
            var wdiv = getEl('div')
            wdiv.style.display = 'flex'
            wdiv.style.flexWrap = 'wrap'
            var table = getWidgetTableFrame();
            table.setAttribute("id", "phylop");
            var tbody = getEl('tbody');
            var sdiv = getEl('div');
            var sdiv = getEl('div')
            sdiv.style.width = '20rem'
            sdiv.style.maxHeight = '100%'
            sdiv.style.overflow = 'auto'
            var tr = document.createElement('tr');
            var sum = getWidgetData(tabName, 'segway', row, 'sum_score');
            var mean = getWidgetData(tabName, 'segway', row, 'mean_score');
            if (sum != null || mean != null){
                var sums = contentWidget('Sum Score', sum)
                var td = document.createElement('td');
                addEl(td, sums)
                addEl(tr, td);
                var means = contentWidget('Mean Score', mean)
                var td = document.createElement('td');
                addEl(tr, td);
                addEl(td, means)
                addEl(tbody, tr);
                addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
                addDlRow(dl, 'Segway', wdiv)
            }else{
                addDlRow(dl, 'Segway', getNoAnnotMsgVariantLevel());
            }
            
            var dl = getEl('dl')
            addEl(div, dl)
            addEl(div, getEl('br'));
            var id = getWidgetData(tabName, 'mirbase', row, 'id');
            var name = getWidgetData(tabName, 'mirbase', row, 'name');
            var trans = getWidgetData(tabName, 'mirbase', row, 'transcript');
            var derive = getWidgetData(tabName, 'mirbase', row, 'derives_from');
           
            if(id != null){
                var table = getWidgetTableFrame();
                table.setAttribute("id", "newtable");
                var thead = getWidgetTableHead(['ID', 'Name', 'Transcript', 'Derives From']);
                addEl(table, thead);
                var tbody = getEl('tbody');
                var sdiv = getEl('div')
                sdiv.style.width = '90rem'
                sdiv.style.display = 'flex'
                sdiv.style.flexWrap = 'wrap'
                link = 'http://www.mirbase.org/cgi-bin/mirna_entry.pl?acc=' + id;
                var tr = getWidgetTableTr([link, name, trans, derive], [id]);
                addEl(tbody, tr);
                addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
                addDlRow(dl, 'miRBase', wdiv)
            
			}else{
                addDlRow(dl, 'miRBase', getNoAnnotMsgVariantLevel())
            }
        }
    }
}
widgetInfo['predictionpanel'] = {'title': ''};
widgetGenerators['predictionpanel'] = {
    'variant': {
        'width': '100%',
        'height': undefined,
        'function': function (div, row, tabName) {
            var dl = getEl('dl')
            dl.style.width = 'calc(100% - 1rem)'
            addEl(div, dl)
            div.style.marginTop = '2vh';
            var br = getEl("br");
            addEl(div, br);
            var dl = getEl('dl')
            addEl(div, dl)
            var wdiv = getEl('div')
            wdiv.style.display = 'flex'
            wdiv.style.flexWrap = 'wrap'
            var divHeight = '100%';
            var scores = [];
            var rankscores = [];
            var preds = [];
            var predictions = [];
            var names = ['DANN','FATHMM','FATHMM MKL','FATHMM XF','LRT','MetaLR', 'MetaSVM','Mutation Assessor','MutPred','MutationTaster','PolyPhen-2 HDIV', 'PolyPhen-2 HVAR','PROVEAN','REVEL', 'SIFT'];
            var dann_score = getWidgetData(tabName, 'dann_coding', row, 'dann_coding_score');
            if (dann_score != undefined || dann_score != null){
                var dann = predWidget('coding score', dann_score);
                scores.push(dann);
                predictions.push(null);
                var pred = predWidget(null, null);
                preds.push(pred);
            }else{
                var dann = predWidget(null, null);
                scores.push(dann);
                var noanno = predWidget(null, getNoAnnotMsgVariantLevel())
                noanno.classList.add('pred_noanno')
                preds.push(noanno);
                
            }
            var dann_rankscore = getWidgetData(tabName, 'dann_coding', row, 'dann_rankscore');
            if (dann_rankscore != undefined || dann_rankscore != null){
                var dann = getDialWidget('coding rankscore', dann_rankscore, 0.75);
                rankscores.push(dann);
            }else{
                var dann = predWidget(null, null);
                rankscores.push(dann);
            }
            var fathmm_score = getWidgetData(tabName, 'fathmm', row, 'fathmm_score');
            if (fathmm_score != undefined || fathmm_score != null){
                scores.push(predWidget('score', fathmm_score));
                var fathmm_pred = getWidgetData(tabName, 'fathmm', row, 'fathmm_pred');
                predictions.push(fathmm_pred);
                preds.push(predWidget('prediction', fathmm_pred));
            }else{
                scores.push(predWidget(null, null));
                var noanno = predWidget(null, getNoAnnotMsgVariantLevel())
                noanno.classList.add('pred_noanno')
                preds.push(noanno);
                predictions.push(null);
            }
            var fathmm_rankscore = getWidgetData(tabName, 'fathmm', row, 'fathmm_rscore');
            if (fathmm_rankscore != undefined || fathmm_rankscore != null){
                rankscores.push(getDialWidget('rankscore', fathmm_rankscore, 0.75));
            }else{
                rankscores.push(predWidget(null, null));
            }
            
            var mkl_score = getWidgetData(tabName, 'fathmm_mkl', row, 'fathmm_mkl_coding_score');
            if (mkl_score != undefined || mkl_score != null){
                var mkl = predWidget('coding score', mkl_score);
                scores.push(mkl);
                var mkl_pred = getWidgetData(tabName, 'fathmm_mkl', row, 'fathmm_mkl_coding_pred');
                predictions.push(mkl_pred);
                var pred = predWidget('prediction', mkl_pred);
                preds.push(pred);
            }else{
                var mkl = predWidget(null, null);
                scores.push(mkl);
                var noanno = predWidget(null, getNoAnnotMsgVariantLevel())
                noanno.classList.add('pred_noanno')
                preds.push(noanno);
                predictions.push(null);
            }
            var mkl_rankscore = getWidgetData(tabName, 'fathmm_mkl', row, 'fathmm_mkl_coding_rankscore');
            if (mkl_rankscore != undefined || mkl_rankscore != null){
                var mkl = getDialWidget('coding rankscore', mkl_rankscore, 0.75);
                rankscores.push(mkl);
            }else{
                var mkl = predWidget(null, null);
                rankscores.push(mkl);
            }
            var xf_score = getWidgetData(tabName, 'fathmm_xf_coding', row, 'fathmm_xf_coding_score');
            if (xf_score != undefined || xf_score != null){
                var xf = predWidget('coding score', xf_score);
                scores.push(xf);
                var xf_pred = getWidgetData(tabName, 'fathmm_xf_coding', row, 'fathmm_xf_coding_pred');
                predictions.push(xf_pred);
                var pred = predWidget('prediction', xf_pred);
                preds.push(pred);
            }else{
                var xf = predWidget(null, null);
                scores.push(xf);
                var noanno = predWidget(null, getNoAnnotMsgVariantLevel())
                noanno.classList.add('pred_noanno')
                preds.push(noanno);
                predictions.push(null);
            }
            var xf_rankscore = getWidgetData(tabName, 'fathmm_xf_coding', row, 'fathmm_xf_coding_rankscore');
            if (xf_rankscore != undefined || xf_rankscore != null){
                var xf = getDialWidget('coding rankscore', xf_rankscore, 0.75);
                rankscores.push(xf);
            }else{
                var xf = predWidget(null, null);
                rankscores.push(xf);
            }
            var lrt_score = getWidgetData(tabName, 'lrt', row, 'lrt_score');
            if (lrt_score != undefined || lrt_score != null){
                var l = predWidget('coding score', lrt_score);
                scores.push(l);
                var lrt_pred = getWidgetData(tabName, 'lrt', row, 'lrt_pred');
                predictions.push(lrt_pred);
                var pred = predWidget('prediction', lrt_pred);
                preds.push(pred);

            }else{
                var l = predWidget(null, null);
                scores.push(l);
                var noanno = predWidget(null, getNoAnnotMsgVariantLevel())
                noanno.classList.add('pred_noanno')
                preds.push(noanno);
                predictions.push(null);
            }
            var lrt_rankscore = getWidgetData(tabName, 'lrt', row, 'lrt_converted_rankscore');
            if (lrt_rankscore != undefined || lrt_rankscore != null){
                var lrt = getDialWidget('coding rankscore', lrt_rankscore, 0.75);
                rankscores.push(lrt);
            }else{
                var lrt = predWidget(null, null);
                rankscores.push(lrt);
            }
            var metalr_score = getWidgetData(tabName, 'metalr', row, 'score');
            if (metalr_score != undefined || metalr_score != null){
                var metalr = predWidget('coding score', metalr_score);
                scores.push(metalr);
                var metalr_pred = getWidgetData(tabName, 'metalr', row, 'pred');
                predictions.push(metalr_pred);
                var pred = predWidget('prediction', metalr_pred);
                preds.push(pred);
            }else{
                var metalr = predWidget(null, null);
                scores.push(metalr);
                var noanno = predWidget(null, getNoAnnotMsgVariantLevel())
                noanno.classList.add('pred_noanno')
                preds.push(noanno);
                predictions.push(null);
            }
            var metalr_rankscore = getWidgetData(tabName, 'metalr', row, 'rankscore');
            if (metalr_rankscore != undefined || metalr_rankscore != null){
                var metalr = getDialWidget('rankscore', metalr_rankscore, 0.75);
                rankscores.push(metalr);
                
            }else{
                var metalr = predWidget(null, null);
                rankscores.push(metalr);
            }
            var metasvm_score = getWidgetData(tabName, 'metasvm', row, 'score');
            if (metasvm_score != undefined || metasvm_score != null){
                var metasvm = predWidget('score', metasvm_score);
                scores.push(metasvm);
                var metasvm_pred = getWidgetData(tabName, 'metasvm', row, 'pred');
                predictions.push(metasvm_pred);
                var pred = predWidget('prediction', metasvm_pred);
                preds.push(pred);
            }else{
                var metasvm = predWidget(null, null);
                scores.push(metasvm);
                var noanno = predWidget(null, getNoAnnotMsgVariantLevel())
                noanno.classList.add('pred_noanno')
                preds.push(noanno);
                predictions.push(null);
            }
            var metasvm_rankscore = getWidgetData(tabName, 'metasvm', row, 'rankscore');
            if (metasvm_rankscore != undefined || metasvm_rankscore != null){
                var metasvm = getDialWidget('rankscore', metasvm_rankscore, 0.75);
                rankscores.push(metasvm);
            }else{
                var metasvm = predWidget(null, null);
                rankscores.push(metasvm);
            }
            var muta_score = getWidgetData(tabName, 'mutation_assessor', row, 'mut_score');
            if (muta_score != undefined || muta_score != null){
                scores.push(predWidget('score', muta_score));
                var muta_pred = getWidgetData(tabName, 'mutation_assessor', row, 'mut_pred');
                predictions.push(muta_pred);
                preds.push(predWidget('prediction', muta_pred));
            }else{
                scores.push(predWidget(null, null));
                var noanno = predWidget(null, getNoAnnotMsgVariantLevel())
                noanno.classList.add('pred_noanno')
                preds.push(noanno);
                predictions.push(null);
            }
            var muta_rankscore = getWidgetData(tabName, 'mutation_assessor', row, 'mut_rscore');
            if (muta_rankscore != undefined || muta_rankscore != null){
                rankscores.push(getDialWidget('rankscore', muta_rankscore, 0.75));
            }else{
                rankscores.push(predWidget(null, null));
            }
            var mutpred_score = getWidgetData(tabName, 'mutpred1', row, 'mutpred_general_score');
            if (mutpred_score != undefined || mutpred_score != null){
                scores.push(predWidget('score', mutpred_score));
                predictions.push(null);
                preds.push(predWidget(null, null));
            }else{
                scores.push(predWidget(null, null));
                var noanno = predWidget(null, getNoAnnotMsgVariantLevel())
                noanno.classList.add('pred_noanno')
                preds.push(noanno);
                predictions.push(null);
            }
            var mutpred_rankscore = getWidgetData(tabName, 'mutpred1', row, 'mutpred_rankscore');
            if (mutpred_rankscore != undefined || mutpred_rankscore != null){
                rankscores.push(getDialWidget('rankscore', mutpred_rankscore, 0.75));
            }else{
                rankscores.push(predWidget(null, null));
            }
            
            var taster_score = getWidgetData(tabName, 'mutationtaster', row, 'score');
            if (taster_score != undefined || taster_score != null){
                scores.push(predWidget('score', taster_score));
                var taster_pred = getWidgetData(tabName, 'mutationtaster', row, 'prediction');
                predictions.push(taster_pred);
                preds.push(predWidget('prediction', taster_pred));
            }else{
                scores.push(predWidget(null, null));
                var noanno = predWidget(null, getNoAnnotMsgVariantLevel())
                noanno.classList.add('pred_noanno')
                preds.push(noanno);
                predictions.push(null);
            }
            var taster_rankscore = getWidgetData(tabName, 'mutationtaster', row, 'rankscore');
            if (taster_rankscore != undefined || taster_rankscore != null){
                rankscores.push(getDialWidget('rankscore', taster_rankscore, 0.75));
            }else{
                rankscores.push(predWidget(null, null));
            }
            var hdiv_score = getWidgetData(tabName, 'polyphen2', row, 'hdiv_score');
            if (hdiv_score != undefined || hdiv_score != null){
                scores.push(predWidget('score', hdiv_score));
                var hdiv_pred = getWidgetData(tabName, 'polyphen2', row, 'hdiv_pred');
                if (hdiv_pred == 'D'){
                    hdiv_pred = 'Probably Damaging';
                }else if (hdiv_pred == 'P'){
                    hdiv_pred = 'Possibly Damaging';
                }else if (hdiv_pred == 'B'){
                    hdiv_pred = 'Benign';
                }
                predictions.push(hdiv_pred);
                preds.push(predWidget('prediction', hdiv_pred));
            }else{
                scores.push(predWidget(null, null));
                var noanno = predWidget(null, getNoAnnotMsgVariantLevel())
                noanno.classList.add('pred_noanno')
                preds.push(noanno);
                predictions.push(null);
            }
            var hdiv_rankscore = getWidgetData(tabName, 'polyphen2', row, 'hdiv_rank');
            if (hdiv_rankscore != undefined || hdiv_rankscore != null){
                rankscores.push(getDialWidget('rankscore', hdiv_rankscore, 0.75));
            }else{
                rankscores.push(predWidget(null, null));
            }
            var hvar_score = getWidgetData(tabName, 'polyphen2', row, 'hvar_score');
            if (hvar_score != undefined || hvar_score != null){
                scores.push(predWidget('score', hvar_score));
                var hvar_pred = getWidgetData(tabName, 'polyphen2', row, 'hvar_pred');
                if (hvar_pred == 'D'){
                    hvar_pred = 'Probably Damaging';
                }else if (hvar_pred == 'P'){
                    hvar_pred = 'Possibly Damaging';
                }else if (hvar_pred == 'B'){
                    hvar_pred = 'Benign';
                }
                predictions.push(hvar_pred);
                preds.push(predWidget('prediction', hvar_pred));
            }else{
                scores.push(predWidget(null, null));
                var noanno = predWidget(null, getNoAnnotMsgVariantLevel())
                noanno.classList.add('pred_noanno')
                preds.push(noanno);
                predictions.push(null);
            }
            var hvar_rankscore = getWidgetData(tabName, 'polyphen2', row, 'hvar_rank');
            if (hvar_rankscore != undefined || hvar_rankscore != null){
                rankscores.push(getDialWidget('rankscore', hvar_rankscore, 0.75));
            }else{
                rankscores.push(predWidget(null, null));
            }
            var provean_score = getWidgetData(tabName, 'provean', row, 'score');
            if (provean_score != undefined || provean_score != null){
                scores.push(predWidget('score', provean_score));
                var provean_pred = getWidgetData(tabName, 'provean', row, 'prediction');
                predictions.push(provean_pred);
                preds.push(predWidget('prediction', provean_pred));
            }else{
                scores.push(predWidget(null, null));
                var noanno = predWidget(null, getNoAnnotMsgVariantLevel())
                noanno.classList.add('pred_noanno')
                preds.push(noanno);
                predictions.push(null);
            }
            var provean_rankscore = getWidgetData(tabName, 'provean', row, 'rankscore');
            if (provean_rankscore != undefined || provean_rankscore != null){
                rankscores.push(getDialWidget('rankscore', provean_rankscore, 0.75));
            }else{
                rankscores.push(predWidget(null, null));
                
            }
            var revel_score = getWidgetData(tabName, 'revel', row, 'score');
            if (revel_score != null || revel_score != undefined){
                var r = predWidget('score', revel_score);
                scores.push(r);
                predictions.push(null);
                var pred = predWidget(null, null);
                preds.push(pred);
            }else{
                var r = predWidget(null, null);
                scores.push(r);
                var noanno = predWidget(null, getNoAnnotMsgVariantLevel())
                noanno.classList.add('pred_noanno')
                preds.push(noanno);
                predictions.push(null);
            }
            var revel_rankscore = getWidgetData(tabName, 'revel', row, 'rankscore');
            if (revel_rankscore != null || revel_rankscore != undefined){
                var revel = getDialWidget('rankscore', revel_rankscore, 0.75);
                rankscores.push(revel);
            }else{
                var revel = predWidget(null, null);
                rankscores.push(revel);
                
            }
            var sift_score = getWidgetData(tabName, 'sift', row, 'score');
            if (sift_score != undefined || sift_score != null){
                scores.push(predWidget('score', sift_score));
                var sift_pred = getWidgetData(tabName, 'sift', row, 'prediction');
                predictions.push(sift_pred);
                preds.push(predWidget('prediction', sift_pred));
            }else{
                scores.push(predWidget(null, null));
                var noanno = predWidget(null, getNoAnnotMsgVariantLevel())
                noanno.classList.add('pred_noanno')
                preds.push(noanno);
                predictions.push(null);
            }
            var sift_rankscore = getWidgetData(tabName, 'sift', row, 'rankscore');
            if (sift_rankscore != undefined || sift_rankscore != null){
                rankscores.push(getDialWidget('rankscore', sift_rankscore, 0.75));
            }else{
                rankscores.push(predWidget(null, null));
            }
            var table = getWidgetTableFrame();
            table.setAttribute("id", "pred");
            var tbody = getEl('tbody');
            var sdiv = getEl('div');
            var sdiv = getEl('div')
            sdiv.style.width = '80rem'
            sdiv.style.maxHeight = '100%'
            sdiv.style.overflow = 'auto'
            var counts = [];
            var dam_count = 0;
            var tol_count = 0;
            for (var i = 0; i < names.length; i++) {
                var name = names[i];
                var p = predictions[i];
                var a = getEl('a')
                a.classList.add('pred_class');
                var tn = document.createTextNode(name)
                var tr = document.createElement('tr');
                var td = document.createElement('td');
                var pred = preds[i];
                var score = scores[i];
                if (score != null){
                    score.classList.add('pred_score');
                }
                addEl(tr, addEl(td, addEl(a, tn)))
                var td = document.createElement('td');
                td.style.width = '35%'
                if (p != null && p.includes('Damaging') || p == 'Medium' || p == 'Disease Causing'){
                    dam_count = dam_count + 1;
                    pred.classList.add('pred_damaging');
                }else if (p != null){
                    tol_count = tol_count + 1;
                    pred.classList.add('pred_tol');
                }
                var a = getEl('a')
                var tn = document.createTextNode(pred)
                addEl(tr, td);
                addEl(td, pred)
                var td = document.createElement('td');
                addEl(td, score)
                addEl(tr, td);
                var rank = rankscores[i];
                var td = document.createElement('td');
                addEl(td, rank);
                addEl(tr, td);
                addEl(tbody, tr);
                }
                counts.push(dam_count);
                counts.push(tol_count);
                
            addEl(wdiv, addEl(sdiv, addEl(table, tbody)));
            var sdiv = getEl('div');
            sdiv.style.overflow = 'auto';
            //sdiv.style.width = 'calc(100% - 400px)';
            // sdiv.style.maxWidth = '400px';
            // sdiv.style.height = '400px';
            sdiv.style.paddingLeft = '1rem'
            sdiv.style.paddingRight = '1rem'
            var chartDiv = getEl('canvas');
            // chartDiv.width = '400';
            // chartDiv.height = '400';
            addEl(sdiv, chartDiv);
            // addEl(wdiv, sdiv);
            console.log('@ wdiv=', wdiv)
            var chart = new Chart(chartDiv, {
            type: 'doughnut',
            data: {
                datasets: [{
                data: counts,
                backgroundColor: ['rgba(153, 27, 27, 1)', 'rgba(6, 95, 70, 1)']
                }],
                labels: ['Damaging', 'Tolerated']
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
                    fontColor: 'white',
                    overlap: false,
                    outsidePadding: 4,
                }
                },
            },
            });
            addDlRow(dl, sdiv, wdiv)
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
            var dl = getEl('dl')
            dl.style.width = 'calc(100% - 1rem)'
            addEl(div, dl)
            div.style.marginTop = '2vh';
            var br = getEl("br");
            addEl(div, br);
            var divs = showWidget('swissprot_binding2', ['swissprot_binding'], 'variant', div, null, null, false);
            var divs = showWidget('swissprot_domains2', ['swissprot_domains'], 'variant', div, null, null, false);
            var divs = showWidget('swissprot_ptm2', ['swissprot_ptm'], 'variant', div, null, null, false);
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
            var dl = getEl('dl')
            dl.style.width = 'calc(100% - 1rem)'
            addEl(div, dl)
            div.style.marginTop = '2vh';
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
            var dl = getEl('dl')
            dl.style.width = 'calc(100% - 1rem)'
            addEl(div, dl)
            div.style.marginTop = '2vh';
            var id = getWidgetData(tabName, 'clinvar', row, 'id');
            var sig = getWidgetData(tabName, 'clinvar', row, 'sig');
            var ps1 = getWidgetData(tabName, 'clinvar_acmg', row, 'ps1_id');
            var pm5 = getWidgetData(tabName, 'clinvar_acmg', row, 'pm5_id');
            if (id != undefined && sig != 'Uncertain significance' || sig != undefined){
                var divs = showWidget('clinvar2', ['clinvar'], 'variant', div, null, null, false);
            }else if (ps1 != undefined || pm5 != undefined && sig == undefined){
                var divs = showWidget('clinvar_acmg', ['clinvar_acmg'], 'variant', div, null, null, false);
            } 
            else if (sig == 'Uncertain significance' && ps1 != undefined || pm5 != undefined){
                var divs = showWidget('clinvar2', ['clinvar'], 'variant', div, null, null, false);
                var divs = showWidget('clinvar_acmg', ['clinvar_acmg'], 'variant', div, null, null, false);
            }
            
            else{
                addDlRow(dl, 'ClinVar', getNoAnnotMsgVariantLevel())
            }
            var dl = getEl('dl')
            addEl(div, dl)
            addEl(div, getEl('br'));
            var dl = getEl('dl')
            addEl(div, dl)
            addEl(div, getEl('br'));
            var phenotype = getWidgetData(tabName, 'denovo', row, 'PrimaryPhenotype');
            // var validation = getWidgetData(tabName, 'denovo', row, 'Validation');
            if (phenotype != null){
            addDlRow(dl, 'Denovo-DB Phenotype', phenotype);
            }else{
                addDlRow(dl, 'Denovo-DB Phenotype', getNoAnnotMsgVariantLevel());
            }
            // if (validation != null){
            // addDlRow(dl, 'Denovo-DB Validation', validation);
            // }else{
            //     addDlRow(dl, 'Denovo-DB Validation', getNoAnnotMsgVariantLevel());
            // }
            var dl = getEl('dl')
            addEl(div, dl)
            var title = getEl('div')
            title.textContent = 'OMIM ID'
            title.classList.add('tooltip')
            var img = document.createElement("img");
            img.src = "desc.png";
            img.classList.add('infoimg')
            title.appendChild(img);
            var spans = getEl('span')
            spans.textContent = 'Online Mendelian Inheritance in Man. Catalog of human genes and genetic disorders and traits'
            spans.classList.add('tooltiptext')
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
                span.classList.add('clinvar_traitname');
                a.classList.add('linkclass')
                addEl(span, a)
                addEl(sdiv, span)
            }
                addDlRow(dl, addEl(title, spans), sdiv);
            }else{
                addDlRow(dl, addEl(title, spans), getNoAnnotMsgVariantLevel());
            }
            addEl(div, getEl('br'));
            var generator = widgetGenerators['clingen2']['gene'];
            var divs = showWidget('clingen2', ['clingen'], 'gene', div, null, null, false);
            var button = document.createElement('button');
            button.onclick = function(){cardio()};  
            button.innerHTML = 'Cardiovascular';
            button.style.marginRight = '50px'
            var img = document.createElement("img");
            img.classList.add('triangle-right')
            addEl(button, img)
            button.classList.add('clinbutton')
            div.appendChild(button);
            
            var button2 = document.createElement('button');
            
            button2.onclick = function(){pharm()};  
            button2.innerHTML = 'Pharmacogenomics';
            button2.style.position = 'relative'
            var img2 = document.createElement("img");
            img2.classList.add('triangle-right')
            addEl(button2, img2)
            button2.classList.add('clinbutton')
            div.appendChild(button2);
            
            var sdiv = getEl('div')
            sdiv.id = 'contents'
            sdiv.style.display = 'none'
            addEl(div, sdiv)
            var divs = showWidget('arrvars', ['arrvars'], 'variant',sdiv, null, null, false);
            var divs = showWidget('cvdkp', ['cvdkp'], 'variant',sdiv, null, null, false);
            var divs = showWidget('cardioboost', ['cardioboost'], 'variant',sdiv, null, null, false);
            var cardio = function() {
                img.classList.remove('triangle-down')
                var mydiv = document.getElementById('contents');
                if (mydiv.style.display === 'none' || mydiv.style.display === ''){
                    mydiv.style.display = 'block'
                    img.classList.add('triangle-down')
                }else
                  mydiv.style.display = 'none'
                }
            var ssdiv = getEl('div')
            ssdiv.id = 'contentss'
            ssdiv.style.display = 'none'
            addEl(div, ssdiv)
            var divs = showWidget('pharmgkb2', ['pharmgkb'], 'variant',ssdiv, null, null, false);
            var divs = showWidget('dgi2', ['dgi'], 'gene', ssdiv, null, null, false);
            var pharm = function() {
                img2.classList.remove('triangle-down')
                var mydiv = document.getElementById('contentss');
                if (mydiv.style.display === 'none' || mydiv.style.display === ''){
                    mydiv.style.display = 'block'
                    img2.classList.add('triangle-down')
                }else
                    mydiv.style.display = 'none'
            }
            
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
        td.style.backgroundColor = 'white'
        td.style.borderRadius = '9px'
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
