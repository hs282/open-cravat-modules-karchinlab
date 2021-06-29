from cravat import BaseConverter
from cravat import BadFormatError
import cravat
from cravat import BaseAnnotator
from cravat import BaseCommonModule
from cravat import InvalidData
import re
import os
import sqlite3
import subprocess
import re
from cravat import get_wgs_reader

class CravatConverter(BaseConverter):

    def __init__(self):
        self.format_name = 'nongenomic'

    def check_format(self, f):
        return f.readline().startswith('#annotation')

    def setup(self, f):
        self.assembly = self.input_assembly
        if self.assembly == 'hg19':
            self.wgs = get_wgs_reader(assembly='hg19')
            self.refversion = 'hg19'
        elif self.assembly == 'hg38':
            self.wgs = get_wgs_reader(assembly='hg38')
            self.refversion = 'hg38'

    def convert_line(self, l):
        if l.startswith('#'):
            return self.IGNORE
        toks = l.rstrip('\r\n').split()
        annotation = toks[0]
        sample_id = toks[1] if len(toks) > 1 else None
        tags = toks[2] if len(toks) > 2 else None
        if ':p.' in annotation:
            query = "transvar panno -i " + annotation  + " --ucsc --refversion " + self.refversion
        elif ':c.' in annotation:
            query = "transvar canno -i " + '"' + annotation + '"'  + " --ccds --refversion " + self.refversion
        elif ':g.' in annotation:
            query = "transvar ganno -i " + '"' + annotation + '"'  + " --ccds --refversion " + self.refversion
        output = subprocess.Popen(query, shell=True, stdout=subprocess.PIPE)
        out = []
        for line in output.stdout.readlines():
            dline  = line.decode('utf-8')
            d = dline.rstrip('\r').split()
            if d[5] != 'region':
                gene = d[3]
                wdict = {}
                g = str(d[5]).strip().split("/")
                achange = g[2]
                if '>' in g[0]:
                    match = re.match(r'(chr\d+):g.(\d+)([ATCG])>([ATCG])', g[0])
                    if match:
                        chrom, start, ref, alt = match.groups()
                elif 'del' in g[0] and '_' not in g[0] and 'delins' not in g[0]:
                    match = re.match(r'(chr\d+):g.(\d+)del([ATCG])', g[0])
                    if match:
                        chrom, start, ref = match.groups()
                        alt = '-'
                elif 'del' in g[0] and '_' in g[0] and 'delins' not in g[0]:
                    match = re.match(r'(chr\d+):g.(\d+)_(\d+)del(.+)', g[0])
                    if match:
                        chrom, start, end, rang = match.groups()
                        start = int(start)
                        end = int(end)
                        base = self.wgs.slice(chrom,start, end).upper()
                        ref = base
                        alt = '-'
                elif 'delins' in g[0]:
                    match = re.match(r'(chr\d+):g.(\d+)_(\d+)delins([ATCG]+)', g[0])
                    if match:
                        chrom, start, end, alt = match.groups()
                        start = int(start)
                        end = int(end)
                        base = self.wgs.slice(chrom,start, end).upper()
                        ref = base
                elif 'ins' in g[0] and 'delins' not in g[0]:
                    match = re.match(r'(chr\d+):g.(\d+)_(\d+)ins([ATCG]+)', g[0])
                    if match:
                        chrom, start, end, alt = match.groups()
                        start = int(start)
                        end = int(end)
                        base = self.wgs.slice(chrom,start, end).upper()
                        ref = base
                elif 'dup' in g[0] and '_' not in g[0]:
                    match = re.match(r'(chr\d+):g.(\d+)dup([ATCG]+)', g[0])
                    if match:
                        chrom, start, ref = match.groups()
                        start = int(start)
                        alt = ref + ref
                elif 'dup' in g[0] and '_' in g[0]:
                    match = re.match(r'(chr\d+):g.(\d+)_(\d+)dup([ATCG]+)', g[0])
                    if match:
                        chrom, start, end, ref = match.groups()
                        start = int(start)
                        alt = ref + ref
                wdict = {
                'chrom':chrom,
                'pos':start,
                'ref_base':ref,
                'alt_base':alt,
                'tags': tags,
                'sample_id': sample_id
            }
                out.append(wdict)
        return out




                    

