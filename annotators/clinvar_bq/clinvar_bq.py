import sys
import os
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
from google.cloud import bigquery


class CravatAnnotator(BaseAnnotator):

    def setup(self):
        self.bq_client = bigquery.Client()

    def annotate(self, input_data):
        project = 'oc-bigquery'
        dataset = 'oc_clinvar'
        chrom = input_data['chrom']
        pos = input_data['pos']
        ref = input_data['ref_base']
        alt = input_data['alt_base']
        q = f'select * from {project}.{dataset}.{chrom} where pos={pos} and ref="{ref}" and alt="{alt}";'
        print(q)
        job = self.bq_client.query(q, location='us-east1')
        result = job.result(page_size=1)
        if result.total_rows > 0:
            return dict(next(iter(result)))

        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
