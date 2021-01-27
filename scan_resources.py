#! env/bin/python

"""
Scan CSS/JS/HTML source files for classes/ids/targets that are never used and may be candidates for removal.

Warning: Classes that do not appear in templates may still be used in actual content on the live site! Be careful when removing anything!
"""
import logging
import os
import re
from typing import List, Dict, Tuple

log = logging.Logger(__name__)
log.addHandler(logging.StreamHandler())
log.setLevel(logging.DEBUG)

SRC = 'src/apps'

# Find target names in CSS files.
CSS_PATTERN = re.compile('[#.][a-zA-Z][a-zA-Z0-9-_]+')
CSS_COLOR_PATTERN = re.compile('(#[a-fA-F0-9]{6})|(#[a-fA-F0-9]{3})')

# Find target names in HTML files.
HTML_CLASSES_PATTERN = re.compile('class="([a-zA-Z0-9-_ ]+)"')
HTML_IDS_PATTERN = re.compile('id="([a-zA-Z0-9-_]+)"')

# Find target names in JS files.
JS_ID_PATTERN = re.compile('\.getElementById\([\'\"](.+?)[\'\"]\)')
JS_QUERY_PATTERN = re.compile('\.querySelector(All)?\([\'\"]([#.].+)[\'\"]\)')


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

    return [f'#{x}' for x in by_id] + by_query


def _find_js_targets_in_file(sourcefile: str) -> List[str]:
    with open(sourcefile, 'r') as f:
        return _find_js_targets(f.read())


def _find_js_targets_in_dir(sourcedir: str) -> List[str]:
    js_targets = []
    for cwd, dirs, files in os.walk(sourcedir):
        js_files = [x for x in files if x.endswith('.js')]
        for f in js_files:
            filepath = os.path.join(cwd, f)
            js_targets += _find_js_targets_in_file(filepath)

    return js_targets


# Enumerate usage of JS/CSS ID/class targets in HTML files
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


def _find_uses_in_html_file(sourcefile: str, usage_map: Dict[str, Dict[str, int]]):
    with open(sourcefile, 'r') as f:
        print(sourcefile)
        _find_uses_in_html(f.read(), usage_map)


def _find_uses(sourcedir: str, css_targets: List[str], js_targets) -> Dict[str, Dict[str, int]]:
    """
    Search HTML source files for usages of the given CSS targets.
    """
    usage_map: Dict[str, Dict[str, int]] = {
        'js': {},
        'css': {},
        'html_only': {}
    }
    for t in css_targets:
        usage_map['css'][t] = 0

    for t in js_targets:
        usage_map['js'][t] = 0

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

    log.info('Referenced in javascript:')
    for name, count in _sorted(used_in_js):
        log.info(f'  {count}: {name}')

    log.info('')

    log.info('Defined in CSS:')
    for name, count in _sorted(used_in_css):
        log.info(f'  {count}: {name}')

    log.info('')

    log.warning('These targets appear in HTML templates but are not referenced in CSS or javascript')
    for name, count in _sorted(undefined):
        log.warning(f'  {count}: {name}')


def _main():
    css_targets = _find_css_targets_in_dir(SRC)
    js_targets = _find_js_targets_in_dir(SRC)

    usage_map = _find_uses(SRC, css_targets, js_targets)

    _report(usage_map)


if __name__ == '__main__':
    _main()
