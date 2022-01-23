#! env/bin/python

"""
Scan CSS/JS/HTML source files for classes/ids/targets that are never used and may be candidates for removal.

Warning: Classes that do not appear in templates may still be used in actual content on the live site! Be careful when removing anything!
"""
import logging
import os
import re
from argparse import ArgumentParser
from collections.abc import Iterable

from refs.reports import report_html

log = logging.Logger(__name__)
log.addHandler(logging.StreamHandler())
log.setLevel(logging.DEBUG)

SRC = "src/apps"

html_filetypes = [".html"]
style_filetypes = [".scss"]
script_filetypes = [".js", ".jsx"]


# Find target names in CSS files.
CSS_PATTERN = re.compile(r"[#.][a-zA-Z][a-zA-Z0-9-_]+")
CSS_COLOR_PATTERN = re.compile(r"(#[a-fA-F0-9]{6})|(#[a-fA-F0-9]{3})")

# Find target names in HTML files.
HTML_CLASSES_PATTERN = re.compile(r'class="([a-zA-Z0-9-_ ]+)"')
HTML_IDS_PATTERN = re.compile(r'id="([a-zA-Z0-9-_]+)"')

HTML_DJANGO_TEMPLATE_PATTERN = re.compile(r"{% (extends|include) \'(.+?)\' %}")
INCLUDE_TEMPLATE_PATTERN = re.compile(r"@@include\(\'(.+?)\'")

# Find target names in JS files.
JS_ID_PATTERN = re.compile(r"\.getElementById\([\'\"](.+?)[\'\"]\)")
JS_QUERY_PATTERN = re.compile(r"\.querySelector(?:All)?\([\'\"]([#.].+)[\'\"]\)")
JSX_CLASSNAME_PATTERN = re.compile(r"className=[`\'\"](.+?)[`\'\"]")


def _prepend_class_prefix(classname):
    return f".{classname}"


def _prepend_id_prefix(id):
    return f"#{id}"


def _prepend_gulpinclude_prefix(name):
    return f"@@{name}"


def _prepend_django(match):
    extend_or_include, name = match
    if extend_or_include == "extends":
        return f"[dj-ext]{name}"
    elif extend_or_include == "include":
        return f"[dj-inc]{name}"
    else:
        return f"[dj-unknown]{name}"


PATTERNS = {
    ".html": [
        (HTML_IDS_PATTERN, _prepend_id_prefix),
        (HTML_CLASSES_PATTERN, _prepend_class_prefix),
        (HTML_DJANGO_TEMPLATE_PATTERN, _prepend_django),
        (INCLUDE_TEMPLATE_PATTERN, _prepend_gulpinclude_prefix),
    ],
    ".js": [
        (JS_ID_PATTERN, _prepend_id_prefix),
        JS_QUERY_PATTERN,
        (INCLUDE_TEMPLATE_PATTERN, _prepend_gulpinclude_prefix),
    ],
    ".jsx": [
        (JS_ID_PATTERN, _prepend_id_prefix),
        JS_QUERY_PATTERN,
        (JSX_CLASSNAME_PATTERN, _prepend_class_prefix),
        (INCLUDE_TEMPLATE_PATTERN, _prepend_gulpinclude_prefix),
    ],
    ".scss": [CSS_PATTERN, (INCLUDE_TEMPLATE_PATTERN, _prepend_gulpinclude_prefix)],
}

"""Ignore any candidate resources that match one of these patterns."""
EXCEPT_PATTERNS = {
    ".scss": [
        CSS_COLOR_PATTERN,
    ]
}


def _parse_args():
    parser = ArgumentParser()

    parser.add_argument("src", default=".", nargs="?")

    args = parser.parse_args()

    args.src = os.path.abspath(args.src)

    if not os.path.exists(args.src):
        raise FileNotFoundError(f"Source directory not found: {args.src}")

    log.info(f"Source directory: {args.src}")

    return args.__dict__


def _scan_resource(filepath, extension):
    patterns = PATTERNS[extension]
    ignore_patterns = EXCEPT_PATTERNS.get(extension, [])

    with open(filepath, "r") as f:
        text = f.read()

    matches = []
    for p in patterns:
        postprocess = None
        if isinstance(p, Iterable):
            p, postprocess = p

        pattern_matches = p.findall(text)
        if postprocess:
            pattern_matches = map(postprocess, pattern_matches)

        matches += pattern_matches

    for p in ignore_patterns:
        matches = list(filter(lambda x: not p.match(x), matches))

    return matches


def scan_resources(src):
    assert os.path.exists(src)
    ignored_file_ext = []

    resources = {}

    for cwd, dirs, files in os.walk(src):
        for f in files:
            filepath = os.path.join(cwd, f)
            ext = os.path.splitext(f)[1]
            if ext in PATTERNS:
                file_resources = sorted(_scan_resource(filepath, ext))

                for r in file_resources:
                    data = resources.get(r, {})
                    data[ext] = data.get(ext, 0) + 1
                    data["files"] = data.get("files", []) + [filepath]
                    resources[r] = data

            else:
                ignored_file_ext += ext

    for r in resources.keys():
        resources[r]["_total"] = sum(
            map(lambda x: x if isinstance(x, int) else 0, resources[r].values())
        )

    return resources


def main():
    args = _parse_args()

    src = args["src"]
    results = scan_resources(src)

    report_html(results, src)


if __name__ == "__main__":
    main()
