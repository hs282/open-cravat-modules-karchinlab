widgetGenerators['cancer_hotspots'] = {
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
            if (samples != undefined && samples != null && samples.indexOf('[[') == 0) {
                if (!samples) {
                    return;
                }
                samples = JSON.parse(samples);
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
                let occurs = {};
                for (let stok of samples.split('; ')) {
                    [cancer,occur] = stok.split(':');
                    occurs[cancer] = occur;
                }
                const table = getWidgetTableFrame();
                addEl(div, table);
                const thead = getWidgetTableHead(['Cancer Type','Count']);
                addEl(table, thead);
                const tbody = getEl('tbody');
                addEl(table, tbody);
                for (let cancer of this.cancerTypes) {
                    let occur = occurs[cancer];
                    if (!occur) {
                        continue;
                    }
                    let tr = getWidgetTableTr([cancer,occur]);
                    addEl(tbody, tr);
                }
            }
		}
	}
}
