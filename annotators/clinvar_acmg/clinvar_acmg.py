import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
import re

class CravatAnnotator(BaseAnnotator):
    
    def setup(self):
        pass
    
    def annotate(self, input_data, secondary_data=None):
        out = {'ps1_id':None,'pm5_id':None}
        for level in ('ps1','pm5'):
            for hit in input_data['mapping_parser'].get_all_mappings():
                pdot_match = re.match(r'p\.(\w{3})(\d+)(\w{3})$', hit.achange)
                if pdot_match:
                    aref, apos, aalt = pdot_match.groups()
                    q = f'select c.clinvar_id, t.aalt from variant as v join clinvar as c on v.alleleid=c.alleleid where v.transcript="{hit.transcript}" and v.pos={apos} and v.ref="{aref}"'
                    if level == 'ps1':
                        q += f' and v.alt="{aalt}"'
                    else:
                        q += f' and v.alt!="{aalt}"'
                    self.cursor.execute(q)
                    r = self.cursor.fetchone()
                    if r:
                        out[level+'_id'] = r[0]
                        break
        if any(out.values()):
            return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()