import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
from cravat.util import get_ucsc_bins

class CravatAnnotator(BaseAnnotator):

    def annotate(self, input_data):
        out = {}
        hugo = input_data['hugo']
        sql = 'select networkid from hugo2network where hugo="' + hugo + '"'
        self.cursor.execute(sql)
        networkids = self.cursor.fetchall()
        if len(networkids) > 0:
            networknames = []
            networkids = [v[0] for v in networkids]
            for networkid in networkids:
                sql = 'select networkname from network where ' +\
                    'networkid="' + networkid + '"'
                self.cursor.execute(sql)
                networkname = self.cursor.fetchone()
                if networkname != None:
                    networkname = networkname[0]
                else:
                    networkname = ''
                networknames.append(networkname)
            out['numhit'] = len(networkids)
            out['networkid'] = ','.join(networkids)
            out['networkname'] = ','.join(networknames)
        return out

if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
