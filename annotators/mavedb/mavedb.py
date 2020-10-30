import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        hugo = input_data['hugo']
        achange = input_data['achange']
        q = 'select score, accession from mavedb where hugo = "{hugo}" and hgvs_pro = "{achange}"'.format(
            hugo = hugo, achange = achange)
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        accession = row[1]
        if row:
            out = {'score': row[0], 'accession': accession, 'vis': accession}
        else:
            out = {}
        return out

    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
