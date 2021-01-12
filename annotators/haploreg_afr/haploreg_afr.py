import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):

    def setup(self): 
        pass
    
    def annotate(self, input_data, secondary_data=None):
        if not secondary_data['dbsnp']:
            return None
        rsids = secondary_data['dbsnp'][0]['rsid'].split(',')
        all = []
        for rsid in rsids:
            rsnum = int(rsid.replace('rs',''))
            q = f'select ldsnp, r2, dprime from haploreg where qsnp={rsnum}'
            self.cursor.execute(q)
            all += [['rs'+str(r[0]),r[1],r[2],] for r in self.cursor]
        if all:
            out = {
                'all': all,
            }
            return out
        else:
            return None
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
