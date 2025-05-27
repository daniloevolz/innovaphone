/// <reference path="../lib1/innovaphone.lib1.js" />
/// <reference path="../ui1.lib/innovaphone.ui1.lib.js" />

innovaphone = innovaphone || {};
innovaphone.ui1 = innovaphone.ui1 || {};

innovaphone.ui1.TableConfig = innovaphone.ui1.TableConfig || function (mediaOrContainerQueryConditions, cl,
    styleTable, styleThead, styleTh, styleTr, styleTbody, styleTd,
    styleMediaTable, styleMediaThead, styleMediaTh, styleMediaTr, styleMediaTbody, styleMediaTd) {

    function checkClass(className) {
        return (className ? " " + className : "");
    }

    this.mediaOrContainerQueryConditions = mediaOrContainerQueryConditions || "@media (max-width:800px)";
    this.styleTable = styleTable || "";
    this.styleThead = styleThead || "";
    this.styleTh = styleTh || "";
    this.styleTr = styleTr || "";
    this.styleTbody = styleTbody || "";
    this.styleTd = styleTd || "";
    this.styleMediaTable = styleMediaTable || "";
    this.styleMediaThead = styleMediaThead || "";
    this.styleMediaTh = styleMediaTh || "";
    this.styleMediaTr = styleMediaTr || "";
    this.styleMediaTbody = styleMediaTbody || "";
    this.styleMediaTd = styleMediaTd || "";
    this.cl = checkClass(cl);
};

innovaphone.ui1.TableCss = innovaphone.ui1.TableCss || {};

innovaphone.ui1.Table = innovaphone.ui1.Table || function (cfg, texts, defaultDescending) {
    const ui1TableClass = "innovaphone-ui1-table";

    cfg = cfg || new innovaphone.ui1.TableConfig();

    this.createNode("table", cfg.styleTable, "", ui1TableClass + cfg.cl);

    var that = this,        
        thead = this.add(new innovaphone.ui1.Node("thead", cfg.styleThead, null, ui1TableClass + cfg.cl)),
        theadTr = thead.add(new innovaphone.ui1.Node("tr", cfg.styleTr, null, ui1TableClass + cfg.cl)),
        tbody = this.add(new innovaphone.ui1.Node("tbody", cfg.styleTbody, null, ui1TableClass + cfg.cl)),
        columns = [],
        ascending = (defaultDescending === true ? false : true),
        lastSortColumn = 0,
        rows = {};

    function getClasses(className) {
        return (className == "" ? ui1TableClass : ui1TableClass + "." + className.trim());
    }

    function init() {
        // create a unique key depending on the used media query and the classes to prevent adding the same CSS multiple times
        var key = cfg.mediaOrContainerQueryConditions + ";" + cfg.cl;
        if (!innovaphone.ui1.TableCss.hasOwnProperty(key)) {
            innovaphone.ui1.TableCss[key] = true;
            var style = document.createElement("style"),
                css = cfg.mediaOrContainerQueryConditions + " {\r\n" +
                    "table." + getClasses(cfg.cl) + " {\r\n" +
                    "    border: 0;\r\n" + cfg.styleMediaTable +
                    "}\r\n" +
                    "thead." + getClasses(cfg.cl) + " {\r\n" +
                    "    display: none;\r\n" + cfg.styleMediaThead +
                    "}\r\n" +
                    "th." + getClasses(cfg.cl) + " {\r\n" +
                    "    " + cfg.styleMediaTh +
                    "}\r\n" +
                    "tr." + getClasses(cfg.cl) + " {\r\n" +
                    "    display: block;\r\n" + cfg.styleMediaTr +
                    "}\r\n" +
                    "td." + getClasses(cfg.cl) + " {\r\n" +
                    "    display: block;\r\n" +
                    "    " + cfg.styleMediaTd +
                    "}\r\n" +
                    "td." + getClasses(cfg.cl) + " {\r\n" +
                    "    " + cfg.styleMediaTbody +
                    "}\r\n" +
                    "td." + getClasses(cfg.cl) + "::before {\r\n" +
                    "    content: attr(data-label); \r\n" +
                    "    float: left; \r\n" +
                    "} \r\n" +
                    "td." + getClasses(cfg.cl) +":last-child {" +
                    "\r\n" +
                    "    border-bottom: 0;\r\n" +
                    "} \r\n" +
                    "}";
            style.setAttribute("type", "text/css");
            style.appendChild(document.createTextNode(css));
            document.head.appendChild(style);
        }
    }

    function addColumn(headerTranslationId, headerText) {
        var th = theadTr.add(new innovaphone.ui1.Node("th", "cursor:pointer;" + cfg.styleTh, headerText, ui1TableClass + cfg.cl));
        if (texts && headerTranslationId) {
            th.addTranslation(texts, headerTranslationId, "innerText");
        }
        columns.push({ text: headerText, tl: headerTranslationId });
        var column = columns.length - 1;
        th.addEvent("click", function () {
            toggleSortOrder();
            sort(column);
        });
        return th;
    }

    function addRow(id, data, object, dataSorting) {
        if (rows.hasOwnProperty(id)) return;
        if (data.length != columns.length) {
            console.warn("innovaphone.ui1.table:addRow row ignored as data.length!=columns.length");
            return;
        }
        if (dataSorting && dataSorting.length != columns.length) {
            console.warn("innovaphone.ui1.table:addRow row ignored as dataSorting.length!=columns.length");
            return;
        }

        var row = tbody.add(new innovaphone.ui1.Node("tr", cfg.styleTr, null, ui1TableClass + cfg.cl));
        row.tds = [];
        row.object = object;
        for (var i = 0; i < data.length; i++) {
            var td = row.add(new innovaphone.ui1.Node("td", cfg.styleTd, null, ui1TableClass + cfg.cl));
            if (data[i] instanceof innovaphone.ui1.Node) {
                td.add(data[i]);
            }
            else {
                td.addText(data[i]);
            }
            if (columns[i].tl) {
                td.setAttribute("data-label", texts.text(columns[i].tl));
            }
            else {
                td.setAttribute("data-label", columns[i].text);
            }
            if (dataSorting) {
                td.sorting = dataSorting[i];
            }
            row.tds.push(td);
        }
        rows[id] = row;
        return row;
    }

    function removeRow(id) {
        if (!rows.hasOwnProperty(id)) return null;

        tbody.rem(rows[id]);
        var row = rows[id];
        delete rows[id];
        return row;
    }

    function onLanguageChanged() {
        Object.keys(rows).forEach(function (key, index) {
            for (var j = 0; j < rows[key].tds.length; j++) {
                if (columns[j].tl) {
                    rows[key].tds[j].setAttribute("data-label", texts.text(columns[j].tl));
                }
            }
        });
    }

    function getRows() {
        return rows;
    }

    function toggleSortOrder() {
        ascending = !ascending;
    }

    function sort(column) {
        if (column == undefined) column = lastSortColumn;
        var arr = Object.values(rows);
        arr.sort(function (a, b) {
            var aValue = a.tds[column].sorting || a.tds[column].container.innerText.toLowerCase(),
                bValue = b.tds[column].sorting || b.tds[column].container.innerText.toLowerCase();

            if (!isNaN(aValue) && !isNaN(bValue)) {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            }

            if (ascending) {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        for (var i = 0; i < arr.length; i++) {
            tbody.add(arr[i]);
        }
        lastSortColumn = column;
    }

    function clear() {
        if (texts) {
            texts.clear(tbody);
        }
        tbody.clear();
        rows = {};
    }

    this.addColumn = addColumn;
    this.addRow = addRow;
    this.removeRow = removeRow;
    this.getRows = getRows;
    this.onLanguageChanged = onLanguageChanged;
    this.toggleSortOrder = toggleSortOrder;
    this.sort = sort;
    this.clear = clear;

    init();
};
innovaphone.ui1.Table.prototype = innovaphone.ui1.nodePrototype;
