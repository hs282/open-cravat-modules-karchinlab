import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator): 
    def annotate(self, input_data, secondary_data=None):
        q = 'select nhomalt, nhomalt_xx, nhomalt_xy, nhomalt_afr, nhomalt_afr_xx, nhomalt_afr_xy, nhomalt_ami, nhomalt_ami_xx, nhomalt_ami_xy,' \
        + 'nhomalt_amr, nhomalt_amr_xx, nhomalt_amr_xy, nhomalt_asj, nhomalt_asj_xx, nhomalt_asj_xy, nhomalt_eas, nhomalt_eas_xx, nhomalt_eas_xy,'\
        + 'nhomalt_fin, nhomalt_fin_xx, nhomalt_fin_xy, nhomalt_mid, nhomalt_mid_xx, nhomalt_mid_xy, nhomalt_nfe, nhomalt_nfe_xx, nhomalt_nfe_xy,' \
        + 'nhomalt_oth, nhomalt_oth_xx, nhomalt_oth_xy, nhomalt_sas, nhomalt_sas_xx, nhomalt_sas_xy from '\
        + '{chrom} where pos = {pos} and ref = "{ref}" and alt = "{alt}"'.format(chrom = input_data["chrom"], pos = int(input_data["pos"]), ref = input_data["ref_base"], alt = input_data["alt_base"])
        self.cursor.execute(q)
        row = self.cursor.fetchone()
        if row:
            out = {
                'nhomalt': row[0],
                'xx': row[1],
                'xy': row[2],
                'afr': row[3],
                'afr_xx': row[4],
                'afr_xy': row[5],
                'ami': row[6],
                'ami_xx': row[7],
                'ami_xy': row[8],
                'amr': row[9],
                'amr_xx': row[10],
                'amr_xy': row[11],
                'asj': row[12],
                'asj_xx': row[13],
                'asj_xy': row[14],
                'eas': row[15],
                'eas_xx': row[16],
                'eas_xy': row[17],
                'fin': row[18],
                'fin_xx': row[19],
                'fin_xy': row[20],
                'mid': row[21],
                'mid_xx': row[22],
                'mid_xy': row[23],
                'nfe': row[24],
                'nfe_xx': row[25],
                'nfe_xy': row[26],
                'oth': row[27],
                'oth_xx': row[28],
                'oth_xy': row[29],
                'sas': row[30],
                'sas_xx': row[31],
                'sas_xy': row[32]
            }
            return out
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()