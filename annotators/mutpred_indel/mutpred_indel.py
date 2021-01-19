import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        hugo = input_data['hugo']
        achange = input_data['achange']
        q = 'select score, rankscore, property from indel where gene = "{hugo}" and hgvs_pro = "{achange}"'.format(
            hugo = hugo, achange = achange)
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            return {'score': row[0], 'rankscore': row[1], 'property': row[2]}
    
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()