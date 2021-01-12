import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
from cravat.util import get_ucsc_bins

class CravatAnnotator(BaseAnnotator):

    def setup(self):
        self.cursor.execute('select distinct chrom from ensembl')
        self.supported_chroms |= {r[0] for r in self.cursor}

    def annotate(self, input_data, secondary_data=None):
        chrom = input_data["chrom"]
        pos = input_data["pos"]
        if chrom is None or pos is None:
            return
        lowbin = get_ucsc_bins(pos)[0]
        q = 'select region, ensr from ensembl where chrom = "{chrom}" and bin = {bin} and beg<={pos} and end>={pos}'.format(
            chrom = chrom, pos= pos, bin = lowbin)
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            out = {'region': row[0], 'ensr': row[1]}
        else:
            out = None
        return out
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()