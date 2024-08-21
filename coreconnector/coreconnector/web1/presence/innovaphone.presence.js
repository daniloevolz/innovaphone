/*---------------------------------------------------------------------------*/
/* innovaphone.presence.js                                                   */
/* A collection of presence related functions                                */
/*---------------------------------------------------------------------------*/

var innovaphone = innovaphone || {};
innovaphone.presence = innovaphone.presence || {};
innovaphone.presence.translateNote = innovaphone.presence.translateNote || function (note, lang) {
    let texts = innovaphone.presence.texts || innovaphone.pbx?.appclient?.lang;
    if (!texts) {
        texts =  { en: {} };
        console.error("innovaphone.presence: Missing texts. Include innovaphone.presence.texts.js in .htm file.");
    }

    function text(id, args) {
        let fallback = { ca: "es", eu: "es" };
        let current = texts[lang] ? lang : texts[fallback[lang]] ? fallback[lang] : "en";
        var t = texts[current][id] || (fallback[current] ? texts[fallback[current]][id] : null) || texts["en"][id] || (id ? "{" + id + "}" : "");
        if (t && args) {
            for (var i = args.length - 1; i >= 0; i--) {
                t = t.replace(new RegExp("\\$" + i.toString(), "g"), args[i]);
            }
        }
        return t;
    }

    let words = note.split(" ");
    let displayNote = "";
    let params = {};

    for (var j = 0; j < words.length; j++) {
        var word = words[j];
        if (word.charAt(0) == "#") {
            if (word.charAt(1) == "#") {
                displayNote += (displayNote ? " " : "") + word.substring(1);
            }
            else {
                var index = word.indexOf(":");
                if (index != -1) params[word.substring(1, index)] = word.substring(index + 1);
                else params[word.substring(1)] = "";
            }
        }
        else {
            displayNote += (displayNote ? " " : "") + word;
        }
    }

    if (params.len !== undefined) {
        params.len = parseInt(params.len);
        displayNote = Array.from(note).slice(0, params.len).join("");
    }
    else if (params.free !== undefined) {
        displayNote = text("presenceFree");
    }
    else if (params.busy !== undefined) {
        displayNote = text("presenceBusy");
    }
    else if (params.away !== undefined) {
        displayNote = text("presenceAway");
    }

    if (params.until !== undefined) {
        params.until = parseInt(params.until);
        var d = new Date(params.until);
        var sameDay = (new Date()).toLocaleDateString([lang]) == d.toLocaleDateString([lang]);
        var wholeDay = params["whole-day"] !== undefined;
        var timeString = sameDay && !wholeDay ? "" : d.toLocaleDateString([lang]);
        timeString += (timeString ? " " : "") + d.toLocaleTimeString([lang], { hour: '2-digit', minute: '2-digit' });
        displayNote = text("presenceUntil", [displayNote, timeString]);
    }

    if (params["next-activity"] !== undefined) {
        displayNote += " (";
        switch (params["next-activity"]) {
            case "free": displayNote += text("presenceFree"); break;
            case "busy": displayNote += text("presenceBusy"); break;
            case "away": displayNote += text("presenceAway"); break;
        }
        if (params.next) {
            var bounds = params.next.split(":"),
                start = parseInt(bounds[0]),
                right = parseInt(bounds[1]) + start;
            displayNote += ": " + Array.from(note).slice(start, right).join("");
        }
        displayNote += ")";
    }

    return displayNote;
};
