(() => {
var selected = "elements";

var console_output = [];
var http_requests = [];

function write_element(node, pos=null){
    var item = document.createElement("div");
    item.original = node;
    item.classList.add("item");
    if (node.nodeType === 1){
        var tag = document.createElement("div");
        tag.classList.add("tag");
        var name = document.createElement("span");
        name.classList.add("name");
        name.innerText = "<";
        tag.append(name);
        var name = document.createElement("span");
        name.classList.add("name");
        name.classList.add("editable");
        name.innerText = node.tagName.toLowerCase();
        name.edit = function(value){
            var newnode = document.createElement(value);
            Array.from(node.attributes).forEach((attr) => {
                newnode.setAttribute(attr.name, attr.value);
            });
            Array.from(node.childNodes).forEach((child) => {
                newnode.append(child);
            });
            node.replaceWith(newnode);
        }
        tag.append(name);
        var attaributes = document.createElement("div");
        attaributes.classList.add("attributes");
        Array.from(node.attributes).forEach((attr) => {
            var attribute = document.createElement("div");
            attribute.classList.add("attribute");
            attribute.classList.add("editable");
            attribute.edit_text = attr.name+"=\""+attr.value+"\"";
            attribute.edit = function(value){
                var splited = value.split("=\"",2);
                var attrname = splited[0];
                var attrvalue = splited[1];
                if (attrvalue.endsWith("\"")){
                    attrvalue = attrvalue.slice(0, -1);
                }
                if (attrvalue.startsWith("\"")){
                    attrvalue = attrvalue.slice(1);
                }
                node.setAttribute(attrname, attrvalue);
                if (attrname !== attr.name){
                    node.removeAttribute(attr.name);
                }
            }
            var name = document.createElement("span");
            name.classList.add("name");
            name.innerText = attr.name;
            attribute.append(name);
            var value = document.createElement("span");
            value.classList.add("value");
            var text = document.createElement("div");
            text.classList.add("valuetext");
            text.innerText = attr.value;
            value.append(text);
            attribute.append(value);
            attaributes.append(attribute);
        });
        tag.append(attaributes);
        var close = document.createElement("span");
        close.classList.add("close");
        close.innerText = ">";
        tag.append(close);
        item.append(tag);

        if (node.childNodes && node.childNodes.length > 0){
            var children = document.createElement("div");
            children.classList.add("children");
            node.childNodes.forEach((child) => {
                if (child.nodeType === 1){
                    write_element(child, children);
                } else if (child.nodeType === 3){
                    if (child.textContent.trim() === "") return;
                    var text = document.createElement("div");
                    text.original = child;
                    text.textContent = child.textContent;
                    text.classList.add("text");
                    text.classList.add("editable");
                    text.edit = function(value){
                        child.textContent = value;
                    }
                    if (text.innerText.length < 20){
                        children.classList.add("nochildren");
                    }
                    children.append(text);
                }
            });
            item.append(children);
        } else {
            var text = document.createElement("div");
            text.style.whiteSpace = "nowrap";
            text.innerText = node.innerText;
            if (text.innerText.length < 20){
                item.classList.add("nochildren");
            } else {
                text.classList.add("text");
            }
            item.append(text);
        }

        if (node.outerHTML.includes("</")){
            var tagclose = document.createElement("div");
            tagclose.classList.add("tagclose");
            tagclose.innerText = "</"+node.tagName.toLowerCase()+">";
            item.append(tagclose);
        }
    }
    if (pos === null){
        content.append(item);
    } else {
        pos.append(item);
    }
}

(() => {
    var observer = new MutationObserver(function(mutationList, observer){
        if (div.querySelector("#phone-dev-mainwindow .content.elements") !== null) {
            write_element(document.documentElement);
        }
    });
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
        attributeOldValue: true,
        characterDataOldValue: true
    });
})();

function add_log(type, args, logtime, logs=null){
    if (logs === null){
        logs = div.querySelector("#phone-dev-mainwindow .content.console .logs");
    }
    if (logs === null) return;
    var item = document.createElement("div");
    item.classList.add("item");
    item.dataset.type = type;
    var text = document.createElement("div");
    text.classList.add("text");
    text.innerText = args.join(" ");
    item.append(text);
    var time = document.createElement("div");
    time.classList.add("time");
    time.innerText = new Date(logtime).toTimeString().split(" ")[0];
    item.append(time);
    var logs_par = logs.parentNode;
    var is_scroll = false;
    if (logs_par){
        is_scroll = logs_par.scrollTop + logs_par.clientHeight === logs_par.scrollHeight;
    }
    logs.append(item);
    if (is_scroll) logs_par.scrollTop = logs_par.scrollHeight;
}

["log", "warn", "error", "debug", "info", "table", "trace"].forEach((type) => {
    var original = console[type];
    console[type] = function(){
        console_output.push([type, Array.from(arguments), Date.now()]);
        add_log(type, Array.from(arguments), Date.now());
        original.apply(console, arguments);
    }
});
window.addEventListener("error", function(e){
    console.error(e);
});

(function(open) {
    XMLHttpRequest.prototype.open = function(method, url, async, user, pass) {
        var conn = [method, url, null, [[0, Date.now()]], "waiting"];
        var laststate = -1;
        this.addEventListener("readystatechange", function(){
            if (laststate !== this.readyState){
                if (this.readyState === 0){
                    conn[3].push([0, Date.now()]);
                    conn[4] = "waiting";
                }
                if (this.readyState === 1){
                    conn[3].push([1, Date.now()]);
                    conn[4] = "opened";
                }
                if (this.readyState === 2){
                    conn[3].push([2, Date.now()]);
                    conn[4] = "headers";
                }
                if (this.readyState === 3){
                    conn[3].push([3, Date.now()]);
                    conn[4] = "loading";
                }
                if (this.readyState === 4){
                    conn[3].push([4, Date.now()]);
                    conn[2] = this;
                    conn[4] = "ok";
                }
                laststate = this.readyState;
                console.log("HTTP Request", conn);
                console.log(laststate);
            }
        });
        this.addEventListener("error", function(){
            conn[3] = "error";
        });
        this.addEventListener("abort", function(){
            conn[3] = "abort";
        });
        this.addEventListener("timeout", function(){
            conn[3] = "timeout";
        });
        http_requests.push(conn);
        console.log("HTTP Request", conn);
        open.call(this, method, url, async, user, pass);
    }
})(XMLHttpRequest.prototype.open);
(function(fetch) {
    window.fetch = function() {
        var url = arguments[0];
        var conn = ["GET", url, null, [[0, Date.now()]], "waiting"];
        var promise = fetch.apply(this, arguments);
        promise.then((response) => {
            conn[2] = response;
            conn[4] = "ok";
        }).catch((e) => {
            conn[3] = "error";
        });
        http_requests.push(conn);
        console.log("HTTP Request", conn);
    }
})(window.fetch);

(function(WebSocket){
    window.WebSocket = function(url, protocols){
        var conn = [url, protocols, null, [[0, Date.now()]], "waiting"];
        var ws = new WebSocket(url, protocols);
        ws.addEventListener("open", function(){
            conn[3].push([1, Date.now()]);
            conn[4] = "opened";
        });
        ws.addEventListener("message", function(){
            conn[3].push([2, Date.now()]);
            conn[4] = "message";
        });
        ws.addEventListener("close", function(){
            conn[3].push([3, Date.now()]);
            conn[4] = "closed";
        });
        ws.addEventListener("error", function(){
            conn[3].push([4, Date.now()]);
            conn[4] = "error";
        });
        http_requests.push(conn);
        console.log("HTTP Request", conn);
        return ws;
    }
})(window.WebSocket);

var host = document.createElement("div");
var shadowRoot = host.attachShadow({ mode: "closed" });
var div = document.createElement("div");
div.id = "phone-dev-mainwindow";
var style = document.createElement("style");
style.innerHTML = "[[[Minified CSS Data]]]";
div.append(style);

var mvfc = function(e){
    if (e.buttons){
        var top = e.movementY+div.offsetTop;
        var left = e.movementX+div.offsetLeft;
        if (parseInt(top) < 0) top = 0;
        if (parseInt(left) < 0) left = 0;
        top = top+"px";
        left = left+"px";
        if (div.style.top != top || div.style.left != left){
            moved = true;
        }
        div.style.top = top;
        div.style.left = left;
        this.setPointerCapture(e.pointerId);
    }
};

var fullbtn = document.createElement("div");
fullbtn.classList.add("fullbtn");
fullbtn.innerText = "D";
let moved = false;
fullbtn.addEventListener("click", function(){
    if (moved) return;
    div.classList.remove("minimized");
});
fullbtn.addEventListener("pointerdown", function(e){
    moved = false;
});
fullbtn.addEventListener("pointermove", mvfc);
div.append(fullbtn);
var header = document.createElement("div");
header.classList.add("header");
header.addEventListener("pointermove", mvfc);
div.addEventListener("touchmove", function(event){
    if (event.target.classList.contains("header") || event.target.classList.contains("fullbtn")){
        event.preventDefault();
    }
}, { passive: false });
var title = document.createElement("div");
title.classList.add("title");
title.innerText = "Developer Tools";
header.append(title);
var buttons = document.createElement("div");
buttons.classList.add("buttons");
var button = document.createElement("div");
button.classList.add("button");
var minibutton = document.createElement("button");
minibutton.classList.add("minibutton");
button.append(minibutton);
button.addEventListener("click", function(){
    div.classList.add("minimized");
});
buttons.append(button);
var button = document.createElement("div");
button.classList.add("button");
var closebutton = document.createElement("button");
closebutton.classList.add("closebutton");
button.append(closebutton);
button.addEventListener("click", function(){
    host.remove();
});
buttons.append(button);
header.append(buttons);
div.append(header);
var menu = document.createElement("div");
menu.classList.add("menu");
[
    {name: "Elements", content: "elements"},
    {name: "Console", content: "console"},
    {name: "Network", content: "network"},
    {name: "Application", content: "application"}
].forEach((mitem) => {
    var item = document.createElement("div");
    item.classList.add("item");
    item.dataset.content = mitem.content;
    item.addEventListener("click", function(){
        changetab(item.dataset.content);
    });
    item.innerText = mitem.name;
    menu.append(item);
});
var dummyitem = document.createElement("div");
dummyitem.classList.add("dummyitem");
menu.append(dummyitem);
div.append(menu);
var content = document.createElement("div");
content.classList.add("content");
div.append(content);
shadowRoot.append(div);
document.body.append(host);

function changetab(tab){
    div.querySelectorAll(".item").forEach((item) => {
        if (item.dataset.content === tab){
            item.classList.add("selected");
        } else {
            item.classList.remove("selected");
        }
    });
    selected = tab;
    update();
}
function update(){
    div.querySelectorAll(".content").forEach((content) => {
        content.innerHTML = "";
        content.className = "content";
        if (selected === "elements"){
            content.classList.add("elements");
            write_element(document.documentElement);
        } else if (selected === "console"){
            content.classList.add("console");
            var logs = document.createElement("div");
            logs.classList.add("logs");
            console_output.forEach((output) => {
                add_log(output[0], output[1], output[2], logs);
            });
            content.append(logs);
            var input = document.createElement("input");
            input.classList.add("input");
            input.placeholder = "Console Input";
            input.addEventListener("keydown", function(e){
                if (e.key === "Enter" && this.value !== ""){
                    try {
                        add_log("input", [this.value], Date.now(), logs);
                        var result = eval(this.value);
                        add_log("output", [result], Date.now(), logs);
                    } catch (e) {
                        add_log("error", [e], Date.now(), logs);
                    }
                    this.value = "";
                }
            });
            content.append(input);
        } else if (selected === "network"){
            content.classList.add("network");
            var requests = document.createElement("div");
            requests.classList.add("requests");
            http_requests.forEach((request) => {
            });
            content.append(requests);
        } else if (selected === "application"){
            var item = document.createElement("div");
            item.innerText = "Application";
            content.append(item);
        }
    });
}

function get_textsize(text, font, max_width=null){
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    var width = metrics.width;
    if (max_width !== null && width > max_width){
        width = max_width;
    }
    return {width: width, height: (metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent)*2};
}

function is_contain_class(node, classname){
    if (node.classList.contains(classname)){
        return [true, node];
    } else {
        if (node.parentNode){
            return is_contain_class(node.parentNode, classname);
        }
    }
    return [false, null];
}

div.addEventListener("dblclick", function(e){
    var contain = is_contain_class(e.target, "editable");
    console.log(contain);
    if (contain[0]){
        var target = contain[1];
        var input = document.createElement("textarea");
        input.classList.add("htmleditbox");
        input.value = target.edit_text ?? target.innerText;
        var max_width = target.offsetWidth;
        input.addEventListener("input", function(){
            var textsize = get_textsize(input.value, "16px sans-serif", max_width);
            input.style.width = textsize.width+"px";
            input.style.height = "auto";
            input.style.height = input.scrollHeight+"px";
        });
        target.replaceWith(input);
        input.focus();
        input.addEventListener("blur", function(){
            console.log(target);
            target.edit(input.value);
            input.replaceWith(target);
        });
        var textsize = get_textsize(input.value, "16px sans-serif", max_width);
        input.style.width = textsize.width+"px";
        input.style.height = input.scrollHeight+"px";
    }
});
changetab("elements");
})();