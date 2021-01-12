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
        snps = []
        r2s = []
        dprimes = []
        for rsid in rsids:
            rsnum = int(rsid.replace('rs',''))
            q = f'select ldsnp, r2, dprime from haploreg where qsnp={rsnum}'
            self.cursor.execute(q)
            for r in self.cursor:
                snp, r2, dprime = r
                snps.append('rs'+str(snp))
                r2s.append(str(r2))
                dprimes.append(str(dprime))
        if snps and r2s and dprimes:
            out = {
                'snps': ','.join(snps),
                'r2s': ','.join(r2s),
                'dprimes': ','.join(dprimes),
            }
            return out
        else:
            return None
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
