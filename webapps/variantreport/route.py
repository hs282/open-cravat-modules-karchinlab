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

async def test (request):
    return web.json_response({'result': 'success'})

routes = [
   ['GET', 'test', test] 
]
