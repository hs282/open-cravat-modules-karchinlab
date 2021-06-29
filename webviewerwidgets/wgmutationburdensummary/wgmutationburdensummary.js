widgetGenerators['mutationburdensummary'] = {
    'info': {
        'width': 720,
        'height': 270,
        'callserver': true,
        'variables': {},
        'init': function (data) {
            this['variables']['data'] = data;
        },
        'function': function(div, row, tabName) {
            var data = this['variables']['data'];
            var genes = Object.keys(data)
            var values = Object.values(data)
            let sampleset = new Set();
            var table = getWidgetTableFrame();
            var tbody = getEl('tbody');
            for (var i = 0; i < values.length; i++) {
                var datas = []
                var gene  = genes[i]
                datas.push(gene)
                for (var j = 0; j < values[i].length; j++) {
                    datas.push(values[i][j][1])
                    sampleset.add(values[i][j][0])
                }
                var tr = getWidgetTableTr(datas)
                addEl(tbody, tr);
            }
            var samples = Array.from(sampleset);
            samples.unshift('')
            var thead= getWidgetTableHead(samples);
            addEl(table, thead);
            addEl(div, addEl(table, tbody));
        }
    }
}