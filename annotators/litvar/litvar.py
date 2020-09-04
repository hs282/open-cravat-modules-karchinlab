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
        rsids = secondary_data['dbsnp'][0]['snp'].split(',')
        if rsids:
            one = rsids[0]
            out = {'rsid': one}
        return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()