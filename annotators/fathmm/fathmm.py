import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):

    def setup(self): 
        dir_path = os.path.dirname(os.path.realpath(__file__))
        db_path = os.path.join(dir_path, "data", "FATHMM.db")
        self.conn = sqlite3.connect(db_path)
        self.curs = self.conn.cursor()
        assert isinstance(self.conn, sqlite3.Connection)
        assert isinstance(self.curs, sqlite3.Cursor)
        self.curs.execute('select name from sqlite_master where type="table"')
        self.supported_chroms |= {r[0] for r in self.curs}
    
    def annotate(self, input_data, secondary_data=None):
        out = {}
        stmt = 'SELECT ens_tid, ens_pid, fathmm_score, fathmm_rscore, fathmm_pred FROM {chr} WHERE pos = {pos} AND alt = "{alt}"'.format(chr=input_data["chrom"], pos=int(input_data["pos"]), alt = input_data["alt_base"])
        self.curs.execute(stmt)
        row = self.curs.fetchone()
        if row is not None:
            out['ens_tid'] = row[0]
            out['ens_pid'] = row[1]
            out['fathmm_score'] = row[2]
            out['fathmm_rscore'] = float(row[3])
            out['fathmm_pred'] = row[4]
        return out
    
    def cleanup(self):
        self.conn.close()
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()