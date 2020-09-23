import sys
import os
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3

class CravatAnnotator(BaseAnnotator):

    def annotate(self, input_data):
        chrom = input_data['chrom']
        ref = input_data['ref_base'].replace('-','')
        alt = input_data['alt_base'].replace('-','')
        # Filter out non-missense
        if len(ref) > 1 or len(alt) > 1:
            return
        qt = f'select sig, disease_refs, disease_names, rev_stat, id, ref, alt from {chrom} where pos=?;'
        self.cursor.execute(qt,(input_data['pos'],))
        for r in self.cursor:
            clin_ref = r[5].replace('-','')
            clin_alt = r[6].replace('-','')
            if r[0]=='Pathogenic' and len(clin_ref)==1 and len(clin_alt)==1 and clin_alt!=alt:
                return {
                    'sig':r[0],
                    'disease_refs':r[1],
                    'disease_names':r[2],
                    'rev_stat':r[3],
                    'id': r[4],
                    'clinvar_ref': r[5],
                    'clinvar_alt': r[6],
                }

        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
