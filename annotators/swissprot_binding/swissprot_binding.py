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
        if chrom is None or pos is None:
            return
        lowbin = get_ucsc_bins(pos)[0]
        q = 'select uniprotkb, desc, pubmed, filenames from binding where chrom = "{chrom}" and bin={bin} and beg<={pos} and end>={pos}'.format(
            chrom = chrom ,pos = pos, bin=lowbin)
        self.cursor.execute(q)
        rows = self.cursor.fetchall()
        if rows is not None:
            act_, binding_, ca_, dna_, metal_, np_, zn_, uniprots, pubmed = set(),set(), set(),set(),set(), set(),set(),set(), set()
            all_results = []
            out = {}
            act, binding, ca, dna,metal,np,zn, pubmeds = '','','','','','','',''
            for row in rows:
                if row[3] == 'act':
                    act = row[1]
                elif row[3] == 'biinding':
                    binding = row[1]
                elif row[3] == 'ca':
                    ca = row[1]
                elif row[3] == 'dna':
                    dna = row[1]
                elif row[3] == 'metal':
                    metal = row[1]
                elif row[3] == 'np':
                    np = row[1]
                elif row[3] == 'zn':
                    zn = row[1]
                new = str(row[2]).strip().split(';')
                for i in range(len(new)):
                    pubmeds = new[i]
                    pubmeds = str(pubmeds).replace('None', '')
                    result = [row[0], act, binding, ca, dna, metal, np, zn, pubmeds]
                    all_results.append(result)
                    if pubmeds != '':
                        pubmed.add(pubmeds)
                uniprots.add(row[0])
                if act != '':
                    act_.add(act)
                if binding != '':
                    binding_.add(binding)
                if ca != '':
                    ca_.add(ca)
                if dna != '':
                    dna_.add(dna)
                if metal != '':
                    metal_.add(metal)
                if np != '':
                    np_.add(np)
                if zn != '':
                    zn_.add(zn)
            pubmed = list(pubmed)
            pubmed.sort()
            uniprots = list(uniprots)
            uniprots.sort()
            act_ = list(act_)
            act_.sort()
            binding_ = list(binding_)
            binding_.sort()
            ca_ = list(ca_)
            ca_.sort()
            dna_ = list(dna_)
            dna_.sort()
            metal_ = list(metal_)
            metal_.sort()
            np_ = list(np_)
            np_.sort()
            zn_ = list(zn_)
            zn_.sort()
            if all_results:
                out = {'uniprotkb': ';'.join(uniprots), 'act': ';'.join(act_), 'binding': ';'.join(binding_), 'ca': ';'.join(ca_), 'dna': ';'.join(dna_), 'metal': ';'.join(metal_), 'np': ';'.join(np_), 'zn': ';'.join(zn_),'pubmed': ';'.join(pubmed), 'all': all_results}
        return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()