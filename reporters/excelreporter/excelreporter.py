from cravat.cravat_report import CravatReport
import sys
import os
import datetime
import xlsxwriter
import re

class Reporter(CravatReport):

    def setup (self):
        if self.savepath == None:
            self.savepath = 'cravat_result.xlsx'
        else: 
            if self.savepath[-5:] != '.xlsx':
                self.savepath = self.savepath + '.xlsx'
        self.wb = xlsxwriter.Workbook(self.savepath)
        self.rowno = 0
        self.colno = 0
        self.sheetno = 0
        self.rightborder = self.wb.add_format()
        self.rightborder.set_right()
        self.bottomborder = self.wb.add_format()
        self.bottomborder.set_bottom()
        self.grayright = self.wb.add_format()
        self.grayright.set_right()
        self.grayright.set_bg_color('#e0e0e0')
        self.grayfill = self.wb.add_format()
        self.grayfill.set_bg_color('#E0E0E0')
        self.boldfont = self.wb.add_format()
        self.boldfont.set_bold()
        self.boldfont.set_font_size(14)
        self.write_info_sheet()
        
    def end (self):
        self.wb.close()
        return self.savepath
    
    def write_info_sheet (self):
        self.rowno = 0
        self.ws = self.wb.add_worksheet('Info')
        self.sheetno += 1
        lines = ['CRAVAT Report', 
            'Created at ' + 
                datetime.datetime.now().strftime('%A %m/%d/%Y %X'),
            ]
        self.colno = 0
        for i in range(len(lines)):
            self.ws.write(self.rowno, self.colno, lines[i])
            self.rowno += 1
            
    def get_cell_coordinate (self):
        return get_column_letter(self.colno) + str(self.rowno)
    
    def get_cell (self):
        return self.ws.cell(row=self.rowno, column=self.colno)
    
    def write_preface (self, level):
        self.ws = self.wb.add_worksheet(level[0].upper() + level[1:])
        self.sheetno += 1
        self.rowno = 0
        self.colno = 0
        self.ws.freeze_panes(2, 1)
   
    def write_header (self, level):
        self.colno = 0
        self.lastcols = []
        groupno = 0
        self.graycols = []
        for colgroup in self.colinfo[level]['colgroups']:
            count = colgroup['count']
            if count == 0:
                continue
            groupno += 1
            displayname = colgroup['displayname']
            lastcol = colgroup['lastcol']
            lastcolno = self.colno + count - 1
            if count > 1:
                self.ws.merge_range(self.rowno, self.colno, self.rowno, lastcolno, displayname)
            else:
                self.ws.write(self.rowno, self.colno, displayname)
            if groupno % 2 == 0:
                self.ws.set_column(self.colno, lastcolno - 1, None, self.grayfill)
                self.ws.set_column(lastcolno, lastcolno, None, self.grayright)
            else:
                self.ws.set_column(lastcolno, lastcolno, None, self.rightborder)
            self.colno += count
            self.lastcols.append(lastcol)
        self.rowno += 1
        self.colno = 0
        for column in self.colinfo[level]['columns']:
            self.ws.write(self.rowno, self.colno, column['col_title'])
            self.colno += 1
        self.rowno += 1
        
    def write_table_row (self, row):
        row = [v if v != None else '' for v in list(row)]
        self.colno = 0
        for cellvalue in row:
            if type(cellvalue) == type('') and ('http:' in cellvalue or 'https:' in cellvalue):
                toks = cellvalue.split('[WEB:]')
                if len(toks) != 2:
                    url = toks[0]
                    text = toks[0]
                else:
                    text = toks[0]
                    url = toks[1]
                cellvalue = '=HYPERLINK("' + url + '", "' +\
                text + '")'
            self.ws.write(self.rowno, self.colno, cellvalue)
            self.colno += 1
        self.rowno += 1

def main ():
    r = Reporter(sys.argv)
    r.run()
    
if __name__ == '__main__':
    main()
