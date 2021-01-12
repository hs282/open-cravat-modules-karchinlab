import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
from cravat import get_ucsc_bins


class CravatAnnotator(BaseAnnotator):

    def setup(self): 
        self.cursor.execute('select name from sqlite_master where type="table"')
        self.supported_chroms = {r[0] for r in self.cursor}
    
    def annotate(self, input_data, secondary_data=None):
        out = {}
        chrom = input_data['chrom']
        pos = input_data['pos']
        bins = get_ucsc_bins(pos)
        for bin in bins:
            q = 'select sum_score, mean_score from {} where bin=? and start<=? and end>?'.format(chrom)
            self.cursor.execute(q,[bin,pos,pos])
            r = self.cursor.fetchone()
            if r:
                out['sum_score'], out['mean_score'] = r
                return out
        return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()