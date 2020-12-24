import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
import json

class CravatAnnotator(BaseAnnotator):
    
    def annotate(self, input_data, secondary_data=None):
        q = 'select cell_type, ui, desc, germlayer, organ, sensitivity, specificity from pangalodb where hugo = "{hugo}"'.format(
            hugo = input_data['hugo'])
        self.cursor.execute(q)
        rows = self.cursor.fetchall()
        if rows is not None:
            out = {}
            precomp_data = []
            all_results = []
            cell_type_, ui_,desc_, germlayer_, organ_, sensitivity_, specificity_ = set(), set(), set(), set(), set(), set(), set()
            for row in rows:
                cell_type = row[0]
                ui = float(row[1])
                desc = row[2]
                germlayer = row[3]
                organ = row[4]
                sensitivity = float(row[5])
                specificity = float(row[6])
                result = [cell_type, ui, desc, germlayer, organ, sensitivity, specificity]
                precomp_data.append({'cell_type': cell_type, 'ui': ui, 'desc': desc, 'germlayer': germlayer, 'organ': organ, 'sensitivity': sensitivity, 'specificity': specificity, 'result': result})
            if precomp_data:
                sens = [x['sensitivity'] for x in precomp_data]
                all_results_list = [x['result'] for x in precomp_data]
                max_sens = max(sens)
                max_index = sens.index(max_sens)
                worst_mapping = precomp_data[max_index]
                worst_ct = worst_mapping['cell_type']
                worst_desc = worst_mapping['desc']
                worst_gl = worst_mapping['germlayer']
                worst_organ = worst_mapping['organ']
                worst_ui = worst_mapping['ui']
                worst_spec = worst_mapping['specificity']
                out = {'cell_type': worst_ct, 'ui': worst_ui, 'desc': worst_desc, 'germlayer': worst_gl, 'organ': worst_organ, 'sensitivity': max_sens, 'specificity': worst_spec, 'hits': all_results_list}
                return out



    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()