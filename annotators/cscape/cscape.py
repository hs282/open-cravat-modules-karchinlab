import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
import tabix

class CravatAnnotator(BaseAnnotator): 
    def setup(self):
        dir_path = os.path.dirname(os.path.realpath(__file__))
        datafile_path = os.path.join(dir_path, "data", "cscape.bed.bgz")
        self.tb = tabix.open(datafile_path)
        pass

    def annotate(self, input_data, secondary_data=None):
        out = {}
        chrom = str(input_data["chrom"])
        pos = int(input_data["pos"])
        ref = input_data["ref_base"]
        alt = input_data["alt_base"]
        records = self.tb.query(chrom, pos - 1, pos)
        for record in records:
            alts = record[3]
            if alt in alts:
                score = record[4]
                out['score'] = score
                return out

    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()