import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):

    def annotate(self, input_data):
        chrom = input_data['chrom']
        pos = input_data['pos']
        ref = input_data['ref_base']
        alt = input_data['alt_base']
        q = '''select global, AFR, AMR, EAS, EUR, SAS from %s where pos=%s and ref="%s" and alt="%s";''' \
            %(chrom, pos, ref, alt)
        self.cursor.execute(q)
        result = self.cursor.fetchone()
        if result:
            return {
                'af': result[0], 
                'afr_af': result[1], 
                'amr_af': result[2], 
                'eas_af': result[3], 
                'eur_af': result[4], 
                'sas_af': result[5], 
            }

    def cleanup(self):
        pass

if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()