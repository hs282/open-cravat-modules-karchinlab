import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):

    def annotate(self, input_data, secondary_data=None):
        q = 'select samples from cancer where chrom = "{chrom}" and pos = {pos} and ref = "{ref}" and alt = "{alt}"'.format(
            chrom = input_data["chrom"], pos = int(input_data["pos"]), ref = input_data["ref_base"], alt = input_data["alt_base"])
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            samples = str(row[0]).replace('|', '; ')
            out = {'samples': samples}
        else:
            out = None
        return out

    def cleanup(self):
        pass
    
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()