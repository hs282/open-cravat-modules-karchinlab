import sys
from cravat import BaseAnnotator
from cravat import InvalidData
import sqlite3
import os

class CravatAnnotator(BaseAnnotator):
    def annotate(self, input_data, secondary_data=None):
        out = {}
        achange = input_data['achange']
        aa_321 = {
        'Asp': 'D', 'Ser': 'S', 'Gln': 'Q', 'Lys': 'K',
        'Trp': 'W', 'Asn': 'N', 'Pro': 'P', 'Thr': 'T',
        'Phe': 'F', 'Ala': 'A', 'Gly': 'G', 'Cys': 'C',
        'Ile': 'I', 'Leu': 'L', 'His': 'H', 'Arg': 'R',
        'Met': 'M', 'Val': 'V', 'Glu': 'E', 'Tyr': 'Y',
        'Ter': '*','':''}
        for key, value in aa_321.items():
            achange = achange.replace(key, value)
        q = 'select id, name, effect, relation, familial, functional, dist, pub, geneB,Ballele_one_cdna, Ballele_one_protein,Ballele_two_cdna, Ballele_two_protein,Aallele_two_cdna, Aallele_two_protein from gene where geneA = "{hugo}" and Aallele_one_protein = "{achange}"'.format(
            hugo = input_data['hugo'], achange = achange)
        self.cursor.execute(q)
        rows = self.cursor.fetchall()
        if rows:
            data = []
            for row in rows:
                idd = row[0]
                name = row[1]
                effect = row[2]
                if row[2] == 'TD':
                    effect = "True Digenic"
                elif row[2] == 'CO':
                    effect = "Composite"
                else:
                    effect = None
                relation = row[3]
                fam = row[4]
                funct = row[5]
                dist = row[6]
                pub = row[7]
                geneB = row[8]
                achangeB = row[10]
                achangeB2 = row[12]
                achangeA2 = row[14]
                for key, value in aa_321.items():
                    achangeB = achangeB.replace(value, key)
                    achangeB2 = achangeB2.replace(value, key)
                    achangeA2 = achangeA2.replace(value, key)
                dida = [idd, name, effect, relation, geneB, achangeB, achangeB2, achangeA2, fam, funct, dist, pub]
                data.append({'id': idd,'name': name, 'effect': effect, 'relation': relation, 'geneB': geneB,'fam':fam,'funct': funct, 'dist': dist, 'pub': pub, 'full': dida})
            if data:
                ids = idd
                out['name'] = name
                out['effect'] = effect
                out['relation'] = relation
                out['fam'] = fam
                out['funct'] = funct
                out['dist'] = dist
                out['pub'] = pub
                all_results_list = [x['full'] for x in data]
                out['all'] = all_results_list
                out['id'] = ids
            return out

    def cleanup(self):
        pass
        
if __name__ == '__main__':
    annotator = CravatAnnotator(sys.argv)
    annotator.run()