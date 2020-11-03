import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
import re
import json

class CravatAnnotator(BaseAnnotator):

    def setup(self):
        self.cursor.execute('select mech_id, mech_name from mechanisms')
        self.mid2mech = {row[0]:row[1] for row in self.cursor}
        pass
    
    def expand_mechanisms(self, mechs_compact):
        matches = re.finditer(r'{(\d+)}', mechs_compact)
        mechs_full = mechs_compact
        for match in matches:
            mid = int(match.group(1))
            mech_name = self.mid2mech[mid]
            placeholder = match.group(0)
            mechs_full = mechs_full.replace(placeholder, mech_name)
        return mechs_full

    def annotate(self, input_data, secondary_data=None):
        # input_data['chrom'] is formatted as chr1, chr2, chrX etc. The chrom
        # column of the database omits the 'chr'. Need to convert formats.
        chrom = input_data['chrom'].replace('chr', '')

        # Construct the query as a string
        #prot_query = 'select external_protein_id from mutpred_precomputed where chr="%s" and position="%s" and ref="%s" and alt="%s"' % chrom, pos, ref_base, alt_base
        #aa_query = 'select amino_acid_substitution from mutpred_precomputed where chr="%s" and position="%s" and ref="%s" and alt="%s"' % chrom, pos, ref_base, alt_base
        #general_query = 'select mutpred_general_score from mutpred_precomputed where chr="%s" and position="%s" and ref="%s" and alt="%s"' % chrom, pos, ref_base, alt_base
        #mech_query = 'select mutpred_top5_mechanisms from mutpred_precomputed where chr="%s" and position="%s" and ref="%s" and alt="%s"' % chrom, pos, ref_base, alt_base
        query = 'select external_protein_id, amino_acid_substitution, mutpred_general_score, mutpred_top5_mechanisms from mutpred_precomputed where chr="%s" and position="%s" and alt="%s"' % (chrom, input_data['pos'], input_data['alt_base'])
        # Execute the query and store the result, if it exists.
        self.cursor.execute(query)
        result = self.cursor.fetchone()

        external_protein_id = None
        amino_acid_substitution = None
        mutpred_general_score = None
        mutpred_top5_mechanisms = []
        if result is not None:
            # Absent values are returned as None from the db
            external_protein_id = result[0]
            amino_acid_substitution = result[1]
            mutpred_general_score = result[2]
            # Top 5 mechanisms stored in compact form, must be expanded
            #mutpred_top5_mechanisms = self.expand_mechanisms(result[3])
            mutpred_top5_mechanisms = []
            top5tmp = self.expand_mechanisms(result[3])
            for r in [v.strip() for v in top5tmp.split(';')]:
                [v1, v2] = r.split('(')
                mechanism = v1.strip()
                pvalue = float(v2.split('=')[1].split(')')[0])
                mutpred_top5_mechanisms.append([mechanism, pvalue])
        
        out = {}
        out['external_protein_id'] = external_protein_id
        out['amino_acid_substitution'] = amino_acid_substitution
        out['mutpred_general_score'] = mutpred_general_score
        out['mutpred_top5_mechanisms'] = json.dumps(mutpred_top5_mechanisms)
        return out
    
    def cleanup(self):
        """
        cleanup is called after every input line has been processed. Use it to
        close database connections and file handlers. Automatically opened
        database connections are also automatically closed.
        """
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
