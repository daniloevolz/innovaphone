
/// <reference path="../ui1.lib/innovaphone.ui1.lib.js" />
/// <reference path="../ui1.scrolling/innovaphone.ui1.scrolling.js" />
/// <reference path="~/web1/ui1.svg/innovaphone.ui1.svg.js" />

innovaphone = innovaphone || {};
innovaphone.ui1 = innovaphone.ui1 || {};

innovaphone.ui1.TreeViewIcons = {
    "arrowNavigation": "<path d=\"M15.5,2l-7,8,7,8-2,2-9-10,9-10Z\"/>"
}

innovaphone.ui1.TreeViewConfig = innovaphone.ui1.TreeViewConfig || function (treeviewCl, elementsCl, arrowCl, onExpandCl, onCollapseCl) {
    this.treeviewCl = treeviewCl;
    this.elementsCl = elementsCl;
    this.arrowCl = arrowCl;
    this.onExpandCl = onExpandCl;
    this.onCollapseCl = onCollapseCl;
}

innovaphone.ui1.TreeView = innovaphone.ui1.TreeView || function (out, id, config) {
    var treeview = this,
        root = null,
        selectedNode = null,
        rootNodes = [];

    function Init() {
        treeview.createNode("div", "position:absolute; display:flex; flex-direction:column; width:100%; height:100%");
        treeview.root = new TreeV(null);
        out.add(treeview);
    }

    function TreeV(parentNode) {
        var tree = this,
            nodes = [];

        this.createNode("div", "display:block; position:relative;");
        if (parentNode != null) {
            //tree.container.style.display = "none";
        }
        if (config.treeviewCl)
            this.addClass(config.treeviewCl);

        this.addNode = function (element, id, obj) {
            var node = new Node(element, id, obj);
            nodes.push(node);
            return node;
        }

        this.findNode = function (id) {
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].id == id) {
                    return nodes[i];
                }
            }
            return null;
        }

        this.removeNode = function (id) {
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].id == id) {
                    var node = nodes[i];
                    tree.rem(node);
                    nodes.splice(i, 1);
                    return node;
                }
            }
            return null;
        }

        this.getNodes = function () {
            return nodes;
        }
        this.SelectNode = SelectNode;

        function SelectNode(node) {
            if (id) {
                var storageIds = [];
                var parentNode = node;
                while (parentNode && parentNode.id) {
                    storageIds.push(parentNode.id);
                    parentNode = parentNode.parentNode;
                }
                localStorage[id] = JSON.stringify(storageIds);
            }
            if (selectedNode) {
                selectedNode.deselect();
            }
            if (selectedNode != node) {             // select the new node and expand it
                selectedNode = node;
                node.select();
            }
            else {                                  // select the same node again
                node.select();
                selectedNode = node;
            }
            if (selectedNode == null) {
                localStorage[id] = [];
            }
        }

        function Node(element, id, obj) {
            var node = this,
                nodeDiv = new innovaphone.ui1.Div("height:25px; width:100%; display:flex; flex-direction:row; padding-left:5px; margin-bottom:5px; cursor:pointer;"), 
                nodeName = new innovaphone.ui1.Div("margin-left:3px;"),
                arrow = new innovaphone.ui1.Div("display:inline-flex; align-items:center; visibility:hidden; margin-left:5px; width:0; transform:rotate(180deg);"),
                arrowSVG = new innovaphone.ui1.SvgInline("height:15px; width:15px;", "0 0 20 20", innovaphone.ui1.TreeViewIcons.arrowNavigation),
                subtree = null,
                expanded = false,
                onExpand = null,
                onCollapse = null,
                onDeselect = null,
                onClick = null,
                selected = false;

            arrow.add(arrowSVG);
            nodeDiv.add(arrow);
            nodeDiv.add(nodeName);

            nodeDiv.addClass(config.elementsCl);
            arrow.addClass(config.arrowCl);
            this.createNode("div", "display:flex; flex-direction:column; width:100%;");
            this.container.setAttribute("pid", id);
            this.add(nodeDiv);
            tree.add(this);

            nodeDiv.addEvent("click", function (e) {
                SelectNode(node);
            });

            if (typeof (element) == "string" || typeof (element) == "number" || typeof (element) == "boolean") {
                nodeName.container.innerHTML = element;

            }
            else {
                nodeDiv.rem(nodeName);
                nodeDiv.add(element);
                element.container.style.marginLeft = "5px";
            }

            if (parentNode != null) {
                var left = parseInt(parentNode.arrow.container.style.marginLeft);
                arrow.container.style.marginLeft = left + 15 + "px";                
            }

            arrow.addEvent("click", function () {
                toggle();
            });            

            function select() {
                if (onClick) onClick(node);
            }

            function expand() {
                if (node.subtree && !expanded) {
                    expanded = true;
                    if (config.onExpandCl) {
                        node.subtree.remClass(config.onCollapseCl);
                        node.subtree.addClass(config.onExpandCl);
                    }
                    else {
                        node.subtree.container.style.display = "block";
                    }
                    
                    arrow.container.style.transform = "rotate(270deg)";
                    if (onExpand) {
                        //subTree.container.clear();
                        onExpand(node);
                    }
                }
            }

            function collapse() {
                if (node.subtree && expanded) {
                    expanded = false;
                    //if (onExpand) subTree.clear();
                    if (config.onCollapseCl) {
                        node.subtree.remClass(config.onExpandCl);
                        node.subtree.addClass(config.onCollapseCl);
                    }
                    else {
                        node.subtree.container.style.display = "none";
                    }                    
                    arrow.container.style.transform = "rotate(180deg)";
                    if (onCollapse) {
                        //subTree.clear();
                        onCollapse(node);
                    }
                }
            }

            function toggle() {
                if (node.subtree) {
                    if (!expanded) {
                        expand();
                    }
                    else {
                        collapse();
                    }
                }
            }

            function deselect() {
                if (onDeselect) {
                    onDeselect(node);
                }
            }

            function select() {
                /*if (selectable) {
                    innovaphone.lib.addClass(content, "ijs-selected");
                }*/
                if (onClick) onClick(node);
            }

            this.object = obj;
            this.id = id;
            this.subtree = subtree;
            this.deselect = deselect;
            this.select = select;
            this.arrow = arrow;

            this.getContainer = function () {
                return nodeDiv;
            }

            this.createTree = function () {
                if (node.subtree) return node.subtree;
                node.subtree = new TreeV(node);
                arrow.container.style.visibility = "visible";
                arrow.container.style.width = "15px";
                node.add(node.subtree);
                return node.subtree;
            }

            this.getSubTree = function () {
                return node.subtree;
            }

            this.isExpanded = function () {
                return expanded;
            }

            this.setOnExpand = function (funcOnExpand) {
                onExpand = funcOnExpand;
                nodeDiv.addEvent("dblclick", function (e) {
                    toggle();
                });
            }
            
            this.setOnCollapse = function (funcOnCollapse) {
                onCollapse = funcOnCollapse;
            }

            this.setOnDeselect = function (funcOnDeselect) {
                onDeselect = funcOnDeselect;
            }

            this.setOnClick = function (funcOnClick) {
                onClick = funcOnClick;
            }
        }
        Node.prototype = innovaphone.ui1.nodePrototype
    }
    TreeV.prototype = innovaphone.ui1.nodePrototype;

    this.addNode = function (element, id, obj) {
        var node = treeview.root.addNode(element, id, obj);
        treeview.add(node);
        return node;
        //var root = new RootNode(element, id, obj);
        //return root;
    }

    this.removeNode = function (id) {
        var node = treeview.root.removeNode(id);
        treeview.rem(node);
    }

    this.getNodes = function () {
        return treeview.root.getNodes();
    }

    this.findNode = function (id) {
        return treeview.root.findNode(id);
    }

    this.selectNode = function (node) {
        treeview.root.SelectNode(node);
    }    

    this.root = root;
    this.getSelectedNode = function () {
        return selectedNode;
    };

    Init();
};
innovaphone.ui1.TreeView.prototype = innovaphone.ui1.nodePrototype;