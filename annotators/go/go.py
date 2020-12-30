import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        out = {}
        q = 'select hugo, go_id, go_name, ontology from go where hugo = "{hugo}"'.format(
            hugo = input_data['hugo'])
        self.cursor.execute(q)
        rows = self.cursor.fetchall()
        if rows is not None:
            bpo_names = []
            cco_names = []
            mfo_names = []
            bpo_ids = []
            cco_ids = []
            mfo_ids = []
            for row in rows:
                if row[3] == 'cco':
                    cco_ids.append(row[1])
                    cco_names.append(row[2])
                elif row[3] == 'bpo':
                    bpo_ids.append(row[1])
                    bpo_names.append(row[2])
                elif row[3] == 'mfo':
                    mfo_ids.append(row[1])
                    mfo_names.append(row[2])
            out['cco_name'] = ';'.join(cco_names)
            out['mfo_name'] = ';'.join(mfo_names)
            out['bpo_name'] = ';'.join(bpo_names)
            out['bpo_id'] = ';'.join(bpo_ids)
            out['cco_id'] = ';'.join(cco_ids)
            out['mfo_id'] = ';'.join(mfo_ids)
            return out

    def cleanup(self):
        pass
    
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
