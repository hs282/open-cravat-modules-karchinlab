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
        dbsnp_result = secondary_data['dbsnp'][0].get('snp')
        if dbsnp_result is None:
            dbsnp_result = secondary_data['dbsnp'][0].get('rsid')
        if dbsnp_result is None:
            return None
        rsids = dbsnp_result.split(',')
        if rsids:
            one = rsids[0]
            out = {'rsid': one}
        return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()