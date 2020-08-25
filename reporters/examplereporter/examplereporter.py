from cravat.cravat_report import CravatReport
import sys
import datetime
import re
import csv
import zipfile
import os

class Reporter(CravatReport):

    def setup (self):
        # setup is called first. Use it to open output files
        # Make output paths by appending to self.savepath
        outpath = f'{self.savepath}.example.txt'
        self.outfile = open(outpath,'w')
    
    def write_header (self, level):
        # write_header is called once per level. Use it to write 
        # header lines, such as the top row of a csv, naming each column. 
        # Use the self.colinfo object to get information about what 
        # columns are present.
        # self.colinfo[level]['colgroups'] contains information about each
        # module (annotator) in the order it appears in the results.
        # self.colinfo[level]['columns'] contains information about each column
        # in the order it appears in the results
        line = f'##Level={level}'
        self.outfile.write(line+'\n')
        colno = 0
        for module in self.colinfo[level]['colgroups']:
            count = module['count']
            module_name = module['name']
            if count == 0:
                continue
            for col in self.colinfo[level]['columns'][colno:colno+count]:
                col_name = col['col_name'].split('__')[1]
                col_title = col['col_title']
                line = f'##Column={colno},{module_name},{col_name},"{col_title}"'
                self.outfile.write(line+'\n')
                colno += 1
        all_columns = self.colinfo[level]['columns']
        all_col_names = [col['col_name'] for col in all_columns]
        line = '#'+'\t'.join(all_col_names)
        self.outfile.write(line+'\n')
    
    def write_table_row (self, row):
        # write_table_row is called once for each variant. row is a list of
        # values. The order or row matches with self.colinfo[level]['columns']
        # Write the data to the output file here.
        str_row = [str(x) if x is not None else '' for x in row]
        line = '\t'.join(str_row)
        self.outfile.write(line+'\n')
    
    def end (self):
        # end is called last. Use it to close the output file and
        # return a path to the output file.
        self.outfile.close()
        return os.path.realpath(self.outfile.name)

### Don't edit anything below here ###
def main ():
    reporter = Reporter(sys.argv)
    reporter.run()

if __name__ == '__main__':
    main()
