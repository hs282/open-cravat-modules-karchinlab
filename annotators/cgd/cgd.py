import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        hugo = input_data['hugo']
        q = 'select condition,inheritance, age_group, allelic_conditions, manifestation, intervention from genes where gene = "{hugo}"'.format(
            hugo = hugo)
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            precomp_data = []
            condition = row[0]
            inheritance = row[1]
            age_group = row[2]
            allelic_conditions = row[3]
            manifestation =  row[4]
            intervention = row[5]
            link = 'https://research.nhgri.nih.gov/CGD/view/?t=' + hugo + ' &par=general:gene,conditions:manifestation,intervention:All&g=' + hugo
            if allelic_conditions:
                for a in [v.strip() for v in allelic_conditions.split(';')]:
                    for c in [v.strip() for v in condition.split(';')]:
                        cgd_results = [c, inheritance,age_group, a, manifestation, intervention, link]
                        precomp_data.append({'condition': condition, 'inheritance': inheritance, 'age': age_group, 'manifestation': manifestation,'intervention': intervention,'link': link, 'full_result': cgd_results})
                if precomp_data:
                    all_results_list = [x['full_result'] for x in precomp_data]
                out = {'condition': row[0], 'inheritance': row[1], 'age_group': row[2], 'allelic_conditions': row[3],
                'manifestation': row[4], 'intervention': row[5],'link': link, 'all': all_results_list}
                return out
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()