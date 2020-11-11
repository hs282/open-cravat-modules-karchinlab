import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
import json

class CravatAnnotator(BaseAnnotator):

    def annotate(self, input_data):
        out = {}
        hugo = input_data['hugo']
        
        q = 'SELECT dname, go_id.id, go_id.name, aspect, go_ref, evi FROM go_id join go_annotation JOIN go_name ON go_annotation.name=go_name.name and go_id.id=go_annotation.id WHERE go_annotation.name="%s";' \
            %(hugo)
        self.cursor.execute(q)
        result = self.cursor.fetchall()
        if result:
            hits = []
            for res in result:
                hits.append(res[1:6])
            out['hits'] = json.dumps(hits)
        return out
    
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
