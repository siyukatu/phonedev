const UglifyJS = require("uglify-js");
const CleanCSS = require("clean-css");
const fs = require("fs");

var main_css = fs.readFileSync("main.css", "utf8");

var minified_css = new CleanCSS().minify(main_css).styles;

var main_js = fs.readFileSync("main.js", "utf8").replace("`[Minified CSS Data]`", "`"+minified_css.replace(/\\/g, "\\\\").replace(/`/g, "\\`")+"`");
var minified = UglifyJS.minify(main_js);

if (!fs.existsSync("output")){
    fs.mkdirSync("output");
}
console.log(minified);
fs.writeFileSync("output/main.js", minified.code);