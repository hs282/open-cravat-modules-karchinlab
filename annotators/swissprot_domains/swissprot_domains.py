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
        q = 'select uniprotkb, desc, pubmed, filenames from protein where chrom = "{chrom}" and bin={bin} and beg<={pos} and end>={pos}'.format(
            chrom = chrom ,pos = pos, bin=lowbin)
        self.cursor.execute(q)
        rows = self.cursor.fetchall()
        if rows is not None:
            domain,intramem, motif, peptide, repeat,topo, transmem, pubmeds = '','','','','','','', ''
            domain_, intramem_, motif_, peptide_, repeat_, topo_, transmem_, uniprot_, pubmed_ = set(),set(), set(), set(), set(),set(), set(), set(), set()
            all_results = []
            out = {}
            for row in rows:
                if row[3] == 'domain':
                    domain = row[1]
                elif row[3] == 'intramem':
                    intramem = row[1]
                elif row[3] == 'motif':
                    motif = row[1]
                elif row[3] == 'peptide':
                    peptide = row[1]
                elif row[3] == 'repeat':
                    repeat = row[1]
                elif row[3] == 'topo':
                    topo = row[1]
                elif row[3] == 'transmem':
                    transmem = row[1]
                new = str(row[2]).strip().split(';')
                for i in range(len(new)):
                    pubmeds = new[i]
                    result = [row[0], domain, intramem, motif, peptide, repeat,topo, transmem, pubmeds]
                    all_results.append(result)
                    if pubmeds != '':
                        pubmed_.add(pubmeds)
                uniprot_.add(row[0])
                if domain != '':
                    domain_.add(domain)
                if intramem != '':
                    intramem_.add(intramem)
                if motif != '':
                    motif_.add(motif)
                if peptide != '':
                    peptide_.add(peptide)
                if repeat != '':
                    repeat_.add(repeat)
                if topo != '':
                    topo_.add(topo)
                if transmem != '':
                    transmem_.add(transmem)
            pubmed_ = list(pubmed_)
            pubmed_.sort()
            uniprot_ = list(uniprot_) 
            uniprot_.sort()
            domain_ = list(domain_)
            domain_.sort()
            intramem_ = list(intramem_)
            intramem_.sort()
            motif_ = list(motif_)
            motif_.sort()
            peptide_ = list(peptide_)
            peptide_.sort()
            repeat_ = list(repeat_)
            repeat_.sort()
            topo_ = list(topo_)
            topo_.sort()
            transmem_ = list(transmem_)
            transmem_.sort()
            if all_results:
                out = {'domain': ';'.join(domain_), 'intramem': ';'.join(intramem_), 'motif': ';'.join(motif_), 'peptide': ';'.join(peptide_), 'repeat': ';'.join(repeat_),'topo': ';'.join(topo_), 'transmem': ';'.join(transmem_), 'uniprotkb': ';'.join(uniprot_), 'pubmed': ';'.join(pubmed_), 'all': all_results}
        return out 

    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()