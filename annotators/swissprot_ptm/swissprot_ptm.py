import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
from cravat.util import get_ucsc_bins

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        chrom = input_data['chrom']
        pos = input_data['pos']
        coding = input_data['coding']
        so = input_data['so']
        if chrom is None or pos is None:
            return
        lowbin = get_ucsc_bins(pos)[0]
        q = 'select uniprotkb, desc, pubmed, filenames from ptm where chrom = "{chrom}" and bin={bin} and beg<={pos} and end>={pos}'.format(
            chrom = chrom ,pos = pos, bin=lowbin)
        self.cursor.execute(q)
        rows = self.cursor.fetchall()
        if rows is not None:
            crosslnk_ ,disulfid_, carbohyd_, init_, lipid_, mod_, propep_, pubmed, signal_, transit_, uniprots = set(),set(),set(),set(),set(),set(),set(),set(),set(),set(),set()
            crosslnk, disulfid, carbohyd, init,lipid,mod,propep, pubmeds,signal, transit = '','','','','','','','','',''
            all_results = []
            out = {}
            for row in rows:
                if coding != 'Y' and row[3] == 'propep' or coding != 'Y' and row[3] == 'signal' or  coding != 'Y' and row[3] == 'transit':
                    continue
                if row[3] == 'transit':
                    transit = row[1]
                elif row[3] == 'mod':
                    mod = row[1]
                elif row[3] == 'signal':
                    signal = row[1]
                elif row[3] == 'propep':
                    propep = row[1]
                elif row[3] == 'crosslnk':
                    crosslnk = row[1]
                elif row[3] == 'carbohyd':
                    carbohyd = row[1]
                elif row[3] == 'lipid':
                    lipid = row[1]
                elif row[3] == 'init':
                    init = row[1]
                elif row[3] == 'disulfid':
                    disulfid = row[1]
                pub = str(row[2]).replace(',', ';')
                new = pub.strip().split(';')
                for i in range(len(new)):
                    pubmeds = new[i]
                    pubmeds = str(pubmeds).replace('None', '')
                    result = [row[0], crosslnk, carbohyd, init,lipid, mod,propep, signal, transit,disulfid, pubmeds]
                    all_results.append(result)
                    if pubmeds != '':
                        pubmed.add(pubmeds)
                uniprots.add(row[0])
                if transit != '':
                    transit_.add(transit)
                if mod != '':
                    mod_.add(mod)
                if signal != '':
                    signal_.add(signal)
                if propep != '':
                    propep_.add(propep)
                if crosslnk != '':
                    crosslnk_.add(crosslnk)
                if carbohyd != '':
                    carbohyd_.add(carbohyd)
                if lipid != '':
                    lipid_.add(lipid)
                if init != '':
                    init_.add(init)
                if disulfid != '':
                    disulfid_.add(disulfid)
            mod_ = list(mod_)
            mod_.sort()
            signal_ = list(signal_)
            signal_.sort()
            propep_ = list(propep_)
            propep_.sort()
            crosslnk_ = list(crosslnk_)
            crosslnk_.sort()
            carbohyd_ = list(carbohyd_)
            carbohyd_.sort()
            lipid_ = list(lipid_)
            lipid_.sort()
            init_ = list(init_)
            init_.sort()
            disulfid_ = list(disulfid_)
            disulfid_.sort()
            transit_ = list(transit_)
            transit_.sort()
            uniprots = list(uniprots)
            uniprots.sort()
            pubmed = list(pubmed)
            pubmed.sort()
            if all_results:
                out = {'disulfid': ';'.join(disulfid_), 'transit': ';'.join(transit_), 'mod': ';'.join(mod_), 'signal': ';'.join(signal_), 'propep': ';'.join(propep_), 'crosslnk': ';'.join(crosslnk_), 'carbohyd': ';'.join(carbohyd_), 'lipid': ';'.join(lipid_), 'init': ';'.join(init_),'uniprotkb': ';'.join(uniprots), 'pubmed': ';'.join(pubmed), 'all': all_results}
        return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
