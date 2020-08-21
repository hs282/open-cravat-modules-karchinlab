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
        if chrom == 'chrY':
            return out
        pos = input_data['pos']
        ref = input_data['ref_base']
        alt = input_data['alt_base']
        
        q = 'select %s from %s where pos=%s and ref="%s" and alt="%s";' \
            %(', '.join(af_col_names), chrom, pos, ref, alt)
        self.cursor.execute(q)
        qr = self.cursor.fetchone()
        if qr:
            for i, k in enumerate(af_col_names):
                out[k] = qr[i]
        return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()