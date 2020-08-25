from cravat.cravat_report import CravatReport
import sys
import datetime
import re

class Reporter(CravatReport):

    def write_preface (self, level):
        self.level = level

    def write_header (self, level):
        if self.level != 'variant':
            return
        line = '#'+'\t'.join([col['col_name'] for col in self.colinfo[level]['columns']])
        print(line)

    def write_table_row (self, row):
        if self.level != 'variant':
            return
        print('\t'.join([str(v) if v != None else '' for v in list(row)]))

def main ():
    reporter = Reporter(sys.argv)
    reporter.run()

if __name__ == '__main__':
    main()
