var widgetName = 'sosummary';
widgetGenerators[widgetName] = {
	'info': {
		'name': 'Sequence Ontology',
		'width': 480, 
		'height': 480, 
		'callserver': false,
		'function': function (div) {
			if (div != null) {
				emptyElement(div);
			}
			var so_dic = {
                null: 'Intergenic',
		        '':'Intergenic',
		        'missense':'missense_variant',
		        'synonymous':'synonymous_variant',
		        'frameshift insertion':'frameshift_elongation',
		        'frameshift insertion by 1':'frameshift_elongation',
		        'frameshift insertion by 2':'frameshift_elongation',
		        'frameshift deletion':'frameshift_truncation',
		        'frameshift deletion by 1':'frameshift_truncation',
		        'frameshift deletion by 2':'frameshift_truncation',
		        'inframe insertion':'inframe_insertion',
		        'inframe deletion':'inframe_deletion',
		        'complex substitution':'complex_substitution',
		        'stop gained':'stop_gained',
		        'stop lost':'stop_lost',
		        'splice site':'splice_site_variant',
		        '2kb upstream':'2kb_upstream_variant',
		        '2kb downstream':'2kb_downstream_variant',
		        '3-prime utr':'3_prime_UTR_variant',
		        '5-prime utr':'5_prime_UTR_variant',
		        'intron':'intron_variant',
		        'unknown':'unknown',
				'MIS':'missense_variant',
				'SYN':'synonymous_variant',
				'FSI':'frameshift_elongation',
				'FI1':'frameshift_elongation',
				'FI2':'frameshift_elongation',
				'FSD':'frameshift_truncation',
				'FD1':'frameshift_truncation',
				'FD2':'frameshift_truncation',
				'IIV':'inframe_insertion',
				'INI':'inframe_insertion',
				'IDV':'inframe_deletion',
				'IND':'inframe_deletion',
				'CSS':'complex_substitution',
				'STG':'stop_gained',
				'STL':'stop_lost',
				'SPL':'splice_site_variant',
				'2KU':'2kb_upstream_variant',
				'2KD':'2kb_downstream_variant',
				'UT3':'3_prime_UTR_variant',
				'UT5':'5_prime_UTR_variant',
				'INT':'intron_variant',
				'UNK':'unknown'
		    };
			var colors = [
				'#2166AC',
				'#4393C3',
				'#92C5DE',
				'#D1E5F0',
				'#F7F7F7',
				'#FDDBC7',
				'#F4A582',
				'#D6604D',
				'#B2182B',
				'#762A83',
				'#9970AB',
				'#C2A5CF',
				'#E7D4E8',
				'#D9F0D3',
				'#ACD39E',
				'#5AAE61',
				'#1B7837',
			];
			var counts = {};
			var d = infomgr.getData('variant'); 
			for (var i = 0; i < d.length; i++) {
				var row = d[i]; 
				var so = getWidgetData('variant', 'base', row, 'so'); 
                if (so in so_dic) {
                    so = so_dic[so];
                }
				if (so != '') {
					if (counts[so] == undefined) {
						counts[so] = 0;
					}
					counts[so] = counts[so] + 1;
				}
			}
			var labels = Object.keys(counts);
			var data = [];
			for (var i = 0; i < labels.length; i++) {
				var count = counts[labels[i]];
				data.push(count);
			}
			
			if (labels.length > 17){
				labels = labels.slice(0, 17);
				var other = data.slice(17, data.length)
				other = other.reduce((a, b) => a + b, 0)
				data = data.slice(0, 17);
				data.push(other);
				labels.push('other');

			}

			div.style.width = 'calc(100% - 37px)';
			var chartDiv = getEl('canvas');
			chartDiv.style.width = 'calc(100% - 20px)';
			chartDiv.style.height = 'calc(100% - 20px)';
			addEl(div, chartDiv);

			var chart = new Chart(chartDiv, {
				type: 'doughnut',
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
				}
			});
		}
	}
};
