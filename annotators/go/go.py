import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def setup(self): 
        self.cursor.execute('select go_id, name from go_name;')
        self.mid2mech = {row[0]:row[1] for row in self.cursor}

    def annotate(self, input_data, secondary_data=None):
        out = {}
        q = 'select hugo, go_id, go_aspect from go_annotation where hugo = "{hugo}"'.format(
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
                if row[2] == 'cco':
                    cco_ids.append(row[1])
                    cco_names.append(self.mid2mech[row[1]])
                elif row[2] == 'bpo':
                    bpo_ids.append(row[1])
                    bpo_names.append(self.mid2mech[row[1]])
                elif row[2] == 'mfo':
                    mfo_ids.append(row[1])
                    mfo_names.append(self.mid2mech[row[1]])
                else:
                    continue
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
