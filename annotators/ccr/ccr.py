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
        q = 'select pct, syn_density, cpg, cov_score, resid, redid_pctile from ccr where chrom = "{chrom}" and bin = {bin} and beg <= {pos} and end >= {pos}'.format(
            chrom = chrom, pos = pos, bin = lowbin)
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            out = {'pct': row[0], 'syn_density': row[1], 'cpg': row[2], 'cov_score':row[3], 'resid': row[4], 'resid_pct': row[5]}
            return out

    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()