import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        q = 'select transcript, transcripts_affected, prob_tolerant, prob_recessive, prob_dominant, pred, confidence from {chr} where pos = {pos} and ref = "{ref}" and alt = "{alt}"'.format(
            chr = input_data['chrom'], pos = int(input_data["pos"]), ref = input_data["ref_base"], alt = input_data["alt_base"])
        self.cursor.execute(q)
        rows = self.cursor.fetchall()
        if rows:
            precomp_data = []
            for row in rows:
                transcript = str(row[0])
                if transcript == None:
                    continue
                affect = str(row[1]).strip().split('|')
                tolerant = str(row[2]).strip().split('|')
                recessive = str(row[3]).strip().split('|')
                dominant = str(row[4]).strip().split('|')
                pred = str(row[5]).strip().split('|')
                conf = str(row[6]).strip().split('|')
                for i in range(len(affect)):
                    affects = affect[i]
                    tolerants = tolerant[i]
                    recessives = recessive[i]
                    dominants = dominant[i]
                    preds = pred[i]
                    confs = conf[i]
                    transc_aloft_result = [transcript, affects, tolerants, recessives, dominants, preds, confs]
                    precomp_data.append({'transcript':transcript, 'affect': affects, 'tolerant': tolerants, 'recessive': recessives, 'dominant': dominants, 'pred': preds, 'conf': confs, 'full_result' : transc_aloft_result})
            if precomp_data:
                all_transcripts = set()
                scores = [x['dominant'] for x in precomp_data]
                all_results_list = [x['full_result'] for x in precomp_data]
                max_score = max(scores)
                for x in precomp_data:
                    if x['dominant'] == max_score:
                        all_transcripts.add(x['transcript'])
                all_transcripts = list(all_transcripts)
                all_transcripts.sort()
                all_transcripts = ';'.join(all_transcripts)
                max_index = scores.index(max_score)
                worst_mapping = precomp_data[max_index]
                worst_affect = worst_mapping['affect']
                worst_tolerant = worst_mapping['tolerant']
                worst_recessive = worst_mapping['recessive']
                worst_pred = worst_mapping['pred']
                worst_conf = worst_mapping['conf']
                out = {'transcript': all_transcripts, 'affect': worst_affect, 'tolerant': worst_tolerant, 'recessive': worst_recessive, 'dominant': max_score, 'pred': worst_pred, 'conf': worst_conf, 'all': all_results_list}
                return out
    
    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()