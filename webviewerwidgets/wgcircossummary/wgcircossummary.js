$.getScript('/result/widgetfile/wgcircossummary/d3.js', function () {});
$.getScript('/result/widgetfile/wgcircossummary/circos.min.js', function () {});

widgetGenerators['circossummary'] = {
	'info': {
		'name': 'Circos',
		'width': 480, 
		'height': 480, 
		'callserver': true,
        'variables': {
            zoom: 1.0,
			layout_data: [
			  {"id":"1","label":"1","color":"#996600","len":248956422},
			  {"id":"2","label":"2","color":"#666600","len":242193529},
			  {"id":"3","label":"3","color":"#99991E","len":198295559},
			  {"id":"4","label":"4","color":"#CC0000","len":190214555},
			  {"id":"5","label":"5","color":"#FF0000","len":181538259},
			  {"id":"6","label":"6","color":"#FF00CC","len":170805979},
			  {"id":"7","label":"7","color":"#FFCCCC","len":159345973},
			  {"id":"8","label":"8","color":"#FF9900","len":145138636},
			  {"id":"9","label":"9","color":"#FFCC00","len":138394717},
			  {"id":"10","label":"10","color":"#FFFF00","len":133797422},
			  {"id":"11","label":"11","color":"#CCFF00","len":135086622},
			  {"id":"12","label":"12","color":"#00FF00","len":133275309},
			  {"id":"13","label":"13","color":"#358000","len":114364328},
			  {"id":"14","label":"14","color":"#0000CC","len":107043718},
			  {"id":"15","label":"5","color":"#6699FF","len":101991189},
			  {"id":"16","label":"16","color":"#99CCFF","len":90338345},
			  {"id":"17","label":"17","color":"#00FFFF","len":83257441},
			  {"id":"18","label":"18","color":"#CCFFFF","len":80373285},
			  {"id":"19","label":"19","color":"#9900CC","len":58617616},
			  {"id":"20","label":"20","color":"#CC33FF","len":64444167},
			  {"id":"21","label":"21","color":"#CC99FF","len":46709983},
			  {"id":"22","label":"22","color":"#666666","len":50818468},
			  {"id":"X","label":"X","color":"#999999","len":156040895},
			  {"id":"Y","label":"Y","color":"#CCCCCC","len":57227415},
			],
        },
        'beforeresize': function () {
            var contentDiv = this['variables']['div'];
            $(contentDiv).empty();
            contentDiv.style.width = '0px';
            contentDiv.style.height = '0px';
        },
        'onresize': function () {
            this['function']();
        },
		'function': function (div, data) {
            var widgetName = 'circossummary';
            var v = this['variables'];
            if (div != undefined) {
                v['div'] = div;
            } else if (v['div'] != undefined) {
                div = v['div'];
            }
            if (data != undefined) {
                v['data'] = data;
            } else if (v['data'] != undefined) {
                data = v['data'];
            }
            div.style.margin = 0;
            div.style.padding = 0;
            var width = null;
            var height = null;
            width = div.offsetWidth;
            if (width == 0) {
                width = parseInt(div.style.width.trimRight('px'));
            }
            height = div.offsetHeight;
            if (height == 0) {
                height = parseInt(div.style.height.trimRight('px'));
            }
            v['width'] = width;
            v['height'] = height;
			if (div != null) {
				$(div).empty();
			}
            var zoom = v['zoom'];
            var wHMin = Math.min(width, height);
            div.style.textAlign = 'center';
            div.style.width = width + 'px';
            div.style.height = height + 'px';
            div.style.overflow = 'auto';
            var btn = getEl('button');
            btn.textContent = '+';
            btn.style.position = 'absolute';
            btn.style.top = '33';
            btn.style.right = '26';
            btn.style.fontSize = '12px';
            btn.style.zIndex = '2';
            btn.setAttribute('widgetname', widgetName);
            btn.addEventListener('click', function (evt) {
                v['zoom'] *= 1.2;
                widgetGenerators[v['widgetname']][currentTab]['function']();
            });
            addEl(div, btn);
            var btn = getEl('button');
            btn.textContent = '-';
            btn.style.position = 'absolute';
            btn.style.top = '33';
            btn.style.right = '5';
            btn.style.fontSize = '12px';
            btn.style.zIndex = '2';
            btn.setAttribute('widgetname', widgetName);
            btn.addEventListener('click', function (evt) {
                v['zoom'] *= 0.8;
                widgetGenerators[v['widgetname']][currentTab]['function']();
            });
            addEl(div, btn);
			var chartDivId = 'circos_summary_svg';
			var chartDiv = getEl('svg');
			chartDiv.id = chartDivId;
			addEl(div, chartDiv);
            var myCircos = new Circos({
                container: '#' + chartDivId,
                width: wHMin * zoom,
                height: wHMin * zoom,
            });
            v['circos'] = myCircos;
			var conf = {
  				innerRadius: wHMin / 2 * zoom - 34,
			    outerRadius: wHMin / 2 * zoom - 14,
  				gap: 0.02,
  				labels: {
    				display: true,
    				position: 'center',
    				size: '14px',
    				color: '#000000',
    				radialOffset: 22,
  				},
				ticks: {
                    display: false,
                },
			};
            myCircos.layout(v['layout_data'], conf);
            myCircos.heatmap('heatmap-missense', data['Missense'], {
                innerRadius: 0.75,
                outerRadius: 0.95,
                color: 'Greens',
                tooltipContent: function (datum, index) {
                    var toks = datum['name'].split('@@@');
                    var effect = toks[0];
                    var genes = toks[1];
                    var tt = `<table style="color: white; width: 350px; font-size: 12px;"><tr><td>Range</td><td>${datum.start} ~ ${datum.end}</td></tr><tr><td>Effect</td><td>${effect}</td></tr><tr><td>Genes</td><td style="word-break: break-all;">${genes}</td></tr></table>`;
                    return tt;
                },
            });
            myCircos.heatmap('heatmap-nonsilent', data['Non-silent'], {
                innerRadius: 0.54,
                outerRadius: 0.74,
                color: 'Blues',
                tooltipContent: function (datum, index) {
                    var toks = datum['name'].split('@@@');
                    var effect = toks[0];
                    var genes = toks[1];
                    var tt = `<table style="color: white; width: 350px; font-size: 12px;"><tr><td>Range</td><td>${datum.start} ~ ${datum.end}</td></tr><tr><td>Effect</td><td>${effect}</td></tr><tr><td>Genes</td><td style="word-break: break-all;">${genes}</td></tr></table>`;
                    return tt;
                },
            });
            myCircos.heatmap('heatmap-inactivating', data['Inactivating'], {
                innerRadius: 0.33,
                outerRadius: 0.53,
                color: 'Reds',
                tooltipContent: function (datum, index) {
                    var toks = datum['name'].split('@@@');
                    var effect = toks[0];
                    var genes = toks[1];
                    var tt = `<table style="color: white; width: 350px; font-size: 12px;"><tr><td>Range</td><td>${datum.start} ~ ${datum.end}</td></tr><tr><td>Effect</td><td>${effect}</td></tr><tr><td>Genes</td><td style="word-break: break-all;">${genes}</td></tr></table>`;
                    return tt;
                },
            });
            myCircos.render();
		}
	}
};
