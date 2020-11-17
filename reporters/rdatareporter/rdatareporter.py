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
        self.headers = {}
        self.dataframe_cols = {}
        self.dataframe_colnos = {}
        self.dataframe_headers = {}
        self.colno_to_colname = {}
        self.levels_to_write = self.get_standardized_module_option(self.confs.get('pages',['variant']))
        self.filename_postfix = 'RData'
        self.data = {}
        self.wgs_reader = cravat.get_wgs_reader('hg38')

    def write_preface (self, level):
        self.level = level

    def write_header (self, level):
        self.dataframe_cols[self.level] = []
        self.dataframe_headers[self.level] = {}
        self.colno_to_colname[self.level] = {}
        for colgroup_dict in self.colinfo[self.level]['colgroups']:
            colgroup_name = colgroup_dict['name']
            minfo = cravat.admin_util.get_local_module_info(colgroup_name)
            if minfo is None:
                continue
            conf = minfo.conf
            if 'output_columns' not in conf:
                continue
            for output_dict in conf['output_columns']:
                module_col_name = colgroup_name + '__' + output_dict['name']
                if module_col_name in self.colnames_to_display[level]:
                    if output_dict.get('table', False) == True:
                        module_col_name = colgroup_name + '__' + output_dict['name']
                        self.dataframe_cols[self.level].append(module_col_name)
                        self.dataframe_headers[self.level][module_col_name] = [v['name'] for v in output_dict['table_headers']]
        self.headers[self.level] = []
        self.dataframe_colnos[self.level] = []
        colno = 0
        for col in self.extracted_cols[level]:
            colname = col['col_name']
            self.colno_to_colname[self.level][colno] = colname
            self.headers[self.level].append(colname)
            if colname in self.dataframe_cols[self.level]:
                self.dataframe_colnos[self.level].append(colno)
            colno += 1
        self.data[self.level] = []

    def write_table_row (self, row):
        self.data[self.level].append([v for v in list(row)])
        for colno in self.dataframe_colnos[self.level]:
            dfhdata = self.data[self.level][-1][colno]
            if dfhdata is not None and len(dfhdata) > 0:
                dfhdata = json.loads(dfhdata)
            else:
                dfhdata = []
            #colname = self.colno_to_colname[self.level][colno]
            colname = self.colnames_to_display[self.level][colno]
            self.data[self.level][-1][colno] = pd.DataFrame(dfhdata, columns=self.dataframe_headers[self.level][colname])

    def end (self):
        self.dfs = {}
        for level in self.headers.keys():
            columns=[v if v.startswith('base__') == False else v[6:] for v in self.colnames_to_display[level]]
            level_data = pd.DataFrame(self.data[level], columns=columns)
            self.filename = f'{self.filename_prefix}.{level}.{self.filename_postfix}'
            self.filenames.append(self.filename)
            pyreadr.write_rdata(self.filename, level_data, df_name=f'{self.filename_prefix}_{level}')
        return self.filenames

def main ():
    reporter = Reporter(sys.argv)
    reporter.run()

if __name__ == '__main__':
    main()
