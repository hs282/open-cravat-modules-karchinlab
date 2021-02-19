import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):    
    def annotate(self, input_data, secondary_data=None):
        q = 'select transcript, score, rankscore, prediction, model from {chrom} where pos = {pos} and alt = "{alt}"'.format(
            chrom = input_data["chrom"], pos = int(input_data["pos"]), alt = input_data["alt_base"])
        self.cursor.execute(q)
        rows = self.cursor.fetchall()
        if rows:
            precomp_data = []
            out = {}
            for row in rows:
                transcripts = str(row[0]).strip().split(';')
                score = row[1]
                rankscore = row[2]
                prediction = row[3]
                if prediction == 'A':
                    prediction = 'Automatic Disease Causing'
                elif prediction == 'D':
                    prediction = "Damaging"
                elif prediction == 'P':
                    prediction = 'Automatic Polymorphism'
                elif prediction == 'N':
                    prediction = 'Polymorphism'
                model = row[4]
                for i in range(len(transcripts)):
                    transcript = transcripts[i]
                    mut = [transcript, score, rankscore, prediction, model]
                    precomp_data.append({'transcript': transcript, 'score': score, 'rankscore': rankscore, 'prediction': prediction, 'model': model, 'full_result': mut})
            if precomp_data:
                all_transcripts = set()
                scores = [x['score'] for x in precomp_data]
                all_results_list = [x['full_result'] for x in precomp_data]
                min_score = min(scores)
                for x in precomp_data:
                    if x['score'] == min_score:
                        all_transcripts.add(x['transcript'])
                all_transcripts = list(all_transcripts)
                all_transcripts.sort()
                all_transcripts = ';'.join(all_transcripts)
                max_index = scores.index(min_score)
                worst_mapping = precomp_data[max_index]
                worst_rankscore = worst_mapping['rankscore']
                worst_prediction = worst_mapping['prediction']
                worst_model = worst_mapping['model']
                out = {'transcript': all_transcripts, 'score': min_score, 'rankscore': worst_rankscore, 'prediction': worst_prediction, 'model': worst_model, 'all': all_results_list}
                return out


    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()