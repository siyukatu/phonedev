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
        name.innerText = "<"+node.tagName.toLowerCase();
        tag.append(name);
        var attaributes = document.createElement("div");
        attaributes.classList.add("attributes");
        Array.from(node.attributes).forEach((attr) => {
            var attribute = document.createElement("div");
            attribute.classList.add("attribute");
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

        if (node.children && node.children.length > 0){
            var children = document.createElement("div");
            children.classList.add("children");
            Array.from(node.children).forEach((child) => {
                write_element(child, children);
            });
            item.append(children);
        } else {
            var text = document.createElement("div");
            text.style.whiteSpace = "nowrap";
            text.innerText = node.innerText;
            div.append(text);
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
        if (div.querySelector("#phone-dev-mainwindow .content.elements") !== null) write_element(document.documentElement);
    });
    observer.observe(document.documentElement, {
        attributes: true,
        childList: true,
        subtree: true
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
    if (event.target.classList.contains("header")){
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

changetab("elements");
})();