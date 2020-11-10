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
                nhlbi_list.append(str(nhlbi))
                pmid_list.append(str(pmid))
                pvalue = '{:.3e}'.format(pvalue)
                pheno_list.append(phenotype + '(' + str(pvalue) + ')')
            out['nhlbi'] = '|'.join(nhlbi_list)
            out['pmid'] = '|'.join(pmid_list)
            out['phenotype'] = '|'.join(pheno_list)
        return out

if __name__ == '__main__':
    module = CravatAnnotator(sys.argv)
    module.run()