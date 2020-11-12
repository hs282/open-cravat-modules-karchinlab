import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
import json

pred_order = {'D': 1, 'P': 2, 'B': 3}

class CravatAnnotator(BaseAnnotator):

    def setup(self): 
        pass
    
    def annotate(self, input_data, secondary_data=None):
        global pred_order
        q = f'select uniprot, hdiv_score, hdiv_rank, hdiv_pred, hvar_score, hvar_rank, hvar_pred from {input_data["chrom"]} where pos=? and alt=?'
        self.cursor.execute(q, (input_data['pos'], input_data['alt_base']))
        r = self.cursor.fetchone()
        if r:
            uniprots = r[0].split(';')
            hdiv_scores = [float(v) for v in r[1].split(';')]
            hdiv_rank = r[2]
            hdiv_preds = r[3].split(';')
            hvar_scores = [float(v) for v in r[4].split(';')]
            hvar_rank = r[5]
            hvar_preds = r[6].split(';')
            hdiv_pred = hdiv_preds[0]
            for v in hdiv_preds[1:]:
                if pred_order[v] < pred_order[hdiv_pred]:
                    hdiv_pred = v
            hvar_pred = hvar_preds[0]
            for v in hvar_preds[1:]:
                if pred_order[v] < pred_order[hvar_pred]:
                    hvar_pred = v
            results = [list(v) for v in zip(uniprots, hdiv_scores, hdiv_preds, hvar_scores, hvar_preds)]
            out = {
                'hdiv_pred': hdiv_pred,
                'hvar_pred': hvar_pred,
                'hdiv_rank': hdiv_rank,
                'hvar_rank': hvar_rank,
                'results': json.dumps(results)
            }
        else:
            out = {}
        return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
