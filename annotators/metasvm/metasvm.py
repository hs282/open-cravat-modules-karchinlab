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
        metasvm_pred = str(row[2]).replace('T', 'Tolerated')
        metasvm_pred = metasvm_pred.replace('D', 'Damaging')
        if row:
            out = {'metasvm_score': row[0], 'metasvm_rankscore': row[1], 'metasvm_pred': metasvm_pred}
        return out
    def cleanup(self):
        pass


        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()