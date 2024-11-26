const UglifyJS = require("uglify-js");
const fs = require("fs");

var main_css = fs.readFileSync("main.css", "utf8");

var minified_css = main_css.replace(/\r?\n/g, "").replace(/\s+/g, " ").replace(/\/\*.*?\*\//g, "").replace(/;}/g, "}").replace(/} /g, "}").replace(/ {/g, "{").replace(/{ /g, "{").replace(/, /g, ",").replace(/: /g, ":").replace(/; /g, ";").replace(/, /g, ",");

var main_js = fs.readFileSync("main.js", "utf8");
var minified = UglifyJS.minify(main_js);

if (!fs.existsSync("output")){
    fs.mkdirSync("output");
}
fs.writeFileSync("output/main.js", minified.code.replace('"[[[Minified CSS Data]]]"', "`"+minified_css.replace(/\\/g, "\\\\").replace(/`/g, "\\`")+"`"));