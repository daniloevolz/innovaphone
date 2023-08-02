var testScripts = testScripts || [];

testScripts.push({
    title: "Basic1",
    file: "ul",
    run: [
        ["Basic1"],
    ],
    steps: [
        { cmd: "exe", obj: "Editor", op: "init", args: { style: "position:absolute; left:20px; top:20px; width:300px; height:200px; border:1px solid black", scrollWidth: 8, scrollColor: "green" } },
        { cmd: "exe", obj: "Editor", op: "focus" },
        { cmd: "exe", obj: "Editor", op: "ul" },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "li1" } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "li2" } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1</li><li>li2</li></ul>" } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1</li><li>li2</li><li><br/></li></ul>" } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1</li><li>li2</li></ul><p><br/></p>" } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "text" } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1</li><li>li2</li></ul><p>text</p>" } },
    ]
});

testScripts.push({
    title: "Basic2",
    file: "ul",
    run: [
        ["Basic2"],
    ],
    steps: [
        { cmd: "exe", obj: "Editor", op: "init", args: { style: "position:absolute; left:20px; top:20px; width:300px; height:200px; border:1px solid black", scrollWidth: 8, scrollColor: "green" } },
        { cmd: "exe", obj: "Editor", op: "focus" },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "li1" } },
        { cmd: "exe", obj: "Editor", op: "ul" },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        //{ cmd: "exe", obj: "Editor", op: "ul" },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "li2" } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1</li><li>li2</li></ul>" } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1</li><li>li2</li><li><br/></li></ul>" } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1</li><li>li2</li></ul><p><br/></p>" } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "text" } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1</li><li>li2</li></ul><p>text</p>" } },
    ]
});

testScripts.push({
    title: "Indent1",
    file: "ul",
    run: [
        ["Indent1"],
    ],
    steps: [
        { cmd: "exe", obj: "Editor", op: "init", args: { style: "position:absolute; left:20px; top:20px; width:300px; height:200px; border:1px solid black", scrollWidth: 8, scrollColor: "green" } },
        { cmd: "exe", obj: "Editor", op: "focus" },
        { cmd: "exe", obj: "Editor", op: "ul" },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "li1" } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "indent" },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "li1-1" } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1<ul><li>li1-1</li></ul></li></ul>" } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "li1-2" } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1<ul><li>li1-1</li><li>li1-2</li></ul></li></ul>" } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "text" } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1<ul><li>li1-1</li><li>li1-2</li></ul></li></ul><p>text</p>" } },
    ]
});

testScripts.push({
    title: "Indent2",
    file: "ul",
    run: [
        ["Indent2"],
    ],
    steps: [
        { cmd: "exe", obj: "Editor", op: "init", args: { style: "position:absolute; left:20px; top:20px; width:300px; height:200px; border:1px solid black", scrollWidth: 8, scrollColor: "green" } },
        { cmd: "exe", obj: "Editor", op: "focus" },
        { cmd: "exe", obj: "Editor", op: "ul" },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "li1" } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "indent" },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "li1-1" } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1<ul><li>li1-1</li></ul></li></ul>" } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "li1-2" } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1<ul><li>li1-1</li><li>li1-2</li></ul></li></ul>" } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "li2" } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "text" } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1<ul><li>li1-1</li><li>li1-2</li></ul></li><li>li2</li></ul><p>text</p>" } },
    ]
});

testScripts.push({
    title: "Insert1",
    file: "ul",
    run: [
        ["Insert1"],
    ],
    steps: [
        { cmd: "exe", obj: "Editor", op: "init", args: { style: "position:absolute; left:20px; top:20px; width:300px; height:200px; border:1px solid black", scrollWidth: 8, scrollColor: "green" } },
        { cmd: "exe", obj: "Editor", op: "focus" },
        { cmd: "exe", obj: "Editor", op: "ul" },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "li1" } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "li2" } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1</li><li>li2</li></ul>" } },
        { cmd: "exe", obj: "Editor", op: "cursor", args: { move: ["up", "down"] } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1</li><li><br/></li><li>li2</li></ul>" } },
        { cmd: "exe", obj: "Editor", op: "cursor", args: { move: ["prev"] } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "li1.1" } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "<ul><li>li1</li><li>li1.1</li><li>li2</li></ul>" } },
    ]
});

testScripts.push({
    title: "UL",
    steps: [
        { cmd: "exe", obj: "Editor", op: "ul" },
    ]
});

testScripts.push({
    title: "->",
    steps: [
        { cmd: "exe", obj: "Editor", op: "indent" },
    ]
});
