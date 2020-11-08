import sys
import os
from cravat import BasePostAggregator
from cravat import InvalidData
import sqlite3
from collections import defaultdict
from scipy.stats import fisher_exact

class CravatPostAggregator (BasePostAggregator):

    def check(self):
        return 'cohorts' in self.confs

    def setup (self):
        self.cohorts = defaultdict(set)
        with open(self.confs['cohorts']) as f:
            for l in f:
                toks = l.strip().split()
                self.cohorts[toks[1]].add(toks[0])
        self.case_samples = self.cohorts['case']
        self.cont_samples = self.cohorts['control']
        self.cursor_samples = self.dbconn.cursor()
        self.qt_samples = 'select base__sample_id from sample where base__uid=?'
        q = 'select distinct base__sample_id from sample'
        self.cursor_samples.execute(q)
        self.all_samples = {r[0] for r in self.cursor_samples}
        self.cohort_samples = self.all_samples & (self.case_samples | self.cont_samples)
    
    def cleanup (self):
        pass
        
    def annotate (self, input_data):
        self.cursor_samples.execute(self.qt_samples,(input_data['base__uid'],))
        samples = {r[0] for r in self.cursor_samples}
        table = [
            [len(self.case_samples&samples), len(self.case_samples-samples)],
            [len(self.cont_samples&samples), len(self.cont_samples-samples)]
        ]
        pvalue = fisher_exact(table,'greater')[1]
        return {
            'dom_pvalue': pvalue
        }

if __name__ == '__main__':
    summarizer = CravatPostAggregator(sys.argv)
    summarizer.run()
