var testScripts = testScripts || [];

testScripts.push({
    title: "One Line",
    file: "basic",
    run: [
        ["One Line"],
    ],
    steps: [
        { cmd: "exe", obj: "Editor", op: "init", args: { style: "position:absolute; left:20px; top:20px; width:300px; height:200px; border:1px solid black", scrollWidth: 8, scrollColor: "green" } },
        { cmd: "exe", obj: "Editor", op: "focus" },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "Line" } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "Line" } },
    ]
});

testScripts.push({
    title: "Two Lines",
    file: "basic",
    run: [
        ["Two Lines"],
    ],
    steps: [
        { cmd: "exe", obj: "Editor", op: "init", args: { style: "position:absolute; left:20px; top:20px; width:300px; height:200px; border:1px solid black", scrollWidth: 8, scrollColor: "green" } },
        { cmd: "exe", obj: "Editor", op: "focus" },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "Line1" } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "Line2" } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "Line1<p>Line2</p>" } },
    ]
});

testScripts.push({
    title: "Init",
    file: "basic",
    run: [
        ["Init"],
    ],
    steps: [
        { cmd: "exe", obj: "Editor", op: "init", args: { style: "position:absolute; left:20px; top:20px; width:300px; height:200px; border:1px solid black", scrollWidth: 8, scrollColor: "green" } },
        { cmd: "exe", obj: "Editor", op: "focus" },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "A" } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "BC" } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "D" } },
        { cmd: "exe", obj: "Editor", op: "cursor", args: { move: ["up", "prev", "down"], offset: 1 } },
        { cmd: "exe", obj: "Editor", op: "keydown", args: { code: 13 } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "A<p>B</p><p>C</p><p>D</p>" } },
    ]
});

testScripts.push({
    title: "ul",
    steps: [
        { cmd: "exe", obj: "Editor", op: "ul" },
    ]
});
