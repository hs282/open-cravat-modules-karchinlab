import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
import json
import re

class CravatAnnotator(BaseAnnotator):

    def annotate(self, input_data):
        out = {}
        chrom = input_data['chrom']
        pos = input_data['pos']
        ref = input_data['ref_base']
        alt = input_data['alt_base']
        cravat_hugo = input_data['hugo']
        achange = input_data['achange']
        aa_321 = {
        'Asp': 'D', 'Ser': 'S', 'Gln': 'Q', 'Lys': 'K',
        'Trp': 'W', 'Asn': 'N', 'Pro': 'P', 'Thr': 'T',
        'Phe': 'F', 'Ala': 'A', 'Gly': 'G', 'Cys': 'C',
        'Ile': 'I', 'Leu': 'L', 'His': 'H', 'Arg': 'R',
        'Met': 'M', 'Val': 'V', 'Glu': 'E', 'Tyr': 'Y',
        'Ter': '*','':''}
        if achange:
            for key, value in aa_321.items():
                achange = achange.replace(key, value)
        mut_type = self.get_cosmic_mut_type(ref, alt)
        q = 'select cosmic_id, accession, aachange_cosmic, primarysites, primarysitenos, occurrences, genename '\
            +'from cosmic_genomic where chromosome="%s" and position=%s and mutation_type="%s" and refbase="%s" and altbase="%s";'\
                %(chrom, pos, mut_type, ref, alt)
        self.cursor.execute(q)
        headers = [x[0] for x in self.cursor.description]
        primary_rd = {}
        lock_primary_rd = False
        has_results = False
        for r in self.cursor:
            has_results = True
            match = "Exact Match"
        if not has_results:
            q = 'select cosmic_id, accession, aachange_cosmic, primarysites, primarysitenos, occurrences, genename '\
            +'from cosmic_genomic where genename="%s" and aachange_cosmic="%s" and mutation_type="%s"'\
                %(cravat_hugo, achange, mut_type)
            match = 'Protein Change'
        self.cursor.execute(q)
        has_results = False
        for r in self.cursor:
            has_results = True
        if not has_results:
            q = 'select cosmic_id, accession, aachange_cosmic, primarysites, primarysitenos, occurrences, genename '\
            +'from cosmic_genomic where chromosome="%s" and position=%s and mutation_type="%s"'\
                %(chrom, pos, mut_type)
            match = 'Genomic Location'
        self.cursor.execute(q)
        for r in self.cursor:
            has_results = True
            rd = dict(zip(headers,r))
            if not(lock_primary_rd):
                if rd['genename'] == cravat_hugo:
                    primary_rd = rd
                    lock_primary_rd = True
                elif len(rd['genename']) > len(primary_rd.get('genename','')):
                    primary_rd = rd
        if has_results:
            out['cosmic_id'] = primary_rd['cosmic_id']
            out['transcript'] = primary_rd['accession']
            out['protein_change'] = primary_rd['aachange_cosmic'].replace('p.','')
            out['variant_count'] = primary_rd['occurrences']
            site_list = zip(primary_rd['primarysites'].split(';'),
                            primary_rd['primarysitenos'].split(';'))
            #site_toks = ['%s(%s)' %(site,n) for site,n in site_list]
            site_toks = sorted([[site, int(n)] for site, n in site_list], key=lambda x: x[1], reverse=True)
            #out['variant_count_tissue'] = ';'.join(site_toks)
            out['variant_count_tissue'] = site_toks
            out['match'] = match
        return out
    
    def get_cosmic_mut_type(self, ref, alt): #THIS VERSION DOESN'T USE crx
        if ref == '-' and alt != '-':
            if len(alt)%3 == 0:
                mut_type = 'ii'
            else:
                mut_type = 'fi'
        elif ref != '-' and alt == '-':
            if len(ref)%3 == 0:
                mut_type = 'id'
            else:
                mut_type = 'fd'
        else:
            if ref == alt:
                mut_type = None
            elif len(ref) == len(alt):
                mut_type = 'snp'
            else:
                mut_type = 'cs'
        return mut_type
    
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
