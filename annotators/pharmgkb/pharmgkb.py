import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
import pickle
import json

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
        d = self.data.get(key)
        if d:
            out = {}
            out.update(d)
            out['chemical'] = json.dumps([list(v) for v in list(zip(out['chemical'], out['chemid']))])
        else:
            return None

        return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
