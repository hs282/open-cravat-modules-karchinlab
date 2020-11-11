import sys
import os
import sqlite3
from cravat import BaseAnnotator

class CravatAnnotator (BaseAnnotator):

    def setup(self):
        self.query_template = 'select nhlbi, pmid, pvalue, phenotype from grasp where chrom=? and pos=? order by pvalue;'

    def annotate(self, input_data):
        out = {}
        
        chrom = input_data['chrom']
        pos = input_data['pos']        
        self.cursor.execute(self.query_template, [chrom, pos]) 
        results = self.cursor.fetchall()
        if len(results) > 0:
            nhlbi_list = []
            pmid_list = []
            pheno_list = []
            for result in results:
                nhlbi, pmid, pvalue, phenotype = result
                phenotypes.add(phenotype)
                hits.append([nhlbi, pmid, phenotype, pvalue])
            phenotypes = list(phenotypes)
            phenotypes.sort()
            out['phenotype'] = ';'.join(phenotypes)
            out['results'] = json.dumps(hits)
        return out

if __name__ == '__main__':
    module = CravatAnnotator(sys.argv)
    module.run()
