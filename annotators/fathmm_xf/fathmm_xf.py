import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
import tabix

class CravatAnnotator(BaseAnnotator):

    def setup(self): 
        gz_coding = os.path.join(self.data_dir,'fathmm_xf_coding_hg38.vcf.gz')
        self.tb_coding = tabix.open(gz_coding) 
        gz_noncoding = os.path.join(self.data_dir,'fathmm_xf_noncoding_hg38.vcf.gz')
        self.tb_noncoding = tabix.open(gz_noncoding) 

    def annotate(self, input_data, secondary_data=None):
        chrom = input_data['chrom'][3:]
        pos = input_data['pos']
        ref = input_data['ref_base'].replace('-','')
        alt = input_data['alt_base'].replace('-','')
        if len(ref) != 1 or len(alt) != 1:
            return
        try:
            records = list(self.tb_noncoding.query(chrom, pos-1, pos))
        except tabix.TabixError:
            pass
        if not records:
            try:
                records = list(self.tb_coding.query(chrom, pos-1, pos))
            except tabix.TabixError:
                return
        for record in records:
            if record[3] == alt:
                return {'score':record[4]}
    
    def cleanup(self):
        """
        cleanup is called after every input line has been processed. Use it to
        close database connections and file handlers. Automatically opened
        database connections are also automatically closed.
        """
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
