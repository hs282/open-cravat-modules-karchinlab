widgetGenerators['hg19'] = {
	'variant': {
		'width': 280, 
		'height': 80, 
		'default_hidden': true,
		'function': function (div, row, tabName) {
			addInfoLine(div, row, 'Chromosome', 'hg19__chrom', tabName);
			addInfoLine(div, row, 'Position', 'hg19__pos', tabName);
		}
	}
}
