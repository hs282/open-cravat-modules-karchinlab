import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
import json

class CravatAnnotator(BaseAnnotator):

    def setup(self): 
        assert isinstance(self.dbconn, sqlite3.Connection)
        assert isinstance(self.cursor, sqlite3.Cursor)
    
    def annotate(self, input_data, secondary_data=None):
        out = {}
        hugo = input_data['hugo']
        self.cursor.execute('SELECT transcript,oe_lof,oe_mis,oe_syn,lof_z,mis_z,syn_z,pLI,pRec,pNull FROM genes WHERE gname= ?;', [hugo])
        rows = self.cursor.fetchall()
        if rows is not None:
            transcript = None
            oe_lof = None
            oe_mis = None
            oe_syn = None
            lof_z = None
            mis_z = None
            syn_z = None
            pLI = None
            pRec = None
            pNull = None
            all_results = []
            max_pLI = 0.0
            for row in rows:
                (
                    tmp_transcript,
                    tmp_oe_lof,
                    tmp_oe_mis,
                    tmp_oe_syn,
                    tmp_lof_z,
                    tmp_mis_z,
                    tmp_syn_z,
                    tmp_pLI,
                    tmp_pRec,
                    tmp_pNull
                ) = row
                all_results.append(list(row))
                if tmp_pLI is not None and tmp_pLI > max_pLI:
                    (
                        transcript,
                        oe_lof,
                        oe_mis,
                        oe_syn,
                        lof_z,
                        mis_z,
                        syn_z,
                        pLI,
                        pRec,
                        pNull
                    ) = row
            out['transcript'] = transcript
            out['oe_lof'] = oe_lof
            out['oe_mis'] = oe_mis
            out['oe_syn'] = oe_syn
            out['lof_z'] = lof_z
            out['mis_z'] = mis_z
            out['syn_z'] = syn_z
            out['pLI'] = pLI
            out['pRec'] = pRec
            out['pNull'] = pNull
            out['all_results'] = json.dumps(all_results)
        return out
    
    def cleanup(self):
        pass
    
    def myCast(self, item):
        if item is None:
            return 'NA'
        else:
            return str(item)
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
