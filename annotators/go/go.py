import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):

    def annotate(self, input_data):
        out = {}
        hugo = input_data['hugo']
        
        q = 'SELECT dname, go_id.id, go_id.name, aspect, go_ref, evi FROM go_id join go_annotation JOIN go_name ON go_annotation.name=go_name.name and go_id.id=go_annotation.id WHERE go_annotation.name="%s";' \
            %(hugo)
        self.cursor.execute(q)
        result = self.cursor.fetchall()
        if result:
            id_list = []
            go_name_list = []
            aspect_list = []
            ref_list = []
            evi_list = []
            for res in result:
                id_list.append(res[1])
                go_name_list.append(res[2])
                aspect_list.append(res[3])
                ref_list.append(res[4])
                evi_list.append(res[5])
            set_asp = set(aspect_list)
            set_asp = sorted(list(set_asp))
            out['dname'] = res[0]
            out['id'] = ';'.join(id_list)
            out['name'] = ';'.join(go_name_list)
            out['aspect'] = ';'.join(aspect_list)
            out['set_asp'] = ','.join(set_asp)
            out['go_ref'] = ';'.join(ref_list)
            out['evi'] = ';'.join(evi_list)
        return out
    
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()