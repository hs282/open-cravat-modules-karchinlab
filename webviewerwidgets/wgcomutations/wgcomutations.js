widgetGenerators['comutations'] = {
    'info': {
        'width': 720,
        'height': 320,
        'callserver': true,
        'init': function(data) {
            this['variables']['data'] = data;
        },
        'shoulddraw': function () {
            var data = this['variables']['data'];
            if (data.length == 0){
                return false
            }else{
                return true
            }
        },
        'function': function(div, row, tabName) {
            var button = document.createElement('button');
            button.onclick = function() {
                perc_click()
            };
            button.innerHTML = 'Percentage of Samples Shared';
            button.id = "perc";
            button.style.position = 'relative'
            button.style.top = '240px'
            button.classList.add("butn")
            addEl(div, button)
            var button1 = document.createElement('button');
            button1.onclick = function() {
                samps_click()
            };
            button1.innerHTML = 'Number of Samples Shared';
            button1.id = "samp";
            button1.style.position = 'relative'
            button1.style.top = '240px'
            button1.style.left = '30px'
            button1.classList.add("butn")
            addEl(div, button1)
            getGradientColor = function(start_color, end_color, percent) {
                start_color = start_color.replace(/^\s*#|\s*$/g, '');
                end_color = end_color.replace(/^\s*#|\s*$/g, '');

                // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
                if (start_color.length == 3) {
                    start_color = start_color.replace(/(.)/g, '$1$1');
                }
                if (end_color.length == 3) {
                    end_color = end_color.replace(/(.)/g, '$1$1');
                }
                // get colors
                var start_red = parseInt(start_color.substr(0, 2), 16),
                    start_green = parseInt(start_color.substr(2, 2), 16),
                    start_blue = parseInt(start_color.substr(4, 2), 16);

                var end_red = parseInt(end_color.substr(0, 2), 16),
                    end_green = parseInt(end_color.substr(2, 2), 16),
                    end_blue = parseInt(end_color.substr(4, 2), 16);
                // calculate new color
                var diff_red = end_red - start_red;
                var diff_green = end_green - start_green;
                var diff_blue = end_blue - start_blue;
                diff_red = ((diff_red * percent) + start_red).toString(16).split('.')[0];
                diff_green = ((diff_green * percent) + start_green).toString(16).split('.')[0];
                diff_blue = ((diff_blue * percent) + start_blue).toString(16).split('.')[0];
                // ensure 2 digits by color
                if (diff_red.length == 1) diff_red = '0' + diff_red
                if (diff_green.length == 1) diff_green = '0' + diff_green
                if (diff_blue.length == 1) diff_blue = '0' + diff_blue

                return '#' + diff_red + diff_green + diff_blue;
            };
            var data = this['variables']['data'];
            var table = getWidgetTableFrame();
            table.setAttribute("id", "mytable")
            addEl(div, table);
            
            var tbody = getEl('tbody');
            addEl(table, tbody);
            var genes = [];
            var perc_dict = {};
            var sample_dict = {};
            for (var j = 0; j < data.length; j++) {
                genes.push(data[j][0]);
                var datas = Object.values(data[j][1]);
                var percentages = [];
                var counts = []
                for (var k = 0; k < datas.length; k++) {
                    var perc = datas[k]
                    var count = datas[k][1]
                    counts.push(count)
                    percentages.push((perc[0]* 100).toFixed(2))
                }
                perc_dict[data[j][0]] = percentages
                sample_dict[data[j][0]] = counts
                percentages.unshift(data[j][0]);
                counts.unshift(data[j][0]);
                var tr = getWidgetTableTr(percentages);
                for (var p = 0; p < percentages.length; p++) {
                    var color = getGradientColor('#FFFFFF', '#FF0000', percentages[p]/100);
                    $(tr).children().eq(p).css("background-color", color);
                    addEl(tbody, tr);
                }
            }
            genes.unshift('');
            var thead = getWidgetTableHead(genes);
            addEl(table, thead);
            addEl(div, addEl(table, tbody));
            var allperc = []
            for (var key in perc_dict) {
                allperc.push(perc_dict[key])
                function perc_click() {
                    tableIdToRemove = document.getElementById("mytable");
                    tableIdToRemove.parentNode.removeChild(tableIdToRemove);
                    var table = getWidgetTableFrame();
                    table.setAttribute("id", "mytable")
                    table.style.width = '700px'
                    addEl(div, table);
                    addEl(table, thead);
                    var tbody = getEl('tbody');
                    addEl(table, tbody);
                    for (var k = 0; k < allperc.length; k++) {
                        var tr = getWidgetTableTr(allperc[k]);
                        var d = allperc[k];
                        for (var j = 0; j < d.length; j++) {
                            var rankscore = d[j]/100
                            var color = getGradientColor('#FFFFFF', '#FF0000', rankscore);
                            $(tr).children().eq(j).css("background-color", color);
                            addEl(tbody, tr);
                            addEl(div, addEl(table, tbody));
                        }
                    }
                }
            }
            var allsamples = []
            for (var key in sample_dict) {
                allsamples.push(sample_dict[key])
                function samps_click() {
                    tableIdToRemove = document.getElementById("mytable");
                    tableIdToRemove.parentNode.removeChild(tableIdToRemove);
                    var table = getWidgetTableFrame();
                    table.style.width = '700px'
                    table.setAttribute("id", "mytable")
                    addEl(div, table);
                    addEl(table, thead);
                    var tbody = getEl('tbody');
                    addEl(table, tbody);
                    for (var k = 0; k < allsamples.length; k++) {
                        var tr = getWidgetTableTr(allsamples[k]);
                        var d = allperc[k];
                        for (var j = 0; j < d.length; j++) {
                            var rankscore = d[j]/100
                            var color = getGradientColor('#FFFFFF', '#FF0000', rankscore);
                            $(tr).children().eq(j).css("background-color", color);
                            addEl(tbody, tr);
                            addEl(div, addEl(table, tbody));
                        }
                    }
                }
            }
        }
    }
}