var widgetName = 'indel';
widgetGenerators[widgetName] = {
    'info': {
        'name': 'Insertion and Deletions',
        'width': 600, 
        'height': 380, 
        'default_hidden': false,
        'variables': {},
        'init': function () {
            var v = this['variables'];
            var d = infomgr.getData('variant'); 
            for (var i = 0; i < d.length; i++) {
                var row = d[i];
                var refs = getWidgetData('variant', 'base', row, 'ref_base');
                var alts = getWidgetData('variant', 'base', row, 'alt_base');
                var rlen = refs.length;
                if (refs == '-'){
                    rlen = 0;
                }
                var alen = alts.length;
                if (alts == '-'){
                    alen = 0;
                }
                if (rlen == alen){
                    continue;
                }
            var difference = alen - rlen;
        }
        v['difference'] = difference;
    },
        'shoulddraw': function () {
            var v = this['variables'];
            if (v['difference'] == undefined) {
                return false;
            } else {
                return true;
            }
        },
        'function': function (div) {
            if (div != null) {
                emptyElement(div);
            }
            var dif = [];
            deletions = [];
            insertions = []; 
            var d = infomgr.getData('variant'); 
            for (var i = 0; i < d.length; i++) {
                var row = d[i];
                var refs = getWidgetData('variant', 'base', row, 'ref_base');
                var alts = getWidgetData('variant', 'base', row, 'alt_base');
                var rlen = refs.length;
                if (refs == '-'){
                    rlen = 0;
                }
                var alen = alts.length;
                if (alts == '-'){
                    alen = 0;
                }
                if (rlen == alen){
                    continue;
                }
            var difference = alen - rlen;
            if (difference < 0){
                deletions.push(difference);
            }else {
                insertions.push(difference);
            }
            dif.push(difference);
        }
            div.style.width = 'calc(100% - 37px)';
            var chartDiv = getEl('canvas');
            chartDiv.style.width = 'calc(100% - 20px)';
            chartDiv.style.height = 'calc(100% - 20px)';
            addEl(div, chartDiv);
            var totals = infomgr.datas.variant.length;
            var list = [];
            for (var i = -6; i <= 6; i++) {
                if (i == 0){
                    continue;
                }
                list.push(i);
            }
            insertions = insertions.sort(((a, b) => a - b))
            var counts = {};
            for (var i = 0; i < insertions.length; i++) {
                if(!counts[insertions[i]])
                    counts[insertions[i]] = 0;
                ++counts[insertions[i]];
            }
            deletions = deletions.sort((a, b) => a - b);
            var counts2 = {};
            for (var i = 0; i < deletions.length; i++) {
                if(!counts2[deletions[i]])
                    counts2[deletions[i]] = 0;
                ++counts2[deletions[i]];
            }
            var l = [];
            var len = Object.keys(counts);
            var len2 = Object.keys(counts2);
            len2.push.apply(len2, len);
            for (var i = 0; i < len2.length; i++) {
                var x = parseInt(len2[i]);
                l.push(x);
            }
            var labels = l.sort((a, b) => a - b);
            var freq = Object.values(counts);
            var freq2 = Object.values(counts2);
            freq2.push.apply(freq2, freq)
            for (var i = 0; i < list.length; i++) {
                var num = list[i];
                var t = labels.includes(num);
                if (t == false){
                    labels.splice(i,0, num);
                    freq2.splice(i, 0, 0)
                }
            }
            var t = [];
            var labs = [];
            var sums = 0;
            for (var i = 0; i < labels.length; i++) {
                if (labels[i] < -6){
                    var name = 'deletion';
                    var color = "#DC143C";
                    sums = sums + freq2[i];
                }
            }
            labs.push(color);
            var label = name;
            var datas = [(sums/totals) * 100];
            t.push(datas);
            for (var i = 0; i < labels.length; i++) {
                if (labels[i] >= -6 && labels[i] <= 0){
                    datas = [(freq2[i]/totals) * 100];
                    label = 'deletion';
                    var color = "#DC143C";
                    t.push(datas);
                    labs.push(color);
                }else if (labels[i] >= 1 && labels[i] <= 6){
                    datas = [(freq2[i]/totals) * 100];
                    label = "insertion";
                    color = "#006666";
                    t.push(datas);
                    labs.push(color);
                } else {
                    continue;
                }
            }
            s = 0;
            for (var i = 0; i < labels.length; i++) {
                if (labels[i] > 6){
                    var name = 'insertion';
                    var color = "#006666";
                    s = s + freq2[i];
                }
            }
            var label = name;
            var datas = [(s/totals) * 100];
            t.push(datas);
            labs.push(color);
            var chart = new Chart(chartDiv, {
                type: 'bar',
                data: {
                    labels: ["<-6",-6, -5, -4, -3, -2, -1, 1,2,3,4,5,6, ">6"],
                    datasets: [
                        {
                            data: t,
                            backgroundColor: labs
                        }
                    ]
                }, options: {
                    tooltips: {
                    callbacks: {
                        label: function(tooltipItem, data) {
                            var label = data.datasets[tooltipItem.datasetIndex].label || '';
        
                            if (label) {
                                label += ': ';
                            }
                            label += Math.round(tooltipItem.yLabel * 100) / 100;
                            label = label + '%';
                            return label;
                        }
                    }
                },
                    legend: {
                        labels: {
                            generateLabels: function(chart) {
                               var labels = ["Deletion", "Insertion"];
                               var colors = ["#DC143C", "#006666"]
                               var dataset = chart.data.datasets[0];
                               var legend = labels.map(function(label, index) {
                                  return {
                                     datasetIndex: 0,
                                     fillStyle: colors[index],
                                     strokeStyle: dataset.borderColor && dataset.borderColor[index],
                                     lineWidth: dataset.borderWidth,
                                     text: label
                                  }
                               });
                               return legend;
                            }
                        },
                      position: 'right',
                      align: "center"
                    },
                    scales: {
                        xAxes: [{
                            categoryPercentage: 1.0,
                            barPercentage: 1.0,
                            scaleLabel: {
                                display: true,
                                labelString: 'Deletion and Insertion Lengths',
                            },
                        }],
                        yAxes: [{
                            ticks: {
                            beginAtZero: true,
                            },
                            scaleLabel: {
                                display: true,
                                labelString: 'Frequency (%)',
                            },
                        }]
                    },
                },
                
            });
        }
    }
}



            

