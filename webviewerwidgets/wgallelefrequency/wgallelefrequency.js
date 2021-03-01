var widgetName = 'allelefrequency';
widgetGenerators[widgetName] = {
    'info': {
        'name': 'Allele Frequency Spectrum',
        'width': 950, 
        'height': 380, 
        'function': function (div) {
            if (div != null) {
                emptyElement(div);
            }
            deletions = [];
            insertions = []; 
            div.style.width = 'calc(100% - 37px)';
            var chartDiv = getEl('canvas');
            chartDiv.style.width = 'calc(100% - 20px)';
            chartDiv.style.height = 'calc(100% - 20px)';
            addEl(div, chartDiv);
            var d = infomgr.getData('variant'); 
            var freq = [];
            var freq_afr = [];
            var freq_amr = [];
            var freq_asj = [];
            var freq_eas = [];
            var freq_fin = [];
            var freq_nfe = [];
            var freq_oth = [];
            var freq_sas = [];
            for (var i = 0; i < d.length; i++) {
                var row = d[i];
                var af = getWidgetData('variant', 'gnomad', row, 'af');
                var afr = getWidgetData('variant', 'gnomad', row, 'af_afr');
                var amr = getWidgetData('variant', 'gnomad', row, 'af_amr');
                var asj = getWidgetData('variant', 'gnomad', row, 'af_asj');
                var eas = getWidgetData('variant', 'gnomad', row, 'af_eas');
                var fin = getWidgetData('variant', 'gnomad', row, 'af_fin');
                var nfe = getWidgetData('variant', 'gnomad', row, 'af_nfe');
                var oth = getWidgetData('variant', 'gnomad', row, 'af_oth');
                var sas = getWidgetData('variant', 'gnomad', row, 'af_sas');
                if (af != null){
                    af = af.toFixed(2);
                    freq.push(af);
                } if (afr != null){
                    afr = afr.toFixed(2);
                    freq_afr.push(afr);
                } if (amr != null){
                    amr = amr.toFixed(2);
                    freq_amr.push(amr);
                } if (asj != null){
                    asj = asj.toFixed(2);
                    freq_asj.push(asj);
                }if (eas != null){
                    eas = eas.toFixed(2);
                    freq_eas.push(eas);
                }if (fin != null){
                    fin = fin.toFixed(2);
                    freq_fin.push(fin);
                }if (nfe != null){
                    nfe = nfe.toFixed(2);
                    freq_nfe.push(nfe);
                }if (oth != null){
                    oth = oth.toFixed(2);
                    freq_oth.push(oth);
                }if (sas != null){
                    sas = sas.toFixed(2);
                    freq_sas.push(sas);
                }
            }   
                var labels = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
                var datas = [];
                var sum0 = 0;
                var sum1 = 0;
                var sum2 = 0;
                var sum3 = 0;
                var sum4 = 0;
                var sum5 = 0;
                var sum6 =0;
                var sum7 = 0;
                var sum8 =0;
                var sum9 = 0;
                for (var i = 0; i < freq.length; i++){
                    if (freq[i] >= 0 && freq[i] < 0.1){
                        sum0 = sum0 + 1
                    }else if (freq[i] >= 0.1 && freq[i] < 0.2){
                        sum1 = sum1 + 1
                    }else if (freq[i] >= 0.2 && freq[i] < 0.3){
                        sum2 = sum2 + 1
                    }else if (freq[i] >= 0.3 && freq[i] < 0.4){
                        sum3 = sum3 + 1
                    }else if (freq[i] >= 0.4 && freq[i] < 0.5){
                        sum4 = sum4 + 1
                    }else if (freq[i] >= 0.5 && freq[i] < 0.6){
                        sum5 = sum5 + 1
                    }else if (freq[i] >= 0.6 && freq[i] < 0.7){
                        sum6 = sum6 + 1
                    }else if (freq[i] >= 0.7 && freq[i] < 0.8){
                        sum7 = sum7 + 1
                    }else if (freq[i] >= 0.8 && freq[i] < 0.9){
                        sum8 = sum8 + 1
                    }else if (freq[i] >= 0.9 && freq[i] <= 1.0){
                        sum9 = sum9 + 1
                    }
                }
                datas.push(sum0, sum1, sum2, sum3, sum4, sum5, sum6, sum7, sum8, sum9)
                var afrdatas = [];
                var afrsum0 = 0;
                var afrsum1 = 0;
                var afrsum2 = 0;
                var afrsum3 = 0;
                var afrsum4 = 0;
                var afrsum5 = 0;
                var afrsum6 =0;
                var afrsum7 = 0;
                var afrsum8 =0;
                var afrsum9 = 0;
                for (var i = 0; i < freq_afr.length; i++){
                    if (freq_afr[i] >= 0 && freq_afr[i] < 0.1){
                        afrsum0 =+ 1
                    }else if (freq[i] >= 0.1 && freq[i] < 0.2){
                        afrsum1 += 1
                    }else if (freq_afr[i] >= 0.2 && freq_afr[i] < 0.3){
                        afrsum2 += 1
                    }else if (freq_afr[i] >= 0.3 && freq_afr[i] < 0.4){
                        afrsum3 += 1
                    }else if (freq_afr[i] >= 0.4 && freq_afr[i] < 0.5){
                        afrsum4 += 1
                    }else if (freq_afr[i] >= 0.5 && freq_afr[i] < 0.6){
                        afrsum5 += 1
                    }else if (freq_afr[i] >= 0.6 && freq_afr[i] < 0.7){
                        afrsum6 += 1
                    }else if (freq_afr[i] >= 0.7 && freq_afr[i] < 0.8){
                        afrsum7 += 1
                    }else if (freq_afr[i] >= 0.8 && freq_afr[i] < 0.9){
                        afrsum8 += 1
                    }else if (freq_afr[i] >= 0.9 && freq_afr[i] <= 1.0){
                        afrsum9 += 1
                    }
                }
                afrdatas.push(afrsum0, afrsum1, afrsum2, afrsum3, afrsum4, afrsum5, afrsum6, afrsum7, afrsum8, afrsum9)
                var amrdatas = [];
                var amrsum0 = 0;
                var amrsum1 = 0;
                var amrsum2 = 0;
                var amrsum3 = 0;
                var amrsum4 = 0;
                var amrsum5 = 0;
                var amrsum6 =0;
                var amrsum7 = 0;
                var amrsum8 =0;
                var amrsum9 = 0;
                for (var i = 0; i < freq_amr.length; i++){
                    if (freq_amr[i] >= 0 && freq_amr[i] < 0.1){
                        amrsum0 += 1
                    }else if (freq_amr[i] >= 0.1 && freq_amr[i] < 0.2){
                        amrsum1 += 1
                    }else if (freq_amr[i] >= 0.2 && freq_amr[i] < 0.3){
                        amrsum2 += 1
                    }else if (freq_amr[i] >= 0.3 && freq_amr[i] < 0.4){
                        amrsum3 += 1
                    }else if (freq_amr[i] >= 0.4 && freq_amr[i] < 0.5){
                        amrsum4 += 1
                    }else if (freq_amr[i] >= 0.5 && freq_amr[i] < 0.6){
                        amrsum5 += 1
                    }else if (freq_amr[i] >= 0.6 && freq_amr[i] < 0.7){
                        amrsum6 += 1
                    }else if (freq_amr[i] >= 0.7 && freq_amr[i] < 0.8){
                        amrsum7 += 1
                    }else if (freq_amr[i] >= 0.8 && freq_amr[i] < 0.9){
                        amrsum8 += 1
                    }else if (freq_amr[i] >= 0.9 && freq_amr[i] <= 1.0){
                        amrsum9 += 1
                    }
                }
                amrdatas.push(amrsum0, amrsum1, amrsum2, amrsum3, amrsum4, amrsum5, amrsum6, amrsum7, amrsum8, amrsum9)
                var asjdatas = [];
                var asjsum0 = 0;
                var asjsum1 = 0;
                var asjsum2 = 0;
                var asjsum3 = 0;
                var asjsum4 = 0;
                var asjsum5 = 0;
                var asjsum6 =0;
                var asjsum7 = 0;
                var asjsum8 =0;
                var asjsum9 = 0;
                for (var i = 0; i < freq_asj.length; i++){
                    if (freq_asj[i] >= 0 && freq_asj[i] < 0.1){
                        asjsum0 += 1
                    }else if (freq_asj[i] >= 0.1 && freq_asj[i] < 0.2){
                        asjsum1 += 1
                    }else if (freq_asj[i] >= 0.2 && freq_asj[i] < 0.3){
                        asjsum2 += 1
                    }else if (freq_asj[i] >= 0.3 && freq_asj[i] < 0.4){
                        asjsum3 += 1
                    }else if (freq_asj[i] >= 0.4 && freq_asj[i] < 0.5){
                        asjsum4 += 1
                    }else if (freq_asj[i] >= 0.5 && freq_asj[i] < 0.6){
                        asjsum5 += 1
                    }else if (freq_asj[i] >= 0.6 && freq_asj[i] < 0.7){
                        asjsum6 += 1
                    }else if (freq_asj[i] >= 0.7 && freq_asj[i] < 0.8){
                        asjsum7 += 1
                    }else if (freq_asj[i] >= 0.8 && freq_asj[i] < 0.9){
                        asjsum8 += 1
                    }else if (freq_asj[i] >= 0.9 && freq_asj[i] <= 1.0){
                        asjsum9 += 1
                    }
                }
                asjdatas.push(asjsum0, asjsum1, asjsum2, asjsum3, asjsum4, asjsum5, asjsum6, asjsum7, asjsum8, asjsum9)
                var easdatas = [];
                var eassum0 = 0;
                var eassum1 = 0;
                var eassum2 = 0;
                var eassum3 = 0;
                var eassum4 = 0;
                var eassum5 = 0;
                var eassum6 =0;
                var eassum7 = 0;
                var eassum8 =0;
                var eassum9 = 0;
                for (var i = 0; i < freq_eas.length; i++){
                    if (freq_eas[i] >= 0 && freq_eas[i] < 0.1){
                        eassum0 += 1
                    }else if (freq_eas[i] >= 0.1 && freq_eas[i] < 0.2){
                        eassum1 += 1
                    }else if (freq_eas[i] >= 0.2 && freq_eas[i] < 0.3){
                        eassum2 += 1
                    }else if (freq_eas[i] >= 0.3 && freq_eas[i] < 0.4){
                        eassum3 += 1
                    }else if (freq_eas[i] >= 0.4 && freq_eas[i] < 0.5){
                        eassum4 += 1
                    }else if (freq_eas[i] >= 0.5 && freq_eas[i] < 0.6){
                        eassum5 += 1
                    }else if (freq_eas[i] >= 0.6 && freq_eas[i] < 0.7){
                        eassum6 += 1
                    }else if (freq_eas[i] >= 0.7 && freq_eas[i] < 0.8){
                        eassum7 += 1
                    }else if (freq_eas[i] >= 0.8 && freq_eas[i] < 0.9){
                        eassum8 += 1
                    }else if (freq_eas[i] >= 0.9 && freq_eas[i] <= 1.0){
                        eassum9 += 1
                    }
                }
                easdatas.push(eassum0, eassum1, eassum2, eassum3, eassum4, eassum5, eassum6, eassum7, eassum8, eassum9)
                var findatas = [];
                var finsum0 = 0;
                var finsum1 = 0;
                var finsum2 = 0;
                var finsum3 = 0;
                var finsum4 = 0;
                var finsum5 = 0;
                var finsum6 =0;
                var finsum7 = 0;
                var finsum8 =0;
                var finsum9 = 0;
                for (var i = 0; i < freq_fin.length; i++){
                    if (freq_fin[i] >= 0 && freq_fin[i] < 0.1){
                        finsum0 += 1
                    }else if (freq_fin[i] >= 0.1 && freq_fin[i] < 0.2){
                        finsum1 += 1
                    }else if (freq_fin[i] >= 0.2 && freq_fin[i] < 0.3){
                        finsum2 += 1
                    }else if (freq_fin[i] >= 0.3 && freq_fin[i] < 0.4){
                        finsum3 += 1
                    }else if (freq_fin[i] >= 0.4 && freq_fin[i] < 0.5){
                        finsum4 += 1
                    }else if (freq_fin[i] >= 0.5 && freq_fin[i] < 0.6){
                        finsum5 += 1
                    }else if (freq_fin[i] >= 0.6 && freq_fin[i] < 0.7){
                        finsum6 += 1
                    }else if (freq_fin[i] >= 0.7 && freq_fin[i] < 0.8){
                        finsum7 += 1
                    }else if (freq_fin[i] >= 0.8 && freq_fin[i] < 0.9){
                        finsum8 += 1
                    }else if (freq_fin[i] >= 0.9 && freq_fin[i] <= 1.0){
                        finsum9 += 1
                    }
                }
                findatas.push(finsum0, finsum1, finsum2, finsum3, finsum4, finsum5, finsum6, finsum7, finsum8, finsum9)
                var nfedatas = [];
                var nfesum0 = 0;
                var nfesum1 = 0;
                var nfesum2 = 0;
                var nfesum3 = 0;
                var nfesum4 = 0;
                var nfesum5 = 0;
                var nfesum6 =0;
                var nfesum7 = 0;
                var nfesum8 =0;
                var nfesum9 = 0;
                for (var i = 0; i < freq_nfe.length; i++){
                    if (freq_nfe[i] >= 0 && freq_nfe[i] < 0.1){
                        nfesum0 += 1
                    }else if (freq_nfe[i] >= 0.1 && freq_nfe[i] < 0.2){
                        nfesum1 += 1
                    }else if (freq_nfe[i] >= 0.2 && freq_nfe[i] < 0.3){
                        nfesum2 += 1
                    }else if (freq_nfe[i] >= 0.3 && freq_nfe[i] < 0.4){
                        nfesum3 += 1
                    }else if (freq_nfe[i] >= 0.4 && freq_nfe[i] < 0.5){
                        nfesum4 += 1
                    }else if (freq_nfe[i] >= 0.5 && freq_nfe[i] < 0.6){
                        nfesum5 += 1
                    }else if (freq_nfe[i] >= 0.6 && freq_nfe[i] < 0.7){
                        nfesum6 += 1
                    }else if (freq_nfe[i] >= 0.7 && freq_nfe[i] < 0.8){
                        nfesum7 += 1
                    }else if (freq_nfe[i] >= 0.8 && freq_nfe[i] < 0.9){
                        nfesum8 += 1
                    }else if (freq_nfe[i] >= 0.9 && freq_nfe[i] <= 1.0){
                        nfesum9 += 1
                    }
                }
                nfedatas.push(nfesum0, nfesum1, nfesum2, nfesum3, nfesum4, nfesum5, nfesum6, nfesum7, nfesum8, nfesum9)
                var othdatas = [];
                var othsum0 = 0;
                var othsum1 = 0;
                var othsum2 = 0;
                var othsum3 = 0;
                var othsum4 = 0;
                var othsum5 = 0;
                var othsum6 =0;
                var othsum7 = 0;
                var othsum8 =0;
                var othsum9 = 0;
                for (var i = 0; i < freq_oth.length; i++){
                    if (freq_oth[i] >= 0 && freq_oth[i] < 0.1){
                        othsum0 += 1
                    }else if (freq_oth[i] >= 0.1 && freq_oth[i] < 0.2){
                        othsum1 += 1
                    }else if (freq_oth[i] >= 0.2 && freq_oth[i] < 0.3){
                        othsum2 += 1
                    }else if (freq_oth[i] >= 0.3 && freq_oth[i] < 0.4){
                        othsum3 += 1
                    }else if (freq_oth[i] >= 0.4 && freq_oth[i] < 0.5){
                        othsum4 += 1
                    }else if (freq_oth[i] >= 0.5 && freq_oth[i] < 0.6){
                        othsum5 += 1
                    }else if (freq_oth[i] >= 0.6 && freq_oth[i] < 0.7){
                        othsum6 += 1
                    }else if (freq_oth[i] >= 0.7 && freq_oth[i] < 0.8){
                        othsum7 += 1
                    }else if (freq_oth[i] >= 0.8 && freq_oth[i] < 0.9){
                        othsum8 += 1
                    }else if (freq_oth[i] >= 0.9 && freq_oth[i] <= 1.0){
                        othsum9 += 1
                    }
                }
                othdatas.push(othsum0, othsum1, othsum2, othsum3, othsum4, othsum5, othsum6, othsum7, othsum8, othsum9)
                var sasdatas = [];
                var sassum0 = 0;
                var sassum1 = 0;
                var sassum2 = 0;
                var sassum3 = 0;
                var sassum4 = 0;
                var sassum5 = 0;
                var sassum6 =0;
                var sassum7 = 0;
                var sassum8 =0;
                var sassum9 = 0;
                for (var i = 0; i < freq_sas.length; i++){
                    if (freq_sas[i] >= 0 && freq_oth[i] < 0.1){
                        sassum0 += 1
                    }else if (freq_sas[i] >= 0.1 && freq_sas[i] < 0.2){
                        sassum1 += 1
                    }else if (freq_sas[i] >= 0.2 && freq_sas[i] < 0.3){
                        sassum2 += 1
                    }else if (freq_sas[i] >= 0.3 && freq_sas[i] < 0.4){
                        sassum3 += 1
                    }else if (freq_sas[i] >= 0.4 && freq_sas[i] < 0.5){
                        sassum4 += 1
                    }else if (freq_sas[i] >= 0.5 && freq_sas[i] < 0.6){
                        sassum5 += 1
                    }else if (freq_sas[i] >= 0.6 && freq_sas[i] < 0.7){
                        sassum6 += 1
                    }else if (freq_sas[i] >= 0.7 && freq_sas[i] < 0.8){
                        sassum7 += 1
                    }else if (freq_sas[i] >= 0.8 && freq_sas[i] < 0.9){
                        sassum8 += 1
                    }else if (freq_sas[i] >= 0.9 && freq_sas[i] <= 1.0){
                        sassum9 += 1
                    }
                }
                sasdatas.push(sassum0, sassum1, sassum2, sassum3, sassum4, sassum5, sassum6, sassum7, sassum8, sassum9)
                var chart = new Chart(chartDiv, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                data: datas,
                                backgroundColor: "#40E0D0",
                                label: "Global"
                            },
                            {
                                data: afrdatas,
                                backgroundColor: "#708090",
                                label: "African"
                            },
                            {
                                data: amrdatas,
                                backgroundColor: "blue",
                                label: "American"

                            },
                            {
                                data: asjdatas,
                                backgroundColor: "#DDA0DD",
                                label: "Ashkenazi Jewish"
                            },
                            {
                                data: easdatas,
                                backgroundColor: '#FFE4B5',
                                label: 'East Asian'
                            },
                            {
                                data: findatas,
                                backgroundColor: '#008080',
                                label: 'Finish'
                            },
                            {
                                data: nfedatas,
                                backgroundColor: '#87CEFA',
                                label: 'Non-Fin Eur'
                            },
                            {
                                data: othdatas,
                                backgroundColor: '#FFC0CB',
                                label: "Other"
                            },
                            {
                                data: sasdatas,
                                backgroundColor: '#4B0082',
                                label: "South Asian"
                            }
                        ]
                    }, options: {
                        tooltips: {
                    },
                        legend: {
                            labels: {
                            },
                          position: 'top',
                          align: "center"
                        },
                        scales: {
                            xAxes: [{
                                display: false,
                                ticks: {
                                    max: 0.9,
                                }
                             }, {
                                display: true,
                                ticks: {
                                    autoSkip: false,
                                    max: 1.0,
                                },
                                categoryPercentage: 1.0,
                                barPercentage: 1.0,
                                scaleLabel: {
                                    display: true,
                                    labelString: 'Allele Frequency',
                                },
                            }],
                            yAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: 'log (Number of Variants)',
                                },
                                type: 'logarithmic',
                                position: 'left',
                                ticks: {
                                     min: 0.1, //minimum tick
                                     max: 10000, //maximum tick
                                     callback: function (value, index, values) {
                                         return Number(value.toString());//pass tick values as a string into Number function
                                     }
                                },
                                afterBuildTicks: function (chartObj) { //Build ticks labelling as per your need
                                    chartObj.ticks = [];
                                    chartObj.ticks.push(0.1);
                                    chartObj.ticks.push(1);
                                    chartObj.ticks.push(10);
                                    chartObj.ticks.push(100);
                                    chartObj.ticks.push(1000);
                                    chartObj.ticks.push(10000);
                                }
                            }]
                        },
                    },
                    
                });
            }
        }
}

