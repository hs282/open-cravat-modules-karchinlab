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
        self.enstnov_ensgnov = {}
        f = open(os.path.join(os.path.abspath(__file__), 'data', 'ensg_enst.txt'))
        for line in f:
            [ensg, enst] = line[:-1].split('\t')
            self.enstnov_ensgnov[enst.split('.')[0]] = ensg.split('.')[0]
        f.close()
        f = open(os.path.join(os.path.abspath(__file__), 'data', 'MANE.GRCh38.v0.9.summary.txt'))
        f.readline()
        self.ensgnov_mane_enstnov = {}
        for line in f:
            [ensg, hugo, enst] = line[:-1].split('\t')
            self.ensgnov_mane_enstnov[ensg.split('.')[0]] = enst.split('.')[0]
        f.close()
        f = open(os.path.join(os.path.abspath(__file__), 'data', 'enst_alen.txt'))
        self.enstnov_alen = {}
        for line in f:
            [enst, alen] = line[:-1].split('\t')
            self.enstnov_alen[enst.split('.')[0]] = int(alen)
        f.close()

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
                self.colno_csq_lofs = colno
            elif colname == 'extra_vcf_info__CSQ_Gene':
                self.colno_csq_gene = colno
            elif colname == 'extra_vcf_info__CSQ_BIOTYPE':
                self.colno_csq_biotype = colno
            elif colname == 'base__transcript':
                self.colno_transcript = colno
            elif colname == 'base__all_mappings':
                self.colno_all_mappings = colno
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
        all_mappings = json.loads(filtered_row[self.colno_all_mappings])
        hugo_enst = {}
        for hugo in all_mappings:
            mapping = all_mappings[0]
            for mapping in all_mappings:
                [_, _, sos, enst, _] = mapping
                enstnov = enst.split('.')[0]
                ensgnov = self.enstnov_ensgnov[enstnov]
                if ensgnov in self.ensgnov_mane_enstnov:
                    mane_enstnov = self.ensgnov_mane_enstnov[ensg_nov]
                    if enstnov == mane_enstnov:
                        hugo_enst[hugo] = enst
                        break
                else:
                    



        coding = row[self.colno_coding]
        genehancertargetgenes = row[self.colno_genehancertargetgenes]
        csq = row[self.colno_csq]
        csq_genes = row[self.colno_csq_gene]
        csq_lofs = row[self.colno_csq_lofs]
        csq_consequence = row[self.colno_csq_consequence]
        csq_biotypes = row[self.colno_csq_biotype]
        if csq_consequence is None:
            csq_consequence = []
        else:
            csq_consequence = csq_consequence.split(';')
        '''
        if csq_genes is not None:
            csq_genes = [m for v in csq_genes.split(',') for m in v.split(';')]
        else:
            csq_toks = csq.split('|')
            for tok in csq_toks:
                if 'ENSG' in tok:
                    csq_genes = [m for v in tok.split(',') for m in v.split(';')]
                    break
        if csq_genes is None:
            csq_genes = []
        '''
        if csq_lofs is not None:
            csq_lofs = csq_lofs.split(';')
        else:
            csq_toks = csq.split('|')
            for tok in csq_toks:
                if 'HC' in tok:
                    csq_lofs = tok.split(';')
                    break
        if csq_lofs is None:
            csq_lofs = []
        if csq_biotypes is None:
            csq_biotypes = []
        else:
            csq_biotypes = csq_biotypes.split(';')
        if len(csq_genes)
        if len(csq_genes) != len(csq_biotypes) or len(csq_genes) != len(csq_lofs):
            print(f'Different number of gene names, biotypes, and LoFs. Gene names={csq_genes} biotypes={csq_biotypes} LoFs={csq_lofs}. row={row}')
            exit()
        group_ids = []
        if coding == 'Yes':
            for i in range(len(csq_genes)):
                if csq_biotypes[i] == 'protein_coding':
                    group_ids.append(csq_genes[i])
        elif so == 'splice_site_variant':
            for i in range(len(csq_genes)):
                if csq_biotypes[i] == 'protein_coding':
                    group_ids.append(csq_genes[i])
        elif 'HC' in csq_lofs:
            for i in range(len(csq_genes)):
                if csq_biotypes[i] == 'protein_coding' or csq_lofs[i] == 'HC':
                    group_ids.append(csq_genes[i])
        else:
            if genehancertargetgenes is not None:
                group_ids = csq_genes
            else:
                if len(csq_consequence) != len(csq_genes):
                    print(f'Different number of gene names and CSQ consequences. row={row}')
                    exit()
                for i in range(len(csq_genes)):
                    if 'upstream_gene_variant' in csq_consequence[i]:
                        group_ids.append(csq_genes[i])
        chrom = filtered_row[self.colno_to_display_chrom]
        if len(group_ids) == 0:
            print(f'No gene name for {chrom} {pos} {ref} {alt} {csq}')
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
            level_data = level_data.drop_duplicates()
            self.filename = f'{self.filename_prefix}.{level}.{self.filename_postfix}'
            self.filenames.append(self.filename)
            pyreadr.write_rdata(self.filename, level_data, df_name=f'{self.filename_prefix}_{level}')
        return self.filenames

def main ():
    reporter = Reporter(sys.argv)
    reporter.run()

if __name__ == '__main__':
    main()
