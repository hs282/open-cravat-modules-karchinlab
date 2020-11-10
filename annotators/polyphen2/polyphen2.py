import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):

    def setup(self): 
        pass
    
    def annotate(self, input_data, secondary_data=None):
        q = f'select uniprot, hdiv_score, hdiv_rank, hdiv_pred, hvar_score, hvar_rank, hvar_pred from {input_data["chrom"]} where pos=? and alt=?'
        self.cursor.execute(q, (input_data['pos'], input_data['alt_base']))
        r = self.cursor.fetchone()
        if r:
            return {
                'uniprot':r[0],
                'hdiv_score':r[1],
                'hdiv_rank':r[2],
                'hdiv_pred':r[3],
                'hvar_score':r[4],
                'hvar_rank':r[5],
                'hvar_pred':r[6],
            }
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()