from cravat import BaseConverter
from cravat import BadFormatError
from cravat import ExpectedException
from cravat import InvalidData
import re
from collections import OrderedDict
from cravat.inout import CravatWriter
from cravat import constants
import os
import logging
import traceback

class CravatConverter(BaseConverter):

    def __init__(self):
        self.format_name = 'vcf'
        self.samples = []
        self.var_counter = 0
        self.addl_cols = [{'name':'phred',
                           'title':'Phred',
                           'type':'string'},
                          {'name':'filter',
                           'title':'VCF filter',
                           'type':'string'},
                          {'name':'zygosity',
                           'title':'Zygosity',
                           'type':'string'},
                          {'name':'alt_reads',
                           'title':'Alternate reads',
                           'type':'int'},
                          {'name':'tot_reads',
                           'title':'Total reads',
                           'type':'int'},
                          {'name':'af',
                           'title':'Variant allele frequency',
                           'type':'float'},
                          {'name': 'hap_block',
                           'title': 'Haplotype block ID',
                           'type': 'int'},
                          {'name': 'hap_strand',
                           'title': 'Haplotype strand ID',
                           'type': 'int'}
        ]
        self.info_field_coltype_dict = {
            'integer': 'float',
            'float': 'float',
            'flag': 'string',
            'character': 'string',
            'string': 'string'
        }
        self.allowed_info_colnumbers = ['0', '1', 'a', 'r', '.']
        self.unique_excs = []
        self.vep_present = False
        self.ex_info_writer = None

    def check_format(self, f): 
        vcf_format = False
        if f.name.endswith('.vcf'):
            vcf_format = True
        first_line = f.readline()
        if first_line.startswith('##fileformat=VCF'):
            vcf_format = True
        return vcf_format

    def setup(self, f):
        self.logger = logging.getLogger('cravat.converter')
        self.error_logger = logging.getLogger('error.converter')
        self.input_path = f.name
        self.info_field_cols = OrderedDict()
        # TODO: make this a generic one in cravat_convert.py. This is just a first aid measure due to request from the CF group.
        self.info_field_cols['oripos'] = {'name': 'oripos', 'type': 'string', 'title': 'Input position', 'desc': 'Position in input', 'oritype': 'string', 'number': '1', 'separate': False}
        self.info_field_cols['oriref'] = {'name': 'oriref', 'type': 'string', 'title': 'Input Ref', 'desc': 'Reference bases in input', 'oritype': 'string', 'number': '1', 'separate': False}
        self.info_field_cols['orialt'] = {'name': 'orialt', 'type': 'string', 'title': 'Input Alt', 'desc': 'Alternate bases in input', 'oritype': 'string', 'number': '1', 'separate': False}
        self.sepcols = {}
        for n, l in enumerate(f):
            if n==2 and l.startswith('##source=VarScan'):
                self.vcf_format = 'varscan'
            else:
                self.vcf_format = 'unknown'
            if len(l) < 6:
                continue
            if l.startswith('##INFO='):
                coldefs = self.parse_header_info_field(l)
                for coldef in coldefs:
                    if coldef['type'] is None or coldef['number'] not in self.allowed_info_colnumbers:
                        continue
                    else:
                        self.info_field_cols[coldef['name']] = coldef
            elif l[:6] == '#CHROM':
                toks = re.split(r'\s+', l.rstrip())
                if len(toks) > 8:
                    self.samples = toks[9:]
                else:
                    self.samples = ['no_sample']
                break
        self.genotype_fields = []
        for l in f:
            toks = l.split('\t')
            if len(toks) >= 9:
                gtfs = toks[8].split(':')
                for gtf in gtfs:
                    if gtf not in self.genotype_fields:
                        self.genotype_fields.append(gtf)
        self.write_ex_info = (len(self.info_field_cols) > 0)
        if self.write_ex_info and self.ex_info_writer is None:
            self.open_ex_info_writer()

    def open_ex_info_writer (self):
        self.ex_info_fpath = os.path.join(self.output_dir, self.run_name + '.extra_vcf_info.var')
        self.ex_info_writer = CravatWriter(self.ex_info_fpath)
        cols = list(self.info_field_cols.values())
        cols.insert(0, constants.crv_def[0])
        self.ex_info_writer.add_columns(cols)
        self.ex_info_writer.write_definition()
        for index_columns in constants.crv_idx:
            self.ex_info_writer.add_index(index_columns)
        self.ex_info_writer.write_meta_line('name', 'extra_vcf_info');
        self.ex_info_writer.write_meta_line('displayname', 'Extra VCF INFO Annotations');

    def end (self):
        if write_ex_info:
            self.ex_info_writer.close()

    def clean_colname (self, colname):
        colname = ''.join([v if v.isalnum() else 'x' for v in colname])
        return colname

    def parse_header_info_field (self, l):
        l = l[7:].rstrip('>')
        if 'ID=' in l:
            idx = l.index('ID=')
            l2 = l[idx + 3:]
            try:
                idx2 = l2.index(',')
            except:
                idx2 = len(l2)
            colname = self.clean_colname(l2[:idx2])
        else:
            colname = None
        if 'Number=' in l:
            idx = l.index('Number=')
            l2 = l[idx + 7:]
            try:
                idx2 = l2.index(',')
            except:
                idx2 = len(l2)
            colnumber = l2[:idx2].lower()
        else:
            colnumber = None
        if 'Type=' in l:
            idx = l.index('Type=')
            l2 = l[idx + 5:]
            try:
                idx2 = l2.index(',')
            except:
                idx2 = len(l2)
            coloritype = l2[:idx2].lower()
            if coloritype in self.info_field_coltype_dict:
                coltype = self.info_field_coltype_dict[coloritype]
            else:
                coltype = None
        else:
            coltype = None
        if 'Description="' in l:
            idx = l.index('Description="')
            l2 = l[idx + 13:]
            idx2 = l2.index('"')
            coldesc = l2[:idx2]
            if len(coldesc.split()) > 5:
                coltitle = colname
            else:
                coltitle = coldesc
        else:
            coldesc = None
            coltitle = None
        coldefs = []
        if colname == 'CSQ': # VEP annotation
            self.vep_present = True
            colsep = True
            self.sepcols[colname] = []
            colname2s = [self.clean_colname(v) for v in coldesc.split(' Format: ')[1].split('|')]
            colname2_idx = 0
            for colname2 in colname2s:
                if colname2 == 'Allele':
                    self.vep_alt_idx = colname2_idx
                newcolname = colname + '_' + colname2
                newcoltitle = colname + ' ' + colname2
                newdesc = f'VEP annotation: {colname2}'
                coldef = {'name': newcolname, 'type': coltype, 'title': newcoltitle, 'desc': newdesc, 'oritype': coloritype, 'number': colnumber, 'separate': colsep}
                coldefs.append(coldef)
                self.sepcols[colname].append(coldef)
                colname2_idx += 1
        else:
            colsep = False
            self.vep_present = False
            coldefs = [{'name': colname, 'type': coltype, 'title': coltitle, 'desc': coldesc, 'oritype': coloritype, 'number': colnumber, 'separate': colsep}]
        return coldefs

    def parse_data_info_field (self, infoline, pos, ref, alts, l, all_wdicts):
        len_alts = len(alts)
        toks = infoline.split(';')
        info_dict = {}
        lenref = len(ref)
        self.alts = []
        if self.vep_present == False:
            for wdict in all_wdicts:
                ref = wdict['ref_base']
                alt = wdict['alt_base']
                sample = wdict['sample_id']
                refalt = f'{ref}:{alt}'
                if refalt not in info_dict:
                    info_dict[refalt] = {}
                    self.alts.append(refalt)
        else:
            alt_1st_same = len(set([alt[0] for alt in alts])) == 1
            for alt in alts:
                lenalt = len(alt)
                if lenalt < lenref:
                    if ref.startswith(alt):
                        if lenalt == 1:
                            if alt_1st_same:
                                vepalt = '-'
                            else:
                                vepalt = alt
                        else:
                            if alt_1st_same:
                                vepalt = alt[1:]
                            else:
                                vepalt = alt
                    elif ref[0] == alt[0]:
                        if alt_1st_same:
                            vepalt = alt[1:]
                        else:
                            vepalt = alt
                    else:
                        vepalt = alt
                elif lenalt > lenref:
                    if alt.startswith(ref):
                        if alt_1st_same:
                            vepalt = alt[1:]
                        else:
                            vepalt = alt
                    else:
                        if alt_1st_same:
                            vepalt = alt[1:]
                        else:
                            vepalt = alt
                elif lenalt == lenref:
                    vepalt = alt
                else:
                    print(f'VEP alt problem. Please report to support@cravat.us with this printout: l={l}')
                    exit()
                if vepalt in self.alts:
                    refalt = f'{ref}:{alt}'
                else:
                    refalt = f'{ref}:{vepalt}'
                self.alts.append(refalt)
                info_dict[refalt] = {}
                info_dict[refalt]['oripos'] = str(pos)
                info_dict[refalt]['oriref'] = ref
                info_dict[refalt]['orialt'] = alt
        for tok in toks:
            data = None
            if '=' in tok:
                idx = tok.index('=')
                colname = self.clean_colname(tok[:idx])
                colvals = tok[idx + 1:].split(',')
                if colname == 'CSQ':
                    coldefs = self.sepcols[colname]
                    colvalss = [v.split('|') for v in colvals]
                    for i in range(len(colvalss)):
                        vepalt = colvalss[i][self.vep_alt_idx]
                        refalt = f'{ref}:{vepalt}'
                        for j in range(1, len(coldefs)):
                            coldef = coldefs[j]
                            val = colvalss[i][j]
                            colname = coldef['name']
                            try:
                                if colname not in info_dict[refalt]:
                                    info_dict[refalt][colname] = []
                                info_dict[refalt][colname].append(val)
                            except:
                                raise
                    for refalt in info_dict:
                        for colname in info_dict[refalt]:
                            if colname.startswith('CSQ_'):
                                try:
                                    info_dict[refalt][colname] = ';'.join(info_dict[refalt][colname])
                                except:
                                    raise
                else:
                    if colname not in self.info_field_cols:
                        continue
                    coldef = self.info_field_cols[colname]
                    coloritype = coldef['oritype']
                    colnumber = coldef['number']
                    colsep = coldef['separate']
                    if coloritype == 'integer':
                        colvals = [float(v) if v != '.' else None for v in colvals]
                    elif coloritype == 'float':
                        colvals = [float(v) if v != '.' else None for v in colvals]
                    elif coloritype in ['string', 'character', 'flag']:
                        colvals = colvals
                    if colnumber == '0':
                        for refalt in self.alts:
                            info_dict[refalt][colname] = colvals[0]
                    if colnumber == '1':
                        for refalt in self.alts:
                            info_dict[refalt][colname] = colvals[0]
                    elif colnumber == 'a':
                        for i in range(len(self.alts)):
                            info_dict[self.alts[i]][colname] = colvals[i]
                    elif colnumber == 'r':
                        for i in range(len(self.alts)):
                            info_dict[self.alts[i]][colname] = colvals[i + 1]
                    elif colnumber == '.':
                        if len(colvals) == len_alts:
                            for i in range(len(self.alts)):
                                info_dict[self.alts[i]][colname] = colvals[i]
                        elif len(colvals) == 1 and len_alts > 1:
                            for refalt in self.alts:
                                info_dict[refalt][colname] = colvals[0]
            else:
                colname = self.clean_colname(tok)
                col = self.info_field_cols[colname]
                if col['oritype'] == 'flag':
                    data = True
                    for refalt in self.alts:
                        info_dict[refalt][colname] = data
                else:
                    print('{} cannot be processed: {}'.format(colname, tok))
                    continue
        return info_dict

    def convert_line(self, l):
        if l.startswith('#'): return self.IGNORE
        self.var_counter += 1
        toks = l.strip('\r\n').split('\t')
        toklen = len(toks)
        all_wdicts = []
        if toklen < 5:
            raise BadFormatError('At least CHROM POS ID REF ALT columns are needed')
        [chrom, pos, tag, ref, alts] = toks[:5]
        # Skip structural variants
        if '<' in alts or '[' in alts or ']' in alts:
            raise BadFormatError(f'OpenCRAVAT does not support alt={alts} at this time')
        # Skips . alt.
        if alts == '.':
            raise InvalidData(f'. alt is skipped')
        if toklen >= 6:
            qual = toks[5]
            if qual == '.': qual = None
        else:
            qual = None
        if toklen >= 7:
            filter = toks[6]
            if filter == '.': filter = None
        else:
            filter = None
        if toklen >= 8:
            info = toks[7]
            if info == '.': 
                info = None
        else:
            info = None
        if tag == '.':
            tag = None
        alts = alts.split(',')
        len_alts = len(alts)
        newalts = []
        if toklen <= 8:
            gtf_nos = {'GT': 0}
            gtfs = ['GT']
            self.samples = []
            sample_datas = []
            for altno in range(len_alts):
                self.samples.append('no_sample')
                sample_datas.append(f'{altno + 1}/{altno + 1}')
        elif toklen > 8:
            sample_datas = toks[9:]
            gtf_nos = {}
            gtfs = []
            gtf_no = 0
            for gtf in toks[8].split(':'):
                gtf_nos[gtf] = gtf_no
                gtfs.append(gtf)
                gtf_no += 1
            if not ('GT' in gtfs):
                raise BadFormatError('No GT Field')
        gt_field_no = gtf_nos['GT']
        gt_all_zero = True
        used_alts = []
        wdicts_by_gtno = {}
        newalts_by_gtno = {}
        for i in range(len(alts)):
            wdicts_by_gtno[i + 1] = []
            newalts_by_gtno[i + 1] = []
        for sample_no in range(len(sample_datas)):
            sample = self.samples[sample_no]
            sample_data = sample_datas[sample_no].split(':')
            gts = {}
            for gt in sample_data[gt_field_no].replace('/', '|').split('|'):
                if gt == '.':
                    continue
                else:
                    gts[int(gt)] = True
            for gt in sorted(gts.keys()):
                wdict = None
                if gt == 0:
                    continue
                gt_all_zero = False
                alt = alts[gt - 1]
                if alt == '*':
                    continue
                newpos, newref, newalt = self.extract_vcf_variant('+', pos, ref, alt)
                zyg = self.homo_hetro(sample_data[gt_field_no])
                depth, alt_reads, af = self.extract_read_info(sample_data, gt, gts, gtf_nos)
                if depth == '.': depth = None
                if alt_reads == '.': alt_reads = None
                if af == '.': af = None
                if 'HP' in gtf_nos:
                    hp_field_no = gtf_nos['HP']
                    haplotype_block = sample_data[hp_field_no].split(',')[0].split('-')[0]
                    haplotype_strand = sample_data[hp_field_no].split(',')[0].split('-')[1]
                    wdict = {'tags':tag,
                                'chrom':chrom,
                                'pos':newpos,
                                'ref_base':newref,
                                'alt_base':newalt,
                                'sample_id':sample,
                                'phred': qual,
                                'filter': filter,
                                'zygosity': zyg,
                                'tot_reads': depth,
                                'alt_reads': alt_reads,
                                'af': af,
                                'hap_block': haplotype_block,
                                'hap_strand': haplotype_strand,                               
                                } 
                else:
                    wdict = {'tags':tag,
                                'chrom':chrom,
                                'pos':newpos,
                                'ref_base':newref,
                                'alt_base':newalt,
                                'sample_id':sample,
                                'phred': qual,
                                'filter': filter,
                                'zygosity': zyg,
                                'tot_reads': depth,
                                'alt_reads': alt_reads,
                                'af': af, 
                                'hap_block': None,
                                'hap_strand': None,                               
                                }
                for gtf in gtfs:
                    gtf_no = gtf_nos[gtf]
                    value = sample_data[gtf_no]
                    wdict[gtf] = value
                wdicts_by_gtno[gt].append(wdict)
                newalts_by_gtno[gt].append(newalt)
                if alt not in used_alts:
                    used_alts.append(alt)
        if gt_all_zero:
            raise BadFormatError('All sample GT are zero')
        for i in range(len(alts)):
            gtno = i + 1
            for wdict in wdicts_by_gtno[gtno]:
                all_wdicts.append(wdict)
            for newalt in newalts_by_gtno[gtno]:
                newalts.append(newalt)
        if info is not None:
            try:
                self.info_field_data = self.parse_data_info_field(info, pos, ref, alts, l, all_wdicts)
            except Exception as e:
                # print(l)
                # traceback.print_exc()
                self._log_conversion_error(l, e)
                self.info_field_data = {}
        else:
            self.info_field_data = {}
            self.alts = newalts
        return all_wdicts

    def addl_operation_for_unique_variant (self, wdict, wdict_no):
        if self.write_ex_info:
            uid = wdict['uid']
            row_data = {}
            refalt = self.alts[wdict_no]
            if refalt in self.info_field_data:
                data = self.info_field_data[refalt]
                for k, v in data.items():
                    if type(v) is list:
                        row_data[k] = v[wdict_no]
                    else:
                        row_data[k] = v
                row_data['uid'] = uid
                self.ex_info_writer.write_data(row_data)

    #The vcf genotype string has a call for each allele separated by '\' or '/'
    #If the call is the same for all allels, return 'hom' otherwise 'het'
    def homo_hetro(self, gt_str):
        if '.' in gt_str:
            return '';

        gts = gt_str.strip().replace('/', '|').split('|')
        for gt in gts:
            if gt != gts[0]:
                return 'het'
        return 'hom'            

    #Extract read depth, allele count, and allele frequency from optional VCR information
    def extract_read_info (self, sample_data, gt, gts, genotype_fields): 
        depth = ''
        alt_reads = ''
        ref_reads = ''
        af = ''
        #AD contains 2 values usually ref count and alt count unless there are 
        #multiple alts then it will have alt 1 then alt 2.
        if self.vcf_format == 'varscan':
            if 'AD' in genotype_fields and 'RD' in genotype_fields:
                try:
                    ref_reads = sample_data[genotype_fields['RD']]
                except:
                    ref_reads = ''
                try:
                    alt_reads = sample_data[genotype_fields['AD']]
                except:
                    alt_reads = ''
        else:
            if 'AD' in genotype_fields and genotype_fields['AD'] <= len(sample_data): 
                if 0 in gts.keys():
                    #if part of the genotype is reference, then AD will have #ref reads, #alt reads
                    try:
                        ref_reads = sample_data[genotype_fields['AD']].split(',')[0]
                    except:
                        ref_reads = ''
                    try:
                        alt_reads = sample_data[genotype_fields['AD']].split(',')[1]
                    except:
                        alt_reads = ''
                elif gt == max(gts.keys()):    
                    #if geontype has multiple alt bases, then AD will have #alt1 reads, #alt2 reads
                    try:
                        alt_reads = sample_data[genotype_fields['AD']].split(',')[1]
                    except:
                        alt_reads = ''
                else:
                    try:
                        alt_reads = sample_data[genotype_fields['AD']].split(',')[0]
                    except:
                        alt_reads = ''
        if alt_reads != '' and ref_reads != '':
            # Default dp = ref+alt
            depth = int(alt_reads) + int(ref_reads)   
        elif 'DP' in genotype_fields and genotype_fields['DP'] <= len(sample_data): 
            # DP is fallback because some callers apply additional filters to DP which are not applied to AD
            depth = sample_data[genotype_fields['DP']] 
        else:
            depth = ''
        if 'AF' in genotype_fields and genotype_fields['AF'] <= len(sample_data):
            try:
                af = round(float(sample_data[genotype_fields['AF']] ),3)
            except:
                af = ''
        elif depth != '' and alt_reads != '':
            #if AF not specified, calc it from alt and ref reads
            af = None
            try: # Handle cases where alt_reads and/or depth are a placeholder character like '.'
                int(alt_reads)
                int(depth)
            except ValueError:
                af = ''
            if af is None:
                if int(depth) == 0: # Uncommon case where a filter has removed all reads but call is still made
                    af = ''
                else:
                    af = round(int(alt_reads) / int(depth),3)
        else:
            af = ''
        if type(af) == float: # Bound af to [0.0, 1.0]
            if af > 1.0:
                af = 1.0
            elif af < 0.0:
                af = 0.0
        return depth, alt_reads, af

    def extract_vcf_variant (self, strand, pos, ref, alt):

        reflen = len(ref)
        altlen = len(alt)

        # Returns without change if same single nucleotide for ref and alt. 
        if reflen == 1 and altlen == 1 and ref == alt:
            return pos, ref, alt

        # Trimming from the start and then the end of the sequence 
        # where the sequences overlap with the same nucleotides
        new_ref2, new_alt2, new_pos = \
            self.trimming_vcf_input(ref, alt, pos, strand)

        if new_ref2 == '' or new_ref2 == '.':
            new_ref2 = '-'
        if new_alt2 == '' or new_alt2 == '.':
            new_alt2 = '-'

        return new_pos, new_ref2, new_alt2

    # This function looks at the ref and alt sequences and removes 
    # where the overlapping sequences contain the same nucleotide.
    # This trims from the end first but does not remove the first nucleotide 
    # because based on the format of VCF input the 
    # first nucleotide of the ref and alt sequence occur 
    # at the position specified.
    #     End removed first, not the first nucleotide
    #     Front removed and position changed
    def trimming_vcf_input(self, ref, alt, pos, strand):
        pos = int(pos)
        reflen = len(ref)
        altlen = len(alt)
        minlen = min(reflen, altlen)
        new_ref = ref
        new_alt = alt
        new_pos = pos
        # Trims from the end. Except don't remove the first nucleotide. 
        # 1:6530968 CTCA -> GTCTCA becomes C -> GTC.
        for nt_pos in range(0, minlen - 1): 
            if ref[reflen - nt_pos - 1] == alt[altlen - nt_pos - 1]:
                new_ref = ref[:reflen - nt_pos - 1]
                new_alt = alt[:altlen - nt_pos - 1]
            else:
                break    
        new_ref_len = len(new_ref)
        new_alt_len = len(new_alt)
        minlen = min(new_ref_len, new_alt_len)
        new_ref2 = new_ref
        new_alt2 = new_alt
        # Trims from the start. 1:6530968 G -> GT becomes 1:6530969 - -> T.
        for nt_pos in range(0, minlen):
            if new_ref[nt_pos] == new_alt[nt_pos]:
                if strand == '+':
                    new_pos += 1
                elif strand == '-':
                    new_pos -= 1
                new_ref2 = new_ref[nt_pos + 1:]
                new_alt2 = new_alt[nt_pos + 1:]
            else:
                new_ref2 = new_ref[nt_pos:]
                new_alt2 = new_alt[nt_pos:]
                break  
        return new_ref2, new_alt2, new_pos

    def _log_conversion_error(self, line, e):
        """ Log exceptions thrown by primary converter.
            All exceptions are written to the .err file with the exception type
            and message. Exceptions are also written to the log file once, with the 
            traceback. 
        """
        err_str = traceback.format_exc().rstrip()
        err_str_u = '\n'.join(err_str.split('\n')[:-1])
        if err_str_u not in self.unique_excs:
            self.unique_excs.append(err_str_u)
            self.logger.error(err_str)
        self.error_logger.error('\nLINE:NA\nINPUT:{}\nERROR:{}\n#'.format(line[:-1], str(e)))

