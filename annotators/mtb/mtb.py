import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        chrom = input_data['chrom']
        pos = input_data['pos']
        ref = input_data['ref_base']
        alt = input_data['alt_base']
        link = 'https://run.opencravat.org/webapps/moleculartumorboard/index.html?chrom=' + chrom + '&pos=' + str(pos) +'&ref_base=' + ref + '&alt_base=' + alt
        return {'link': link}

    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()