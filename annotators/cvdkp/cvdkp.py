import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data):
        q = 'select effect_weight, Disease from cvdkp where chr = "{chr}" AND position_hg19 = {position_hg19} AND A1 = "{A1}" AND A2 = "{A2}"'.format(
            chr = input_data["chrom"], position_hg19=int(input_data["pos"]), A2 = input_data["alt_base"], A1 = input_data["ref_base"])
        self.cursor.execute(q)
        rows = self.cursor.fetchall()
        out = {}
        for row in rows:
            if row[1] == 'IBS':
                out['ibs'] = row[0]
            elif row[1] == 'CAD':
                out['cad'] = row[0]
            elif row[1] == 'BMI and Obesity':
                out['bmi'] = row[0]
            elif row[1] == 'Atrial Fibrillation':
                out['afib'] = row[0]
            elif row[1] == 'Type 2 Diabetes':
                out['diabetes'] = row[0]
        return out

    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()