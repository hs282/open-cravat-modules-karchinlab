from cravat.cravat_report import CravatReport
import sys
import datetime
import re
import pandas as pd

class Reporter(CravatReport):

    def setup (self):
        self.data = {}
        self.headers = {}

    def write_preface (self, level):
        self.level = level

    def write_header (self, level):
        self.headers[self.level] = [col['col_name'] for col in self.colinfo[self.level]['columns']]
        self.data[self.level] = []

    def write_table_row (self, row):
        self.data[self.level].append([v for v in list(row)])

    def end (self):
        self.dfs = {}
        for level in self.headers.keys():
            self.dfs[level] = pd.DataFrame(self.data[level], columns=self.headers[level])
        return self.dfs

def main ():
    reporter = Reporter(sys.argv)
    reporter.run()

if __name__ == '__main__':
    main()
