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
        q = 'select acc_d, acc_e, _group, bound from screen where chrom = "{chrom}" and bin={bin} and beg<={pos} and end>={pos}'.format(
            chrom = chrom ,pos = pos, bin=lowbin)
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            if row[3] == 'CTCF-bound':
                bound = 'Yes'
            else:
                bound = None
            return {'acc_d': row[0], 'acc_e': row[1], '_group': row[2], 'bound': bound}
            
    def cleanup(self):
            pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()