import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        q = 'select fathmm_xf_coding_score, fathmm_xf_coding_rankscore, fathmm_xf_coding_pred from {chr} where pos = {pos} and ref = "{ref}" and alt = "{alt}"'.format(
            chr = input_data["chrom"], pos = int(input_data["pos"]), ref = input_data["ref_base"], alt = input_data["alt_base"])
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            pred = str(row[2]).replace('N', 'Neutral')
            pred = pred.replace('D', 'Damaging')
            out = {'fathmm_xf_coding_score': row[0], 'fathmm_xf_coding_rankscore': row[1], 'fathmm_xf_coding_pred': pred}
        else:
            out = None
        return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()