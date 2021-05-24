import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):    
    def annotate(self, input_data, secondary_data=None):
        aa_321 = {
            'Asp': 'D', 'Ser': 'S', 'Gln': 'Q', 'Lys': 'K',
            'Trp': 'W', 'Asn': 'N', 'Pro': 'P', 'Thr': 'T',
            'Phe': 'F', 'Ala': 'A', 'Gly': 'G', 'Cys': 'C',
            'Ile': 'I', 'Leu': 'L', 'His': 'H', 'Arg': 'R',
            'Met': 'M', 'Val': 'V', 'Glu': 'E', 'Tyr': 'Y',
            'Ter': '*','':''}     
        hugo = input_data['hugo']
        achange = input_data['achange']
        for key, value in aa_321.items():
            achange = achange.replace(key, value)
        q = 'select evidence from dbcid where hugo = "{hugo}" and protein = "{achange}"'.format(
            hugo = hugo, achange = achange)
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            evidence = row[0]
            out = {'evidence': evidence}
            return out

    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()