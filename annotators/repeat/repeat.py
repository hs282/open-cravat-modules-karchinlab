import sys
import os
import sqlite3
from cravat import BaseAnnotator
from cravat import InvalidData
from cravat.util import get_ucsc_bins

class CravatAnnotator (BaseAnnotator):

    def annotate(self, input_data):
        out = {}
        
        chrom = input_data['chrom']
        start = input_data['pos']
        ref = input_data['ref_base']
        alt = input_data['alt_base']
        reflen = len(ref)
        altlen = len(alt)
        if reflen == 1 and altlen == 1:
            end = start
        elif reflen == 1 and altlen > 1:
            end = start
        elif altlen == 1 and reflen > 1:
            end = start + reflen - 1
        elif reflen > 1 and altlen > 1:
            end = start + reflen - 1
        
        out = {'repeatclass': [],
               'repeatfamily': [],
               'repeatname': []}
        
        has_annotation = False
        bins = get_ucsc_bins(start, end)
        for bin in bins:
            query = 'select class, family, name ' +\
                'from repeat ' +\
                'where binno=' + str(bin) + ' and ' +\
                'chrom="' + chrom + '" and ' +\
                'start<=' + str(end) + ' and end>=' + str(start)
            self.cursor.execute(query) 
            results = self.cursor.fetchall()
            
            if len(results) == 0:
                continue
            
            for result in results:
                has_annotation = True
                (repeat_class, repeat_family, repeat_name) = result
                out['repeatclass'].append(repeat_class)
                out['repeatfamily'].append(repeat_family)
                out['repeatname'].append(repeat_name)
        if has_annotation:
            out['repeatclass'] = ','.join(out['repeatclass'])
            out['repeatfamily'] = ','.join(out['repeatfamily'])
            out['repeatname'] = ','.join(out['repeatname'])
            return out

if __name__ == '__main__':
    module = CravatAnnotator(sys.argv)
    module.run()