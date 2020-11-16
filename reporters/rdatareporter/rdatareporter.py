from cravat.cravat_report import CravatReport
import sys
import datetime
import re
import pandas as pd
import cravat
import json
import pyreadr
import sqlite3

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
                self.confs.get("separate-header-file", "false")
            )
            == True
        )
        self.zip = (
            self.get_standardized_module_option(self.confs.get("zip", "false")) == True
        )
        self.show_default_cols_only = (
            self.get_standardized_module_option(
                self.confs.get("show-default-columns-only", "false")
            )
            == True
        )
        self.cols_to_display = self.get_standardized_module_option(
            self.confs.get("extract-columns", [])
        )
        self.display_select_columns = len(self.cols_to_display) > 0
        self.module_col_sep = "."
        self.colnos_to_display = {}
        self.colnames_to_display = {}
        self.dataframe_colnames = {}
        if self.display_select_columns == False:
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
                    col_add = False
                    if self.show_default_cols_only:
                        if "hidden" not in col_def or col_def["hidden"] == False:
                            col_add = True
                    else:
                        col_add = True
                    if col_add:
                        if col_name not in self.cols_to_display:
                            self.cols_to_display.append(col_name)
                        if "table" in col_def and col_def["table"] == True:
                            self.dataframe_colnames.append(col_name)
        self.headers = {}
        self.dataframe_cols = {}
        self.dataframe_colnos = {}
        self.dataframe_headers = {}
        self.colno_to_colname = {}
        self.filename_postfix = 'RData'
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

    def write_header (self, level):
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
                    if colname in self.dataframe_colnames:
                        self.dataframe_cols[self.level].append(colname)
                        self.dataframe_headers[self.level][colname] = [v for v in output_dict['table_headers']]
        colno = 0
        for col in self.colinfo[self.level]['columns']:
            colname = col['col_name']
            self.colno_to_colname[self.level][colno] = colname
            self.headers[self.level].append(colname)
            if colname in self.dataframe_cols[self.level]:
                self.dataframe_colnos[self.level].append(colno)
            colno += 1
        colno = 0
        self.colnos_to_display[level] = []
        self.colnames_to_display[level] = []
        columns = self.colinfo[level]["columns"]
        for module_col_name in self.cols_to_display:
            [module_name, col_name] = module_col_name.split('__')
            for colno in range(len(columns)):
                if columns[colno]["col_name"] == module_col_name:
                    self.colnos_to_display[level].append(colno)
                    self.colnames_to_display[level].append(module_col_name)
                    break
        self.data[self.level] = []

    def write_table_row (self, row):
        if len(self.colnos_to_display[self.level]) > 0:
            filtered_row = [row[colno] for colno in self.colnos_to_display[self.level]]
        else:
            filtered_row = row
        self.data[self.level].append([v for v in list(filtered_row)])
        for colno in self.dataframe_colnos[self.level]:
            dfhdata = self.data[self.level][-1][colno]
            if dfhdata is not None and len(dfhdata) > 0:
                dfhdata = json.loads(dfhdata)
            else:
                dfhdata = []
            colname = self.colno_to_colname[self.level][colno]
            self.data[self.level][-1][colno] = pd.DataFrame(dfhdata, columns=self.dataframe_headers[self.level][colname])

    def end (self):
        self.dfs = {}
        for level in self.headers.keys():
            columns=[v if v.startswith('base__') == False else v[6:] for v in self.colnames_to_display[level]]
            level_data = pd.DataFrame(self.data[level], columns=[v if v.startswith('base__') == False else v[6:] for v in self.colnames_to_display[level]])
            self.filename = f'{self.filename_prefix}.{level}.{self.filename_postfix}'
            self.filenames.append(self.filename)
            pyreadr.write_rdata(self.filename, level_data, df_name=f'{self.filename_prefix}_{level}')
        return self.filenames

def main ():
    reporter = Reporter(sys.argv)
    reporter.run()

if __name__ == '__main__':
    main()
