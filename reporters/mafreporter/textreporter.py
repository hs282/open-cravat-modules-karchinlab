from cravat.cravat_report import CravatReport
import sys
import datetime
import re

class Reporter(CravatReport):

    def setup (self):
        if self.savepath == None:
            self.savepath = 'cravat_result.tsv'
        else: 
            if self.savepath[-5:] != '.tsv':
                self.savepath = self.savepath + '.tsv'
        self.wf = open(self.savepath, 'w', encoding='utf-8')
    
    def end (self):
        self.wf.close()
        
    def write_preface (self, level): 
        lines = ['CRAVAT Report', 
            'Created at ' + 
                datetime.datetime.now().strftime('%A %m/%d/%Y %X'),
            'Report level: ' + level,
            '']
        self.write_preface_lines(lines)
    
    def write_header (self, level):
        line = ''
        for colgroup in self.colinfo[level]['colgroups']:
            count = colgroup['count']
            if count == 0:
                continue
            line += colgroup['displayname']
            for i in range(count):
                line += '\t'
        if line[-1] == '\t':
            line = line[:-1]
        self.write_body_line(line)
        self.write_body_line('\t'.join(
            [column['col_title'] for column in self.colinfo[level]['columns']]))
    
    def write_table_row (self, row):
        self.write_body_line('\t'.join([
            str(v) if v != None else '' for v in list(row)]))
        
    def write_body_lines (self, lines):
        for line in lines:
            self.write_body_line(line)
    
    def write_body_line (self, line):
        self.wf.write(line + '\n')
    
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
