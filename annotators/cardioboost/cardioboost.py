import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    
    def annotate(self, input_data, secondary_data=None):
        q = 'select pathogenicity, classification, Phenotype from cardio where chrom = "{chrom}" and pos = {pos} and ref = "{ref}" and alt = "{alt}"'.format(
            chrom = input_data["chrom"] ,pos=int(input_data["pos"]), alt = input_data["alt_base"], ref = input_data["ref_base"])
        self.cursor.execute(q)
        rows = self.cursor.fetchall()
        out = {}
        for row in rows:
            if row[2] == 'Cardiomyopathy':
                out['cardiomyopathy'] = row[0]
                out['cardiomyopathy1'] = row[1]
                
            elif row[2] == 'Arrhythmias':
                out['arrhythmias'] = row[0]
                out['arrhythmias1'] = row[1]     
        return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()

 