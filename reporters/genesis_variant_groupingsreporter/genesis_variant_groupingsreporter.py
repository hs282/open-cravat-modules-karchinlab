from cravat.cravat_report import CravatReport
import sys
import datetime
import re
import pandas as pd
import cravat
import json
import pyreadr
import os

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
        data_path = os.path.dirname(os.path.abspath(__file__))
        # hugo synonyms
        f = open(os.path.join(data_path, 'data', 'hugo_synonyms.txt'))
        line = f.readline()
        toks = line.split('\t')
        app_symbol_colno = toks.index('Approved symbol')
        prev_symbols_colno = toks.index('Previous symbols')
        #alias_symbols_colno = toks.index('Alias symbols')
        self.hugo_synonyms = {}
        for line in f:
            toks = line.split('\t')
            app_symbol = toks[app_symbol_colno]
            prev_symbols = [v.strip() for v in toks[prev_symbols_colno].split(',')]
            #alias_symbols = [v.strip() for v in toks[alias_symbols_colno].split(',')]
            for symbol in prev_symbols:
                self.hugo_synonyms[symbol] = app_symbol
            #for symbol in alias_symbols:
            #    self.hugo_synonyms[symbol] = app_symbol
        f.close()
        # enst to ensg
        f = open(os.path.join(data_path, 'data', 'ensg_enst.txt'))
        for line in f:
            [ensg, enst] = line[:-1].split('\t')
            self.enstnov_ensgnov[self.remove_version(enst)] = self.remove_version(ensg)
        f.close()
        # canonical enst
        f = open(os.path.join(data_path, 'data', 'MANE.GRCh38.v0.9.summary.txt'))
        f.readline()
        self.mane_ensgnv_to_enstnv = {}
        self.mane_hugo_to_canonical_enst = {}
        self.mane_hugos = []
        self.mane_hugo_to_ensg = {}
        for line in f:
            toks = line[:-1].split('\t')
            ensg = toks[1]
            hugo = toks[3]
            #if hugo in self.hugo_synonyms:
            #    hugo = self.hugo_synonyms[hugo]
            enst = toks[7]
            ensgnv = self.remove_version(ensg)
            enstnv = self.remove_version(enst)
            self.mane_ensgnv_to_enstnv[ensgnv] = enstnv
            self.mane_hugos.append(hugo)
            self.mane_hugo_to_canonical_enst[hugo] = enst
            self.mane_hugo_to_ensg[hugo] = ensgnv
        f.close()
        # enst alen
        f = open(os.path.join(data_path, 'data', 'enst_alen.txt'))
        self.enstnv_to_alens = {}
        for line in f:
            [enst, alen] = line[:-1].split('\t')
            self.enstnv_to_alens[self.remove_version(enst)] = int(alen)
        f.close()
        # hugo to ensg
        f = open(os.path.join(data_path, 'data', 'hugo_ensg_chrom.txt'))
        self.hugo_to_ensg = {}
        self.hugo_to_chrom = {}
        self.ensg_to_chrom = {}
        for line in f:
            [hugo, ensg, chrom] = line[:-1].split('\t')
            ensg = ensg.split('.')[0]
            #if hugo in self.hugo_synonyms:
            #    hugo = self.hugo_synonyms[hugo]
            self.hugo_to_ensg[hugo] = ensg
            if hugo not in self.hugo_to_chrom:
                self.hugo_to_chrom[hugo] = []
            if ensg not in self.ensg_to_chrom:
                self.ensg_to_chrom[ensg] = chrom
            self.hugo_to_chrom[hugo].append(chrom)
        f.close()
        self.csq_consequence_to_oc_so = {
            'splice_acceptor_variant': 'splice_site_variant',
            'splice_donor_variant': 'splice_site_variant',
            'frameshift_variant': 'frameshift_elongation,frameshift_truncation'
        }
        self.no_mane_hugos = {}
        self.filter_name = os.path.basename(self.filterpath)

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
            elif colname == 'extra_vcf_info__CSQ_Feature':
                self.colno_csq_ensts = colno
            elif colname == 'base__transcript':
                self.colno_transcript = colno
            elif colname == 'base__all_mappings':
                self.colno_all_mappings = colno
            elif colname == 'metasvm__score':
                self.colno_metasvm_score = colno
            elif colname == 'fathmm_xf__score':
                self.colno_fathmm_xf_score = colno
            elif colname == 'sift__prediction':
                self.colno_sift_prediction = colno
            elif colname == 'lrt__lrt_pred':
                self.colno_lrt_lrt_pred = colno
            elif colname == 'polyphen2__hdiv_pred':
                self.colno_polyphen2_hdiv_pred = colno
            elif colname == 'polyphen2__hvar_pred':
                self.colno_polyphen2_hvar_pred = colno
            elif colname == 'genehancer__feature_name':
                self.colno_genehancer_feature_name = colno
            elif colname == 'ensembl_regulatory_build__region':
                self.colno_ensembl_regulatory_build_region = colno
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

    def remove_version (self, uid):
        return uid.split('.')[0]

    def convert_csq_consequence (self, c):
        cs = []
        for tok in c.split('&'):
            cs.append(self.csq_consequence_to_oc_so.get(c, c))
        cs = '&'.join(cs)
        return cs

    def has_coding_so (self, sos):
        if 'frameshift_elongation' in sos \
                or 'frameshift_truncation' in sos \
                or 'complex_substitution' in sos \
                or 'splice_site_variant' in sos \
                or 'start_lost' in sos \
                or 'stop_gained' in sos \
                or 'stop_lost' in sos \
                or 'transcript_ablation' in sos \
                or 'inframe_insertion' in sos \
                or 'inframe_deletion' in sos \
                or 'exon_loss_variant' in sos \
                or 'missense_variant' in sos:
            return True
        else:
            return False

    def parse_mapping (self, mapping):
        [enst, _, _, sos, _, _] = mapping
        return enst, sos

    def find_canonical_mapping (self, hugo, all_mappings, canonical_enstnv):
        for mapping in all_mappings[hugo]:
            enst, sos = self.parse_mapping(mapping)
            if self.remove_version(enst) == canonical_enstnv:
                return mapping
        return None

    def parse_all_mappings_str (self, all_mappings_str):
        all_mappings_t = [v.strip() for v in all_mappings_str.split(';')]
        all_mappings = {}
        for mapping_t in all_mappings_t:
            mapping = mapping_t.split(':')
            try:
                hugo = mapping[1]
                #if hugo in self.hugo_synonyms:
                #    hugo = self.hugo_synonyms[hugo]
            except:
                print(f'#####################|\nAn exception occurred. Please contact the OpenCRAVAT team with the following information:')
                print(f'#exception: getting hugo from mapping\nall_mappings_t={all_mappings_t}')
                print(f'mapping={mapping}')
                return {}
            if hugo not in all_mappings:
                all_mappings[hugo] = []
            all_mappings[hugo].append(mapping)
        return all_mappings

    def get_canonicals(self, row, all_mappings, chrom):
        # Which hugos are in MANE and which are not.
        hugos_in_mane = []
        other_hugos = []
        csq_hugos_in_mane = []
        csq_other_hugos = []
        csq_biotypes = row[self.colno_csq_biotype]
        csq_hugos = row[self.colno_csq_symbol]
        csq_ensts = row[self.colno_csq_ensts]
        if csq_ensts is None:
            csq_ensts = []
        else:
            csq_ensts = csq_ensts.split(';')
        if csq_hugos is None:
            csq_hugos = []
        else:
            csq_hugos = csq_hugos.split(';')
        for hugo in all_mappings:
            if hugo in self.mane_hugos and hugo not in hugos_in_mane:
                hugos_in_mane.append(hugo)
            elif hugo not in other_hugos:
                other_hugos.append(hugo)
        for i in range(len(csq_hugos)):
            hugo = csq_hugos[i]
            if csq_ensts[i].startswith('ENST') == False:
                continue
            if csq_biotypes[i] != 'protein_coding':
                continue
            if hugo in self.mane_hugos and hugo not in csq_hugos_in_mane:
                csq_hugos_in_mane.append(hugo)
            elif hugo not in csq_other_hugos:
                csq_other_hugos.append(hugo)
        # ENSG and canonical ENST
        self.ensgs = {}
        canonical_ensts = {}
        canonical_enstnvs = {}
        # MANE transcript as canonical
        for hugo in hugos_in_mane:
            self.ensgs[hugo] = self.mane_hugo_to_ensg[hugo]
            enst = self.mane_hugo_to_canonical_enst[hugo]
            canonical_ensts[hugo] = enst
            canonical_enstnvs[hugo] = self.remove_version(enst)
        for hugo in csq_hugos_in_mane:
            if hugo in self.ensgs:
                continue
            self.ensgs[hugo] = self.mane_hugo_to_ensg[hugo]
            enst = self.mane_hugo_to_canonical_enst[hugo]
            canonical_ensts[hugo] = enst
            canonical_enstnvs[hugo] = self.remove_version(enst)
        for hugo in other_hugos:
            if hugo in self.hugo_to_ensg and chrom in self.hugo_to_chrom[hugo]:
                self.ensgs[hugo] = self.hugo_to_ensg[hugo]
            elif hugo in csq_hugos:
                self.ensgs[hugo] = csq_genes[csq_hugos.index(hugo)]
            else:
                print(f'ENSG ID for {hugo} was not found. Using {hugo} as group_id')
                self.ensgs[hugo] = hugo
        for hugo in csq_other_hugos:
            if hugo in self.ensgs:
                continue
            if hugo in self.hugo_to_ensg and chrom in self.hugo_to_chrom[hugo]:
                self.ensgs[hugo] = self.hugo_to_ensg[hugo]
            elif hugo in csq_hugos:
                self.ensgs[hugo] = csq_genes[csq_hugos.index(hugo)]
            else:
                print(f'ENSG ID for {hugo} was not found. Using {hugo} as group_id')
                self.ensgs[hugo] = hugo
        # Longest transcript as canonical
        for hugo in other_hugos:
            mappings = all_mappings[hugo]
            enst = mappings[0][0]
            enstnv = self.remove_version(enst)
            canonical_ensts[hugo] = enst
            canonical_enstnvs[hugo] = enstnv
            if enstnv in self.enstnv_to_alens:
                canonical_alen = self.enstnv_to_alens[enstnv]
            else:
                canonical_alen = -1
            for mapping in mappings[1:]:
                enst, sos = self.parse_mapping(mapping)
                enstnv = self.remove_version(enst)
                if enstnv in self.enstnv_to_alens:
                    alen = self.enstnv_to_alens[enstnv]
                else:
                    alen = -1
                if alen > canonical_alen:
                    canonical_alen = alen
                    canonical_ensts[hugo] = enst
                    canonical_enstnvs[hugo] = enstnv
        for hugo in csq_other_hugos:
            enst = csq_ensts[0]
            enstnv = self.remove_version(enst)
            if enst.startswith('ENST'):
                canonical_ensts[hugo] = enst
                canonical_enstnvs[hugo] = enstnv
            else:
                canonical_ensts[hugo] = None
                canonical_enstnvs[hugo] = None
            if enstnv in self.enstnv_to_alens:
                canonical_alen = self.enstnv_to_alens[enstnv]
            else:
                canonical_alen = -1
            for i in range(1, len(csq_ensts)):
                enst = csq_ensts[i]
                enstnv = self.remove_version(enst)
                if enst.startswith('ENST') == False:
                    continue
                if enstnv in self.enstnv_to_alens:
                    alen = self.enstnv_to_alens[enstnv]
                else:
                    alen = -1
                if canonical_ensts[hugo] is None or alen > canonical_alen:
                    canonical_alen = alen
                    canonical_ensts[hugo] = enst
                    canonical_enstnvs[hugo] = enstnv
        # SO for canonical transcripts
        canonical_sos = {}
        for hugo in list(set(hugos_in_mane) | set(other_hugos)):
            canonical_mapping = self.find_canonical_mapping(hugo, all_mappings, canonical_enstnvs[hugo])
            if canonical_mapping is not None:
                enst, sos = self.parse_mapping(canonical_mapping)
                canonical_sos[hugo] = sos
        csq_consequences = row[self.colno_csq_consequence]
        for hugo in list(set(csq_hugos_in_mane) | set(csq_other_hugos)):
            canonical_enstnv = canonical_enstnvs[hugo]
            for i in range(len(csq_ensts)):
                if csq_ensts[i].split('.')[0] == canonical_enstnv:
                    sos = self.convert_csq_consequence(csq_consequences[i])
                    if hugo not in canonical_sos:
                        canonical_sos[hugo] = sos
                    else:
                        canonical_sos[hugo] += ',' + sos
                    break
        return canonical_enstnvs, canonical_sos

    def get_lof_of_enstnv(self, enstnv, csq_lofs, csq_enstnvs):
        if len(csq_lofs) == 0:
            return None
        if enstnv in csq_enstnvs:
            return csq_lofs[csq_enstnvs.index(enstnv)]
        else:
            return None

    def get_all_mappings(self, row):
        all_mappings_t = row[self.colno_all_mappings]
        if all_mappings_t != '':
            all_mappings = self.parse_all_mappings_str(all_mappings_t)
        else:
            all_mappings = {}

    def get_so_of_enstnv(self, row, hugo, enstnv, csq_enstnvs, all_mappings, csq_sos):
        if hugo in all_mappings:
            for mapping in all_mappings[hugo]:
                if enstnv == mapping[3].split('.')[0]:
                    return mapping[2]
        if enstnv in csq_enstnvs:
            return self.convert_csq_consequence(csq_sos[csq_enstnvs.index(enstnv)])
        else:
            return None

    def get_csq_lofs(self, row):
        csq_lofs = row[self.colno_csq_lofs]
        if csq_lofs is None:
            return []
        else:
            return csq_lofs.split(';')

    def get_csq_enstnvs(self, row):
        csq_ensts = row[self.colno_csq_ensts]
        if csq_ensts is None:
            return []
        else:
            return [v.split('.')[0] for v in csq_ensts.split(';')]

    def run_coding1_filter(self, row, all_mappings, canonical_enstnvs, canonical_sos, csq_sos):
        csq_lofs = self.get_csq_lofs(row)
        csq_enstnvs = self.get_csq_enstnvs(row)
        metasvm_score = row[self.colno_metasvm_score]
        fathmm_xf_score = row[self.colno_fathmm_xf_score]
        group_ids = set()
        for hugo in canonical_enstnvs:
            enstnv = canonical_enstnvs[hugo]
            lof = self.get_lof_of_enstnv(enstnv, csq_lofs, csq_enstnvs)
            so = self.get_so_of_enstnv(
                row, hugo, enstnv, csq_enstnvs, all_mappings, csq_sos) # oc over vep
            if  lof == 'HC'\
                or\
                (so == 'missense_variant' and metasvm_score is not None and metasvm_score > 0)\
                or\
                (fathmm_xf_score is not None and fathmm_xf_score > 0.5 and\
                    so in ['complex_substitution', 
                    'exon_loss_variant',
                    'frameshift_variant',
                    'frameshift_elongation',
                    'frameshift_truncation',
                    'inframe_insertion',
                    'inframe_deletion'
                    'missense_variant',
                    'splice_site_variant',
                    'splice_acceptor_variant',
                    'splice_donor_variant',
                    'start_lost',
                    'stop_gained',
                    'stop_lost',
                    'transcript_ablation'])\
                or\
                (so == 'synonymous_variant' and\
                    fathmm_xf_score is not None and fathmm_xf_score > 0.5):
                group_ids.add(self.ensgs[hugo])
        return group_ids

    def run_coding2_filter(self, row, all_mappings, canonical_enstnvs, canonical_sos, csq_sos):
        csq_lofs = self.get_csq_lofs(row)
        csq_enstnvs = self.get_csq_enstnvs(row)
        fathmm_xf_score = row[self.colno_fathmm_xf_score]
        sift_prediction = row[self.colno_sift_prediction]
        lrt_pred = row[self.colno_lrt_lrt_pred]
        polyphen2_hdiv_pred = row[self.colno_polyphen2_hdiv_pred]
        polyphen2_hvar_pred = row[self.colno_polyphen2_hvar_pred]
        group_ids = set()
        for hugo in canonical_enstnvs:
            enstnv = canonical_enstnvs[hugo]
            lof = self.get_lof_of_enstnv(enstnv, csq_lofs, csq_enstnvs)
            so = self.get_so_of_enstnv(row, hugo, enstnv, csq_enstnvs, all_mappings, csq_sos)
            if  (\
                    so == 'missense_variant' and\
                    sift_prediction == 'Damaging' and\
                    lrt_pred == 'Deleterious' and\
                    polyphen2_hdiv_pred is not None and 'P' in polyphen2_hdiv_pred and\
                    polyphen2_hvar_pred is not None and 'P' in polyphen2_hvar_pred
                ) or\
                (fathmm_xf_score is not None and fathmm_xf_score > 0.5 and so in [
                    'complex_substitution', 
                    'exon_loss_variant',
                    'frameshift_variant',
                    'frameshift_elongation',
                    'frameshift_truncation',
                    'inframe_insertion',
                    'inframe_deletion'
                    'missense_variant',
                    'splice_site_variant',
                    'splice_acceptor_variant',
                    'splice_donor_variant',
                    'start_lost',
                    'stop_gained',
                    'stop_lost',
                    'transcript_ablation']\
                ) or\
                (\
                    so == 'synonymous_variant' and\
                    fathmm_xf_score is not None and fathmm_xf_score > 0.5\
                ) or\
                (lof == 'HC'):
                group_ids.add(self.ensgs[hugo])
        return group_ids

    def run_coding3_filter(self, row, all_mappings, canonical_enstnvs, canonical_sos, csq_sos):
        csq_lofs = self.get_csq_lofs(row)
        csq_enstnvs = self.get_csq_enstnvs(row)
        fathmm_xf_score = row[self.colno_fathmm_xf_score]
        sift_prediction = row[self.colno_sift_prediction]
        lrt_pred = row[self.colno_lrt_lrt_pred]
        polyphen2_hdiv_pred = row[self.colno_polyphen2_hdiv_pred]
        polyphen2_hvar_pred = row[self.colno_polyphen2_hvar_pred]
        group_ids = set()
        for hugo in canonical_enstnvs:
            enstnv = canonical_enstnvs[hugo]
            lof = self.get_lof_of_enstnv(enstnv, csq_lofs, csq_enstnvs)
            so = self.get_so_of_enstnv(row, hugo, enstnv, csq_enstnvs, all_mappings, csq_sos)
            if  (\
                    so == 'missense_variant' and\
                    (\
                        sift_prediction == 'Damaging' or\
                        lrt_pred == 'Deleterious' or\
                        (polyphen2_hdiv_pred is not None and 'P' in polyphen2_hdiv_pred) or\
                        (polyphen2_hvar_pred is not None and 'P' in polyphen2_hvar_pred)\
                    )\
                )\
                or\
                (fathmm_xf_score is not None and fathmm_xf_score > 0.5 and so in [
                    'complex_substitution', 
                    'exon_loss_variant',
                    'frameshift_variant',
                    'frameshift_elongation',
                    'frameshift_truncation',
                    'inframe_insertion',
                    'inframe_deletion'
                    'missense_variant',
                    'splice_site_variant',
                    'splice_acceptor_variant',
                    'splice_donor_variant',
                    'start_lost',
                    'stop_gained',
                    'stop_lost',
                    'transcript_ablation']) or\
                (so == 'synonymous_variant' and\
                    fathmm_xf_score is not None and fathmm_xf_score > 0.5)\
                or\
                (lof == 'HC'):
                group_ids.add(self.ensgs[hugo])
        return group_ids

    def run_coding_noncoding_filter_1(
            self, row, all_mappings, canonical_enstnvs, canonical_sos, csq_sos):
        csq_lofs = self.get_csq_lofs(row)
        csq_enstnvs = self.get_csq_enstnvs(row)
        fathmm_xf_score = row[self.colno_fathmm_xf_score]
        metasvm_score = row[self.colno_metasvm_score]
        sift_prediction = row[self.colno_sift_prediction]
        lrt_pred = row[self.colno_lrt_lrt_pred]
        genehancer_feature_name = row[self.colno_genehancer_feature_name]
        ensembl_regulatory_build_region = row[self.colno_ensembl_regulatory_build_region]
        group_ids = set()
        for hugo in canonical_enstnvs:
            enstnv = canonical_enstnvs[hugo]
            lof = self.get_lof_of_enstnv(enstnv, csq_lofs, csq_enstnvs)
            so = self.get_so_of_enstnv(row, hugo, enstnv, csq_enstnvs, all_mappings, csq_sos)
            if  lof == 'HC'\
                or\
                (so == 'missense_variant' and metasvm_score is not None and metasvm_score > 0)\
                or\
                (fathmm_xf_score is not None and fathmm_xf_score > 0.5 and\
                    so in ['complex_substitution', 
                    'exon_loss_variant',
                    'frameshift_variant',
                    'frameshift_elongation',
                    'frameshift_truncation',
                    'inframe_insertion',
                    'inframe_deletion'
                    'missense_variant',
                    'splice_site_variant',
                    'splice_acceptor_variant',
                    'splice_donor_variant',
                    'start_lost',
                    'stop_gained',
                    'stop_lost',
                    'transcript_ablation'])\
                or\
                (so == 'synonymous_variant' and\
                    fathmm_xf_score is not None and fathmm_xf_score > 0.5):
                group_ids.add(self.ensgs[hugo])
            elif genehancer_feature_name == 'Enhancer' and\
                (\
                    (fathmm_xf_score is not None and fathmm_xf_score > 0.5)\
                    or\
                    (ensembl_regulatory_build_region in [\
                        'CTCF_binding_site', 'TF_binding_site'\
                    ])\
                ):
                genehancer_target_genes = [v.split(':')[0]\
                    for v in row[self.colno_genehancertargetgenes].split(',')]
                for target in genehancer_target_genes:
                    if target.startswith('ENSG'):
                        group_ids.add(target)
            elif genehancer_feature_name == 'Promoter' and\
                (\
                    (fathmm_xf_score is not None and fathmm_xf_score > 0.5)\
                    or\
                    (ensembl_regulatory_build_region in [
                        'CTCF_binding_site', 'TF_binding_site'
                    ])\
                ):
                genehancer_target_genes = [v.split(':')[0]\
                    for v in row[self.colno_genehancertargetgenes].split(',')]
                for target in genehancer_target_genes:
                    if target.startswith('ENSG'):
                        group_ids.add(target)
            elif so is not None and 'upstream_gene_variant' in so and\
                (\
                    (fathmm_xf_score is not None and fathmm_xf_score > 0.5)\
                    or\
                    (ensembl_regulatory_build_region in [\
                        'CTCF_binding_site', 'TF_binding_site'\
                    ])\
                ):
                group_ids.add(self.ensgs[hugo])
        return group_ids

    def run_coding_noncoding_filter_2(
            self, row, all_mappings, canonical_enstnvs, canonical_sos, csq_sos):
        csq_lofs = self.get_csq_lofs(row)
        csq_enstnvs = self.get_csq_enstnvs(row)
        fathmm_xf_score = row[self.colno_fathmm_xf_score]
        metasvm_score = row[self.colno_metasvm_score]
        sift_prediction = row[self.colno_sift_prediction]
        lrt_pred = row[self.colno_lrt_lrt_pred]
        genehancer_feature_name = row[self.colno_genehancer_feature_name]
        ensembl_regulatory_build_region = row[self.colno_ensembl_regulatory_build_region]
        group_ids = set()
        for hugo in canonical_enstnvs:
            enstnv = canonical_enstnvs[hugo]
            lof = self.get_lof_of_enstnv(enstnv, csq_lofs, csq_enstnvs)
            so = self.get_so_of_enstnv(row, hugo, enstnv, csq_enstnvs, all_mappings, csq_sos)
            if  lof == 'HC'\
                or\
                (so == 'missense_variant' and metasvm_score is not None and metasvm_score > 0)\
                or\
                (fathmm_xf_score is not None and fathmm_xf_score > 0.5 and\
                    so in ['complex_substitution', 
                    'exon_loss_variant',
                    'frameshift_variant',
                    'frameshift_elongation',
                    'frameshift_truncation',
                    'inframe_insertion',
                    'inframe_deletion'
                    'missense_variant',
                    'splice_site_variant',
                    'splice_acceptor_variant',
                    'splice_donor_variant',
                    'start_lost',
                    'stop_gained',
                    'stop_lost',
                    'transcript_ablation'])\
                or\
                (so == 'synonymous_variant' and\
                    fathmm_xf_score is not None and fathmm_xf_score > 0.5):
                group_ids.add(self.ensgs[hugo])
            elif genehancer_feature_name == 'Enhancer' and\
                fathmm_xf_score is not None and fathmm_xf_score > 0.5 and\
                    ensembl_regulatory_build_region in [
                    'CTCF_binding_site', 
                    'TF_binding_site',
                    'enhancer',
                    'open_chromatin_region',
                    'promoter',
                    'promoter_flanking_region'
                ]:
                genehancer_target_genes = [v.split(':')[0]\
                    for v in row[self.colno_genehancertargetgenes].split(',')]
                for target in genehancer_target_genes:
                    if target.startswith('ENSG'):
                        group_ids.add(target)
            elif genehancer_feature_name == 'Promoter' and\
                fathmm_xf_score is not None and fathmm_xf_score > 0.5 and\
                    ensembl_regulatory_build_region in [
                    'CTCF_binding_site', 
                    'TF_binding_site'
                    'enhancer',
                    'open_chromatin_region',
                    'promoter',
                    'promoter_flanking_region'
                ]:
                genehancer_target_genes = [v.split(':')[0]\
                    for v in row[self.colno_genehancertargetgenes].split(',')]
                for target in genehancer_target_genes:
                    if target.startswith('ENSG'):
                        group_ids.add(target)
            elif so is not None and 'upstream_gene_variant' in so and\
                fathmm_xf_score is not None and fathmm_xf_score > 0.5 and\
                    ensembl_regulatory_build_region in [
                    'CTCF_binding_site', 
                    'TF_binding_site'
                    'enhancer',
                    'open_chromatin_region',
                    'promoter',
                    'promoter_flanking_region'
                ]:
                group_ids.add(self.ensgs[hugo])
        return group_ids

    def write_table_row (self, row):
        if self.should_write_level(self.level) == False:
            return
        try:
            if len(self.colnos_to_display[self.level]) > 0:
                filtered_row = [row[colno] for colno in self.colnos_to_display[self.level]]
            else:
                filtered_row = row
            chrom = filtered_row[self.colno_to_display_chrom]
            pos = int(filtered_row[self.colno_to_display_pos])
            ref = filtered_row[self.colno_to_display_ref]
            alt = filtered_row[self.colno_to_display_alt]
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
            all_mappings_t = row[self.colno_all_mappings]
            if all_mappings_t != '':
                all_mappings = self.parse_all_mappings_str(all_mappings_t)
            else:
                all_mappings = {}
            csq_consequences = row[self.colno_csq_consequence]
            if csq_consequences is None:
                csq_consequences = []
            else:
                csq_consequences = csq_consequences.split(';')
            #coding = row[self.colno_coding]
            #genehancertargetgenes = row[self.colno_genehancertargetgenes]
            # VEP annotations
            #csq = row[self.colno_csq]
            #csq_hugos = row[self.colno_csq_symbol]
            #csq_genes = row[self.colno_csq_gene]
            #csq_lofs = row[self.colno_csq_lofs]
            #csq_biotypes = row[self.colno_csq_biotype]
            #csq_ensts = row[self.colno_csq_ensts]
            #if csq_hugos is None:
            #    csq_hugos = []
            #else:
                #csq_hugos = [self.hugo_synonyms[v] if v in self.hugo_synonyms else v\
                    #for v in csq_hugos.split(';')]
            #    csq_hugos = csq_hugos.split(';')
            #if csq_ensts is None:
            #    csq_ensts = []
            #else:
            #    csq_ensts = csq_ensts.split(';')
            #if csq_genes is not None:
            #    csq_genes = [m for v in csq_genes.split(',') for m in v.split(';')]
            #else:
            #    csq_toks = csq.split('|')
            #    for tok in csq_toks:
            #        if 'ENSG' in tok:
            #            csq_genes = [m for v in tok.split(',') for m in v.split(';')]
            #            break
            #if csq_genes is None:
            #    csq_genes = []
            #if csq_lofs is not None:
            #    csq_lofs = csq_lofs.split(';')
            #else:
            #    csq_toks = csq.split('|')
            #    for tok in csq_toks:
            #        if 'HC' in tok:
            #            csq_lofs = tok.split(';')
            #            break
            #if csq_lofs is None:
            #    csq_lofs = []
            #if csq_biotypes is None:
            #    csq_biotypes = []
            #else:
            #    csq_biotypes = csq_biotypes.split(';')
            canonical_enstnvs, canonical_sos = self.get_canonicals(row, all_mappings, chrom)
            # Filters
            if self.filter_name.startswith('coding1.json'):
                group_ids = self.run_coding1_filter(
                    row, 
                    all_mappings, 
                    canonical_enstnvs, 
                    canonical_sos,
                    csq_consequences
                )
            elif self.filter_name.startswith('coding2.json'):
                group_ids = self.run_coding2_filter(
                    row, 
                    all_mappings, 
                    canonical_enstnvs, 
                    canonical_sos,
                    csq_consequences
                )
            elif self.filter_name.startswith('coding3.json'):
                group_ids = self.run_coding3_filter(
                    row, 
                    all_mappings, 
                    canonical_enstnvs, 
                    canonical_sos,
                    csq_consequences
                )
            elif self.filter_name.startswith('coding_noncoding_1.json'):
                group_ids = self.run_coding_noncoding_filter_1(
                    row, 
                    all_mappings, 
                    canonical_enstnvs, 
                    canonical_sos,
                    csq_consequences
                )
            elif self.filter_name.startswith('coding_noncoding_2.json'):
                group_ids = self.run_coding_noncoding_filter_2(
                    row, 
                    all_mappings, 
                    canonical_enstnvs, 
                    canonical_sos,
                    csq_consequences
                )
            '''
            # GeneHancer targets
            if genehancertargetgenes is not None:
                genehancertargetgenes = [v.split(':')[0].strip() for v in genehancertargetgenes.split(',')]
                for target in genehancertargetgenes:
                    if target.startswith('ENSG') and target not in group_ids:
                        group_ids.add(target)
                        genehancer_target_exists = True
                    elif target in self.hugo_to_ensg and target in self.hugo_to_chrom and chrom in self.hugo_to_chrom[target]:
                        ensg = self.hugo_to_ensg[target]
                        if ensg not in group_ids:
                            group_ids.add(ensg)
                            genehancer_target_exists = True
            '''
            wrong_chrom_ensgs = []
            for ensg in group_ids:
                if ensg in self.ensg_to_chrom and self.ensg_to_chrom[ensg] != chrom:
                    wrong_chrom_ensgs.append(ensg)
            if len(wrong_chrom_ensgs) > 0:
                print(f'@@@ wrong_chrom_ensgs={wrong_chrom_ensgs}')
            for ensg in wrong_chrom_ensgs:
                    group_ids.remove(ensg)
            '''
            so_ignores = [
                'intron_variant', 
                'synonymous_variant', 
                '3_prime_UTR_variant', 
                '5_prime_UTR_variant', 
                'downstream_gene_variant', 
                'intergenic_variant', 
                'non_coding_transcript_exon_variant',
                'splice_region_variant',
                'start_retained_variant',
                'stop_retained_variant',
                'mature_miRNA_variant',
                'NMD_transcript_variant',
                'non_coding_transcript_variant',
                'TFBS_ablation',
                'TFBS_amplification',
                'TF_binding_site_variant',
                'regulatory_region_ablation',
                'regulatory_region_amplification',
                'feature_elongation',
                'regulatory_region_variant',
                'feature_truncation',
                'incomplete_terminal_codon_variant',
            ]
            # Collects group_id.
            group_ids = set() 
            ## coding and splice site variant
            for hugo in canonical_enstsnv:
                if hugo == '': # For example, ENSTR.
                    continue
                sos = None
                if hugo not in canonical_sos:
                    canonical_enstnv = canonical_enstnvs[hugo]
                    for i in range(len(csq_ensts)):
                        enstnv = self.remove_version(csq_ensts[i])
                        if enstnv == canonical_enstnv:
                            csq_consq = csq_consequences[i]
                            if ('intron' in csq_consq and not ('splice_donor' in csq_consq or 'splice_acceptor' in csq_consq)) or 'downstream' in csq_consq or 'non_coding' in csq_consq or 'upstream' in csq_consq:
                                break
                            elif enstnv not in self.enstnv_to_alens:
                                print(f'{enstnv} not in oc aalen')
                                break
                            elif (self.filter_name == 'coding1' or self.filter_name == 'coding2' or self.filter_name == 'coding3'):
                                if csq_biotypes[i] != 'protein_coding':
                                    break
                                elif self.has_coding_so(
                            if csq_hugos[i] in canonical_sos:
                                sos = canonical_sos[csq_hugos[i]]
                                break
                            for cano_hugo, cano_enstnv in canonical_enstnvs.items():
                                if cano_enstnv == canonical_enstnv and cano_hugo in canonical_sos:
                                    sos = canonical_sos[cano_hugo]
                                    break
                            if sos is None:
                                print(f'##################\nAn exception occurred. Please contact the OpenCRAVAT team with the following information:')
                                print(f'#exception: sos is None\n#row={row}\ncanonical_enstnvs={canonical_enstnvs}\ncanonical_sos={canonical_sos}\nin mane? {hugo in self.mane_hugos}\nall_mappings={all_mappings}\ncsq_ensts={csq_ensts}\ncsq_hugos={csq_hugos}\ncsq_consequenced={csq_consequences}\ncsq={csq}\nhugo={hugo}')
                                return
                        if sos is not None:
                            break
                    if sos is None:
                        continue
                else:
                    sos = canonical_sos[hugo]
                if self.has_coding_so(sos):
                    ensg = self.ensgs[hugo]
                    group_ids.add(ensg)
            ## HC Lof from VEP
            if len(csq_ensts) == len(csq_lofs):
                for hugo in canonical_enstsnv:
                    canonical_enstnv = canonical_enstsnv[hugo]
                    if canonical_enstnv is None:
                        continue
                    ensg = self.ensgs[hugo]
                    if ensg in group_ids:
                        continue
                    for i in range(len(csq_lofs)):
                        enst = csq_ensts[i]
                        enstnv = self.remove_version(enst)
                        lof = csq_lofs[i]
                        biotype = csq_biotypes[i]
                        ### LoF HC and BIOTYPE relationship from chr22.sqlite:
                        # frameshift_variant	protein_coding
                        # frameshift_variant&splice_region_variant	protein_coding
                        # frameshift_variant&start_lost	protein_coding
                        # frameshift_variant&stop_lost	protein_coding
                        # frameshift_variant&stop_retained_variant	protein_coding
                        # splice_acceptor_variant	protein_coding
                        # splice_acceptor_variant&coding_sequence_variant	protein_coding
                        # splice_acceptor_variant&coding_sequence_variant&intron_variant	protein_coding
                        # splice_acceptor_variant&intron_variant	protein_coding
                        # splice_donor_variant	protein_coding
                        # splice_donor_variant&coding_sequence_variant	protein_coding
                        # splice_donor_variant&coding_sequence_variant&intron_variant	protein_coding
                        # splice_donor_variant&intron_variant	protein_coding
                        # stop_gained	protein_coding
                        # stop_gained&frameshift_variant	protein_coding
                        # stop_gained&inframe_insertion	protein_coding
                        # stop_gained&inframe_insertion&splice_region_variant	protein_coding
                        # stop_gained&splice_region_variant	protein_coding
                        ### thus, no need for checking BIOTYPE "protein_coding".
                        if enstnv == canonical_enstnv and lof == 'HC':
                            group_ids.add(ensg)
                            break
            ## GeneHancer
            genehancer_target_exists = False
            if genehancertargetgenes is not None:
                genehancertargetgenes = [v.split(':')[0].strip() for v in genehancertargetgenes.split(',')]
                for target in genehancertargetgenes:
                    if target.startswith('ENSG') and target not in group_ids:
                        group_ids.add(target)
                        genehancer_target_exists = True
                    elif target in self.hugo_to_ensg and target in self.hugo_to_chrom and chrom in self.hugo_to_chrom[target]:
                        ensg = self.hugo_to_ensg[target]
                        if ensg not in group_ids:
                            group_ids.add(ensg)
                            genehancer_target_exists = True
            ## 5k upstream
            upstream_but_no_canonical = False
            if len(csq_consequences) > 0:
                for hugo in canonical_enstsnv:
                    ensg = self.ensgs[hugo]
                    if ensg in group_ids:
                        continue
                    canonical_enstnv = canonical_enstnvs[hugo]
                    for i in range(len(csq_genes)):
                        hugo = csq_hugos[i]
                        #if hugo in self.hugo_synonyms:
                        #    hugo = self.hugo_synonyms[hugo]
                        ensg = csq_genes[i]
                        enst = csq_ensts[i]
                        enstnv = self.remove_version(enst)
                        consequence = csq_consequences[i]
                        if hugo == '': # ENSR for example
                            continue
                        if 'upstream_gene_variant' in consequence:
                            if enstnv == canonical_enstnv:
                                group_ids.add(csq_genes[i])
                                upstream_but_no_canonical = False
                                break
                            else:
                                upstream_but_no_canonical = True
            if len(group_ids) == 0:
                errmsgs = set()
                correct_so = False
                for hugo in canonical_sos:
                    sos = canonical_sos[hugo].split(',')
                    if self.has_coding_so(sos):
                        correct_so = True
                        break
                if correct_so == False:
                    errmsgs.add(f'no valid so in canonical transcript')
                if genehancertargetgenes is not None \
                        and len(genehancertargetgenes) > 0 \
                        and genehancer_target_exists == False:
                    errmsgs.add(f'GeneHancer targets are not ENSG')
                if upstream_but_no_canonical:
                    errmsgs.add('5k upstream on non-canonical transcript')
                if len(csq_ensts) == 0:
                    errmsgs.add('no transcript detected')
                if 'HC' in csq_lofs:
                    correct_lof_canonical_so = False
                    for lof_i in range(len(csq_lofs)):
                        lof = csq_lofs[lof_i]
                        enst = csq_ensts[lof_i]
                        consequence = csq_consequences[lof_i]
                        hugo = csq_hugos[lof_i]
                        if hugo in canonical_enstnvs:
                            canonical = canonical_enstnvs[hugo]
                        else:
                            canonical = ''
                        if lof == 'HC' and enst.split('.')[0] == canonical\
                                and consequence not in so_ignores:
                            correct_lof_canonical_so = True
                            break
                    if correct_lof_canonical_so == False:
                        errmsgs.add('no HC lof for canonical transcript with valid so')
                no_canonical_enst = True
                for hugo in canonical_enstnvs:
                    if hugo in all_mappings:
                        mappings = all_mappings[hugo]
                        for mapping in mappings:
                            enstnv = mapping[0].split('.')[0]
                            if enstnv == canonical_enstnvs[hugo]:
                                no_canonical_enst = False
                                break
                if len(csq_hugos) > 0:
                    for enst_i in range(len(csq_ensts)):
                        enstnv = csq_ensts[enst_i].split('.')[0]
                        if enstnv.startswith('ENST') == False:
                            continue
                        hugo = csq_hugos[enst_i]
                        #if hugo in self.hugo_synonyms:
                        #    hugo = self.hugo_synonyms[hugo]
                        try:
                            if enstnv == canonical_enstnvs[hugo]:
                                no_canonical_enst = False
                                break
                        except:
                            print(f'hugo={hugo} canonical_enstnvs={canonical_enstnvs}')
                            print(f'csq_hugos={csq_hugos}')
                            print(f'row={row}')
                            raise
                if no_canonical_enst:
                    errmsgs.add('no canonical transcript')
                if len(errmsgs) == 0:
                    print(f'#################\nAn exception occurred. Please contact the OpenCRAVAT team with the following information:')
                    print(f'#exception: No gene name for {chrom} {pos} {ref} {alt}\n#row={row}\n# csq={csq}\n# row={row}\n# csq_genes={csq_genes}\n# canonical_sos={canonical_sos}\n# coding={coding}\n# csq_lofs={csq_lofs}\n# genehancertargetgenes={genehancertargetgenes}\n# csq_ensts={csq_ensts}\n# csq_consequence={csq_consequences}\n# group_ids={group_ids}\n# canonical_ensts={canonical_ensts}\n# all_mappings={all_mappings}\n# genehancer_target_exists={genehancer_target_exists}\n# errmsgs={errmsgs}')
            else:
                if chrom.startswith('chr'):
                    chrom = chrom[3:]
                    filtered_row[self.colno_to_display_chrom] = chrom
                group_ids = list(group_ids)
                group_ids.sort()
                group_ids = [v for v in group_ids if v != '']
                for group_id in group_ids:
                    filtered_row[self.colno_to_display_hugo] = group_id
                    self.data[self.level].append([v for v in list(filtered_row)])
            '''
            if chrom.startswith('chr'):
                chrom = chrom[3:]
                filtered_row[self.colno_to_display_chrom] = chrom
            group_ids = list(group_ids)
            group_ids.sort()
            group_ids = [v for v in group_ids if v != '']
            for group_id in group_ids:
                filtered_row[self.colno_to_display_hugo] = group_id
                self.data[self.level].append([v for v in list(filtered_row)])
        except Exception as e:
            print(f'#################\nAn exception occurred. Please contact the OpenCRAVAT team with the following information:')
            print(f'#exception: {e}')
            import traceback
            traceback.print_exc(file=sys.stdout)
            print(f'#row={row}')

    def end (self):
        self.dfs = {}
        for level in self.headers.keys():
            level_data = pd.DataFrame(self.data[level], columns=self.colnames_to_display[level])
            level_data = level_data.drop_duplicates()
            self.filename = f'{self.filename_prefix}.{level}.{self.filename_postfix}'
            self.filenames.append(self.filename)
            if len(level_data) > 0:
                pyreadr.write_rdata(self.filename, level_data, df_name=f'{self.filename_prefix}_{level}')
            else:
                wf = open(self.filename, 'w')
                wf.close()
        return self.filenames

def main ():
    reporter = Reporter(sys.argv)
    reporter.run()

if __name__ == '__main__':
    main()
