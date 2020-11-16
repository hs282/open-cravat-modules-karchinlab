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
        stmt = 'SELECT uniprot_acc, ensembl_transcriptid, interpro_domain FROM {chr} WHERE pos = {pos} AND alt = "{alt}"'.format(chr=input_data["chrom"], pos=int(input_data["pos"]), alt = input_data["alt_base"])
        self.cursor.execute(stmt)
        row = self.cursor.fetchone()
        if row is not None:
            domains = [None if v == '.' else v for v in row[2].split(';')]
            accs = row[0].split(';')
            trs = row[1].split(';')
            hits = [list(v) for v in zip(domains, accs, trs)]
            out['domain'] = json.dumps(list(set([v for v in domains if v is not None])))
            out['all'] = json.dumps(hits)
            return out
    
    def cleanup(self):
        self.dbconn.close()
        pass

    def summarize_by_gene (self, hugo, input_data):
        domains = []
        for domain in input_data['domain']:
            if domain is None:
                continue
            ds = domain.split(';')
            for d in ds:
                if d == '.':
                    continue
                es = d.split('|')
                for e in es:
                    if e not in domains:
                        domains.append(e)
        if len(domains) == 0:
            out = None
        else:
            out = {'domain': ';'.join(domains)}
            return out

if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
