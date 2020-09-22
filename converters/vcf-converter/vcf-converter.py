from cravat import BaseConverter
from cravat import BadFormatError
from cravat import ExpectedException
from cravat import InvalidData
import re
from collections import defaultdict
from cravat.inout import CravatWriter
from cravat import constants
import os
import logging
import traceback
import vcf
from io import StringIO
import copy
from pathlib import Path

class CravatConverter(BaseConverter):

    def __init__(self):
        self.format_name = 'vcf'
        self._in_header = True
        self._first_variant = True
        self._buffer = StringIO()
        self._reader = None
        self.addl_cols = [
            {'name':'phred','title':'Phred','type':'string'},
            {'name':'filter','title':'VCF filter','type':'string'},
            {'name':'zygosity','title':'Zygosity','type':'string'},
            {'name':'alt_reads','title':'Alternate reads','type':'int'},
            {'name':'tot_reads','title':'Total reads','type':'int'},
            {'name':'af','title':'Variant allele frequency','type':'float'},
            {'name':'hap_block','title':'Haplotype block ID','type':'int'},
            {'name':'hap_strand','title':'Haplotype strand ID','type':'int'},
        ]
        self.ex_info_writer = None
        self.curvar = None
        self.csq_fields = None

    def check_format(self, f): 
        if f.name.endswith('.vcf'):
            return True
        if f.name.endswith('.vcf.gz'):
            return True
        first_line = f.readline()
        if first_line.startswith('##fileformat=VCF'):
            return True

    def setup(self, f):
        reader = vcf.Reader(f)
        self.open_extra_info(reader)
    
    def open_extra_info(self, reader):
        if not reader.infos:
            return
        self.has_extra_info = True
        writer_path = Path(self.output_dir)/(self.run_name+'.extra_vcf_info.var')
        self.ex_info_writer = CravatWriter(str(writer_path))
        info_cols = [{'name':'uid','title':'UID','type':'int'}]
        info_cols.append({
            'name': 'pos',
            'title': 'VCF Position',
            'desc': '',
            'type': 'int',
            'width': 60,
        })
        info_cols.append({
            'name': 'ref',
            'title': 'VCF Ref Allele',
            'desc': '',
            'type': 'string',
            'width': 60,
        })
        info_cols.append({
            'name': 'alt',
            'title': 'VCF Alt Allele',
            'desc': '',
            'type': 'string',
            'width': 60,
        })
        typemap = {'Integer':'int','Float':'float'}
        for info in reader.infos.values():
            info_cols.append({
                'name': info.id,
                'title': info.id,
                'desc': info.desc,
                'type': typemap.get(info.type,'string'),
                'hidden': True,
            })
        if 'CSQ' in reader.infos:
            csq_info = reader.infos['CSQ']
            fields_match = re.search('Format: ([^\s]+)', csq_info.desc)
            if fields_match:
                self.csq_fields = ['CSQ_'+x for x in fields_match.group(1).split('|')]
                for cname in self.csq_fields:
                    info_cols.append({
                        'name': cname,
                        'title': cname.replace('_',' '),
                        'type': 'string',
                        'hidden': True,
                    })
        self.ex_info_writer.add_columns(info_cols)
        self.ex_info_writer.write_definition()
        self.ex_info_writer.write_meta_line('name', 'extra_vcf_info')
        self.ex_info_writer.write_meta_line('displayname', 'Extra VCF INFO Annotations')

    def convert_line(self, l):
        if l.startswith('#'):
            if self._in_header:
                self._buffer.write(l)
            return self.IGNORE
        if self._first_variant:
            self._first_variant = False
            self._in_header = False
            self._buffer.seek(0)
            self._reader = vcf.Reader(self._buffer)
        self._buffer.seek(0)
        self._buffer.truncate()
        self._buffer.write(l)
        self._buffer.seek(0)
        variant = next(self._reader)
        wdict_blanks = {}
        for gtn,alt in enumerate(variant.ALT):
            if alt is None:
                alt_base = ''
            else:
                alt_base = alt.sequence
            new_pos, new_ref, new_alt = self.trim_variant(variant.POS, variant.REF, alt_base)
            wdict_blanks[str(gtn+1)] = {
                'chrom': variant.CHROM,
                'pos': new_pos,
                'ref_base': new_ref,
                'alt_base': new_alt,
                'tags': variant.ID,
                'phred': variant.QUAL,
                'filter': None, #FIXME
            }
        wdicts = []
        self.gt_occur = []
        for call in variant.samples:
            for gt in call.gt_alleles:
                if gt == '0' or gt is None:
                    continue
                wdict = copy.copy(wdict_blanks[gt])
                if wdict['alt_base'] == '*':
                    continue
                wdict['sample_id'] = call.sample
                wdict['zygosity'] = 'het' if call.is_het else 'hom'
                wdict['alt_reads'] = None #FIXME
                wdict['tot_reads'] = None #FIXME
                wdict['af'] = None #FIXME
                wdict['hap_block'] = None #FIXME
                wdict['hap_strand'] = None #FIXME
                wdicts.append(wdict)
                self.gt_occur.append(gt)
        self.curvar = variant
        self.cur_csq = {}
        if self.csq_fields and 'CSQ' in variant.INFO:
            csq_entries = defaultdict(list)
            for gt_csq in variant.INFO['CSQ']:
                l = gt_csq.split('|')
                csq_entries[l[0]].append(l)
            for allele, entries in csq_entries.items():
                transpose = zip(*entries)
                alleled = {}
                self.cur_csq[allele] = dict([(cname, self.csq_format(value)) for cname, value in zip(self.csq_fields, transpose)])
        return wdicts
    
    @staticmethod
    def csq_format(l):
        # Format a list of CSQ values into it's representation in OC
        # Each value comes from a VEP transcript mapping
        if all([x=='' for x in l]):
            return None
        else:
            return ','.join(l)

    def trim_variant(self, pos, ref, alt):
        if len(ref) == 1 and len(alt) == 1:
            return pos, ref, alt
        ref = list(ref)
        alt = list(alt)
        adj = 0
        while ref and alt and ref[0]==alt[0]:
            adj += 1
            ref.pop(0)
            alt.pop(0)
        while ref and alt and ref[-1]==alt[-1]:
            ref.pop()
            alt.pop()
        ref = ''.join(ref) if ref else '-'
        alt = ''.join(alt) if alt else '-'
        return pos+adj, ref, alt

    def addl_operation_for_unique_variant (self, wdict, wdict_no):
        if self.ex_info_writer is None:
            return
        gt_index = int(self.gt_occur[wdict_no])-1
        row_data = {'uid':wdict['uid']}
        for info_name, info_val in self.curvar.INFO.items():
            if type(info_val) is list:
                info_val = info_val[wdict_no]
            if self._reader.infos[info_name].type not in ('Integer','Float'):
                info_val = str(info_val)
            row_data[info_name] = info_val
        alt = self.curvar.ALT[gt_index].sequence
        row_data['pos'] = self.curvar.POS
        row_data['ref'] = self.curvar.REF
        row_data['alt'] = alt
        if self.cur_csq:
            row_data.update(self.cur_csq.get(alt,{}))
        self.ex_info_writer.write_data(row_data)