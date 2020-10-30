import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
from pyliftover import LiftOver

class CravatAnnotator(BaseAnnotator):

    def setup(self): 
        chain_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'data', 'hg38ToHg19.over.chain')
        self.liftover = LiftOver(chain_path)
    
    def annotate(self, input_data, secondary_data=None):
        out = {}
        hg19_data = self.liftover.convert_coordinate(input_data['chrom'], int(input_data['pos']) - 1)
        if len(hg19_data) > 0:
            out['chrom'] = hg19_data[0][0]
            out['pos'] = hg19_data[0][1] + 1
        return out

if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
