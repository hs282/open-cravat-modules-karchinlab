import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
import json

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        out = {}
        q = 'select hugo, go_id, ontology from go where hugo = "{hugo}"'.format(
            hugo = input_data['hugo'])
        self.cursor.execute(q)
        rows = self.cursor.fetchall()
        if rows is not None:
            cco_ = []
            bpo_ = []
            mfo_ = []
            for row in rows:
                if row[2] == 'cco':
                    cco_.append(row[1])
                elif row[2] == 'bpo':
                    bpo_.append(row[1])
                elif row[2] == 'mfo':
                    mfo_.append(row[1])
            out['cco_'] = ';'.join(cco_)
            out['bpo_'] = ';'.join(bpo_)
            out['mfo_'] = ';'.join(mfo_)
        return out

    def cleanup(self):
        pass
    
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()