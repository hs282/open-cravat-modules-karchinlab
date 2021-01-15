import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
import pickle

class CravatAnnotator(BaseAnnotator):

    def setup(self): 
        data_path = os.path.join(self.data_dir, 'pharmgkb.pickle')
        self.data = pickle.load(open(data_path,'rb'))
    
    def annotate(self, input_data, secondary_data=None):
        key = ':'.join(map(str, [
            input_data['chrom'],
            input_data['pos'],
            input_data['ref_base'],
            input_data['alt_base'],
        ]))
        hits = self.data.get(key)
        if hits:
            pharmgkb_id = hits[0]['pharmgkb_id']
            assocs = []
            for hit in hits:
                chemicals = hit['chemical']
                chem_urls = [
                    f'https://www.pharmgkb.org/chemical/{chemid}' 
                    for chemid in hit['chemid']
                ]
                assocs.append([
                    hit['pmid'],
                    hit['pheno_cat'],
                    hit['sig'],
                    hit['notes'],
                    hit['sentence'],
                    list(zip(chemicals, chem_urls)),
                ])
            return {
                'id': pharmgkb_id,
                'drug_assoc': assocs,
            }
        else:
            return None
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
