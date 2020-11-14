from cravat.cravat_report import CravatReport
import sys
import datetime
import re
import csv
import zipfile
import os
import sqlite3
import json
from io import StringIO
import cravat

class Reporter(CravatReport):
    def setup(self):
        self.wf = None
        self.tsvwriter = None
        self.filenames = []
        self.filename = None
        self.filename_prefix = None
        if self.savepath == None:
            self.filename_prefix = "cravat_result"
        else:
            self.filename_prefix = self.savepath
        self.levels_to_write = self.get_standardized_module_option(
            self.confs.get("pages", "variant")
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
        self.cols_to_display = self.get_standardized_module_option(
            self.confs.get("extract-columns", [])
        )
        self.display_select_columns = len(self.cols_to_display) > 0
        self.module_col_sep = "."
        self.cols_hidden = {}
        self.colnos_to_display = {}
        if self.display_select_columns == False and self.show_default_cols_only:
            db = sqlite3.connect(self.dbpath)
            c = db.cursor()
            q = f'select name from sqlite_master where name like "%_header"'
            c.execute(q)
            levels = [v[0].split("_")[0] for v in c.fetchall()]
            for level in levels:
                self.cols_hidden[level] = []
                q = f"select col_name, col_def from {level}_header"
                c.execute(q)
                for row in c.fetchall():
                    (col_name, col_def) = row
                    col_def = json.loads(col_def)
                    if "hidden" in col_def and col_def["hidden"] == True:
                        self.cols_hidden[level].append(col_name)
        self.headers = {}
        self.dataframe_cols = {}
        self.dataframe_colnos = {}
        self.dataframe_headers = {}
        self.colno_to_colname = {}
        self.filename_postfix = '.simple.tsv'

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

    def end(self):
        if self.wf is not None:
            self.wf.close()
        if self.zip:
            zipfile_path = self.filename_prefix + ".tsv.zip"
            zf = zipfile.ZipFile(
                zipfile_path, mode="w", compression=zipfile.ZIP_DEFLATED
            )
            for filename in self.filenames:
                zf.write(
                    filename, os.path.relpath(filename, start=os.path.dirname(filename))
                )
            zf.close()
        else:
            zipfile_path = self.filenames
        return zipfile_path

    def write_preface(self, level):
        self.level = level
        if level not in self.cols_hidden:
            self.cols_hidden[level] = []
        if self.wf is not None:
            self.wf.close()
        if self.separate_header_file:
            self.filename = self.filename_prefix + "." + level + self.filename_postfix + ".header"
        else:
            self.filename = self.filename_prefix + "." + level + self.filename_postfix
            self.filenames.append(self.filename)
        self.wf = open(self.filename, "w", encoding="utf-8", newline="")
        self.tsvwriter = csv.writer(self.wf, delimiter='\t', lineterminator="\n")
        lines = []
        if self.separate_header_file:
            lines.append("title=\"OpenCRAVAT Report Header\"")
            lines.append(f"datafile={self.filename[:-7]}")
        else:
            lines.append("title=\"OpenCRAVAT Report\"")
        lines.extend(
            [
                "created=" + datetime.datetime.now().strftime("%A %m/%d/%Y %X"),
                "level=" + level,
            ]
        )
        lines.append(f"datasource={self.dbpath}")
        self.write_preface_lines(lines)

    def write_header(self, level):
        self.headers[self.level] = []
        self.dataframe_colnos[self.level] = []
        self.dataframe_cols[self.level] = []
        self.dataframe_headers[self.level] = {}
        self.colno_to_colname[self.level] = {}
        # table columns
        for colgroup_dict in self.colinfo[self.level]['colgroups']:
            colgroup_name = colgroup_dict['name']
            conf = cravat.admin_util.get_local_module_info(colgroup_name).conf
            if 'output_columns' not in conf:
                continue
            for output_dict in conf['output_columns']:
                if output_dict.get('table', False) == True:
                    colname = colgroup_name + '__' + output_dict['name']
                    self.cols_hidden[level].append(colname)
                    self.dataframe_cols[self.level].append(colname)
                    self.dataframe_headers[self.level][colname] = [v['name'] for v in output_dict['table_headers']]
        colno = 0
        for col in self.colinfo[self.level]['columns']:
            colname = col['col_name']
            self.colno_to_colname[self.level][colno] = colname
            self.headers[self.level].append(colname)
            if colname in self.dataframe_cols[self.level]:
                self.dataframe_colnos[self.level].append(colno)
            colno += 1
        colno = 0
        display_colno = 0
        self.colnos_to_display[level] = []
        for colgroup in self.colinfo[level]["colgroups"]:
            count = colgroup["count"]
            if count == 0:
                continue
            for col in self.colinfo[level]["columns"][colno : colno + count]:
                module_col_name = col["col_name"]
                if self.display_select_columns:
                    if module_col_name in self.cols_to_display:
                        include_col = True
                    else:
                        include_col = False
                else:
                    if module_col_name not in self.cols_hidden[level]:
                        include_col = True
                    else:
                        include_col = False
                if include_col:
                    [module_name, col_name] = col["col_name"].split("__")
                    if module_name == "base":
                        line = f'column={display_colno},{col_name},"{col["col_title"]}"'
                    else:
                        line = f'column={display_colno},{module_name}{self.module_col_sep}{col_name},"{col["col_title"]}"'
                    self.write_preface_line(line)
                    display_colno += 1
                    self.colnos_to_display[level].append(colno)
                colno += 1
        row = []
        colno = 0
        if self.separate_header_file:
            self.wf.close()
            self.filename = f"{self.filename_prefix}.{level}{self.filename_postfix}"
            self.filenames.append(self.filename)
            self.wf = open(self.filename, "w", encoding="utf-8", newline="")
            self.tsvwriter = csv.writer(self.wf, delimiter='\t', lineterminator="\n")
        for colgroup in self.colinfo[level]["colgroups"]:
            count = colgroup["count"]
            if count == 0:
                continue
            for col in self.colinfo[level]["columns"][colno : colno + count]:
                if col["col_name"].startswith("base__"):
                    row.append(col["col_name"].split("__")[1])
                else:
                    row.append(col["col_name"].replace("__", self.module_col_sep))
                colno += 1
        self.write_body_line(row)

    def write_table_row(self, row):
        for colno in self.dataframe_colnos[self.level]:
            dfhdata = row[colno]
            if dfhdata is not None:
                dfhdata = json.loads(dfhdata.replace("'", '"'))
            else:
                dfhdata = []
            colname = self.colno_to_colname[self.level][colno]
            line = StringIO()
            writer = csv.writer(line, lineterminator='\n')
            writer.writerow(self.dataframe_headers[self.level][colname])
            for dfhrow in dfhdata:
                writer.writerow(dfhrow)
            row[colno] = line.getvalue()
        self.write_body_line([str(v) if v != None else "" for v in list(row)])

    def write_body_lines(self, lines):
        for line in lines:
            self.write_body_line(line)

    def write_body_line(self, row):
        if len(self.colnos_to_display[self.level]) > 0:
            filtered_row = [row[colno] for colno in self.colnos_to_display[self.level]]
        else:
            filtered_row = row
        self.tsvwriter.writerow(filtered_row)

    def write_preface_lines(self, lines):
        for line in lines:
            self.write_preface_line(line)

    def write_preface_line(self, line):
        self.wf.write("#" + line + "\n")


def main():
    reporter = Reporter(sys.argv)
    reporter.run()


if __name__ == "__main__":
    main()
