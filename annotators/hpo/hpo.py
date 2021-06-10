import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        out = {}
        q = 'select hpo_id, hpo_term from genes where hugo = "{hugo}"'.format(
            hugo = input_data["hugo"])
        self.cursor.execute(q)
        rows = self.cursor.execute(q)
        if rows:
            hpos = []
            terms = []
            results = []
            for row in rows:
                hpo = row[0]
                term = row[1]
                hpos.append(hpo)
                terms.append(term)
                results.append([hpo, term])
            if len(results) > 0:
                out['id'] = ';'.join(hpos)
                out['term'] = ';'.join(terms)
                out['all'] = results
                return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()