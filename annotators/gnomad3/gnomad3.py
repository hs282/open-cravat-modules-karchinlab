import sys
import os
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3

class CravatAnnotator(BaseAnnotator):

    def annotate(self, input_data):
        af_col_names = ['af','af_afr','af_amr','af_asj','af_eas',
                        'af_fin','af_nfe','af_oth', 'af_sas']
        out = {x:'' for x in af_col_names}

        chrom = input_data['chrom']
        pos = input_data['pos']
        ref = input_data['ref_base']
        alt = input_data['alt_base']
        
        q = 'select {} from {} where pos=? and ref=? and alt=?'.format(
            ', '.join(af_col_names),
            chrom
        )
        self.cursor.execute(q, (pos, ref, alt))
        qr = self.cursor.fetchone()
        if qr:
            for i, k in enumerate(af_col_names):
                out[k] = qr[i]
            # Patch in latino for american
            out['af_lat'] = out['af_amr']
            del out['af_amr']
            return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
