/*! highlight.js v9.12.0 | BSD3 License | git.io/hljslicense */
!function (e) {
    var n = "object" == typeof window && window || "object" == typeof self && self;
    "undefined" != typeof exports ? e(exports) : n && (n.hljs = e({}), "function" == typeof define && define.amd && define([], function () {
            return n.hljs
        }))
}
(function (e) {
    function n(e) {
        return e.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    }
    function t(e) {
        return e.nodeName.toLowerCase()
    }
    function r(e, n) {
        var t = e && e.exec(n);
        return t && 0 === t.index
    }
    function a(e) {
        return k.test(e)
    }
    function i(e) {
        var n,
        t,
        r,
        i,
        o = e.className + " ";
        if (o += e.parentNode ? e.parentNode.className : "", t = B.exec(o))
            return w(t[1]) ? t[1] : "no-highlight";
        for (o = o.split(/\s+/), n = 0, r = o.length; r > n; n++)
            if (i = o[n], a(i) || w(i))
                return i
    }
    function o(e) {
        var n,
        t = {},
        r = Array.prototype.slice.call(arguments, 1);
        for (n in e)
            t[n] = e[n];
        return r.forEach(function (e) {
            for (n in e)
                t[n] = e[n]
        }),
        t
    }
    function u(e) {
        var n = [];
        return function r(e, a) {
            for (var i = e.firstChild; i; i = i.nextSibling)
                3 === i.nodeType ? a += i.nodeValue.length : 1 === i.nodeType && (n.push({
                        event: "start",
                        offset: a,
                        node: i
                    }), a = r(i, a), t(i).match(/br|hr|img|input/) || n.push({
                        event: "stop",
                        offset: a,
                        node: i
                    }));
            return a
        }
        (e, 0),
        n
    }
    function c(e, r, a) {
        function i() {
            return e.length && r.length ? e[0].offset !== r[0].offset ? e[0].offset < r[0].offset ? e : r : "start" === r[0].event ? e : r : e.length ? e : r
        }
        function o(e) {
            function r(e) {
                return " " + e.nodeName + '="' + n(e.value).replace('"', "&quot;") + '"'
            }
            s += "<" + t(e) + E.map.call(e.attributes, r).join("") + ">"
        }
        function u(e) {
            s += "</" + t(e) + ">"
        }
        function c(e) {
            ("start" === e.event ? o : u)(e.node)
        }
        for (var l = 0, s = "", f = []; e.length || r.length; ) {
            var g = i();
            if (s += n(a.substring(l, g[0].offset)), l = g[0].offset, g === e) {
                f.reverse().forEach(u);
                do
                    c(g.splice(0, 1)[0]), g = i();
                while (g === e && g.length && g[0].offset === l);
                f.reverse().forEach(o)
            } else
                "start" === g[0].event ? f.push(g[0].node) : f.pop(), c(g.splice(0, 1)[0])
        }
        return s + n(a.substr(l))
    }
    function l(e) {
        return e.v && !e.cached_variants && (e.cached_variants = e.v.map(function (n) {
                return o(e, {
                    v: null
                }, n)
            })),
        e.cached_variants || e.eW && [o(e)] || [e]
    }
    function s(e) {
        function n(e) {
            return e && e.source || e
        }
        function t(t, r) {
            return new RegExp(n(t), "m" + (e.cI ? "i" : "") + (r ? "g" : ""))
        }
        function r(a, i) {
            if (!a.compiled) {
                if (a.compiled = !0, a.k = a.k || a.bK, a.k) {
                    var o = {},
                    u = function (n, t) {
                        e.cI && (t = t.toLowerCase()),
                        t.split(" ").forEach(function (e) {
                            var t = e.split("|");
                            o[t[0]] = [n, t[1] ? Number(t[1]) : 1]
                        })
                    };
                    "string" == typeof a.k ? u("keyword", a.k) : x(a.k).forEach(function (e) {
                        u(e, a.k[e])
                    }),
                    a.k = o
                }
                a.lR = t(a.l || /\w+/, !0),
                i && (a.bK && (a.b = "\\b(" + a.bK.split(" ").join("|") + ")\\b"), a.b || (a.b = /\B|\b/), a.bR = t(a.b), a.e || a.eW || (a.e = /\B|\b/), a.e && (a.eR = t(a.e)), a.tE = n(a.e) || "", a.eW && i.tE && (a.tE += (a.e ? "|" : "") + i.tE)),
                a.i && (a.iR = t(a.i)),
                null == a.r && (a.r = 1),
                a.c || (a.c = []),
                a.c = Array.prototype.concat.apply([], a.c.map(function (e) {
                            return l("self" === e ? a : e)
                        })),
                a.c.forEach(function (e) {
                    r(e, a)
                }),
                a.starts && r(a.starts, i);
                var c = a.c.map(function (e) {
                    return e.bK ? "\\.?(" + e.b + ")\\.?" : e.b
                }).concat([a.tE, a.i]).map(n).filter(Boolean);
                a.t = c.length ? t(c.join("|"), !0) : {
                    exec: function () {
                        return null
                    }
                }
            }
        }
        r(e)
    }
    function f(e, t, a, i) {
        function o(e, n) {
            var t,
            a;
            for (t = 0, a = n.c.length; a > t; t++)
                if (r(n.c[t].bR, e))
                    return n.c[t]
        }
        function u(e, n) {
            if (r(e.eR, n)) {
                for (; e.endsParent && e.parent; )
                    e = e.parent;
                return e
            }
            return e.eW ? u(e.parent, n) : void 0
        }
        function c(e, n) {
            return !a && r(n.iR, e)
        }
        function l(e, n) {
            var t = N.cI ? n[0].toLowerCase() : n[0];
            return e.k.hasOwnProperty(t) && e.k[t]
        }
        function p(e, n, t, r) {
            var a = r ? "" : I.classPrefix,
            i = '<span class="' + a,
            o = t ? "" : C;
            return i += e + '">',
            i + n + o
        }
        function h() {
            var e,
            t,
            r,
            a;
            if (!E.k)
                return n(k);
            for (a = "", t = 0, E.lR.lastIndex = 0, r = E.lR.exec(k); r; )
                a += n(k.substring(t, r.index)), e = l(E, r), e ? (B += e[1], a += p(e[0], n(r[0]))) : a += n(r[0]), t = E.lR.lastIndex, r = E.lR.exec(k);
            return a + n(k.substr(t))
        }
        function d() {
            var e = "string" == typeof E.sL;
            if (e && !y[E.sL])
                return n(k);
            var t = e ? f(E.sL, k, !0, x[E.sL]) : g(k, E.sL.length ? E.sL : void 0);
            return E.r > 0 && (B += t.r),
            e && (x[E.sL] = t.top),
            p(t.language, t.value, !1, !0)
        }
        function b() {
            L += null != E.sL ? d() : h(),
            k = ""
        }
        function v(e) {
            L += e.cN ? p(e.cN, "", !0) : "",
            E = Object.create(e, {
                parent: {
                    value: E
                }
            })
        }
        function m(e, n) {
            if (k += e, null == n)
                return b(), 0;
            var t = o(n, E);
            if (t)
                return t.skip ? k += n : (t.eB && (k += n), b(), t.rB || t.eB || (k = n)), v(t, n), t.rB ? 0 : n.length;
            var r = u(E, n);
            if (r) {
                var a = E;
                a.skip ? k += n : (a.rE || a.eE || (k += n), b(), a.eE && (k = n));
                do
                    E.cN && (L += C), E.skip || (B += E.r), E = E.parent;
                while (E !== r.parent);
                return r.starts && v(r.starts, ""),
                a.rE ? 0 : n.length
            }
            if (c(n, E))
                throw new Error('Illegal lexeme "' + n + '" for mode "' + (E.cN || "<unnamed>") + '"');
            return k += n,
            n.length || 1
        }
        var N = w(e);
        if (!N)
            throw new Error('Unknown language: "' + e + '"');
        s(N);
        var R,
        E = i || N,
        x = {},
        L = "";
        for (R = E; R !== N; R = R.parent)
            R.cN && (L = p(R.cN, "", !0) + L);
        var k = "",
        B = 0;
        try {
            for (var M, j, O = 0; ; ) {
                if (E.t.lastIndex = O, M = E.t.exec(t), !M)
                    break;
                j = m(t.substring(O, M.index), M[0]),
                O = M.index + j
            }
            for (m(t.substr(O)), R = E; R.parent; R = R.parent)
                R.cN && (L += C);
            return {
                r: B,
                value: L,
                language: e,
                top: E
            }
        } catch (T) {
            if (T.message && -1 !== T.message.indexOf("Illegal"))
                return {
                    r: 0,
                    value: n(t)
                };
            throw T
        }
    }
    function g(e, t) {
        t = t || I.languages || x(y);
        var r = {
            r: 0,
            value: n(e)
        },
        a = r;
        return t.filter(w).forEach(function (n) {
            var t = f(n, e, !1);
            t.language = n,
            t.r > a.r && (a = t),
            t.r > r.r && (a = r, r = t)
        }),
        a.language && (r.second_best = a),
        r
    }
    function p(e) {
        return I.tabReplace || I.useBR ? e.replace(M, function (e, n) {
            return I.useBR && "\n" === e ? "<br>" : I.tabReplace ? n.replace(/\t/g, I.tabReplace) : ""
        }) : e
    }
    function h(e, n, t) {
        var r = n ? L[n] : t,
        a = [e.trim()];
        return e.match(/\bhljs\b/) || a.push("hljs"),
        -1 === e.indexOf(r) && a.push(r),
        a.join(" ").trim()
    }
    function d(e) {
        var n,
        t,
        r,
        o,
        l,
        s = i(e);
        a(s) || (I.useBR ? (n = document.createElementNS("http://www.w3.org/1999/xhtml", "div"), n.innerHTML = e.innerHTML.replace(/\n/g, "").replace(/<br[ \/]*>/g, "\n")) : n = e, l = n.textContent, r = s ? f(s, l, !0) : g(l), t = u(n), t.length && (o = document.createElementNS("http://www.w3.org/1999/xhtml", "div"), o.innerHTML = r.value, r.value = c(t, u(o), l)), r.value = p(r.value), e.innerHTML = r.value, e.className = h(e.className, s, r.language), e.result = {
                language: r.language,
                re: r.r
            }, r.second_best && (e.second_best = {
                    language: r.second_best.language,
                    re: r.second_best.r
                }))
    }
    function b(e) {
        I = o(I, e)
    }
    function v() {
        if (!v.called) {
            v.called = !0;
            var e = document.querySelectorAll("pre code");
            E.forEach.call(e, d)
        }
    }
    function m() {
        addEventListener("DOMContentLoaded", v, !1),
        addEventListener("load", v, !1)
    }
    function N(n, t) {
        var r = y[n] = t(e);
        r.aliases && r.aliases.forEach(function (e) {
            L[e] = n
        })
    }
    function R() {
        return x(y)
    }
    function w(e) {
        return e = (e || "").toLowerCase(),
        y[e] || y[L[e]]
    }
    var E = [],
    x = Object.keys,
    y = {},
    L = {},
    k = /^(no-?highlight|plain|text)$/i,
    B = /\blang(?:uage)?-([\w-]+)\b/i,
    M = /((^(<[^>]+>|\t|)+|(?:\n)))/gm,
    C = "</span>",
    I = {
        classPrefix: "hljs-",
        tabReplace: null,
        useBR: !1,
        languages: void 0
    };
    return e.highlight = f,
    e.highlightAuto = g,
    e.fixMarkup = p,
    e.highlightBlock = d,
    e.configure = b,
    e.initHighlighting = v,
    e.initHighlightingOnLoad = m,
    e.registerLanguage = N,
    e.listLanguages = R,
    e.getLanguage = w,
    e.inherit = o,
    e.IR = "[a-zA-Z]\\w*",
    e.UIR = "[a-zA-Z_]\\w*",
    e.NR = "\\b\\d+(\\.\\d+)?",
    e.CNR = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",
    e.BNR = "\\b(0b[01]+)",
    e.RSR = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",
    e.BE = {
        b: "\\\\[\\s\\S]",
        r: 0
    },
    e.ASM = {
        cN: "string",
        b: "'",
        e: "'",
        i: "\\n",
        c: [e.BE]
    },
    e.QSM = {
        cN: "string",
        b: '"',
        e: '"',
        i: "\\n",
        c: [e.BE]
    },
    e.PWM = {
        b: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
    },
    e.C = function (n, t, r) {
        var a = e.inherit({
            cN: "comment",
            b: n,
            e: t,
            c: []
        }, r || {});
        return a.c.push(e.PWM),
        a.c.push({
            cN: "doctag",
            b: "(?:TODO|FIXME|NOTE|BUG|XXX):",
            r: 0
        }),
        a
    },
    e.CLCM = e.C("//", "$"),
    e.CBCM = e.C("/\\*", "\\*/"),
    e.HCM = e.C("#", "$"),
    e.NM = {
        cN: "number",
        b: e.NR,
        r: 0
    },
    e.CNM = {
        cN: "number",
        b: e.CNR,
        r: 0
    },
    e.BNM = {
        cN: "number",
        b: e.BNR,
        r: 0
    },
    e.CSSNM = {
        cN: "number",
        b: e.NR + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
        r: 0
    },
    e.RM = {
        cN: "regexp",
        b: /\//,
        e: /\/[gimuy]*/,
        i: /\n/,
        c: [e.BE, {
                b: /\[/,
                e: /\]/,
                r: 0,
                c: [e.BE]
            }
        ]
    },
    e.TM = {
        cN: "title",
        b: e.IR,
        r: 0
    },
    e.UTM = {
        cN: "title",
        b: e.UIR,
        r: 0
    },
    e.METHOD_GUARD = {
        b: "\\.\\s*" + e.UIR,
        r: 0
    },
    e
});
hljs.registerLanguage("xml", function (s) {
    var e = "[A-Za-z0-9\\._:-]+",
    t = {
        eW: !0,
        i: /</,
        r: 0,
        c: [{
                cN: "attr",
                b: e,
                r: 0
            }, {
                b: /=\s*/,
                r: 0,
                c: [{
                        cN: "string",
                        endsParent: !0,
                        v: [{
                                b: /"/,
                                e: /"/
                            }, {
                                b: /'/,
                                e: /'/
                            }, {
                                b: /[^\s"'=<>`]+/
                            }
                        ]
                    }
                ]
            }
        ]
    };
    return {
        aliases: ["html", "xhtml", "rss", "atom", "xjb", "xsd", "xsl", "plist"],
        cI: !0,
        c: [{
                cN: "meta",
                b: "<!DOCTYPE",
                e: ">",
                r: 10,
                c: [{
                        b: "\\[",
                        e: "\\]"
                    }
                ]
            }, s.C("<!--", "-->", {
                r: 10
            }), {
                b: "<\\!\\[CDATA\\[",
                e: "\\]\\]>",
                r: 10
            }, {
                b: /<\?(php)?/,
                e: /\?>/,
                sL: "php",
                c: [{
                        b: "/\\*",
                        e: "\\*/",
                        skip: !0
                    }
                ]
            }, {
                cN: "tag",
                b: "<style(?=\\s|>|$)",
                e: ">",
                k: {
                    name: "style"
                },
                c: [t],
                starts: {
                    e: "</style>",
                    rE: !0,
                    sL: ["css", "xml"]
                }
            }, {
                cN: "tag",
                b: "<script(?=\\s|>|$)",
                e: ">",
                k: {
                    name: "script"
                },
                c: [t],
                starts: {
                    e: "</script>",
                    rE: !0,
                    sL: ["actionscript", "javascript", "handlebars", "xml"]
                }
            }, {
                cN: "meta",
                v: [{
                        b: /<\?xml/,
                        e: /\?>/,
                        r: 10
                    }, {
                        b: /<\?\w+/,
                        e: /\?>/
                    }
                ]
            }, {
                cN: "tag",
                b: "</?",
                e: "/?>",
                c: [{
                        cN: "name",
                        b: /[^\/><\s]+/,
                        r: 0
                    }, t]
            }
        ]
    }
});
hljs.registerLanguage("css", function (e) {
    var c = "[a-zA-Z-][a-zA-Z0-9_-]*",
    t = {
        b: /[A-Z\_\.\-]+\s*:/,
        rB: !0,
        e: ";",
        eW: !0,
        c: [{
                cN: "attribute",
                b: /\S/,
                e: ":",
                eE: !0,
                starts: {
                    eW: !0,
                    eE: !0,
                    c: [{
                            b: /[\w-]+\(/,
                            rB: !0,
                            c: [{
                                    cN: "built_in",
                                    b: /[\w-]+/
                                }, {
                                    b: /\(/,
                                    e: /\)/,
                                    c: [e.ASM, e.QSM]
                                }
                            ]
                        }, e.CSSNM, e.QSM, e.ASM, e.CBCM, {
                            cN: "number",
                            b: "#[0-9A-Fa-f]+"
                        }, {
                            cN: "meta",
                            b: "!important"
                        }
                    ]
                }
            }
        ]
    };
    return {
        cI: !0,
        i: /[=\/|'\$]/,
        c: [e.CBCM, {
                cN: "selector-id",
                b: /#[A-Za-z0-9_-]+/
            }, {
                cN: "selector-class",
                b: /\.[A-Za-z0-9_-]+/
            }, {
                cN: "selector-attr",
                b: /\[/,
                e: /\]/,
                i: "$"
            }, {
                cN: "selector-pseudo",
                b: /:(:)?[a-zA-Z0-9\_\-\+\(\)"'.]+/
            }, {
                b: "@(font-face|page)",
                l: "[a-z-]+",
                k: "font-face page"
            }, {
                b: "@",
                e: "[{;]",
                i: /:/,
                c: [{
                        cN: "keyword",
                        b: /\w+/
                    }, {
                        b: /\s/,
                        eW: !0,
                        eE: !0,
                        r: 0,
                        c: [e.ASM, e.QSM, e.CSSNM]
                    }
                ]
            }, {
                cN: "selector-tag",
                b: c,
                r: 0
            }, {
                b: "{",
                e: "}",
                i: /\S/,
                c: [e.CBCM, t]
            }
        ]
    }
});
hljs.registerLanguage("sql", function (e) {
    var t = e.C("--", "$");
    return {
        cI: !0,
        i: /[<>{}*#]/,
        c: [{
                bK: "begin end start commit rollback savepoint lock alter create drop rename call delete do handler insert load replace select truncate update set show pragma grant merge describe use explain help declare prepare execute deallocate release unlock purge reset change stop analyze cache flush optimize repair kill install uninstall checksum restore check backup revoke comment",
                e: /;/,
                eW: !0,
                l: /[\w\.]+/,
                k: {
                    keyword: "abort abs absolute acc acce accep accept access accessed accessible account acos action activate add addtime admin administer advanced advise aes_decrypt aes_encrypt after agent aggregate ali alia alias allocate allow alter always analyze ancillary and any anydata anydataset anyschema anytype apply archive archived archivelog are as asc ascii asin assembly assertion associate asynchronous at atan atn2 attr attri attrib attribu attribut attribute attributes audit authenticated authentication authid authors auto autoallocate autodblink autoextend automatic availability avg backup badfile basicfile before begin beginning benchmark between bfile bfile_base big bigfile bin binary_double binary_float binlog bit_and bit_count bit_length bit_or bit_xor bitmap blob_base block blocksize body both bound buffer_cache buffer_pool build bulk by byte byteordermark bytes cache caching call calling cancel capacity cascade cascaded case cast catalog category ceil ceiling chain change changed char_base char_length character_length characters characterset charindex charset charsetform charsetid check checksum checksum_agg child choose chr chunk class cleanup clear client clob clob_base clone close cluster_id cluster_probability cluster_set clustering coalesce coercibility col collate collation collect colu colum column column_value columns columns_updated comment commit compact compatibility compiled complete composite_limit compound compress compute concat concat_ws concurrent confirm conn connec connect connect_by_iscycle connect_by_isleaf connect_by_root connect_time connection consider consistent constant constraint constraints constructor container content contents context contributors controlfile conv convert convert_tz corr corr_k corr_s corresponding corruption cos cost count count_big counted covar_pop covar_samp cpu_per_call cpu_per_session crc32 create creation critical cross cube cume_dist curdate current current_date current_time current_timestamp current_user cursor curtime customdatum cycle data database databases datafile datafiles datalength date_add date_cache date_format date_sub dateadd datediff datefromparts datename datepart datetime2fromparts day day_to_second dayname dayofmonth dayofweek dayofyear days db_role_change dbtimezone ddl deallocate declare decode decompose decrement decrypt deduplicate def defa defau defaul default defaults deferred defi defin define degrees delayed delegate delete delete_all delimited demand dense_rank depth dequeue des_decrypt des_encrypt des_key_file desc descr descri describ describe descriptor deterministic diagnostics difference dimension direct_load directory disable disable_all disallow disassociate discardfile disconnect diskgroup distinct distinctrow distribute distributed div do document domain dotnet double downgrade drop dumpfile duplicate duration each edition editionable editions element ellipsis else elsif elt empty enable enable_all enclosed encode encoding encrypt end end-exec endian enforced engine engines enqueue enterprise entityescaping eomonth error errors escaped evalname evaluate event eventdata events except exception exceptions exchange exclude excluding execu execut execute exempt exists exit exp expire explain export export_set extended extent external external_1 external_2 externally extract failed failed_login_attempts failover failure far fast feature_set feature_value fetch field fields file file_name_convert filesystem_like_logging final finish first first_value fixed flash_cache flashback floor flush following follows for forall force form forma format found found_rows freelist freelists freepools fresh from from_base64 from_days ftp full function general generated get get_format get_lock getdate getutcdate global global_name globally go goto grant grants greatest group group_concat group_id grouping grouping_id groups gtid_subtract guarantee guard handler hash hashkeys having hea head headi headin heading heap help hex hierarchy high high_priority hosts hour http id ident_current ident_incr ident_seed identified identity idle_time if ifnull ignore iif ilike ilm immediate import in include including increment index indexes indexing indextype indicator indices inet6_aton inet6_ntoa inet_aton inet_ntoa infile initial initialized initially initrans inmemory inner innodb input insert install instance instantiable instr interface interleaved intersect into invalidate invisible is is_free_lock is_ipv4 is_ipv4_compat is_not is_not_null is_used_lock isdate isnull isolation iterate java join json json_exists keep keep_duplicates key keys kill language large last last_day last_insert_id last_value lax lcase lead leading least leaves left len lenght length less level levels library like like2 like4 likec limit lines link list listagg little ln load load_file lob lobs local localtime localtimestamp locate locator lock locked log log10 log2 logfile logfiles logging logical logical_reads_per_call logoff logon logs long loop low low_priority lower lpad lrtrim ltrim main make_set makedate maketime managed management manual map mapping mask master master_pos_wait match matched materialized max maxextents maximize maxinstances maxlen maxlogfiles maxloghistory maxlogmembers maxsize maxtrans md5 measures median medium member memcompress memory merge microsecond mid migration min minextents minimum mining minus minute minvalue missing mod mode model modification modify module monitoring month months mount move movement multiset mutex name name_const names nan national native natural nav nchar nclob nested never new newline next nextval no no_write_to_binlog noarchivelog noaudit nobadfile nocheck nocompress nocopy nocycle nodelay nodiscardfile noentityescaping noguarantee nokeep nologfile nomapping nomaxvalue nominimize nominvalue nomonitoring none noneditionable nonschema noorder nopr nopro noprom nopromp noprompt norely noresetlogs noreverse normal norowdependencies noschemacheck noswitch not nothing notice notrim novalidate now nowait nth_value nullif nulls num numb numbe nvarchar nvarchar2 object ocicoll ocidate ocidatetime ociduration ociinterval ociloblocator ocinumber ociref ocirefcursor ocirowid ocistring ocitype oct octet_length of off offline offset oid oidindex old on online only opaque open operations operator optimal optimize option optionally or oracle oracle_date oradata ord ordaudio orddicom orddoc order ordimage ordinality ordvideo organization orlany orlvary out outer outfile outline output over overflow overriding package pad parallel parallel_enable parameters parent parse partial partition partitions pascal passing password password_grace_time password_lock_time password_reuse_max password_reuse_time password_verify_function patch path patindex pctincrease pctthreshold pctused pctversion percent percent_rank percentile_cont percentile_disc performance period period_add period_diff permanent physical pi pipe pipelined pivot pluggable plugin policy position post_transaction pow power pragma prebuilt precedes preceding precision prediction prediction_cost prediction_details prediction_probability prediction_set prepare present preserve prior priority private private_sga privileges procedural procedure procedure_analyze processlist profiles project prompt protection public publishingservername purge quarter query quick quiesce quota quotename radians raise rand range rank raw read reads readsize rebuild record records recover recovery recursive recycle redo reduced ref reference referenced references referencing refresh regexp_like register regr_avgx regr_avgy regr_count regr_intercept regr_r2 regr_slope regr_sxx regr_sxy reject rekey relational relative relaylog release release_lock relies_on relocate rely rem remainder rename repair repeat replace replicate replication required reset resetlogs resize resource respect restore restricted result result_cache resumable resume retention return returning returns reuse reverse revoke right rlike role roles rollback rolling rollup round row row_count rowdependencies rowid rownum rows rtrim rules safe salt sample save savepoint sb1 sb2 sb4 scan schema schemacheck scn scope scroll sdo_georaster sdo_topo_geometry search sec_to_time second section securefile security seed segment select self sequence sequential serializable server servererror session session_user sessions_per_user set sets settings sha sha1 sha2 share shared shared_pool short show shrink shutdown si_averagecolor si_colorhistogram si_featurelist si_positionalcolor si_stillimage si_texture siblings sid sign sin size size_t sizes skip slave sleep smalldatetimefromparts smallfile snapshot some soname sort soundex source space sparse spfile split sql sql_big_result sql_buffer_result sql_cache sql_calc_found_rows sql_small_result sql_variant_property sqlcode sqldata sqlerror sqlname sqlstate sqrt square standalone standby start starting startup statement static statistics stats_binomial_test stats_crosstab stats_ks_test stats_mode stats_mw_test stats_one_way_anova stats_t_test_ stats_t_test_indep stats_t_test_one stats_t_test_paired stats_wsr_test status std stddev stddev_pop stddev_samp stdev stop storage store stored str str_to_date straight_join strcmp strict string struct stuff style subdate subpartition subpartitions substitutable substr substring subtime subtring_index subtype success sum suspend switch switchoffset switchover sync synchronous synonym sys sys_xmlagg sysasm sysaux sysdate sysdatetimeoffset sysdba sysoper system system_user sysutcdatetime table tables tablespace tan tdo template temporary terminated tertiary_weights test than then thread through tier ties time time_format time_zone timediff timefromparts timeout timestamp timestampadd timestampdiff timezone_abbr timezone_minute timezone_region to to_base64 to_date to_days to_seconds todatetimeoffset trace tracking transaction transactional translate translation treat trigger trigger_nestlevel triggers trim truncate try_cast try_convert try_parse type ub1 ub2 ub4 ucase unarchived unbounded uncompress under undo unhex unicode uniform uninstall union unique unix_timestamp unknown unlimited unlock unpivot unrecoverable unsafe unsigned until untrusted unusable unused update updated upgrade upped upper upsert url urowid usable usage use use_stored_outlines user user_data user_resources users using utc_date utc_timestamp uuid uuid_short validate validate_password_strength validation valist value values var var_samp varcharc vari varia variab variabl variable variables variance varp varraw varrawc varray verify version versions view virtual visible void wait wallet warning warnings week weekday weekofyear wellformed when whene whenev wheneve whenever where while whitespace with within without work wrapped xdb xml xmlagg xmlattributes xmlcast xmlcolattval xmlelement xmlexists xmlforest xmlindex xmlnamespaces xmlpi xmlquery xmlroot xmlschema xmlserialize xmltable xmltype xor year year_to_month years yearweek",
                    literal: "true false null",
                    built_in: "array bigint binary bit blob boolean char character date dec decimal float int int8 integer interval number numeric real record serial serial8 smallint text varchar varying void"
                },
                c: [{
                        cN: "string",
                        b: "'",
                        e: "'",
                        c: [e.BE, {
                                b: "''"
                            }
                        ]
                    }, {
                        cN: "string",
                        b: '"',
                        e: '"',
                        c: [e.BE, {
                                b: '""'
                            }
                        ]
                    }, {
                        cN: "string",
                        b: "`",
                        e: "`",
                        c: [e.BE]
                    }, e.CNM, e.CBCM, t]
            }, e.CBCM, t]
    }
});
hljs.registerLanguage("cpp", function (t) {
    var e = {
        cN: "keyword",
        b: "\\b[a-z\\d_]*_t\\b"
    },
    r = {
        cN: "string",
        v: [{
                b: '(u8?|U)?L?"',
                e: '"',
                i: "\\n",
                c: [t.BE]
            }, {
                b: '(u8?|U)?R"',
                e: '"',
                c: [t.BE]
            }, {
                b: "'\\\\?.",
                e: "'",
                i: "."
            }
        ]
    },
    s = {
        cN: "number",
        v: [{
                b: "\\b(0b[01']+)"
            }, {
                b: "(-?)\\b([\\d']+(\\.[\\d']*)?|\\.[\\d']+)(u|U|l|L|ul|UL|f|F|b|B)"
            }, {
                b: "(-?)(\\b0[xX][a-fA-F0-9']+|(\\b[\\d']+(\\.[\\d']*)?|\\.[\\d']+)([eE][-+]?[\\d']+)?)"
            }
        ],
        r: 0
    },
    i = {
        cN: "meta",
        b: /#\s*[a-z]+\b/,
        e: /$/,
        k: {
            "meta-keyword": "if else elif endif define undef warning error line pragma ifdef ifndef include"
        },
        c: [{
                b: /\\\n/,
                r: 0
            }, t.inherit(r, {
                cN: "meta-string"
            }), {
                cN: "meta-string",
                b: /<[^\n>]*>/,
                e: /$/,
                i: "\\n"
            }, t.CLCM, t.CBCM]
    },
    a = t.IR + "\\s*\\(",
    c = {
        keyword: "int float while private char catch import module export virtual operator sizeof dynamic_cast|10 typedef const_cast|10 const class for static_cast|10 union namespace unsigned long volatile static protected bool template mutable if public friend do goto auto void enum else break extern using asm case typeid short reinterpret_cast|10 default double register explicit signed typename try this switch continue inline delete alignof constexpr decltype noexcept static_assert thread_local restrict _Bool complex _Complex _Imaginary atomic_bool atomic_char atomic_schar atomic_uchar atomic_short atomic_ushort atomic_int atomic_uint atomic_long atomic_ulong atomic_llong atomic_ullong new throw return and or not word dword ulong64 long64 byte size_t",
        built_in: "std string cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap array shared_ptr abort abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 malloc realloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf endl initializer_list unique_ptr",
        literal: "true false nullptr NULL"
    },
    n = [e, t.CLCM, t.CBCM, s, r];
    return {
        aliases: ["c", "cc", "h", "c++", "h++", "hpp"],
        k: c,
        i: "</",
        c: n.concat([i, {
                    b: "\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<",
                    e: ">",
                    k: c,
                    c: ["self", e]
                }, {
                    b: t.IR + "::",
                    k: c
                }, {
                    v: [{
                            b: /=/,
                            e: /;/
                        }, {
                            b: /\(/,
                            e: /\)/
                        }, {
                            bK: "new throw return else",
                            e: /;/
                        }
                    ],
                    k: c,
                    c: n.concat([{
                                b: /\(/,
                                e: /\)/,
                                k: c,
                                c: n.concat(["self"]),
                                r: 0
                            }
                        ]),
                    r: 0
                }, {
                    cN: "function",
                    b: "(" + t.IR + "[\\*&\\s]+)+" + a,
                    rB: !0,
                    e: /[{;=]/,
                    eE: !0,
                    k: c,
                    i: /[^\w\s\*&]/,
                    c: [{
                            b: a,
                            rB: !0,
                            c: [t.TM],
                            r: 0
                        }, {
                            cN: "params",
                            b: /\(/,
                            e: /\)/,
                            k: c,
                            r: 0,
                            c: [t.CLCM, t.CBCM, r, s, e]
                        }, t.CLCM, t.CBCM, i]
                }, {
                    cN: "class",
                    bK: "class struct",
                    e: /[{;:]/,
                    c: [{
                            b: /</,
                            e: />/,
                            c: ["self"]
                        }, t.TM]
                }
            ]),
        exports: {
            preprocessor: i,
            strings: r,
            k: c
        }
    }
});
hljs.registerLanguage("http", function (e) {
    var t = "HTTP/[0-9\\.]+";
    return {
        aliases: ["https"],
        i: "\\S",
        c: [{
                b: "^" + t,
                e: "$",
                c: [{
                        cN: "number",
                        b: "\\b\\d{3}\\b"
                    }
                ]
            }, {
                b: "^[A-Z]+ (.*?) " + t + "$",
                rB: !0,
                e: "$",
                c: [{
                        cN: "string",
                        b: " ",
                        e: " ",
                        eB: !0,
                        eE: !0
                    }, {
                        b: t
                    }, {
                        cN: "keyword",
                        b: "[A-Z]+"
                    }
                ]
            }, {
                cN: "attribute",
                b: "^\\w",
                e: ": ",
                eE: !0,
                i: "\\n|\\s|=",
                starts: {
                    e: "$",
                    r: 0
                }
            }, {
                b: "\\n\\n",
                starts: {
                    sL: [],
                    eW: !0
                }
            }
        ]
    }
});
hljs.registerLanguage("json", function (e) {
    var i = {
        literal: "true false null"
    },
    n = [e.QSM, e.CNM],
    r = {
        e: ",",
        eW: !0,
        eE: !0,
        c: n,
        k: i
    },
    t = {
        b: "{",
        e: "}",
        c: [{
                cN: "attr",
                b: /"/,
                e: /"/,
                c: [e.BE],
                i: "\\n"
            }, e.inherit(r, {
                b: /:/
            })],
        i: "\\S"
    },
    c = {
        b: "\\[",
        e: "\\]",
        c: [e.inherit(r)],
        i: "\\S"
    };
    return n.splice(n.length, 0, t, c), {
        c: n,
        k: i,
        i: "\\S"
    }
});
hljs.registerLanguage("javascript", function (e) {
    var r = "[A-Za-z$_][0-9A-Za-z$_]*",
    t = {
        keyword: "in of if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const export super debugger as async await static import from as",
        literal: "true false null undefined NaN Infinity",
        built_in: "eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape Object Function Boolean Error EvalError InternalError RangeError ReferenceError StopIteration SyntaxError TypeError URIError Number Math Date String RegExp Array Float32Array Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect Promise"
    },
    a = {
        cN: "number",
        v: [{
                b: "\\b(0[bB][01]+)"
            }, {
                b: "\\b(0[oO][0-7]+)"
            }, {
                b: e.CNR
            }
        ],
        r: 0
    },
    n = {
        cN: "subst",
        b: "\\$\\{",
        e: "\\}",
        k: t,
        c: []
    },
    c = {
        cN: "string",
        b: "`",
        e: "`",
        c: [e.BE, n]
    };
    n.c = [e.ASM, e.QSM, c, a, e.RM];
    var s = n.c.concat([e.CBCM, e.CLCM]);
    return {
        aliases: ["js", "jsx"],
        k: t,
        c: [{
                cN: "meta",
                r: 10,
                b: /^\s*['"]use (strict|asm)['"]/
            }, {
                cN: "meta",
                b: /^#!/,
                e: /$/
            }, e.ASM, e.QSM, c, e.CLCM, e.CBCM, a, {
                b: /[{,]\s*/,
                r: 0,
                c: [{
                        b: r + "\\s*:",
                        rB: !0,
                        r: 0,
                        c: [{
                                cN: "attr",
                                b: r,
                                r: 0
                            }
                        ]
                    }
                ]
            }, {
                b: "(" + e.RSR + "|\\b(case|return|throw)\\b)\\s*",
                k: "return throw case",
                c: [e.CLCM, e.CBCM, e.RM, {
                        cN: "function",
                        b: "(\\(.*?\\)|" + r + ")\\s*=>",
                        rB: !0,
                        e: "\\s*=>",
                        c: [{
                                cN: "params",
                                v: [{
                                        b: r
                                    }, {
                                        b: /\(\s*\)/
                                    }, {
                                        b: /\(/,
                                        e: /\)/,
                                        eB: !0,
                                        eE: !0,
                                        k: t,
                                        c: s
                                    }
                                ]
                            }
                        ]
                    }, {
                        b: /</,
                        e: /(\/\w+|\w+\/)>/,
                        sL: "xml",
                        c: [{
                                b: /<\w+\s*\/>/,
                                skip: !0
                            }, {
                                b: /<\w+/,
                                e: /(\/\w+|\w+\/)>/,
                                skip: !0,
                                c: [{
                                        b: /<\w+\s*\/>/,
                                        skip: !0
                                    }, "self"]
                            }
                        ]
                    }
                ],
                r: 0
            }, {
                cN: "function",
                bK: "function",
                e: /\{/,
                eE: !0,
                c: [e.inherit(e.TM, {
                        b: r
                    }), {
                        cN: "params",
                        b: /\(/,
                        e: /\)/,
                        eB: !0,
                        eE: !0,
                        c: s
                    }
                ],
                i: /\[|%/
            }, {
                b: /\$[(.]/
            }, e.METHOD_GUARD, {
                cN: "class",
                bK: "class",
                e: /[{;=]/,
                eE: !0,
                i: /[:"\[\]]/,
                c: [{
                        bK: "extends"
                    }, e.UTM]
            }, {
                bK: "constructor",
                e: /\{/,
                eE: !0
            }
        ],
        i: /#(?!!)/
    }
});
hljs.registerLanguage("makefile", function (e) {
    var i = {
        cN: "variable",
        v: [{
                b: "\\$\\(" + e.UIR + "\\)",
                c: [e.BE]
            }, {
                b: /\$[@%<?\^\+\*]/
            }
        ]
    },
    r = {
        cN: "string",
        b: /"/,
        e: /"/,
        c: [e.BE, i]
    },
    a = {
        cN: "variable",
        b: /\$\([\w-]+\s/,
        e: /\)/,
        k: {
            built_in: "subst patsubst strip findstring filter filter-out sort word wordlist firstword lastword dir notdir suffix basename addsuffix addprefix join wildcard realpath abspath error warning shell origin flavor foreach if or and call eval file value"
        },
        c: [i]
    },
    n = {
        b: "^" + e.UIR + "\\s*[:+?]?=",
        i: "\\n",
        rB: !0,
        c: [{
                b: "^" + e.UIR,
                e: "[:+?]?=",
                eE: !0
            }
        ]
    },
    t = {
        cN: "meta",
        b: /^\.PHONY:/,
        e: /$/,
        k: {
            "meta-keyword": ".PHONY"
        },
        l: /[\.\w]+/
    },
    l = {
        cN: "section",
        b: /^[^\s]+:/,
        e: /$/,
        c: [i]
    };
    return {
        aliases: ["mk", "mak"],
        k: "define endef undefine ifdef ifndef ifeq ifneq else endif include -include sinclude override export unexport private vpath",
        l: /[\w-]+/,
        c: [e.HCM, i, r, a, n, t, l]
    }
});