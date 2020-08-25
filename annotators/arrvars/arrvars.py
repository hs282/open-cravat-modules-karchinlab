import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        q = 'select total_carriers, lqt3, brs1, unaff, other, brs1_penetrance, lqt3_penetrance, Function, Structure, var from scn5a where chrom = "{chrom}" and pos = {pos} and ref = "{ref}" and alt = "{alt}"'.format(
            chrom = input_data["chrom"], pos=int(input_data["pos"]), ref = input_data["ref_base"], alt = input_data["alt_base"])
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            out = {'total_carriers': row[0], 'lqt3': row[1], 'brs1': row[2], 'unaff': row[3], 'other': row[4], 'brs1_penetrance' : row[5], 'lqt3_penetrance': row[6], 'Function': row[7], 'Structure': row[8], 'var': row[9]}
        else:
            out = None
        return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()