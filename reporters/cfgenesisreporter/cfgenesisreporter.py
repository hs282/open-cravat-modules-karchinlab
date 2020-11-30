from cravat.cravat_report import CravatReport
import sys
import datetime
import re
import pandas as pd
import cravat
import json
import pyreadr

class Reporter(CravatReport):

    def setup (self):
        self.filenames = []
        self.filename = None
        self.filename_prefix = None
        if self.savepath == None:
            self.filename_prefix = "cravat_result"
        else:
            self.filename_prefix = self.savepath
        self.levels_to_write = self.get_standardized_module_option(
            self.confs.get("pages", ["variant"])
        )
        self.separate_header_file = (
            self.get_standardized_module_option(
                self.confs.get("separate-header-file", "true")
            )
            == True
        )
        self.zip = (
            self.get_standardized_module_option(self.confs.get("zip", "false")) == True
        )
        self.show_default_cols_only = (
            self.get_standardized_module_option(
                self.confs.get("show-default-columns-only", "true")
            )
            == True
        )
        self.cols_to_display = [
            'base__hugo',
            'base__chrom',
            'base__pos',
            'base__ref_base',
            'base__alt_base',
        ]
        self.colno_to_display_hugo = self.cols_to_display.index('base__hugo')
        self.colno_to_display_chrom = self.cols_to_display.index('base__chrom')
        self.colno_to_display_pos = self.cols_to_display.index('base__pos')
        self.colno_to_display_ref = self.cols_to_display.index('base__ref_base')
        self.colno_to_display_alt = self.cols_to_display.index('base__alt_base')
        self.colname_display_dict = {
            'base__hugo': 'group_id',
            'base__chrom': 'chr',
            'base__pos': 'pos',
            'base__ref_base': 'ref',
            'base__alt_base': 'alt',
        }
        self.display_select_columns = {}
        self.display_select_columns['variant'] = len(self.cols_to_display) > 0
        self.module_col_sep = "."
        self.colnos_to_display = {}
        self.colnames_to_display = {}
        if self.display_select_columns['variant'] == False and self.show_default_cols_only:
            db = sqlite3.connect(self.dbpath)
            c = db.cursor()
            q = f'select name from sqlite_master where name like "%_header"'
            c.execute(q)
            levels = [v[0].split("_")[0] for v in c.fetchall()]
            for level in levels:
                q = f"select col_name, col_def from {level}_header"
                c.execute(q)
                for row in c.fetchall():
                    (col_name, col_def) = row
                    col_def = json.loads(col_def)
                    if "hidden" not in col_def or col_def["hidden"] == False:
                        if col_name not in self.cols_to_display:
                            self.cols_to_display.append(col_name)
        self.headers = {}
        self.dataframe_cols = {}
        self.dataframe_colnos = {}
        self.dataframe_headers = {}
        self.colno_to_colname = {}
        self.filename_postfix = 'cfgenesis.RData'
        self.data = {}
        self.wgs_reader = cravat.get_wgs_reader('hg38')

    def get_standardized_module_option(self, v):
        tv = type(v)
        if tv == str:
            if "," in v:
                v = [val for val in v.split(",") if val != ""]
        if v == "true":
            v = True
        elif v == "false":
            v = False
        return v

    def should_write_level(self, level):
        if self.levels_to_write is None:
            return True
        elif level in self.levels_to_write:
            return True
        else:
            return False

    def write_preface (self, level):
        self.level = level
        if self.should_write_level(level) == False:
            return

    def write_header (self, level):
        if self.should_write_level(level) == False:
            return
        self.headers[self.level] = []
        self.dataframe_colnos[self.level] = []
        self.dataframe_cols[self.level] = []
        self.dataframe_headers[self.level] = {}
        self.colno_to_colname[self.level] = {}
        # table columns
        for colgroup_dict in self.colinfo[self.level]['colgroups']:
            colgroup_name = colgroup_dict['name']
            minfo = cravat.admin_util.get_local_module_info(colgroup_name)
            if minfo is None:
                continue
            conf = minfo.conf
            if 'output_columns' not in conf:
                continue
            for output_dict in conf['output_columns']:
                if output_dict.get('table', False) == True:
                    colname = colgroup_name + '__' + output_dict['name']
                    if colname in self.cols_to_display:
                        self.cols_to_display.remove(colname)
                    self.dataframe_cols[self.level].append(colname)
                    self.dataframe_headers[self.level][colname] = [v['name'] for v in output_dict['table_headers']]
        colno = 0
        columns = self.colinfo[level]["columns"]
        for i in range(len(columns)):
            col = columns[i]
            colname = col['col_name']
            self.colno_to_colname[self.level][colno] = colname
            self.headers[self.level].append(colname)
            if colname in self.dataframe_cols[self.level]:
                self.dataframe_colnos[self.level].append(colno)
            if colname == 'genehancer__target_genes':
                self.colno_genehancertargetgenes = colno
            elif colname == 'base__so':
                self.colno_so = colno
            elif colname == 'base__coding':
                self.colno_coding = colno
            elif colname == 'extra_vcf_info__CSQ':
                self.colno_csq = colno
            elif colname == 'extra_vcf_info__CSQ_SYMBOL':
                self.colno_csq_symbol = colno
            elif colname == 'extra_vcf_info__CSQ_Consequence':
                self.colno_csq_consequence = colno
            elif colname == 'extra_vcf_info__CSQ_LoF':
                self.colno_csq_lof = colno
            elif colname == 'extra_vcf_info__CSQ_Gene':
                self.colno_csq_gene = colno
            colno += 1
        colno = 0
        self.colnos_to_display[level] = []
        self.colnames_to_display[level] = []
        for module_col_name in self.cols_to_display:
            [module_name, col_name] = module_col_name.split('__')
            for colno in range(len(columns)):
                if columns[colno]["col_name"] == module_col_name:
                    self.colnos_to_display[level].append(colno)
                    self.colnames_to_display[level].append(self.colname_display_dict[module_col_name])
                    break
        self.data[self.level] = []

    def write_table_row (self, row):
        if self.should_write_level(self.level) == False:
            return
        if len(self.colnos_to_display[self.level]) > 0:
            filtered_row = [row[colno] for colno in self.colnos_to_display[self.level]]
        else:
            filtered_row = row
        ref = filtered_row[self.colno_to_display_ref]
        alt = filtered_row[self.colno_to_display_alt]
        pos = int(filtered_row[self.colno_to_display_pos])
        if ref == '-' or alt == '-': # deletion or insertion
            chrom = filtered_row[self.colno_to_display_chrom]
            pos = pos - 1
            prev_base = self.wgs_reader.get_bases(chrom, pos).upper()
            if ref != '-' and alt == '-': # deletion
                ref = prev_base + ref
                alt = prev_base
            elif ref == '-' and alt != '-': # insertion
                ref = prev_base
                alt = prev_base + alt
            filtered_row[self.colno_to_display_pos] = pos
            filtered_row[self.colno_to_display_ref] = ref
            filtered_row[self.colno_to_display_alt] = alt
        hugo = filtered_row[self.colno_to_display_hugo]
        so = row[self.colno_so]
        coding = row[self.colno_coding]
        csq = row[self.colno_csq]
        #csq_lof_tokno = 50
        #csq_symbol_tokno = 3
        #csq_consequence_tokno = 1
        csq_lof = row[self.colno_csq_lof]
        if csq_lof is None:
            csq_lof = ''
        csq_symbol = row[self.colno_csq_symbol]
        if csq_symbol is None:
            csq_symbol = ''
        csq_symbol = csq_symbol.split(',')[0].split(';')[0]
        csq_consequence = row[self.colno_csq_consequence]
        if csq_consequence is None:
            csq_consequence = ''
        csq_gene = row[self.colno_csq_gene]
        if csq_gene is None:
            csq_gene = ''
        genenames = []
        if csq_gene != '':
            genenames = [m for v in csq_gene.split(',') for m in v.split(';')]
        else:
            csq_toks = csq.split('|')
            for tok in csq_toks:
                if 'ENSG' in tok:
                    genenames = [m for v in tok.split(',') for m in v.split(';')]
                elif tok == 'HC':
                    csq_lof = tok
        group_ids = []
        if coding == 'Yes' or so == 'splice_site_variant' or 'HC' in csq_lof:
            group_ids = genenames
            #if hugo is not None and hugo != '':
            #    group_id = hugo
            #else:
            #    group_id = csq_symbol
        else:
            genehancertargetgenes = row[self.colno_genehancertargetgenes]
            if genehancertargetgenes is not None:
                #toks = genehancertargetgenes.split(',')
                #group_id = toks[0].split(':')[0]
                group_ids = genenames
            else:
                if 'upstream_gene_variant' in csq_consequence:
                    #group_id = csq_symbol
                    group_ids = genenames
        chrom = filtered_row[self.colno_to_display_chrom]
        if len(group_ids) == 0:
            print(f'{chrom} {pos} {ref} {alt} {csq}')
        else:
            if chrom.startswith('chr'):
                chrom = chrom[3:]
                filtered_row[self.colno_to_display_chrom] = chrom
            group_ids = [v for v in group_ids if v != '']
            for group_id in group_ids:
                filtered_row[self.colno_to_display_hugo] = group_id
                self.data[self.level].append([v for v in list(filtered_row)])

    def end (self):
        self.dfs = {}
        for level in self.headers.keys():
            level_data = pd.DataFrame(self.data[level], columns=self.colnames_to_display[level])
            level_data = level_data.drop_duplicates(subset=['group_id'])
            self.filename = f'{self.filename_prefix}.{level}.{self.filename_postfix}'
            self.filenames.append(self.filename)
            pyreadr.write_rdata(self.filename, level_data, df_name=f'{self.filename_prefix}_{level}')
        return self.filenames

def main ():
    reporter = Reporter(sys.argv)
    reporter.run()

if __name__ == '__main__':
    main()
