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
        for hit in input_data['mapping_parser'].get_all_mappings():
            if not hit.achange:
                continue
            if not out['ps1_id']:
                q_base = f'select c.clinvar_id from variant as v join clinvar as c on v.alleleid=c.alleleid where v.transcript="{hit.transcript}"'
                q_ps1 = q_base + f' and v.hgvsp="{hit.achange}"'
                self.cursor.execute(q_ps1)
                r = self.cursor.fetchone()
                if r:
                    out['ps1_id'] = r[0]
            if not out['pm5_id']:
                pdot_match = re.match(r'p\.([A-Za-z]{3})(\d+)([A-Za-z]{3})$', hit.achange)
                if pdot_match:
                    aref, apos, aalt = pdot_match.groups()
                    q_pm5 = q_base + f' and v.pos={apos} and v.ref="{aref}" and v.alt!="{aalt}"'
                    self.cursor.execute(q_pm5)
                    r = self.cursor.fetchone()
                    if r:
                        out['pm5_id'] = r[0]
        if any(out.values()):
            return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()