#! env/bin/python

"""
Scan CSS/JS/HTML source files for classes/ids/targets that are never used and may be candidates for removal.

Warning: Classes that do not appear in templates may still be used in actual content on the live site! Be careful when removing anything!
"""
import json
import logging
import os
import re
from typing import List, Dict, Tuple

log = logging.Logger(__name__)
log.addHandler(logging.StreamHandler())
log.setLevel(logging.INFO)

SRC = 'src/apps'

# Find target names in CSS files.
CSS_PATTERN = re.compile(r'[#.][a-zA-Z][a-zA-Z0-9-_]+')
CSS_COLOR_PATTERN = re.compile(r'(#[a-fA-F0-9]{6})|(#[a-fA-F0-9]{3})')

# Find target names in HTML files.
HTML_CLASSES_PATTERN = re.compile(r'class="([a-zA-Z0-9-_ ]+)"')
HTML_IDS_PATTERN = re.compile(r'id="([a-zA-Z0-9-_]+)"')

HTML_DJANGO_TEMPLATE_PATTERN = re.compile(r'{% (extends|include) \'(.+?)\' %}')
HTML_INCLUDE_TEMPLATE_PATTERN = re.compile(r'@@include\(\'(.+?)\'')

# Find target names in JS files.
JS_ID_PATTERN = re.compile(r'\.getElementById\([\'\"](.+?)[\'\"]\)')
JS_QUERY_PATTERN = re.compile(r'\.querySelector(All)?\([\'\"]([#.].+)[\'\"]\)')
JSX_CLASSNAME_PATTERN = re.compile(r'className=[\`\'\"](.+?)[\`\'\"]')

REPORT_CSS_STYLE = """
html {
    font-family: monospace;
}
table {
    border-collapse: collapse;
}
th, td {
    transition: all 120ms;
    font-size: 16px;
    padding: 4px 8px;
    border: 1px solid #999999;
    text-align: center;
}
tr:hover td {
    padding: 16px 8px;
    background-color: #ccccff;
}
.name {
    text-align: start;
}
.id {
    text-align: start;
    font-weight: 900;
}
.cls {
    text-align: start;
}
.empty {
    background-color: #ffcccc;
}
"""


# Find ID/class targets in CSS
def _find_css_targets(sourcetext: str) -> List[str]:
    matches = CSS_PATTERN.findall(sourcetext)
    return [x for x in matches if not re.match(CSS_COLOR_PATTERN, x)]


def _find_css_targets_in_file(sourcefile: str) -> List[str]:
    css_targets = []
    with open(sourcefile, 'r') as f:
        for line in f.readlines():
            css_targets += _find_css_targets(line)
    return css_targets


def _find_css_targets_in_dir(sourcedir: str) -> List[str]:
    css_targets = []
    for cwd, dirs, files in os.walk(sourcedir):
        css_files = [x for x in files if x.endswith('.css')]
        for f in css_files:
            filepath = os.path.join(cwd, f)
            css_targets += _find_css_targets_in_file(filepath)

    return css_targets


# Find ID/class targets in JS
def _find_js_targets(js: str) -> List[str]:
    """
    Search for ID/class targets in JS.
    """
    by_id = JS_ID_PATTERN.findall(js)
    by_query = [x[1] for x in JS_QUERY_PATTERN.findall(js)]
    by_jsx_classname = [f".{x}" for x in JSX_CLASSNAME_PATTERN.findall(js)]

    return [f'#{x}' for x in by_id] + by_query + by_jsx_classname


def _find_js_targets_in_file(sourcefile: str) -> List[str]:
    with open(sourcefile, 'r') as f:
        return _find_js_targets(f.read())


def _find_js_targets_in_dir(sourcedir: str) -> List[str]:
    js_targets = []
    for cwd, dirs, files in os.walk(sourcedir):
        js_files = [x for x in files if x.endswith('.js') or x.endswith('.jsx')]
        for f in js_files:
            filepath = os.path.join(cwd, f)
            js_targets += _find_js_targets_in_file(filepath)

    return js_targets


# Enumerate usage of JS/CSS ID/class targets in HTML files.
# Also find any injected templates via Django extend/include tags, or @@include.
def _find_uses_in_html(html: str, usage_map: Dict[str, Dict[str, int]]):
    """
    Search for IDs/classes in HTML and enumerate their usage.
    """
    def _track(name):
        if name == '#' or name == '.':
            return

        is_js = name in usage_map['js']
        is_css = name in usage_map['css']

        if is_js:
            usage_map['js'][name] += 1

        if is_css:
            usage_map['css'][name] += 1

        if (is_css or is_js) == False:
            existing = usage_map['html_only'].get(name)
            if existing is None:
                usage_map['html_only'][name] = 1
            else:
                usage_map['html_only'][name] += 1

    classes = HTML_CLASSES_PATTERN.findall(html)
    for c in classes:
        log.debug(c)
        _classes = re.split('\s+', c)  # Split multiple classes
        log.debug(_classes)
        for _c in _classes:
            _track(f'.{_c}')

    ids = HTML_IDS_PATTERN.findall(html)
    for id in ids:
        _track(f'#{id}')

    def _track_template(name):
        existing = usage_map['templates'].get(name)
        if existing is None:
            usage_map['templates'][name] = 1
        else:
            usage_map['templates'][name] += 1

    templates = HTML_DJANGO_TEMPLATE_PATTERN.findall(html)
    for t in templates:
        _track_template(t[1])

    templates = HTML_INCLUDE_TEMPLATE_PATTERN.findall(html)
    for t in templates:
        _track_template(t)


def _find_uses_in_html_file(sourcefile: str, usage_map: Dict[str, Dict[str, int]]):
    with open(sourcefile, 'r') as f:
        _find_uses_in_html(f.read(), usage_map)


def _find_templates_in_dir(sourcedir: str) -> List[str]:
    templates = []
    for cwd, dirs, files in os.walk(sourcedir):
        html_files = [x for x in files if x.endswith('.html')]
        templates += [os.path.join(cwd, f) for f in html_files]

    template_root_pattern = re.compile(r'src/apps/[a-zA-Z0-9-_]+/templates/(.*?\.html)')
    trimmed = [x for x in template_root_pattern.findall(','.join(templates))]

    assert(len(templates) == len(trimmed))

    return trimmed


def _find_uses(sourcedir: str, css_targets: List[str], js_targets: List[str], html_templates: List[str]) -> Dict[str, Dict[str, int]]:
    """
    Search HTML source files for usages of the given CSS targets.
    """
    usage_map: Dict[str, Dict[str, int]] = {
        'js': {},
        'css': {},
        'templates': {},
        'html_only': {}
    }
    for t in css_targets:
        usage_map['css'][t] = 0

    for t in js_targets:
        usage_map['js'][t] = 0

    for t in html_templates:
        print(t)
        usage_map['templates'][t] = 0

    for cwd, dirs, files in os.walk(sourcedir):
        html_files = [x for x in files if x.endswith('.html')]
        for f in html_files:
            _find_uses_in_html_file(os.path.join(cwd, f), usage_map)

    return usage_map


def _report(usage_map: Dict[str, Dict[str, int]]):
    used_in_js = usage_map['js']
    used_in_css = usage_map['css']
    undefined = usage_map['html_only']

    def _sorted(d: Dict[str, int]) -> List[Tuple[str, int]]:
        return sorted(d.items(), key=lambda item: (item[1], item[0]), reverse=True)

    log.info('Referenced in js, jsx:')
    for name, count in _sorted(used_in_js):
        log.info(f'  {count}: {name}')

    log.info('')

    log.info('Defined in CSS:')
    for name, count in _sorted(used_in_css):
        log.info(f'  {count}: {name}')

    log.info('')

    log.warning('These targets appear in HTML templates but are not referenced in CSS or js, jsx')
    for name, count in _sorted(undefined):
        log.warning(f'  {count}: {name}')

    log.info('')

    log.info('HTML Templates used via {% include %}, {% extends %}, or @@include')
    for name, count in _sorted(usage_map['templates']):
        log.info(f'  {count}: {name}')


def _report_html(usage_map: Dict[str, Dict[str, int]]):
    def _sorted(d: Dict[str, int]) -> List[Tuple[str, int]]:
        return sorted(d.items(), key=lambda item: (item[1], item[0]), reverse=True)

    grouped = _group_by_name(usage_map)
    keys = sorted(grouped.keys(), key=lambda x: grouped[x]["_total"])

    header_row = f"<tr>{''.join([f'<th>{th}</th>' for th in ['Name', 'uses', 'js', 'css', 'html only']])}</tr>"

    content = "".join([f"""<tr class="{'empty' if grouped[key]['_total'] == 0 else ''}">
<td class={'id' if key.startswith('#') else 'cls'}>{key}</td>
<td title='Total uses'>{grouped[key]['_total']}</td>
<td title='js, jsx'>{grouped[key]['js']}</td>
<td title='CSS'>{grouped[key]['css']}</td>
<td title='HTML'>{grouped[key]['html_only']}</td>
</tr>""" for key in keys])

    with open("build/report.html", "w") as f:
        f.write(f"""<html><head><title>Resources</title><style>{REPORT_CSS_STYLE}</style></head><body><table>{header_row}{content}</table></body></html""")

def _group_by_name(usage_map: Dict[str, Dict[str, int]]) -> Dict[str, Dict[str, int]]:
    """
    Rearrange usage_map to use class/id name as the key.
    """
    used_in_js = usage_map['js']
    used_in_css = usage_map['css']
    undefined = usage_map['html_only']

    grouped = {}
    keys = ['js', 'css', 'html_only']

    for key in keys:
        for name, count in usage_map[key].items():
            if name not in grouped:
                grouped[name] = {k: 0 for k in keys}

            grouped[name][key] = count
            grouped[name]["_total"] = grouped[name].get("_total", 0) + count

    return grouped


def _main():
    css_targets = _find_css_targets_in_dir(SRC)
    js_targets = _find_js_targets_in_dir(SRC)
    html_templates = _find_templates_in_dir(SRC)

    usage_map = _find_uses(SRC, css_targets, js_targets, html_templates)

    _report(usage_map)
    _report_html(usage_map)


if __name__ == '__main__':
    _main()
