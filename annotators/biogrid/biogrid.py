import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        out = {}
        hugo = input_data['hugo']
        q = 'select geneB, interaction_method, pubmed, interaction_type, interactid, id from biogrid_id left join evidence on biogrid_id.gname=evidence.geneA where biogrid_id.gname = "{hugo}"'.format(
            hugo = hugo)
        self.cursor.execute(q)
        rows = self.cursor.fetchall()
        if rows is not None:
            precomp_data = []
            acts = set()
            for row in rows:
                acts.add(row[0])
                method = row[1]
                pubmed = row[2]
                types = row[3]
                interactid = row[4]
                biogrid_result = [row[0], method, pubmed, types, interactid]
                precomp_data.append({'all_results': biogrid_result})
                out['id'] = row[5]
            glist = list(acts)
            glist.sort()
            glist = filter(None, glist)
            out['acts'] = ';'.join(glist)
            if precomp_data:
                all_results_list = [x['all_results'] for x in precomp_data]
                out['all'] = all_results_list  
            
        return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
