import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        q = 'select lrt_score, lrt_converted_rankscore, lrt_pred, lrt_omega from {chr} where pos = {pos} and ref = "{ref}" and alt = "{alt}"'.format(
            chr = input_data["chrom"], pos = int(input_data["pos"]), ref = input_data["ref_base"], alt = input_data["alt_base"])
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            if row[2] == 'U':
                pred = 'Unknown'
            elif row[2] == 'D':
                pred = 'Damaging'
            elif row[2] == 'N':
                pred = 'Neutral'
            else:
                pred = None
            return {'lrt_score': row[0], 'lrt_converted_rankscore': row[1], 'lrt_pred': pred, 'lrt_omega': row[3]}
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()