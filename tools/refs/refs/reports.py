import os
import re
from datetime import datetime
from typing import Dict

OUTPUT_DIR = "build/"
OUTPUT_FILENAME = "report.html"

REPORT_CSS_STYLE = """
html {
    font-family: monospace;
}
table {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0 5rem;
}
th, td {
    transition: all 120ms;
    font-size: 16px;
    padding: 4px 8px;
    border: 1px solid #999999;
    text-align: center;
    cursor: default;
}
tr:hover td {
    background-color: #eeeeff;
}
tr.active td {
    padding: 16px 8px;
    background-color: #ccccff;
}
.name {
    text-align: start;
}
.id {
    font-weight: 900;
}
.cls {
}
.gulp-include {
    font-style: italic;
}
.empty {
    background-color: #ffcccc;
}
.files {
    transition: all 120ms;
    display: none;
    opacity: 0;
    font-size: .9rem;
    width: 0;
    height: 0;
    max-width: 100%;
    margin: 8px 0;
}
tr.active .files {
    display: block;
    height: auto;
    width: auto;
    overflow-x: scroll;
    opacity: 1;
    padding: 8px;
    background-color: #ccffcc
}
.filepath {
    white-space: nowrap;
}
"""

SCRIPT = """
<script type="application/javascript">

document.querySelectorAll("tr").forEach(function(x) {
    x.addEventListener('click', ev => 
        x.classList.toggle("active")
    );
});

</script>"""


def _element(tag, content, id=None, cls=None, title=None) -> str:
    id = f' id="{id}"' if id else ""
    title = f' title="{title}"' if title else ""
    cls = f' class="{cls}"' if cls else ""

    if isinstance(content, list):
        content = "".join(content)

    return f"<{tag}{id}{title}{cls}>{content}</{tag}>"


def _table(content, **kwargs) -> str:
    return _element("table", content, **kwargs)


def _tr(content, **kwargs) -> str:
    return _element("tr", content, **kwargs)


def _th(content, **kwargs) -> str:
    return _element("th", content, **kwargs)


def _td(content, **kwargs) -> str:
    return _element("td", content, **kwargs)


def _div(content, **kwargs) -> str:
    return _element("div", content, **kwargs)


def report_html(results: Dict[str, Dict[str, int]], src):
    def _cls(key) -> str:
        """Get css class for row item name"""
        if key.startswith("#"):
            return "id"
        elif key.startswith("."):
            return "cls"
        elif key.startswith("@@"):
            return "gulp-include"

    def _data(key) -> str:
        """Return <td/> for first column"""
        return _td(
            [_div(key, cls=f"{_cls(key)}")]
            + [
                _div(
                    [_div(f, cls="filepath") for f in results[key]["files"]],
                    cls="files",
                )
            ],
            cls="name",
        )

    keys = sorted(results.keys(), key=lambda x: results[x]["_total"])

    header_row = _tr([_th(th) for th in ["Name", "uses", "js", "jsx", "scss", "html"]])
    css = f"<style>{REPORT_CSS_STYLE}</style>"

    rows = [
        _tr(
            [
                _data(key),
                _td(results[key].get("_total", 0), title="Total uses found"),
                _td(results[key].get(".js", 0), title="js"),
                _td(results[key].get(".jsx", 0), title="jsx"),
                _td(results[key].get(".scss", 0), title="scss"),
                _td(results[key].get(".html", 0), title="html"),
            ],
            cls="empty" if results[key]["_total"] == 0 else "",
        )
        for key in keys
    ]

    table = _table([header_row] + rows)

    content = re.sub(
        "\s+",
        " ",
        f"""<html>
            <head>
            <title>Resources</title>
            {css}
            </head>
            <body>
            <h1>Resources</h1>
            <div>Source: {src}</div>
            <div>Generated: {datetime.now().strftime("%Y/%m/%d %H:%M")}</div>
            {table}
            {SCRIPT}
            </body>
            </html>
    """,
    ).strip()

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    output_file = os.path.join(OUTPUT_DIR, OUTPUT_FILENAME)
    with open(output_file, "w") as f:
        f.write(content)

    print(f"Report: {output_file}")
