from cravat import BaseConverter
from cravat import BadFormatError
import cravat.constants as constants
from pyliftover import LiftOver
import os
from cravat.exceptions import LiftoverFailure, InvalidData
from cravat.inout import CravatWriter
import re
from cravat import get_wgs_reader

class CravatConverter(BaseConverter):
    
    def __init__(self):
        self.format_name = 'ftdna'
        self.addl_cols = [
            {
                'name':'zygosity',
                'title':'Zygosity',
                'type':'string'
            },
        ]
    
    def check_format(self, f):
        for l in f:
            if l.startswith('#'):
                continue
            else:
                break
        f.readline()
        l = f.readline().replace('"','')
        return re.match(
            r'rs\d+,[0-9xXyYmMtT]{1,2},\d+,[TCGA-]{2}',
            l,
            ) is not None
    
    def setup(self, f):
        self.wgs = get_wgs_reader(assembly='hg19')
        self.good_vars = set(['T','C','G','A'])

    def convert_line(self, l):
        if l.startswith('#'): return self.IGNORE
        if l.upper().startswith('RSID'): return self.IGNORE
        ret = []
        toks = l.strip('\r\n').replace('"','').split(',')
        tags = toks[0]
        chrom = toks[1]
        if chrom=='MT':
            chrom = 'M'
        chrom = 'chr'+chrom.upper()
        pos = int(toks[2])
        try:
            ref = self.wgs.slice(chrom, pos).upper()
        except KeyError:
            raise InvalidData(f'Bad chrom {chrom}')
        except IndexError:
            raise InvalidData(f'Bad position {pos}')        
        sample = ''
        geno = toks[3]
        zygosity = None
        try:
            if geno[0]==geno[1]:
                zygosity = 'hom'
            else:
                zygosity = 'het'
        except IndexError:
            zygosity = 'hom'
            
        for var in geno:
            if var in self.good_vars and var != ref:
                alt = var
                wdict = {
                    'tags':tags,
                    'chrom':chrom,
                    'pos':pos,
                    'ref_base':ref,
                    'alt_base':alt,
                    'sample_id':sample,
                    'zygosity':zygosity,
                }
                ret.append(wdict)
        if not ret:
            return self.IGNORE
        if zygosity == 'hom':
            ret = ret[:1]
        return ret
