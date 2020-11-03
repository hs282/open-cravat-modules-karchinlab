import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        q = 'select brs_penetrance, lqt_penetrance, brs_structure, lqt_structure, function, lqt, brs, unaff, other, var, hugo from arrvars where chrom = "{chrom}" and pos = {pos} and ref = "{ref}" and alt = "{alt}"'.format(
            chrom = input_data["chrom"], pos=int(input_data["pos"]), ref = input_data["ref_base"], alt = input_data["alt_base"])
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            var = row[9]
            if var == None:
                var = ''
            hugo = row[10]
            link = 'https://oates.app.vumc.org/vancart/'+ hugo + '/variant.php?q=' + var
            if link.endswith("="):
                link = ''
            return {'brs_penetrance': row[0], 'lqt_penetrance': row[1], 'brs_structure': row[2], 'lqt_structure': row[3], 'function': row[4], 'lqt' : row[5], 'brs': row[6], 'unaff': row[7], 'other': row[8], 'link': link }
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()