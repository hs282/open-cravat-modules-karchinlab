import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):

    def setup(self): 
        """
        Set up data sources. 
        Cravat will automatically make a connection to 
        data/example.sqlite using the sqlite3 python module. The 
        sqlite3.Connection object is stored as self.dbconn, and the 
        sqlite3.Cursor object is stored as self.cursor.
        """
        # Verify the connection and cursor exist.
        assert isinstance(self.dbconn, sqlite3.Connection)
        assert isinstance(self.cursor, sqlite3.Cursor)
    
    def annotate(self, input_data, secondary_data=None):
        """
        input_data is a dictionary containing the data from the current input 
        line. The keys depend on the level of the annotator.
        Variant level keys are: 
            ('chrom', 'pos', 'ref_base', 'alt_base')
        Gene level keys are:
            ('hugo')
        
        secondary_data is used to allow an annotator to access the output of
        other annotators. It is described in more detail in the CRAVAT 
        documentation.
        
        If there is data for a variant, annotate should return a dictionary 
        with keys matching the column names defined in example.yml.
        """

        chrom = input_data['chrom']
        pos = input_data['pos']
        ref_base = input_data['ref_base']
        alt_base = input_data['alt_base']
        query = f'select score, nseq from sift where chrom="{chrom}" and pos={pos} and ref="{ref_base}" and alt="{alt_base}";'
        self.cursor.execute(query)
        result = self.cursor.fetchone()
        if result:
            score = result[0]
            num_seq = result[1]
            if score <= 0.05:
                prediction = 'Damaging'
            else:
                prediction = 'Tolerated'
            return {
                'score': score,
                'seq_count': num_seq,
                'prediction': prediction,
            }
    
    def cleanup(self):
        """
        cleanup is called after every input line has been processed. Use it to
        close database connections and file handlers. The automatically opened
        database connections are also automatically closed.
        """
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()