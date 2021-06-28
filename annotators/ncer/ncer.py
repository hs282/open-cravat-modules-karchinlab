import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
from cravat.util import get_ucsc_bins

class CravatAnnotator(BaseAnnotator):

    def setup(self): 
        assert isinstance(self.dbconn, sqlite3.Connection)
        assert isinstance(self.cursor, sqlite3.Cursor)
        self.cursor.execute('select name from sqlite_master where type="table"')
        if hasattr(self, 'supported_chroms'):
            self.supported_chroms |= {r[0] for r in self.cursor}
        else:
            self.supported_chroms = {r[0] for r in self.cursor}

    def annotate(self, input_data, secondary_data=None):
        chrom = input_data['chrom']
        pos = input_data['pos']
        if chrom is None or pos is None:
            return
        lowbin = get_ucsc_bins(pos)[0]
        q =  'select score from {chrom} where bin={bin} and beg<={pos} and end>={pos}'.format(chrom = chrom ,pos = pos, bin=lowbin)
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            return {'score': row[0]}
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()