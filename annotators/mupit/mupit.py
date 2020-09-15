import sys
import os
from cravat import BaseAnnotator
from cravat import InvalidData

class CravatAnnotator(BaseAnnotator):

    def annotate (self, input_data):
        out = {}
        '''
        allowed_sos = ['MIS', 'INI', 'IND']
        sos = input_data['mapping_parser'].get_uniq_sos()
        proceed = False
        for so in sos:
            if so in allowed_sos:
                proceed = True
                break
        if proceed == False:
            return
        '''
        chrom = input_data['chrom']
        pos = str(input_data['pos'])
        sql = 'select * from mupit where ' +\
            'chrom="' + chrom + '" and ' +\
            'start<=' + pos + ' and ' +\
            'stop>=' + pos
        self.cursor.execute(sql)
        ret = self.cursor.fetchone()
        if ret != None:
            link = 'http://www.cravat.us/MuPIT_Interactive?gm=' +\
                chrom + ':' + pos
            out = {'link': link, 'hugo': input_data['hugo']}
            return out

    def summarize_by_gene (self, hugo, input_data):
        out = None
        links = input_data['link']
        gms = []
        for link in links:
            if link is not None:
                gm = link.split('=')[1]
                if gm not in gms:
                    gms.append(gm)
        if len(gms) > 0:
            link = 'http://www.cravat.us/MuPIT_Interactive?gm=' + ','.join(gms)
            if len(link) > 2000:
                link = 'URL too long';
            out = {'link': link}
        return out

if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()
