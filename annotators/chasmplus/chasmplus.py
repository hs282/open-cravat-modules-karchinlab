import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
import stouffer

class CravatAnnotator(BaseAnnotator):

    def setup(self): 
        pval_path = os.path.join(self.annotator_dir, 'data', self.conf['pval_file'])
        self.pvals = {}
        sig3_round = lambda x: float('{:.3g}'.format(float(x)))
        with open(pval_path) as f:
            f.readline()
            for l in f:
                toks = l.strip('\r\n').split('\t')
                score = float(toks[0])
                pval = sig3_round(toks[1])
                self.pvals[score] = pval
        cnames_query = 'select name from sqlite_master where type="table" and name like "chr%%";'
        self.cursor.execute(cnames_query)
        self.available_chroms = [x[0] for x in self.cursor]
    
    def annotate(self, input_data):
        out = {}
        ref_base = input_data['ref_base']
        alt_base = input_data['alt_base']
        single_base = len(ref_base) == 1 and len(alt_base) == 1
        indel = ref_base == '-' or alt_base == '-'
        snv = single_base and not(indel)
        if not(snv):
            return out
        chrom = input_data['chrom']
        if chrom not in self.available_chroms:
            return out
        pos = input_data['pos']
        q = 'select c.score, t.transcript, t.alen from '+chrom+' as c '\
            +'join transcript as t '\
            +'on c.tid = t.tid '\
            +'where c.pos='+str(pos)+' and '\
            +'c.alt="'+alt_base+'";'
        self.cursor.execute(q)
        rows = self.cursor.fetchall()
        if len(rows) > 0:
            results = []
            max_alen_index = rows.index(max(rows, key=lambda row: row[2]))
            for i, row in enumerate(rows):
                score = row[0]
                transc = row[1]
                pvalue = self.pvals.get(score, 0.0)
                result = '{0}:({1:.3f}:{2:.3g})'.format(transc, score, pvalue)
                if i == max_alen_index:
                    out['score'] = score
                    out['transcript'] = transc
                    out['pval'] = pvalue
                    result = '*'+result
                results.append(result)
            out['results'] = (',').join(results)
        return out

    def summarize_by_gene (self, hugo, input_data):
        out = None
        in_scores = input_data['score']
        in_pvals = input_data['pval']
        scores = [s for s in in_scores if s is not None]
        pvals_non_unique = [v for v in in_pvals if v is not None]
        pvals = list(set(pvals_non_unique))
        if len(scores) > 0:
            out = {}
            raw_gene_pval = stouffer.stouffer(pvals)[1]
            out['max_score'] = max(scores)
            out['mean_score'] = round(sum(scores)/len(scores),3)
            out['gene_pval'] = round(raw_gene_pval, 3)
        return out

if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
