import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        q = 'select missense_count, lof_count from genes where hugo = "{hugo}"'.format(hugo = input_data['hugo'])
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            out = {'missense_count': row[0], 'lof_count': row[1]}
            return out

    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()