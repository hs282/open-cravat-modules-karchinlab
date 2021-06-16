import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
import tabix
class CravatAnnotator(BaseAnnotator):

    def setup(self): 
        datafile = os.path.join(self.data_dir,'cadd.tsv.gz')
        self.tb = tabix.open(datafile) 
    
    def annotate(self, input_data, secondary_data=None):
        chrom = input_data['chrom'][3:]
        pos = input_data['pos']
        ref = input_data['ref_base']
        alt = input_data['alt_base']
        try:
            records = list(self.tb.query(chrom, pos - 1, pos))
        except tabix.TabixError:
            pass
        for record in records:
            if record[3] == alt:
                return {'score':record[4], 'phred': record[5]}
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()