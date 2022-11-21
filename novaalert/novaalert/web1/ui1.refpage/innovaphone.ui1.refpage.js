
/// <reference path="../ui.lib1/innovaphone.ui1.lib.js" />
/// <reference path="../ui.svg/innovaphone.ui1.svg.js" />

innovaphone = innovaphone || {};
innovaphone.ui1 = innovaphone.ui1 || {};

innovaphone.ui1.RefPage = innovaphone.ui1.RefPage || function (style, urlPostfix, cl, urlPrefix) {
    var svgCode = "<path d=\'M8.62.38h2.07A3.3,3.3,0,0,1,14,3.67V5.92A3.78,3.78,0,0,1,12.38,9l-1.16.82a.52.52,0,0,0-.23.43v3.2a.52.52,0,0,1-.52.52H8.53A.52.52,0,0,1,8,13.46v-4a1.93,1.93,0,0,1,.84-1.6l1.39-1A1.81,1.81,0,0,0,11,5.44v-1A1.09,1.09,0,0,0,9.9,3.38H9.09A1.09,1.09,0,0,0,8,4.47v.78a.53.53,0,0,1-.53.53H5.53A.52.52,0,0,1,5,5.26V4A3.61,3.61,0,0,1,8.62.38ZM8.39,20h2.22a.4.4,0,0,0,.39-.39V17.39a.4.4,0,0,0-.39-.39H8.39a.4.4,0,0,0-.39.39v2.22A.4.4,0,0,0,8.39,20Z'/>",
        svgViewBox = "0 0 20 20";

    urlPrefix = urlPrefix || "https://wiki.innovaphone.com/index.php?title=Reference13r2:";
    if (navigator.userAgent.indexOf("myApps/") != -1) urlPrefix = "com.innovaphone.browsehttps:" + urlPrefix;

    this.createNode("a", style, 0, cl);
    this.add(new innovaphone.ui1.SvgInline("width: inherit; height: inherit; fill: inherit", svgViewBox, svgCode));
    this.setAttribute("href", urlPrefix + urlPostfix).setAttribute("target", "_blank").setStyle("cursor", "pointer").setStyle("outline", "none").setStyle("box-shaddow", "none");
};

innovaphone.ui1.RefPage.prototype = innovaphone.ui1.nodePrototype;
