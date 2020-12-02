import os
import webbrowser
import multiprocessing
import aiosqlite
import urllib.parse
import json
import sys
import argparse
import imp
import yaml
import re
from cravat import ConfigLoader
from cravat import admin_util as au
from cravat import CravatFilter
from cravat.constants import base_smartfilters
from aiohttp import web
import time
from concurrent.futures import ProcessPoolExecutor
from cravat import get_live_annotator, get_live_mapper
from cravat.config_loader import ConfigLoader
import requests
import oyaml

live_modules = {}
live_mapper = None
module_confs = {}
modules_to_run_ordered = []

async def test (request):
    return web.json_response({'result': 'success'})

async def get_live_annotation_post (request):
    queries = await request.post()
    response = await get_live_annotation(queries)
    return web.json_response(response)

async def get_live_annotation_get (request):
    queries = request.rel_url.query
    response = await get_live_annotation(queries)
    return web.json_response(response)

async def get_live_annotation (queries):
    chrom = queries['chrom']
    pos = queries['pos']
    ref_base = queries['ref_base']
    alt_base = queries['alt_base']
    if 'uid' not in queries:
        uid = ''
    else:
        uid = queries['uid']
    input_data = {'uid': uid, 'chrom': chrom, 'pos': int(pos), 'ref_base': ref_base, 'alt_base': alt_base}
    if 'annotators' in queries:
        annotators = queries['annotators'].split(',')
    else:
        annotators = None
    global live_modules
    if len(live_modules) == 0:
        await load_live_modules()
        response = await live_annotate(input_data, annotators)
    else:
        response = await live_annotate(input_data, annotators)
    return response

def clean_annot_dict (d):
    keys = d.keys()
    for key in keys:
        value = d[key]
        if value == '' or value == {}:
            d[key] = None
        elif type(value) is dict:
            d[key] = clean_annot_dict(value)
    if type(d) is dict:
        all_none = True
        for key in keys:
            if d[key] is not None:
                all_none = False
                break
        if all_none:
            d = None
    return d

async def live_annotate (input_data, annotators):
    from cravat.constants import mapping_parser_name
    from cravat.constants import all_mappings_col_name
    from cravat.inout import AllMappingsParser
    global live_modules
    global live_mapper
    global module_confs
    global modules_to_run_ordered
    response = {}
    crx_data = live_mapper.map(input_data)
    crx_data = live_mapper.live_report_substitute(crx_data)
    crx_data[mapping_parser_name] = AllMappingsParser(crx_data[all_mappings_col_name])
    for module_name in modules_to_run_ordered:
        module = live_modules[module_name]
        if annotators is not None and module_name not in annotators:
            continue
        try:
            conf = module_confs[module_name]
            if 'secondary_inputs' in conf:
                sec_mods = conf['secondary_inputs']
                secondary_data = {}
                for sec_mod in sec_mods:
                    secondary_data[sec_mod] = [response[sec_mod]]
                annot_data = module.annotate(
                        input_data=crx_data, 
                        secondary_data=secondary_data)
            else:
                annot_data = module.annotate(input_data=crx_data)
            annot_data = module.live_report_substitute(annot_data)
            if annot_data == '' or annot_data == {}:
                annot_data = None
            elif type(annot_data) is dict:
                annot_data = clean_annot_dict(annot_data)
            response[module_name] = annot_data
        except Exception as e:
            import traceback
            traceback.print_exc()
            response[module_name] = None
    del crx_data[mapping_parser_name]
    response['crx'] = crx_data
    return response

async def load_live_modules ():
    global live_modules
    global live_mapper
    global module_confs
    global modules_to_run_ordered
    confloader = ConfigLoader()
    conf = confloader.get_module_conf('moleculartumorboard')
    module_names_to_load = conf['live_modules']
    if live_mapper is None:
        cravat_conf = au.get_cravat_conf()
        if 'genemapper' in cravat_conf:
            default_mapper = cravat_conf['genemapper']
        else:
            default_mapper = 'hg38'
        live_mapper = get_live_mapper(default_mapper)
        module_confs[default_mapper] = confloader.get_module_conf(default_mapper)
    for module_name in module_names_to_load:
        if module_name in live_modules:
            continue
        annotator = get_live_annotator(module_name)
        live_modules[module_name] = annotator
        module_confs[module_name] = confloader.get_module_conf(module_name)
    modules_to_run_ordered = []
    module_names = list(module_confs.keys())
    num_module_names = len(module_names)
    while True:
        for module_name in module_names:
            if module_name in modules_to_run_ordered:
                continue
            if module_name == default_mapper:
                continue
            conf = module_confs[module_name]
            if 'secondary_inputs' not in conf:
                modules_to_run_ordered.append(module_name)
            else:
                sec_mods = conf['secondary_inputs']
                all_sec_mods_already = True
                for sec_mod in sec_mods:
                    if sec_mod not in modules_to_run_ordered:
                        all_sec_mods_alreay = False
                        break
                if all_sec_mods_already:
                    modules_to_run_ordered.append(module_name)
        if len(modules_to_run_ordered) == num_module_names - 1:
            break

async def get_oncokb_annotation (request):
    global oncokb_conf
    queries = request.rel_url.query
    chrom = queries['chrom']
    start = queries['start']
    end = queries['end']
    ref_base = queries['ref_base']
    alt_base = queries['alt_base']
    url = f'https://www.oncokb.org/api/v1/annotate/mutations/byGenomicChange?genomicLocation={chrom},{start},{end},{ref_base},{alt_base}&referenceGenome=GRCh38'
    headers = {'Authorization': 'Bearer ' + oncokb_conf['token']}
    r = requests.get(url, headers=headers)
    response = r.json()
    return web.json_response(response)

f = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'oncokb_conf.yml'))
oncokb_conf = oyaml.safe_load(f)
f.close()

routes = [
   ['GET', 'test', test],
   ['GET', 'annotate', get_live_annotation_get],
   ['POST', 'annotate', get_live_annotation_post],
   ['GET', 'loadlivemodules', load_live_modules],
   ['GET', 'oncokb', get_oncokb_annotation],
   #['GET', 'mupit/{tail:.*}', get_mupit],
]
