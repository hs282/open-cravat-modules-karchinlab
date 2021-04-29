widgetGenerators['casecontrolsummary'] = {
	'info': {
        'width': 380,
        'height': 380,
        'variables': {},
        'init': function () {
            var v = this['variables'];
			for (var i = 0; i < infomgr.colModels.variant.length; i++) {
                var cols = infomgr.colModels.variant[i].colModel;
                for (var j = 0; j < cols.length; j++) { 
                    var col = cols[j];
                    if (col.col.includes("casecontrol")){
                        var column = col.col;
                        v['column'] = column;
                    }else{
                        v['column'] = 0;
                    }
                }
            }
        },

        'shoulddraw': function () {
            var v = this['variables'];
            if (v['column'] == 0){
                return false
            }else{
                return true
            }
        },
		'function': function (div, row, tabName) {
            var labels = [];
            var dom_labels = [];
            var rec_labels = [];
            var all_labels = [];
            var labs = [];
            var dom_labs = [];
            var rec_labs = [];
            var all_labs =[];
            var dom_count = [];
            var rec_count = [];
            var all_count = [];
            var count = [];
            var hugos = [];
            var cases = [];
            var geneDataModels = infomgr.datas.gene;
            for (var i = 0; i < geneDataModels.length; i++) {
                var row = geneDataModels[i];
                hugos.push(row[0]);
            }
            var dd = infomgr.getData('variant');
            for (var j = 0; j < dd.length; j++) {
                var dict = {};
                var rowd = dd[j];
                var gene = getWidgetData('variant', 'base', rowd, 'hugo');
                var dom_pvalue = getWidgetData('variant', 'casecontrol', rowd, 'dom_pvalue');
                var rec_pvalue = getWidgetData('variant', 'casecontrol', rowd, 'rec_pvalue');
                var all_pvalue = getWidgetData('variant', 'casecontrol', rowd, 'all_pvalue');
                if (gene == null){
                    continue;
                }
                if (dom_pvalue > 0.05 && rec_pvalue > 0.05 && all_pvalue > 0.05){
                    continue;
                }
                for (var i = 0; i < hugos.length; i++) {  
                    if (gene == hugos[i]){
                        labels.push(gene);
                    }
                }
                if (dom_pvalue <= 0.05){
                    for (var i = 0; i < hugos.length; i++) {  
                        if (gene == hugos[i]){
                            dom_labels.push(gene);
                        }
                     }
                }
                if (rec_pvalue <= 0.05){
                for (var i = 0; i < hugos.length; i++) {  
                    if (gene == hugos[i]){
                        rec_labels.push(gene);
                    }
                }
            }
            if (all_pvalue <= 0.05){
                for (var i = 0; i < hugos.length; i++) {  
                    if (gene == hugos[i]){
                        all_labels.push(gene);
                    }
                }
            }
        }
            var counts = {};
            for (var i = 0; i < labels.length; i++) {
                if(!counts[labels[i]])
                    counts[labels[i]] = 0;
                ++counts[labels[i]];
            }
            var dom_counts = {};
            for (var i = 0; i < dom_labels.length; i++) {
                if(!dom_counts[dom_labels[i]])
                    dom_counts[dom_labels[i]] = 0;
                ++dom_counts[dom_labels[i]];
            }
            var rec_counts = {};
            for (var i = 0; i < rec_labels.length; i++) {
                if(!rec_counts[rec_labels[i]])
                    rec_counts[rec_labels[i]] = 0;
                ++rec_counts[rec_labels[i]];
            }
            var all_counts = {};
            for (var i = 0; i < all_labels.length; i++) {
                if(!all_counts[all_labels[i]])
                    all_counts[all_labels[i]] = 0;
                ++all_counts[all_labels[i]];
            }
            console.log(counts)
            var items = Object.keys(counts).map(function(key) {
                return [key, counts[key]];
              });
              items.sort(function(first, second) {
                return second[1] - first[1];
              });
              items = items.slice(0, 10);
              for (var i = 0; i < items.length; i++) {
                  labs.push(items[i][0]);
                  count.push(items[i][1]);
              }
              var dom_items = Object.keys(dom_counts).map(function(key) {
                return [key, dom_counts[key]];
              });
              dom_items.sort(function(first, second) {
                return second[1] - first[1];
              });
              dom_items = dom_items.slice(0, 10);
              for (var i = 0; i < dom_items.length; i++) {
                  dom_labs.push(dom_items[i][0]);
                  dom_count.push(dom_items[i][1]);
              } 
              var rec_items = Object.keys(rec_counts).map(function(key) {
                return [key, rec_counts[key]];
              });
              rec_items.sort(function(first, second) {
                return second[1] - first[1];
              });
              rec_items = rec_items.slice(0, 10);
              for (var i = 0; i < rec_items.length; i++) {
                  rec_labs.push(rec_items[i][0]);
                  rec_count.push(rec_items[i][1]);
              }
              var all_items = Object.keys(all_counts).map(function(key) {
                return [key, all_counts[key]];
              });
              all_items.sort(function(first, second) {
                return second[1] - first[1];
              });
              all_items = all_items.slice(0, 10);
              for (var i = 0; i < all_items.length; i++) {
                  all_labs.push(all_items[i][0]);
                  all_count.push(all_items[i][1]);
              }
              
                div.style.width = 'calc(100% - 37px)';
                var chartDiv = getEl('canvas');
                chartDiv.style.width = 'calc(100% - 20px)';
                chartDiv.style.height = 'calc(100% - 20px)';
                addEl(div, chartDiv);
                var button = document.createElement('button');
                button.id = "0";
                button.innerHTML = 'Overall';
                button.classList.add("butn");
                document.getElementById("widgetcontentdiv_casecontrolsummary_info").appendChild(button);
                var button2 = document.createElement('button');
                button2.id = "1";
                button2.innerHTML = 'Dominant p-value';
                button2.classList.add("butn");
                document.getElementById("widgetcontentdiv_casecontrolsummary_info").appendChild(button2);
                var button3 = document.createElement('button');
                button3.id = "2";
                button3.innerHTML = 'Recessive p-value';
                button3.classList.add("butn");
                document.getElementById("widgetcontentdiv_casecontrolsummary_info").appendChild(button3);
                var button4 = document.createElement('button');
                button4.id = "3";
                button4.innerHTML = 'Allelic p-value';
                button4.classList.add("butn");
                document.getElementById("widgetcontentdiv_casecontrolsummary_info").appendChild(button4);
                var config = {
                    type: 'horizontalBar',
                    data: {
                        labels: labs,
                        datasets: [{
                            type: 'horizontalBar',
                            backgroundColor:'#4B0082',
                            label: 'Any p-value <= 0.05',                        
                            data: count,
                        }, 
                        ]
                    },
                    options: {
                        responsive: false,
                        maintainAspectRatio: false,
                        scales: {
                            xAxes: [{
                                ticks: {
                                    beginAtZero: true,
                                    },
                                    scaleLabel: {
                                        display: true,
                                        labelString: 'Number of Variants',
                                    },
                            }]
                        }
                    }
                };
                var forecast_chart = new Chart(chartDiv, config);
                $("#0").click(function() {
                    var data = forecast_chart.config.data;
                    data.datasets[0].data = count;
                    data.labels = labs;
                    data.datasets[0].backgroundColor =  '#4B0082',
                    data.datasets[0].label =  'Any p-value <= 0.05',
                    forecast_chart.update();
                });
                $("#1").click(function() {
                    var data = forecast_chart.config.data;
                    data.datasets[0].data = dom_count;
                    data.labels = dom_labs;
                    data.datasets[0].backgroundColor =  '#8A2BE2',
                    data.datasets[0].label =  'Dominant p-value <= 0.05',
                    forecast_chart.update();
                });
                $("#2").click(function() {
                    var data = forecast_chart.config.data;
                    data.datasets[0].data = rec_count;
                    data.labels = rec_labs;
                    data.datasets[0].backgroundColor =  '#BA55D3',
                    data.datasets[0].label =  'Recessive p-value <= 0.05',
                    forecast_chart.update();
                });
                $("#3").click(function() {
                    var data = forecast_chart.config.data;
                    data.datasets[0].data = all_count;
                    data.labels = all_labs;
                    data.datasets[0].backgroundColor =  '#EE82EE',
                    data.datasets[0].label =  'Allelic p-value <= 0.05',
                    forecast_chart.update();
                });
        }
        
      }
    }