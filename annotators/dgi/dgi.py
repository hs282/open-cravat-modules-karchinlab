import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):    
    def annotate(self, input_data, secondary_data=None):
        q = 'select interaction, name, chembl, score, pmid, cats from gene where hugo = "{hugo}"'.format(
            hugo = input_data["hugo"])
        self.cursor.execute(q)
        rows = self.cursor.fetchall()
        if rows:
            data = []
            for row in rows:
                interaction = row[0]
                name = row[1].upper()
                chembl = row[2]
                score = row[3]
                pmid = row[4]
                cats = row[5]
                dgi = [cats, interaction, name,score, chembl, pmid]
                if score:
                    score = float(row[3])
                    data.append({'cats': cats,'interaction': interaction, 'name': name, 'chembl': chembl, 'score':score, 'pmid': pmid, 'full': dgi})
            if data:
                all_results_list = [x['full'] for x in data]
                scores = [x['score'] for x in data]
                max_scores = max(scores)
                max_index = scores.index(max_scores)
                mapping = data[max_index]
                cats_ = mapping['cats']
                interaction_ = mapping['interaction']
                name_ = mapping['name']
                chembl_ = mapping['chembl']
                pmid_ = mapping['pmid']
                out = {'category': cats_, 'interaction': interaction_, 'name': name_,'score': max_scores, 'chembl': chembl_, 'pmid': pmid_, 'all': all_results_list}
                return out

    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()