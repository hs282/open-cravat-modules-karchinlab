widgetGenerators['gnomad_gene'] = {
	'gene': {
		'width': 840, 
		'height': 150, 
		'function': function (div, row, tabName) {
			var trx = getWidgetData(tabName, 'gnomad_gene', row, 'transcript');
			var trxls = trx != null ? trx.split(';') : [];
			var oelof = getWidgetData(tabName, 'gnomad_gene', row, 'oe_lof');
			var oelofls = oelof != null ? oelof.split(';').map(Number) : [];
			var oemis = getWidgetData(tabName, 'gnomad_gene', row, 'oe_mis');
			var oemisls = oemis != null ? oemis.split(';').map(Number) : [];
			var oesyn = getWidgetData(tabName, 'gnomad_gene', row, 'oe_syn');
			var oesynls = oesyn != null ? oesyn.split(';').map(Number) : [];
			var lofz = getWidgetData(tabName, 'gnomad_gene', row, 'lof_z');
			var lofzls = lofz != null ? lofz.split(';').map(Number) : [];
			var misz = getWidgetData(tabName, 'gnomad_gene', row, 'mis_z');
			var miszls = misz != null ? misz.split(';').map(Number) : [];
			var synz = getWidgetData(tabName, 'gnomad_gene', row, 'syn_z');
			var synzls = synz != null ? synz.split(';').map(Number) : [];
			var pli = getWidgetData(tabName, 'gnomad_gene', row, 'pLI');
			var plils = pli != null ? pli.split(';').map(Number) : [];
			var prec = getWidgetData(tabName, 'gnomad_gene', row, 'pRec');
			var precls = prec != null ? prec.split(';').map(Number) : [];
			var pnull = getWidgetData(tabName, 'gnomad_gene', row, 'pNull');
			var pnullls = pnull != null ? pnull.split(';').map(Number) : [];
			var table = getWidgetTableFrame();
			addEl(div, table);
			var thead = getWidgetTableHead(['Transcript','Obv/Exp LoF','Obv/Exp Mis','Obv/Exp Syn','LoF Z-Score','Mis Z-Score','Syn Z-Score','pLI','pRec','pNull'],['20%']);
			addEl(table, thead);
			var tbody = getEl('tbody');
			addEl(table, tbody);
			for(var i=0;i<trxls.length;i++){
				var tr = getWidgetTableTr([trxls[i],oelofls[i],oemisls[i],oesynls[i],lofzls[i],miszls[i],synzls[i],plils[i],precls[i],pnullls[i]]);
				addEl(tbody, tr);
			}
			addEl(div, addEl(table, tbody));
		}
	}
}
