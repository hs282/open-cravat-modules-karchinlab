import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        q = 'select ds_ag, ds_al, ds_dg, ds_dl, dp_ag, dp_al, dp_dg, dp_dl from {chrom} where pos = {pos} and ref = "{ref}" and alt = "{alt}"'.format(
            chrom = input_data["chrom"], pos = int(input_data["pos"]), ref = input_data["ref_base"], alt = input_data["alt_base"])
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            return {'ds_ag': row[0], 'ds_al': row[1], 'ds_dg': row[2], 'ds_dl': row[3], 'dp_ag': row[4], 'dp_al': row[5], 'dp_dg': row[6], 'dp_dl': row[7]}

    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()