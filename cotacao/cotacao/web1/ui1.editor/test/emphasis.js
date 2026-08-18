var testScripts = testScripts || [];

testScripts.push({
    title: "Emphasis1",
    file: "emphasis",
    run: [
        ["Emphasis1"],
    ],
    steps: [
        { cmd: "exe", obj: "Editor", op: "init", args: { style: "position:absolute; left:20px; top:20px; width:300px; height:200px; border:1px solid black", scrollWidth: 8, scrollColor: "green" } },
        { cmd: "exe", obj: "Editor", op: "focus" },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "S" } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "1234" } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "E" } },
        { cmd: "exe", obj: "Editor", op: "cursor", args: { "move": ["up"], "offset": 0 } },
        { cmd: "exe", obj: "Editor", op: "cursor", args: { "move": ["down"], "offset": 0 } },
        { cmd: "exe", obj: "Editor", op: "cursor", args: { "move": ["next"], "offset": 0 } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "S1234E" } },
        { cmd: "exe", obj: "Editor", op: "emphasis", args: { tag: "B", on: true } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "S<b></b>1234E" } },
    ]
});


testScripts.push({
    title: "Emphasis2",
    file: "emphasis",
    run: [
        ["Emphasis2"],
    ],
    steps: [
        { cmd: "exe", obj: "Editor", op: "init", args: { style: "position:absolute; left:20px; top:20px; width:300px; height:200px; border:1px solid black", scrollWidth: 8, scrollColor: "green" } },
        { cmd: "exe", obj: "Editor", op: "focus" },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "S" } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "1234" } },
        { cmd: "exe", obj: "Editor", op: "input", args: { text: "E" } },
        { cmd: "exe", obj: "Editor", op: "cursor", args: { move: ["prev"], offset: 1 } },
        { cmd: "exe", obj: "Editor", op: "cursor", args: { move: ["next"], offset: 1, select: "end" } },
        { cmd: "exe", obj: "Editor", op: "emphasis", args: { tag: "I", on: true } },    
        { cmd: "exe", obj: "Editor", op: "cursor", args: { move: ["up"], offset: 0 } },
        { cmd: "exe", obj: "Editor", op: "cursor", args: { move: ["prev"], offset: 1 } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "S<i>1234</i><i>E</i>" } },
        { cmd: "exe", obj: "Editor", op: "cursor", args: { move: ["down"], offset: 2 } },
        { cmd: "exe", obj: "Editor", op: "cursor", args: { move: ["up", "next", "down"], offset: 1, select: "end" } },
        { cmd: "exe", obj: "Editor", op: "emphasis", args: { tag: "U", on: true } },
        { cmd: "exe", obj: "Editor", op: "cursor", args: { move: ["up", "down"], offset: 0 } },
        { cmd: "exe", obj: "Editor", op: "emphasis", args: { tag: "I", on: false } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "S<i><u>1234</u></i><u>E</u>" } },
        { cmd: "exe", obj: "Editor", op: "emphasis", args: { tag: "I", on: true } },
        { cmd: "exe", obj: "Editor", op: "text", args: { match: "S<i><u>1234</u></i><u><i>E</i></u>" } },
    ]
});

testScripts.push({
    title: "Up",
    steps: [
        { cmd: "exe", obj: "Editor", op: "cursor", args: { move: ["up"], offset: 0 } },
    ]
});

testScripts.push({
    title: "Prev",
    steps: [
        { cmd: "exe", obj: "Editor", op: "cursor", args: { move: ["prev"], offset: 0 } },
    ]
});

testScripts.push({
    title: "Next",
    steps: [
        { cmd: "exe", obj: "Editor", op: "cursor", args: { move: ["next"], offset: 0 } },
    ]
});

testScripts.push({
    title: "Down",
    steps: [
        { cmd: "exe", obj: "Editor", op: "cursor", args: { move: ["down"], offset: 0 } },
    ]
});

testScripts.push({
    title: "Bold on",
    steps: [
        { cmd: "exe", obj: "Editor", op: "emphasis", args: { tag: "B", on: true } },
    ]
});

testScripts.push({
    title: "Bold off",
    steps: [
        { cmd: "exe", obj: "Editor", op: "emphasis", args: { tag: "B", on: false } },
    ]
});

testScripts.push({
    title: "Italic on",
    steps: [
        { cmd: "exe", obj: "Editor", op: "emphasis", args: { tag: "I", on: true } },
    ]
});

testScripts.push({
    title: "Italic off",
    steps: [
        { cmd: "exe", obj: "Editor", op: "emphasis", args: { tag: "I", on: false } },
    ]
});
testScripts.push({
    title: "Underline on",
    steps: [
        { cmd: "exe", obj: "Editor", op: "emphasis", args: { tag: "U", on: true } },
    ]
});

testScripts.push({
    title: "Underline off",
    steps: [
        { cmd: "exe", obj: "Editor", op: "emphasis", args: { tag: "U", on: false } },
    ]
});
