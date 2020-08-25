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
        q = 'select feature_name, score, id, target_genes from gene where chrom="{chrom}" and bin={bin} and beg<={pos} and end>={pos}'.format(
            chrom = chrom ,pos = pos, bin=lowbin)
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        
        if row:
            out = {'feature_name': row[0], 'score': row[1], 'ident': row[2], 'target_genes': row[3]}
        else:
            out = None
        return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__': 
    annotator = CravatAnnotator(sys.argv)
    annotator.run()