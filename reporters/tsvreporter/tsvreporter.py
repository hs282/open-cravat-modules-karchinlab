from cravat.cravat_report import CravatReport
import sys
import datetime
import re
import csv
import zipfile
import os

class Reporter(CravatReport):

    def setup (self):
        self.wf = None
        self.csvwriter = None
        self.filenames = []
        self.filename = None
        self.filename_prefix = None
        if self.savepath == None:
            self.filename_prefix = 'cravat_result'
        else:
            self.filename_prefix = self.savepath
    
    def end (self):
        if self.wf is not None:
            self.wf.close()
        zipfile_path = self.filename_prefix + '.tsv.zip'
        zf = zipfile.ZipFile(zipfile_path, mode='w', compression=zipfile.ZIP_DEFLATED)
        for filename in self.filenames:
            zf.write(filename, os.path.relpath(filename, start=os.path.dirname(filename)))
        zf.close()
        return zipfile_path
        
    def write_preface (self, level): 
        if self.wf is not None:
            self.wf.close()
        self.filename = self.filename_prefix + '.' + level + '.tsv'
        self.filenames.append(self.filename)
        self.wf = open(self.filename, 'w', encoding='utf-8', newline='')
        self.csvwriter = csv.writer(self.wf, delimiter='\t', lineterminator='\n')
        lines = ['CRAVAT Report', 
            'Created at ' + 
                datetime.datetime.now().strftime('%A %m/%d/%Y %X'),
            'Report level: ' + level,
            '']
        self.write_preface_lines(lines)
    
    def write_header (self, level):
        colno = 0
        for colgroup in self.colinfo[level]['colgroups']:
            count = colgroup['count']
            if count == 0:
                continue
            for col in self.colinfo[level]['columns'][colno:colno+count]:
                [module_name, col_name] = col['col_name'].split('__')
                line = 'Column description. Column {} {}:{}={}'.format(colno, module_name, col_name, col['col_title'])
                self.write_preface_line(line)
                colno += 1
        line = '#'
        colno = 0
        for colgroup in self.colinfo[level]['colgroups']:
            count = colgroup['count']
            if count == 0:
                continue
            for col in self.colinfo[level]['columns'][colno:colno+count]:
                line += ':'.join(col['col_name'].split('__')) + '\t'
                colno += 1
        if line[-1] == '\t':
            line = line[:-1]
        self.write_preface_line(line)
    
    def write_table_row (self, row):
        self.write_body_line([
            str(v) if v != None else '' for v in list(row)])
        
    def write_body_lines (self, lines):
        for line in lines:
            self.write_body_line(line)
    
    def write_body_line (self, row):
        self.csvwriter.writerow(row)
    
    def write_preface_lines (self, lines):
        for line in lines:
            self.write_preface_line(line)
    
    def write_preface_line (self, line):
        self.wf.write('#' + line + '\n')

def main ():
    reporter = Reporter(sys.argv)
    reporter.run()

if __name__ == '__main__':
    main()
