import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    
    def annotate(self, input_data, secondary_data=None):
        q = 'select metasvm_score, metasvm_rankscore, metasvm_pred from {chr} where pos = {pos} and ref = "{ref}" and alt = "{alt}"'.format(
            chr = input_data["chrom"] ,pos=int(input_data["pos"]), alt = input_data["alt_base"], ref = input_data["ref_base"])
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            if row[2] == 'T':
                pred = 'Tolerated'
            elif row[2] == 'D':
                pred = 'Damaging'
            else:
                pred = None
            out = {'score': row[0], 'rankscore': row[1], 'pred': pred}
            return out
    
    def cleanup(self):
        pass


        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()