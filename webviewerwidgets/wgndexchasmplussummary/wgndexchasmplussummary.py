import os
import sys
import json
import yaml
import importlib.util
script_dir = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('data_model', os.path.join(script_dir, 'data_model.py'))
data_model = importlib.util.module_from_spec(spec)
spec.loader.exec_module(data_model)
e_data = data_model.EnrichmentData(os.path.join(script_dir, "data"))
e_data.load()
ymlpath = '.'.join(os.path.abspath(__file__).split('.')[:-1]) + '.yml'
with open(ymlpath) as f:
    conf = yaml.safe_load(f)
max_num_hugos = conf['max_num_hugos']

def run_query (hugos):
    query_ids = hugos
    if len(query_ids) > max_num_hugos:
        result = {
            'scores': None, 
            'coverage': None, 
            'msg': f'Too many genes. Use the Filter tab to reduce the number of genes to below {max_num_hugos}.'
        }
        return result
    matched_genes = {}
    for term in query_ids:
        matched_genes[term] = [term]
    standardized_search_terms = {'matched': matched_genes, 'unmatched':[]}
    result = e_data.get_scores_on_standarized_query_terms('cravat_nci', standardized_search_terms, False)
    return result

async def get_data (queries):
    params = queries['params']
    hugos = params['hugos']
    response = {'data': run_query(hugos)}
    return response

if __name__ ==  '__main__':
    run_query(['BRCA1', 'BRCA2'])
