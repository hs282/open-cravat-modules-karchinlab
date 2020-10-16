import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        q = 'select fathmm_mkl_coding_score, fathmm_mkl_coding_rankscore, fathmm_mkl_coding_pred, fathmm_mkl_group from {chr} where pos = {pos} and ref = "{ref}" and alt = "{alt}"'.format(
            chr = input_data["chrom"], pos = int(input_data["pos"]), ref = input_data["ref_base"], alt = input_data["alt_base"])
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            if row[2] == 'D':
                pred = 'Damaging'
            elif row[2] == 'N':
                pred = 'Neutral'
            else:
                pred = None
            return {'fathmm_mkl_coding_score': row[0], 'fathmm_mkl_coding_rankscore': row[1], 'fathmm_mkl_coding_pred': pred, 'fathmm_mkl_group': row[3]}
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()