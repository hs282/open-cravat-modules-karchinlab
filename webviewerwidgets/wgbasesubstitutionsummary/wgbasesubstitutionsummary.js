var widgetName = 'basesubstitutionsummary';
widgetGenerators[widgetName] = {
    'info': {
        'name': 'Base Substitution',
        'width': 780, 
        'height': 400, 
        'callserver': true,
        'function': function (div, data) {
            if (div != null) {
                emptyElement(div);
            }

            // 6 colors since we have 6 categories of base changes
            var colorPalette = [
                '#CF212D',
                '#1439CC',
                '#0EB554',
                '#70119C',
                '#D1941B',
                '#E57CEB',
            ];

            div.style.width = 'calc(100% - 37px)';
            div.style.marginTop = '15px';
            var chartDiv = getEl('canvas');
            chartDiv.style.width = 'calc(100% - 20px)';
            chartDiv.style.height = 'calc(100% - 20px)';
            addEl(div, chartDiv);
            var x = [];
            var y = [];
            
            // "invisible" bars separating regular bars from bars representing base change category
            var blankSpace = [];
            
            // bars representing base change category
            var baseChangeCategory = [];

            let substitutionData = data[0];
            let numSubstitutions = data[1];

            var colors = [];

            let i = 0;
            for (baseChange in substitutionData) {
                for (triplet in substitutionData[baseChange]) {
                    x.push(triplet);
                    y.push(substitutionData[baseChange][triplet] / numSubstitutions * 100);
                    blankSpace.push(-2);
                    baseChangeCategory.push(-0.5);
                    colors.push(colorPalette[i % colorPalette.length]);
                }
                i++;
            }

            var secondaryXAxisLabels = ['G>T', 'G>A', 'G>C', 'A>T', 'A>G', 'A>C'];
            var tripletLabelIndex = 0;
            
            var chart = new Chart(chartDiv, {
                type: 'bar',
                data: {
                    borderColor: 'black',
                    labels: x,
                    datasets: [
                        {
                            data: y,
                            backgroundColor: colors,
                            borderColor: colors,
                            borderWidth: 0.7,
                            hoverBorderColor: '#aaaaaa',
                            xAxisID: 'triplets'
                        },
                        {
                            data: blankSpace,
                            fill: false,
                            backgroundColor: 'rgba(255,10,13, 0)',
                            borderColor: 'rgba(255,10,13, 0)',
                            borderWidth: 0.7,
                            hoverBorderColor: '#aaaaaa',
                            xAxisID: 'triplets'
                        },
                        {
                            data: baseChangeCategory,
                            backgroundColor: colors,
                            borderColor: colors,
                            borderWidth: 0.7,
                            hoverBorderColor: '#aaaaaa',
                            xAxisID: 'triplets'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    legend: {display: false},
                    scales: {
                        xAxes: [{
                            position: {
                                y: 10
                            },
                            stacked: true,
                            id: 'triplets',
                            scaleLabel: {
                                display: true,
                            },
                            ticks: {
                                beginAtZero: true,
                                stepSize: 1.0,
                                max: 20,
                                maxRotation: 90,
                                minRotation: 90,
                                fontSize: 6,
                                fontColor: 'black',
                                padding: -25
                            },
                            gridLines: {
                                drawBorder: false,
                                zeroLineWidth: 3,
                                zeroLineColor: "#2C292E",
                                drawOnChartArea: false,
                                color: 'black',
                                tickMarkLength: 0
                            }
                        },
                        {
                            stacked: true,
                            id: 'baseChanges',
                            scaleLabel: {
                                display: true,
                            },
                            ticks: {
                                callback:function(label) {
                                    tripletLabelIndex++;
                                    console.log(label, tripletLabelIndex);
                                    
                                    if ((tripletLabelIndex % 16 == 8) && tripletLabelIndex > 96) {
                                        return secondaryXAxisLabels.pop();
                                    }
                                    
                                  },
                                beginAtZero: true,
                                stepSize: 1.0,
                                max: 20,
                                autoSkip: false,
                                maxRotation: 0,
                                minRotation: 0,
                                fontSize: 16,
                                fontColor: 'black',
                                padding: -20
                            },
                            gridLines: {
                                drawBorder: false,
                                drawOnChartArea: false,
                                tickMarkLength: 0,
                                color: 'black',
                            }
                          }
                    ],
                        yAxes: [{
                            stacked: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Percentage of Mutations',
                                fontSize: 16,
                                fontColor: 'black'
                            },
                            ticks: {
                                fontSize: 16,
                                fontColor: 'black',
                                beginAtZero: true,
                                min: -3
                            },
                            gridLines: {
                                display: false,
                                drawOnChartArea: false,
                                color: 'black'
                            },
                        },
                    ],
                    },
                    tooltips: {
                        backgroundColor: '#ffffff',
                        displayColors: false,
                        titleFontColor: '#000000',
                        titleFontStyle: 'normal',
                        bodyFontColor: '#000000',
                        borderColor: '#333333',
                        borderWidth: 1,
                    }
                }
            });
        }
    }
};