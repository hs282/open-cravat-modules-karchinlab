import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os
import tabix
import re

class CravatAnnotator(BaseAnnotator): 
    def setup(self):
        dir_path = os.path.dirname(os.path.realpath(__file__))
        datafile_path = os.path.join(dir_path, "data", "funseq2.bed.bgz")
        self.tb = tabix.open(datafile_path)
        pass

    def annotate(self, input_data, secondary_data=None):
        chrom = str(input_data["chrom"])
        pos = int(input_data["pos"])
        ref = input_data["ref_base"]
        alt = input_data["alt_base"]
        precomp_data = []
        out = {}
        hots = set()
        mot_type = set()
        motif_type = ''
        tf_name = ''
        motif_name = ''
        alt_score = ''
        ref_score = ''
        records = self.tb.query(chrom, pos - 1, pos)
        for record in records:
            refs = record[3]
            alts = record[4]
            if alt in alts:
                hot = str(record[5]).strip().split(',')
                for i in range(len(hot)):
                    hot_region = hot[i]
                    motif = str(record[6])
                    motif = motif.replace(',M', ';M')
                    for m in motif.split(';'):
                        match = re.search(r'(MOTIFBR)', m)
                        if match:
                            motif_type = "MOTIFBR"
                        matched = re.search(r'(MOTIFG)', m)
                        if matched:
                            motif_type = "MOTIFG"
                        mots = m.strip().split(',')
                        for motifs in mots:
                            motifs = motifs.replace(motif_type + '=', '')
                            if motif_type == "MOTIFG":
                                motifs = ' #' + motifs
                            a = re.search(r'(.+)#(\w+)#(\w+[.]\w+)#(\w+[.]\w+)', motifs)
                            if a:
                                tf_name = a.group(1)
                                if tf_name == ' ':
                                    tf_name = ''
                                motif_name = a.group(2)
                                alt_score = a.group(3)
                                ref_score = a.group(4)
                            elif motif != '':
                                tf_name = motifs
                                name = re.search(r'#(\w+)#((\d+(?:\.\d+)?))#(\d+(?:\.\d+)?)', motif)
                                motif_name = name.group(1)
                                alt_score = name.group(2)
                                ref_score = name.group(3)
                            score = record[7]
                            mtype = ''
                            if score == '':
                                score = record[8]
                            if motif_type == "MOTIFG":
                                mtype = "Motif-Gaining"
                            elif motif_type == "MOTIFBR":
                                mtype = "Motif-Breaking"
                            fun_result = [hot_region, mtype,tf_name, motif_name, alt_score, ref_score, score]
                            precomp_data.append({'hot': hot_region, 'motif': mtype, 'score': score, 'full_result': fun_result})
        if precomp_data:
            all_results_list = [x['full_result'] for x in precomp_data]
            out['all'] = all_results_list
            for i in precomp_data:
                hots.add(i['hot'])
                mot_type.add(i['motif'])
            hregion = list(hots)
            motif = list(mot_type)
            hregion.sort()
            motif.sort()
            out['hot'] = ';'.join(hregion)
            out['motif'] = ';'.join(motif)
            out['score'] = i['score']
            return out
                
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()