from css_html_js_minify import js_minify, css_minify
import os

os.makedirs("output", exist_ok=True)

with open("main.js", "r") as f:
    js_code = f.read()
minified_js = js_minify(js_code)

with open("main.css", "r") as f:
    css_code = f.read()
minified_css = css_minify(css_code)

minified_js = minified_js.replace("`[Minified CSS Data]`", "`" + minified_css + "`")

with open("output/main.js", "w") as f:
    f.write(minified_js)
