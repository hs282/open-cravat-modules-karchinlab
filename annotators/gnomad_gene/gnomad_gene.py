import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

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
            transcript = []
            oe_lof = []
            oe_mis = []
            oe_syn = []
            lof_z = []
            mis_z = []
            syn_z = []
            pLI = []
            pRec = []
            pNull = []
            for row in rows:
                transcript.append(row[0])
                oe_lof.append(self.myCast(row[1]))
                oe_mis.append(self.myCast(row[2]))
                oe_syn.append(self.myCast(row[3]))
                lof_z.append(self.myCast(row[4]))
                mis_z.append(self.myCast(row[5]))
                syn_z.append(self.myCast(row[6]))
                pLI.append(self.myCast(row[7]))
                pRec.append(self.myCast(row[8]))
                pNull.append(self.myCast(row[9]))
            out['transcript'] = ';'.join(transcript)
            out['oe_lof'] = ';'.join(oe_lof)
            out['oe_mis'] = ';'.join(oe_mis)
            out['oe_syn'] = ';'.join(oe_syn)
            out['lof_z'] = ';'.join(lof_z)
            out['mis_z'] = ';'.join(mis_z)
            out['syn_z'] = ';'.join(syn_z)
            out['pLI'] = ';'.join(pLI)
            out['pRec'] = ';'.join(pRec)
            out['pNull'] = ';'.join(pNull)
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
