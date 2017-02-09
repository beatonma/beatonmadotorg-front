#!/usr/bin/python3

from argparse import ArgumentParser
import os
import re
import json
from bs4 import BeautifulSoup

TEMP_ONE = 'merging.temp'
TEMP_TWO = 'merged.temp'

def safe_load(dictionary, key, default_value=''):
    try:
        return dictionary[key]
    except Exception as e:
        return default_value

class TemplateParser:
    def __init__(self, filename, data_filename=None):
        dir = os.path.dirname(filename)
        parent_filename = self._get_parent(filename)
        
        print("parent: {}/{}".format(dir, parent_filename))
        
        tempfile = self._merge_data(filename, data_filename) # replace variables in filename using data from data_filename
        
        if parent_filename is not None:
            outfile = '{}'.format(os.path.join('preview', 'PREVIEW.{}'.format(os.path.basename(filename))))
            self._merge_into_parent(tempfile, os.path.join(dir, parent_filename), outfile)
        
        os.remove(TEMP_ONE)
        os.remove(TEMP_TWO)
        
        
    def _merge_data(self, filename, data_filename):
        sections = {}
        with open(filename, 'r') as f, open(TEMP_ONE, 'w') as o:
            section_name = ''
            section = []
            for line in f:
                if section:
                    if '{% endfor %}' in line:
                        sections[section_name] = section
                        section = []
                        section_name = ''
                    else:
                        section.append(line.strip() + '\n')
                else:
                    m = re.search("{% for (?P<varname>[\w]+) in (?P<groupname>[\w]+) %}", line)
                    if m is not None:
                        section_name = m.group('varname')
                        section = []
                        section.append('')
                    o.write(line)
        
        with open(TEMP_ONE, 'r') as temp, open(data_filename, 'r') as d, open(TEMP_TWO, 'w') as out:
            j = json.load(d)
            for line in temp:
                m = re.search("{% for (?P<varname>[\w]+) in (?P<groupname>[\w]+) %}", line)
                if m is not None:
                    varname = m.group('varname')
                    group = j[varname]
                    
                    for item in group:
                        s = sections[varname]
                        for ln in s:
                            match = re.search("({{{{{}\.(?P<attr>[\w]+)}}}})".format(varname), ln)
                            if match is not None:
                                ln = ln.replace(match.group(0), safe_load(item, match.group('attr'), ''))
                                out.write(ln)
                            else:
                                out.write(ln)
                else:
                    out.write(line)
        
        return TEMP_TWO
    
    def _merge_into_parent(self, filename, parent_filename, outfile):
        blocks = {}
        blockname = ''
        block = []
        for line in open(filename, 'r'):
            if blockname:
                if '{% endblock %}' in line:
                    blocks[blockname] = block
                    blockname = ''
                    block = []
                else:
                    block.append(line.strip() + '\n')
                    # print(line.strip())
            else:
                m = re.search("{% block (?P<blockname>[\w]+) %}", line)
                if m is not None:
                    blockname = m.group('blockname')
                    block = []
        print('block keys: {}'.format(blocks.keys()))
        
        with open(parent_filename, 'r') as parent, open(outfile, 'w') as out:
            html = ''
            for line in parent:
                if '{% load ' in line:
                    continue
                m = re.search('{% block (?P<blockname>[\w]+) %}', line)
                if m is not None:
                    for ln in safe_load(blocks, m.group('blockname'), []):
                        # out.write('{}'.format(ln.strip()) + '\n')
                        html += '{}'.format(ln.strip())
                else:
                    # out.write(line.strip().replace('"/js/', '"../app/js/').replace('"/css/', '"../app/css/') + '\n')
                    html += line.strip().replace('"/js/', '"../app/js/').replace('"/css/', '"../app/css/') + '\n'
            
            bs = BeautifulSoup(html, 'html.parser')
            out.write(bs.prettify())
    
    def _get_parent(self, filename):
        for line in open(filename, 'r'):
            m = re.search("^{% extends '(?P<name>[\w\.]+)' %}", line)
            if m is not None:
                return m.group('name')
        
        return None
    
    # def _get_tags(self, filename):
        # tags = []
        # for line in open(filename, 'r'):
            # m = re.search("{% block (?P<tag>[\w]+) %}", line)
            # if m is not None:
                # tags.append(m.group('tag'))
        # return tags

if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument('filename', type=str)
    parser.add_argument('data', type=str)# filename for a json file
    
    args = parser.parse_args()
    
    template_parser = TemplateParser(args.filename, args.data)