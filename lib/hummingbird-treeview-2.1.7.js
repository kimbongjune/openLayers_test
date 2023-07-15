(function ($) {
    var uncheckAll_doubles = false;
    var checkDisabled = true;
    var skip_next_check_uncheck = false;
    var checkboxesGroups_grayed = false;
    var checkboxesGroups = false;
    var clickedNode = {};
    var textcolor = "";
    $(document).ready(function () {
        var all_converter = $(".hummingbird-treeview-converter");
        var converter_num = 1;
        var converter_str = "";
        $.each(all_converter, function (e) {
            if (converter_num > 1) {
                converter_str = converter_num.toString();
            }
            converter_num++;
            var converter = $(this);
            converter.hide(350);
            var converter_height = converter.attr("data-height");
            var converter_scroll = converter.attr("data-scroll");
            var converter_id = converter.attr("data-id");
            var boldParents = converter.attr("data-boldParents");
            if (converter_scroll == "true") {
                converter_scroll = "overflow-y:scroll;";
            } else {
                converter_scroll = "";
            }
            if (typeof converter_height == "undefined") {
                converter_height = "";
            } else {
                converter_height = "height: " + converter_height + ";";
            }
            if (typeof converter_id == "undefined") {
                converter_id = "";
            }
            if (typeof boldParents == "undefined") {
                boldParents = false;
            } else {
                boldParents = true;
            }
            var tree_html =
                '<div id="treeview_container' +
                converter_str +
                '" class="hummingbird-treeview" style="' +
                converter_height +
                " " +
                converter_scroll +
                '">' +
                '<ul id="treeview' +
                converter_str +
                converter_id +
                '" class="hummingbird-base">';
            var tree = converter.children("li");
            var id_num = 0;
            var id_str = "";
            var data_id = "";
            var item = "";
            var allowed = true;
            var msg = "";
            $.each(tree, function (i, e) {
                var treeText = $(this).text();
                var regExp = /^-+/;
                var numHyphenMatch = treeText.match(regExp);
                var numHyphen_nextMatch = $(this).next().text().match(regExp);
                var numHyphen =
                    numHyphenMatch != null ? numHyphenMatch[0].length : 0;
                var numHyphen_next =
                    numHyphen_nextMatch != null
                        ? numHyphen_nextMatch[0].length
                        : 0;
                treeText = treeText.replace(regExp, "");
                if ($(this).attr("id")) {
                    id_str = $(this).attr("id");
                } else {
                    id_num++;
                    id_str = "hum" + converter_str + "_" + id_num;
                }
                if ($(this).attr("data-id")) {
                    data_id = $(this).attr("data-id");
                } else {
                    data_id = treeText;
                }
                if ($(this).attr("data-str")) {
                    data_str = $(this).attr("data-str");
                } else {
                    data_str = "";
                }
                if (numHyphen < numHyphen_next) {
                    var check_diff = numHyphen_next - numHyphen;
                    if (check_diff > 1) {
                        msg =
                            '<h4 style="color:red;">Error!</h4>The item after <span style="color:red;">' +
                            treeText +
                            " </span>has too much hyphens, i.e. it is too far intended. Note that down the tree, the items are only allowed to be intended by one instance, i.e. one hyphen more than the item before. In contrast, up the tree arbitrarily large jumps are allowed.";
                        allowed = false;
                    }
                    item = item + '<li data-id="' + numHyphen + '">' + "\n";
                    item = item + '<i class="fa fa-plus"></i>' + "\n";
                    item = item + "<label " + data_str + ">" + "\n";
                    if (boldParents) {
                        item =
                            item +
                            '<input id="' +
                            id_str +
                            '" data-id="' +
                            data_id +
                            '" type="checkbox" /> <b>' +
                            treeText +
                            "</b>";
                    } else {
                        item =
                            item +
                            '<input id="' +
                            id_str +
                            '" data-id="' +
                            data_id +
                            '" type="checkbox" /> ' +
                            treeText;
                    }
                    item = item + "</label>" + "\n";
                    item = item + "<ul>" + "\n";
                }
                if (numHyphen == numHyphen_next) {
                    item = item + "<li>" + "\n";
                    item = item + "<label " + data_str + ">" + "\n";
                    item =
                        item +
                        '<input class="hummingbird-end-node" id="' +
                        id_str +
                        '" data-id="' +
                        data_id +
                        '" type="checkbox" /> ' +
                        treeText;
                    item = item + "</label>" + "\n";
                    item = item + "</li>" + "\n";
                }
                if (numHyphen > numHyphen_next) {
                    item = item + "<li>" + "\n";
                    item = item + "<label " + data_str + ">" + "\n";
                    item =
                        item +
                        '<input class="hummingbird-end-node" id="' +
                        id_str +
                        '" data-id="' +
                        data_id +
                        '" type="checkbox" /> ' +
                        treeText;
                    item = item + "</label>" + "\n";
                    item = item + "</li>" + "\n";
                    item = item + "</ul>" + "\n";
                    var hyphen_diff = numHyphen - numHyphen_next;
                    for (var m = 2; m <= hyphen_diff; m++) {
                        item = item + "</ul>" + "\n";
                        item = item + "</li>" + "\n";
                    }
                }
            });
            item = item + "</ul></div>";
            tree_html = tree_html + item;
            if (allowed == true) {
                converter.after(tree_html);
            } else {
                converter.after(msg);
            }
            converter.remove();
        });
    });
    $.fn.hummingbird = function (options) {
        var methodName = options;
        var args = arguments;
        var options = $.extend({}, $.fn.hummingbird.defaults, options);
        if (typeof methodName == "undefined") {
            return this.each(function () {
                if (options.SymbolPrefix != "fa") {
                    $(this)
                        .find("i")
                        .removeClass("fa")
                        .addClass(options.SymbolPrefix);
                }
                if (options.collapsedSymbol != "fa-plus") {
                    $(this)
                        .find("i")
                        .removeClass("fa-plus")
                        .addClass(options.collapsedSymbol);
                }
                textcolor = options.hoverColorText2;
                $(this)
                    .find("label")
                    .css({
                        "background-color": options.hoverColorBg2,
                        color: options.hoverColorText2,
                    });
                if (options.hoverItems == true) {
                    var this_labels = $(this).find("label");
                    if (options.hoverMode == "bootstrap") {
                        this_labels.hover(
                            function () {
                                if (
                                    $(this)
                                        .children("input")
                                        .prop("disabled") == false
                                ) {
                                    $(this).addClass(
                                        options.hoverColorBootstrap
                                    );
                                }
                            },
                            function () {
                                if (
                                    $(this)
                                        .children("input")
                                        .prop("disabled") == false
                                ) {
                                    $(this).removeClass(
                                        options.hoverColorBootstrap
                                    );
                                }
                            }
                        );
                    }
                    if (options.hoverMode == "html") {
                        this_labels.hover(
                            function () {
                                if (
                                    $(this)
                                        .children("input")
                                        .prop("disabled") == false
                                ) {
                                    $(this).css({
                                        "background-color":
                                            options.hoverColorBg1,
                                        color: options.hoverColorText1,
                                    });
                                }
                            },
                            function () {
                                if (
                                    $(this)
                                        .children("input")
                                        .prop("disabled") == false
                                ) {
                                    $(this).css({
                                        "background-color":
                                            options.hoverColorBg2,
                                        color: options.hoverColorText2,
                                    });
                                }
                            }
                        );
                    }
                }
                $(this)
                    .find("input:checkbox")
                    .parent("label")
                    .css({ cursor: "pointer" });
                if (options.checkboxes == "disabled") {
                    $(this).find("input:checkbox").hide(350);
                }
                if (options.checkboxesGroups == "disabled") {
                    checkboxesGroups = true;
                    var groups = $(this).find(
                        'input:checkbox:not(".hummingbird-end-node")'
                    );
                    groups
                        .prop("disabled", true)
                        .parent("label")
                        .css({ cursor: "not-allowed" });
                }
                if (options.checkboxesGroups == "disabled_grayed") {
                    checkboxesGroups = true;
                    checkboxesGroups_grayed = true;
                    var groups = $(this).find(
                        'input:checkbox:not(".hummingbird-end-node")'
                    );
                    groups
                        .prop("disabled", true)
                        .parent("label")
                        .css({ cursor: "not-allowed", color: "#c8c8c8" });
                }
                if (options.checkboxesEndNodes == "disabled") {
                    var end_nodes = $(this).find(
                        "input:checkbox.hummingbird-end-node"
                    );
                    end_nodes
                        .prop("disabled", true)
                        .parent("label")
                        .css({ cursor: "not-allowed" });
                }
                if (options.clickGroupsToggle == "enabled") {
                    var groups = $(this).find(
                        'input:checkbox:not(".hummingbird-end-node")'
                    );
                    groups
                        .prop("disabled", true)
                        .parent("label")
                        .css({ cursor: "pointer" });
                    $(this).on("click", "label", function () {
                        if (
                            $(this)
                                .children("input")
                                .hasClass("hummingbird-end-node")
                        ) {
                        } else {
                            $(this).prev("i").trigger("click");
                        }
                    });
                }
                if (options.collapseAll === false) {
                    $.fn.hummingbird.expandAll(
                        $(this),
                        options.collapsedSymbol,
                        options.expandedSymbol
                    );
                }
                var doubleMode = false;
                var allVariables = new Object();
                if (options.checkDoubles) {
                    $(this)
                        .find("input:checkbox.hummingbird-end-node")
                        .each(function () {
                            if (allVariables[$(this).attr("data-id")]) {
                                allVariables[$(this).attr("data-id")].push(
                                    $(this).attr("id")
                                );
                            } else {
                                allVariables[$(this).attr("data-id")] = [
                                    $(this).attr("id"),
                                ];
                            }
                        });
                }
                $.fn.hummingbird.ThreeStateLogic(
                    $(this),
                    doubleMode,
                    allVariables,
                    options.checkDoubles,
                    checkDisabled
                );
                var tmp_tree = $(this);
                $(this).on(
                    "click",
                    "li i." + options.collapsedSymbol,
                    function () {
                        if (options.singleGroupOpen >= 0) {
                            var this_level = $(this)
                                .parent("li")
                                .attr("data-id");
                            var level = options.singleGroupOpen;
                            if (this_level == level) {
                                var all_nodes_on_level = tmp_tree
                                    .find("li[data-id=" + level + "]")
                                    .children("label")
                                    .children("input");
                                $.each(all_nodes_on_level, function (i, e) {
                                    tmp_tree.hummingbird("collapseNode", {
                                        attr: "id",
                                        name: $(this).attr("id"),
                                        collapseChildren: true,
                                    });
                                });
                            }
                        }
                        $.fn.hummingbird.expandSingle(
                            $(this),
                            options.collapsedSymbol,
                            options.expandedSymbol
                        );
                    }
                );
                $(this).on(
                    "click",
                    "li i." + options.expandedSymbol,
                    function () {
                        $.fn.hummingbird.collapseSingle(
                            $(this),
                            options.collapsedSymbol,
                            options.expandedSymbol
                        );
                    }
                );
            });
        }
        if (methodName == "checkAll") {
            return this.each(function () {
                $.fn.hummingbird.checkAll($(this));
            });
        }
        if (methodName == "uncheckAll") {
            return this.each(function () {
                $.fn.hummingbird.uncheckAll($(this));
            });
        }
        if (methodName == "disableNode") {
            return this.each(function () {
                var name = args[1].name;
                var attr = args[1].attr;
                var state = args[1].state;
                if (typeof args[1].disableChildren !== "undefined") {
                    var disableChildren = args[1].disableChildren;
                } else {
                    var disableChildren = true;
                }
                $.fn.hummingbird.disableNode(
                    $(this),
                    attr,
                    name,
                    state,
                    disableChildren
                );
            });
        }
        if (methodName == "enableNode") {
            return this.each(function () {
                var name = args[1].name;
                var attr = args[1].attr;
                var state = args[1].state;
                if (typeof args[1].enableChildren !== "undefined") {
                    var enableChildren = args[1].enableChildren;
                } else {
                    var enableChildren = true;
                }
                $.fn.hummingbird.enableNode(
                    $(this),
                    attr,
                    name,
                    state,
                    enableChildren
                );
            });
        }
        if (methodName == "hideNode") {
            return this.each(function () {
                var name = args[1].name;
                var attr = args[1].attr;
                $.fn.hummingbird.hideNode($(this), attr, name);
            });
        }
        if (methodName == "showNode") {
            return this.each(function () {
                var name = args[1].name;
                var attr = args[1].attr;
                $.fn.hummingbird.showNode($(this), attr, name);
            });
        }
        if (methodName == "checkNode") {
            return this.each(function () {
                var name = args[1].name;
                var attr = args[1].attr;
                var expandParents = args[1].expandParents;
                $.fn.hummingbird.checkNode($(this), attr, name);
                if (expandParents == true) {
                    $.fn.hummingbird.expandNode(
                        $(this),
                        attr,
                        name,
                        expandParents,
                        options.collapsedSymbol,
                        options.expandedSymbol
                    );
                }
            });
        }
        if (methodName == "uncheckNode") {
            return this.each(function () {
                var name = args[1].name;
                var attr = args[1].attr;
                var collapseChildren = args[1].collapseChildren;
                $.fn.hummingbird.uncheckNode($(this), attr, name);
                if (collapseChildren == true) {
                    $.fn.hummingbird.collapseNode(
                        $(this),
                        attr,
                        name,
                        collapseChildren,
                        options.collapsedSymbol,
                        options.expandedSymbol
                    );
                }
            });
        }
        if (methodName == "disableToggle") {
            return this.each(function () {
                var name = args[1].name;
                var attr = args[1].attr;
                $.fn.hummingbird.disableToggle($(this), attr, name);
            });
        }
        if (methodName == "setNodeColor") {
            return this.each(function () {
                var attr = args[1];
                var ID = args[2];
                var color = args[3];
                $.fn.hummingbird.setNodeColor($(this), attr, ID, color);
            });
        }
        if (methodName == "collapseAll") {
            return this.each(function () {
                $.fn.hummingbird.collapseAll(
                    $(this),
                    options.collapsedSymbol,
                    options.expandedSymbol
                );
            });
        }
        if (methodName == "expandAll") {
            return this.each(function () {
                $.fn.hummingbird.expandAll(
                    $(this),
                    options.collapsedSymbol,
                    options.expandedSymbol
                );
            });
        }
        if (methodName == "expandNode") {
            return this.each(function () {
                var name = args[1].name;
                var attr = args[1].attr;
                var expandParents = args[1].expandParents;
                $.fn.hummingbird.expandNode(
                    $(this),
                    attr,
                    name,
                    expandParents,
                    options.collapsedSymbol,
                    options.expandedSymbol
                );
            });
        }
        if (methodName == "collapseNode") {
            return this.each(function () {
                var name = args[1].name;
                var attr = args[1].attr;
                var collapseChildren = args[1].collapseChildren;
                $.fn.hummingbird.collapseNode(
                    $(this),
                    attr,
                    name,
                    collapseChildren,
                    options.collapsedSymbol,
                    options.expandedSymbol
                );
            });
        }
        if (methodName == "getChecked") {
            return this.each(function () {
                var list = args[1].list;
                if (typeof args[1].onlyEndNodes !== "undefined") {
                    var onlyEndNodes = args[1].onlyEndNodes;
                } else {
                    var onlyEndNodes = false;
                }
                if (typeof args[1].onlyParents !== "undefined") {
                    var onlyParents = args[1].onlyParents;
                } else {
                    var onlyParents = false;
                }
                if (typeof args[1].fromThis !== "undefined") {
                    var fromThis = args[1].fromThis;
                } else {
                    var fromThis = false;
                }
                $.fn.hummingbird.getChecked(
                    $(this),
                    list,
                    onlyEndNodes,
                    onlyParents,
                    fromThis
                );
            });
        }
        if (methodName == "getUnchecked") {
            return this.each(function () {
                var list = args[1].list;
                if (typeof args[1].onlyEndNodes !== "undefined") {
                    var onlyEndNodes = args[1].onlyEndNodes;
                } else {
                    var onlyEndNodes = false;
                }
                if (typeof args[1].onlyParents !== "undefined") {
                    var onlyParents = args[1].onlyParents;
                } else {
                    var onlyParents = false;
                }
                if (typeof args[1].fromThis !== "undefined") {
                    var fromThis = args[1].fromThis;
                } else {
                    var fromThis = false;
                }
                $.fn.hummingbird.getUnchecked(
                    $(this),
                    list,
                    onlyEndNodes,
                    onlyParents,
                    fromThis
                );
            });
        }
        if (methodName == "getIndeterminate") {
            return this.each(function () {
                var list = args[1].list;
                $.fn.hummingbird.getIndeterminate($(this), list);
            });
        }
        if (methodName == "saveState") {
            return this.each(function () {
                var save_state = args[1].save_state;
                $.fn.hummingbird.saveState($(this), save_state);
            });
        }
        if (methodName == "restoreState") {
            return this.each(function () {
                var restore_state = args[1].restore_state;
                $.fn.hummingbird.restoreState($(this), restore_state);
            });
        }
        if (methodName == "skipCheckUncheckDone") {
            return this.each(function () {
                $.fn.hummingbird.skipCheckUncheckDone();
            });
        }
        if (methodName == "addNode") {
            return this.each(function () {
                var pos = args[1].pos;
                var anchor_attr = args[1].anchor_attr;
                var anchor_name = args[1].anchor_name;
                var text = args[1].text;
                var the_id = args[1].the_id;
                var data_id = args[1].data_id;
                if (typeof args[1].end_node !== "undefined") {
                    var end_node = args[1].end_node;
                } else {
                    var end_node = true;
                }
                if (typeof args[1].children !== "undefined") {
                    var children = args[1].children;
                } else {
                    var children = false;
                }
                $.fn.hummingbird.addNode(
                    $(this),
                    pos,
                    anchor_attr,
                    anchor_name,
                    text,
                    the_id,
                    data_id,
                    end_node,
                    children,
                    options.collapsedSymbol
                );
            });
        }
        if (methodName == "removeNode") {
            return this.each(function () {
                var name = args[1].name;
                var attr = args[1].attr;
                $.fn.hummingbird.removeNode($(this), attr, name);
            });
        }
        if (methodName == "filter") {
            return this.each(function () {
                var str = args[1].str;
                if (typeof args[1].box_disable !== "undefined") {
                    var box_disable = args[1].box_disable;
                } else {
                    var box_disable = false;
                }
                if (typeof args[1].filterChildren !== "undefined") {
                    var filterChildren = args[1].filterChildren;
                } else {
                    var filterChildren = true;
                }
                if (typeof args[1].onlyEndNodes !== "undefined") {
                    var onlyEndNodes = args[1].onlyEndNodes;
                } else {
                    var onlyEndNodes = false;
                }
                if (typeof args[1].caseSensitive !== "undefined") {
                    var caseSensitive = args[1].caseSensitive;
                } else {
                    var caseSensitive = false;
                }
                $.fn.hummingbird.filter(
                    $(this),
                    str,
                    box_disable,
                    caseSensitive,
                    onlyEndNodes,
                    filterChildren
                );
            });
        }
        if (methodName == "search") {
            return this.each(function () {
                var treeview_container = args[1].treeview_container;
                var search_input = args[1].search_input;
                var search_output = args[1].search_output;
                var search_button = args[1].search_button;
                if (typeof args[1].dialog !== "undefined") {
                    var dialog = args[1].dialog;
                } else {
                    var dialog = "";
                }
                if (typeof args[1].enter_key_1 !== "undefined") {
                    var enter_key_1 = args[1].enter_key_1;
                } else {
                    var enter_key_1 = true;
                }
                if (typeof args[1].enter_key_2 !== "undefined") {
                    var enter_key_2 = args[1].enter_key_2;
                } else {
                    var enter_key_2 = true;
                }
                if (typeof args[1].scrollOffset !== "undefined") {
                    var scrollOffset = args[1].scrollOffset;
                } else {
                    var scrollOffset = false;
                }
                if (typeof args[1].onlyEndNodes !== "undefined") {
                    var onlyEndNodes = args[1].onlyEndNodes;
                } else {
                    var onlyEndNodes = false;
                }
                if (typeof args[1].EnterKey !== "undefined") {
                    var EnterKey = args[1].EnterKey;
                } else {
                    var EnterKey = true;
                }
                $.fn.hummingbird.search(
                    $(this),
                    treeview_container,
                    search_input,
                    search_output,
                    search_button,
                    dialog,
                    enter_key_1,
                    enter_key_2,
                    options.collapsedSymbol,
                    options.expandedSymbol,
                    scrollOffset,
                    onlyEndNodes,
                    EnterKey
                );
            });
        }
    };
    $.fn.hummingbird.defaults = {
        SymbolPrefix: "fa",
        expandedSymbol: "fa-minus",
        collapsedSymbol: "fa-plus",
        collapseAll: true,
        checkboxes: "enabled",
        checkboxesGroups: "enabled",
        clickGroupsToggle: "disabled",
        checkboxesEndNodes: "enabled",
        checkDoubles: false,
        singleGroupOpen: -1,
        hoverItems: false,
        hoverMode: "html",
        hoverColorBg1: "#6c757c",
        hoverColorBg2: "white",
        hoverColorText1: "white",
        hoverColorText2: "black",
        hoverColorBootstrap: "bg-secondary text-white",
    };
    var nodeDisabled = false;
    var nodeEnabled = false;
    $.fn.hummingbird.checkAll = function (tree) {
        tree.children("li")
            .children("label")
            .children("input:checkbox")
            .prop("indeterminate", false)
            .prop("checked", false)
            .trigger("click");
    };
    $.fn.hummingbird.uncheckAll = function (tree) {
        var disabled_groups = tree.find(
            "input:checkbox:disabled:not(.hummingbird-end-node)"
        );
        disabled_groups.prop("disabled", false);
        uncheckAll_doubles = true;
        tree.children("li")
            .children("label")
            .children("input:checkbox")
            .prop("indeterminate", false)
            .prop("checked", true)
            .trigger("click");
        uncheckAll_doubles = false;
        disabled_groups.prop("disabled", true);
    };
    $.fn.hummingbird.collapseAll = function (
        tree,
        collapsedSymbol,
        expandedSymbol
    ) {
        var that_nodes = tree.find("label:not(.disableToggle)");
        that_nodes.siblings("ul").slideUp(500);
        that_nodes
            .siblings("." + expandedSymbol)
            .removeClass(expandedSymbol)
            .addClass(collapsedSymbol);
    };
    $.fn.hummingbird.expandAll = function (
        tree,
        collapsedSymbol,
        expandedSymbol
    ) {
        var that_nodes = tree.find("label:not(.disableToggle)");
        that_nodes.siblings("ul").slideDown(500);
        that_nodes
            .siblings("." + collapsedSymbol)
            .removeClass(collapsedSymbol)
            .addClass(expandedSymbol);
    };
    $.fn.hummingbird.collapseSingle = function (
        node,
        collapsedSymbol,
        expandedSymbol
    ) {
        if (!node.next("label").hasClass("disableToggle")) {
            node.parent("li").children("ul").hide(350);
            node.removeClass(expandedSymbol).addClass(collapsedSymbol);
        }
    };
    $.fn.hummingbird.expandSingle = function (
        node,
        collapsedSymbol,
        expandedSymbol
    ) {
        if (!node.next("label").hasClass("disableToggle")) {
            node.parent("li").children("ul").show(350);
            node.removeClass(collapsedSymbol).addClass(expandedSymbol);
        }
    };
    $.fn.hummingbird.expandNode = function (
        tree,
        attr,
        name,
        expandParents,
        collapsedSymbol,
        expandedSymbol
    ) {
        var that_node = tree.find("input[" + attr + "=" + name + "]");
        var that_label = that_node.parent("label");
        if (!that_label.hasClass("disableToggle")) {
            var that_ul = that_label.siblings("ul");
            that_ul
                .show(350)
                .siblings("i")
                .removeClass(collapsedSymbol)
                .addClass(expandedSymbol);
            if (expandParents === true) {
                that_node
                    .parents("ul")
                    .show(350)
                    .siblings("i")
                    .removeClass(collapsedSymbol)
                    .addClass(expandedSymbol);
            }
        }
    };
    $.fn.hummingbird.collapseNode = function (
        tree,
        attr,
        name,
        collapseChildren,
        collapsedSymbol,
        expandedSymbol
    ) {
        var that_node = tree.find("input[" + attr + "=" + name + "]");
        var that_label = that_node.parent("label");
        if (!that_label.hasClass("disableToggle")) {
            var that_ul = that_label.siblings("ul");
            if (collapseChildren === true) {
                that_node
                    .parent("label")
                    .parent("li")
                    .find("ul")
                    .hide(350)
                    .siblings("i")
                    .removeClass(expandedSymbol)
                    .addClass(collapsedSymbol);
            } else {
                that_ul
                    .hide(350)
                    .siblings("i")
                    .removeClass(expandedSymbol)
                    .addClass(collapsedSymbol);
            }
        }
    };
    $.fn.hummingbird.checkNode = function (tree, attr, name) {
        if (attr == "text") {
            name = name.trim();
            var that_nodes = tree
                .find("input:checkbox:not(:checked)")
                .prop("indeterminate", false)
                .parent("label:contains(" + name + ")");
            that_nodes.children("input:checkbox").trigger("click");
        } else {
            tree.find("input:checkbox:not(:checked)[" + attr + "=" + name + "]")
                .prop("indeterminate", false)
                .trigger("click");
        }
    };
    $.fn.hummingbird.uncheckNode = function (tree, attr, name) {
        if (attr == "text") {
            name = name.trim();
            var that_nodes = tree
                .find("input:checkbox:checked")
                .prop("indeterminate", false)
                .parent("label:contains(" + name + ")");
            that_nodes.children("input:checkbox").trigger("click");
        } else {
            tree.find("input:checkbox:checked[" + attr + "=" + name + "]")
                .prop("indeterminate", false)
                .trigger("click");
        }
    };
    $.fn.hummingbird.disableToggle = function (tree, attr, name) {
        if (attr == "text") {
            name = name.trim();
            var that_nodes = tree.find("label:contains(" + name + ")");
        } else {
            var that_nodes = tree
                .find("input:checkbox:not(:checked)[" + attr + "=" + name + "]")
                .parent("label");
        }
        that_nodes.addClass("disableToggle");
    };
    $.fn.hummingbird.removeNode = function (tree, attr, name) {
        if (attr == "text") {
            name = name.trim();
            tree.find("input:checkbox")
                .parent("label:contains(" + name + ")")
                .parent("li")
                .remove();
        } else {
            tree.find("input:checkbox[" + attr + "=" + name + "]")
                .parent("label")
                .parent("li")
                .remove();
        }
    };
    $.fn.hummingbird.addNode = function (
        tree,
        pos,
        anchor_attr,
        anchor_name,
        text,
        the_id,
        data_id,
        end_node,
        children,
        collapsedSymbol
    ) {
        if (anchor_attr == "text") {
            anchor_name = anchor_name.trim();
            var that_node = tree
                .find("input:checkbox")
                .parent("label:contains(" + anchor_name + ")")
                .parent("li");
        } else {
            var that_node = tree
                .find("input:checkbox[" + anchor_attr + "=" + anchor_name + "]")
                .parent("label")
                .parent("li");
        }
        if (end_node) {
            var Xclass = "hummingbird-end-node";
            if (pos == "before") {
                that_node.before(
                    '<li><label><input class="' +
                        Xclass +
                        '" id="' +
                        the_id +
                        '" data-id="' +
                        data_id +
                        '" type="checkbox"> ' +
                        text +
                        "</label></li>"
                );
            }
            if (pos == "after") {
                that_node.after(
                    '<li><label><input class="' +
                        Xclass +
                        '" id="' +
                        the_id +
                        '" data-id="' +
                        data_id +
                        '" type="checkbox"> ' +
                        text +
                        "</label></li>"
                );
            }
        } else {
            var Xclass = "";
            var subtree = "";
            $.each(children, function (i, e) {
                subtree =
                    subtree +
                    '<li><label><input class="' +
                    "hummingbird-end-node" +
                    '" id="' +
                    e.id +
                    '" data-id="' +
                    e.data_id +
                    '" type="checkbox"> ' +
                    e.text +
                    "</label></li>";
            });
            if (pos == "before") {
                that_node.before(
                    "<li>" +
                        "\n" +
                        '<i class="fa ' +
                        collapsedSymbol +
                        '"></i>' +
                        "\n" +
                        "<label>" +
                        "\n" +
                        '<input class="' +
                        Xclass +
                        '" id="' +
                        the_id +
                        '" data-id="' +
                        data_id +
                        '" type="checkbox"> ' +
                        text +
                        "</label>" +
                        "\n" +
                        "<ul>" +
                        "\n" +
                        subtree +
                        "</ul>" +
                        "\n" +
                        "</li>"
                );
            }
            if (pos == "after") {
                that_node.after(
                    "<li>" +
                        "\n" +
                        '<i class="fa ' +
                        collapsedSymbol +
                        '"></i>' +
                        "\n" +
                        "<label>" +
                        "\n" +
                        '<input class="' +
                        Xclass +
                        '" id="' +
                        the_id +
                        '" data-id="' +
                        data_id +
                        '" type="checkbox"> ' +
                        text +
                        "</label>" +
                        "\n" +
                        "<ul>" +
                        "\n" +
                        subtree +
                        "</ul>" +
                        "\n" +
                        "</li>"
                );
            }
        }
    };
    $.fn.hummingbird.filter = function (
        tree,
        str,
        box_disable,
        caseSensitive,
        onlyEndNodes,
        filterChildren
    ) {
        if (onlyEndNodes) {
            var entries = tree.find("input:checkbox.hummingbird-end-node");
        } else {
            var entries = tree.find("input:checkbox");
        }
        var modifier = "i";
        if (caseSensitive) {
            modifier = "g";
        }
        var re = new RegExp(str, modifier);
        $.each(entries, function () {
            var entry = $(this).parent("label").text();
            if (entry.match(re)) {
                $(this).parents("li").addClass("noFilter");
                if (filterChildren == false) {
                    $(this)
                        .parent("label")
                        .parent("li")
                        .find("li")
                        .addClass("noFilter");
                }
            }
        });
        if (box_disable) {
            tree.find("li").not(".noFilter").prop("disabled", true);
        } else {
            tree.find("li").not(".noFilter").remove();
        }
    };
    $.fn.hummingbird.disableNode = function (
        tree,
        attr,
        name,
        state,
        disableChildren
    ) {
        if (attr == "text") {
            name = name.trim();
            var that_nodes = tree
                .find("input:checkbox:not(:disabled)")
                .parent("label:contains(" + name + ")");
            var this_checkbox = that_nodes.children("input:checkbox");
        } else {
            var this_checkbox = tree.find(
                "input:checkbox:not(:disabled)[" + attr + "=" + name + "]"
            );
        }
        this_checkbox.prop("checked", state === false);
        nodeDisabled = true;
        this_checkbox.trigger("click");
        if (disableChildren === true) {
            this_checkbox
                .parent("label")
                .parent("li")
                .find("input:checkbox")
                .prop("disabled", true)
                .parent("label")
                .css({
                    color: "#c8c8c8",
                    cursor: "not-allowed",
                    "background-color": "",
                });
        } else {
            this_checkbox
                .prop("disabled", true)
                .parent("label")
                .css({ color: "#c8c8c8", cursor: "not-allowed" });
        }
    };
    $.fn.hummingbird.enableNode = function (
        tree,
        attr,
        name,
        state,
        enableChildren
    ) {
        var this_checkbox = {};
        if (attr == "text") {
            name = name.trim();
            var that_nodes = tree
                .find("input:checkbox:disabled")
                .parent("label:contains(" + name + ")");
            var this_checkbox = that_nodes.children("input:checkbox");
        } else {
            this_checkbox = tree.find(
                "input:checkbox:disabled[" + attr + "=" + name + "]"
            );
        }
        var children_not_disabled_sum = this_checkbox
            .parent("label")
            .next("ul")
            .children("li")
            .children("label")
            .children("input:checkbox:not(:disabled)").length;
        if (children_not_disabled_sum == 0 && enableChildren == false) {
            return;
        }
        this_checkbox
            .prop("disabled", false)
            .parent("label")
            .css({ color: textcolor, cursor: "pointer" });
        if (checkboxesGroups == false) {
            this_checkbox
                .parent("label")
                .parent("li")
                .parents("li")
                .children("label")
                .children("input[type='checkbox']")
                .prop("disabled", false)
                .parents("label")
                .css({ color: textcolor, cursor: "pointer" });
        }
        if (enableChildren === true) {
            this_checkbox
                .parent("label")
                .parent("li")
                .find("input:checkbox")
                .prop("disabled", false)
                .parent("label")
                .css({ color: textcolor, cursor: "pointer" });
        }
        this_checkbox.prop("checked", state === false);
        nodeEnabled = true;
        this_checkbox.trigger("click");
    };
    $.fn.hummingbird.hideNode = function (tree, attr, name) {
        if (attr == "text") {
            name = name.trim();
            var that_nodes = tree
                .find("input:checkbox")
                .parent("label:contains(" + name + ")");
            var this_checkbox = that_nodes.children("input:checkbox");
        } else {
            var this_checkbox = tree.find(
                "input:checkbox[" + attr + "=" + name + "]"
            );
        }
        this_checkbox.attr("type", "hidden");
        this_checkbox.parent("label").parent("li").hide(350);
    };
    $.fn.hummingbird.showNode = function (tree, attr, name) {
        if (attr == "text") {
            name = name.trim();
            var that_nodes = tree
                .find("input")
                .parent("label:contains(" + name + ")");
            var this_checkbox = that_nodes.children("input");
        } else {
            var this_checkbox = tree.find("input[" + attr + "=" + name + "]");
        }
        this_checkbox.attr("type", "checkbox");
        this_checkbox.parent("label").parent("li").show(350);
    };
    $.fn.hummingbird.getChecked = function (
        tree,
        list,
        onlyEndNodes,
        onlyParents,
        fromThis
    ) {
        if (fromThis == true) {
            if (clickedNode.hasClass("hummingbird-end-node")) {
                var activeGroup = clickedNode
                    .parent("label")
                    .parent("li")
                    .parent("ul")
                    .parent("li");
            } else {
                var activeGroup = clickedNode.parent("label").parent("li");
            }
        } else {
            var activeGroup = tree;
        }
        if (onlyEndNodes == true) {
            activeGroup
                .find("input:checkbox.hummingbird-end-node:checked")
                .each(function () {
                    list.text.push($(this).parent("label").parent("li").text());
                    list.id.push($(this).attr("id"));
                    list.dataid.push($(this).attr("data-id"));
                });
        } else {
            if (onlyParents == true) {
                activeGroup
                    .find("input:checkbox:checked:not(.hummingbird-end-node)")
                    .each(function () {
                        list.text.push(
                            $(this).parent("label").parent("li").text()
                        );
                        list.id.push($(this).attr("id"));
                        list.dataid.push($(this).attr("data-id"));
                    });
            } else {
                activeGroup.find("input:checkbox:checked").each(function () {
                    list.text.push($(this).parent("label").parent("li").text());
                    list.id.push($(this).attr("id"));
                    list.dataid.push($(this).attr("data-id"));
                });
            }
        }
    };
    $.fn.hummingbird.getUnchecked = function (
        tree,
        list,
        onlyEndNodes,
        onlyParents
    ) {
        if (onlyEndNodes == true) {
            tree.find("input:checkbox.hummingbird-end-node:not(:checked)").each(
                function () {
                    list.text.push($(this).parent("label").parent("li").text());
                    list.id.push($(this).attr("id"));
                    list.dataid.push($(this).attr("data-id"));
                }
            );
        } else {
            if (onlyParents == true) {
                tree.find(
                    "input:checkbox:not(:checked):not(.hummingbird-end-node)"
                ).each(function () {
                    list.text.push($(this).parent("label").parent("li").text());
                    list.id.push($(this).attr("id"));
                    list.dataid.push($(this).attr("data-id"));
                });
            } else {
                tree.find("input:checkbox:not(:checked)").each(function () {
                    list.text.push($(this).parent("label").parent("li").text());
                    list.id.push($(this).attr("id"));
                    list.dataid.push($(this).attr("data-id"));
                });
            }
        }
    };
    $.fn.hummingbird.getIndeterminate = function (tree, list) {
        tree.find("input:indeterminate").each(function () {
            list.text.push($(this).parent("label").parent("li").text());
            list.id.push($(this).attr("id"));
            list.dataid.push($(this).attr("data-id"));
        });
    };
    $.fn.hummingbird.skipCheckUncheckDone = function () {
        skip_next_check_uncheck = true;
    };
    $.fn.hummingbird.saveState = function (tree, save_state) {
        var List_full = { id: [], dataid: [], text: [] };
        tree.hummingbird("getChecked", { list: List_full });
        var List_indeterminate = { id: [], dataid: [], text: [] };
        tree.hummingbird("getIndeterminate", { list: List_indeterminate });
        save_state.checked = List_full.id;
        save_state.indeterminate = List_indeterminate.id;
    };
    $.fn.hummingbird.restoreState = function (tree, restore_state) {
        tree.find("input:checkbox")
            .prop("checked", false)
            .prop("indeterminate", false);
        if (jQuery.isEmptyObject(restore_state) == false) {
            if (jQuery.isEmptyObject(restore_state.checked) == false) {
                $.each(restore_state.checked, function (i, e) {
                    tree.find("input:checkbox#" + e).prop("checked", true);
                });
            }
            if (jQuery.isEmptyObject(restore_state.indeterminate) == false) {
                $.each(restore_state.indeterminate, function (i, e) {
                    tree.find("input:checkbox#" + e).prop(
                        "indeterminate",
                        true
                    );
                });
            }
        }
    };
    $.fn.hummingbird.setNodeColor = function (tree, attr, ID, color) {
        tree.find("input:checkbox[" + attr + "=" + ID + "]")
            .parent("li")
            .css({ color: color });
    };
    $.fn.hummingbird.ThreeStateLogic = function (
        tree,
        doubleMode,
        allVariables,
        checkDoubles,
        checkDisabled
    ) {
        tree.find("input:checkbox").on("click", function (e) {
            clickedNode = $(this);
            var nodes_below_not_disabled = $(this)
                .parent("label")
                .parent("li")
                .find("input:checkbox:not(:disabled)");
            var nodes_below_disabled_groups = $(this)
                .parent("label")
                .parent("li")
                .find("input:checkbox:disabled:not(.hummingbird-end-node)");
            var nodes_below = nodes_below_not_disabled.add(
                nodes_below_disabled_groups
            );
            var ids = [];
            nodes_below.each(function () {
                ids.push($(this).attr("id"));
            });
            if ($(this).prop("checked")) {
                var state = true;
                var checkSiblings = "input:checkbox:not(:checked)";
                tree.trigger("nodeChecked", ids.join());
            } else {
                var state = false;
                var checkSiblings = "input:checkbox:checked";
                tree.trigger("nodeUnchecked", ids.join());
            }
            nodes_below.prop("indeterminate", false).prop("checked", state);
            $(this)
                .parent("label")
                .parent()
                .parents("li")
                .children("label")
                .children("input:checkbox")
                .prop("indeterminate", true);
            $(this)
                .parent("label")
                .parent()
                .parents("li")
                .children("label")
                .children("input:checkbox")
                .prop("checked", false);
            $(this)
                .parent("label")
                .siblings("ul")
                .find("ul")
                .map(function () {
                    var disabled_sum_children = $(this)
                        .children("li")
                        .children("label")
                        .children("input:checkbox:disabled").length;
                    var checked_sum_children = $(this)
                        .children("li")
                        .children("label")
                        .children("input:checkbox:checked").length;
                    var unchecked_sum_children = $(this)
                        .children("li")
                        .children("label")
                        .children("input:checkbox:not(:checked)").length;
                    var num_children_endnode = $(this)
                        .children("li")
                        .children("label")
                        .children("input:checkbox.hummingbird-end-node").length;
                    if (disabled_sum_children > 0) {
                        if (checked_sum_children == 0) {
                            $(this)
                                .siblings("label")
                                .children("input:checkbox")
                                .prop("checked", false);
                        }
                        if (unchecked_sum_children == 0) {
                            if (num_children_endnode > 0) {
                                $(this)
                                    .siblings("label")
                                    .children("input:checkbox")
                                    .prop("checked", true);
                            } else {
                                $(this)
                                    .siblings("label")
                                    .children("input:checkbox")
                                    .prop("checked", false);
                            }
                        }
                        if (
                            checked_sum_children > 0 &&
                            unchecked_sum_children > 0
                        ) {
                            $(this)
                                .siblings("label")
                                .children("input:checkbox")
                                .prop("checked", false);
                        }
                    }
                });
            $(this)
                .parent("label")
                .parents("li")
                .map(function () {
                    var indeterminate_sum = 0;
                    var checked_unchecked_sum = $(this)
                        .siblings()
                        .addBack()
                        .children("label")
                        .children(checkSiblings).length;
                    if (checkDisabled) {
                        var not_disabled_sum = $(this)
                            .siblings()
                            .addBack()
                            .children("label")
                            .children("input:checkbox:not(:disabled)").length;
                    }
                    $(this)
                        .siblings()
                        .addBack()
                        .children("label")
                        .children("input:checkbox")
                        .map(function () {
                            indeterminate_sum =
                                indeterminate_sum +
                                $(this).prop("indeterminate");
                        });
                    if (indeterminate_sum + checked_unchecked_sum == 0) {
                        $(this)
                            .parent()
                            .parent()
                            .children("label")
                            .children("input:checkbox")
                            .prop("indeterminate", false);
                        $(this)
                            .parent()
                            .parent()
                            .children("label")
                            .children("input:checkbox")
                            .prop("checked", state);
                    }
                    if (checkDisabled) {
                        if (nodeDisabled == true) {
                            not_disabled_sum--;
                            nodeDisabled = false;
                        }
                        if (not_disabled_sum == 0) {
                            if (
                                checkboxesGroups_grayed == false &&
                                checkboxesGroups == false
                            ) {
                                $(this)
                                    .parent()
                                    .parent()
                                    .children("label")
                                    .children("input[type='checkbox']")
                                    .prop("disabled", true)
                                    .parent("label")
                                    .css({
                                        color: "#c8c8c8",
                                        cursor: "not-allowed",
                                    });
                            }
                        }
                    }
                });
            if (checkDoubles == true && uncheckAll_doubles == false) {
                if (doubleMode == false) {
                    $(this)
                        .parent("label")
                        .parent("li")
                        .find("input.hummingbird-end-node[type='checkbox']")
                        .each(function () {
                            var L =
                                allVariables[$(this).attr("data-id")].length;
                            if (L > 1) {
                                doubleMode = true;
                                var Zvar =
                                    allVariables[$(this).attr("data-id")];
                                for (var i = 0; i < L; i++) {
                                    if (
                                        $("#" + Zvar[i]).prop("checked") !=
                                        state
                                    ) {
                                        $("#" + Zvar[i]).trigger("click");
                                    }
                                }
                            }
                        });
                    doubleMode = false;
                }
            }
            if (checkDisabled) {
                if ($(this).hasClass("hummingbird-end-node") === false) {
                    if (state === true) {
                        var disabledCheckboxes = $(this)
                            .parent("label")
                            .parent("li")
                            .find("input:checkbox:not(:checked):disabled");
                        var num_state_inverse_Checkboxes = $(this)
                            .parent("label")
                            .parent("li")
                            .find("input:checkbox:checked");
                    }
                    if (state === false) {
                        var disabledCheckboxes = $(this)
                            .parent("label")
                            .parent("li")
                            .find("input:checkbox:checked:disabled");
                        var num_state_inverse_Checkboxes = $(this)
                            .parent("label")
                            .parent("li")
                            .find("input:checkbox:not(:checked)");
                    }
                    if (
                        disabledCheckboxes.length > 0 &&
                        num_state_inverse_Checkboxes.length > 0
                    ) {
                        disabledCheckboxes
                            .parent("label")
                            .parent("li")
                            .parents("li")
                            .children("label")
                            .children("input:checkbox:not(:disabled)")
                            .prop("indeterminate", true)
                            .prop("checked", state);
                    }
                }
            }
            nodeDisabled = false;
            nodeEnabled = false;
            if (skip_next_check_uncheck == false) {
                tree.trigger("CheckUncheckDone");
            } else {
                skip_next_check_uncheck = false;
            }
        });
    };
    $.fn.hummingbird.search = function (
        tree,
        treeview_container,
        search_input,
        search_output,
        search_button,
        dialog,
        enter_key_1,
        enter_key_2,
        collapsedSymbol,
        expandedSymbol,
        scrollOffset,
        onlyEndNodes,
        EnterKey
    ) {
        if (EnterKey == true) {
            $(document).keyup(function (e) {
                if (e.which == 13) {
                    if (enter_key_1 == enter_key_2) {
                        $(dialog + " #" + search_button).trigger("click");
                    }
                }
            });
        }
        var first_search = true;
        var this_var_checkbox = {};
        $(dialog + " #" + search_input).on("click", function (e) {
            $(dialog + " #" + search_output).hide(350);
        });
        $(dialog + " #" + search_button).on("click", function (e) {
            $(dialog + " #" + search_output).show(350);
            var search_str = $(dialog + " #" + search_input)
                .val()
                .trim();
            $(dialog + " #" + search_output).empty();
            var num_search_results = 0;
            if (onlyEndNodes == true) {
                var onlyEndNodes_Class = ".hummingbird-end-node";
            } else {
                var onlyEndNodes_Class = "";
            }
            $(dialog + " #" + search_output)
                .children("li")
                .remove();
            tree.find("input:checkbox" + onlyEndNodes_Class).each(function () {
                if (
                    $(this)
                        .parent()
                        .text()
                        .toUpperCase()
                        .includes(search_str.toUpperCase())
                ) {
                    $(dialog + " #" + search_output).append(
                        '<li id="drop_' +
                            $(this).attr("id") +
                            '"><a href="#">' +
                            $(this).parent().text() +
                            "</a></li>"
                    );
                    num_search_results++;
                }
            });
            if (num_search_results == 0) {
                $(dialog + " #" + search_output).append(
                    "&nbsp; &nbsp; Nothing found"
                );
            }
            $(dialog + " #" + search_output + " li").on("click", function (e) {
                e.preventDefault();
                $(dialog + " #" + search_output).hide(350);
                $(dialog + " #" + search_input).val($(this).text());
                if (first_search == false) {
                    if (this_var_checkbox.prop("disabled")) {
                        this_var_checkbox
                            .parent("label")
                            .parent("li")
                            .css({ color: "#c8c8c8", cursor: "not-allowed" });
                    } else {
                        this_var_checkbox
                            .parent("label")
                            .parent("li")
                            .css({ color: "black", cursor: "pointer" });
                    }
                }
                tree.hummingbird("collapseAll");
                this_var_checkbox = tree.find(
                    'input[id="' + $(this).attr("id").substring(5) + '"]'
                );
                var prev_uls = this_var_checkbox.parents("ul");
                prev_uls
                    .closest("li")
                    .children("i")
                    .removeClass(collapsedSymbol)
                    .addClass(expandedSymbol);
                this_var_checkbox
                    .parent("label")
                    .parent("li")
                    .css({ color: "#f0ad4e" });
                first_search = false;
                prev_uls.show(350);
                if (treeview_container == "body") {
                    document.body.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                } else {
                    $(dialog + " #" + treeview_container)[0].scrollTop = 0;
                }
                var this_var_checkbox_position =
                    this_var_checkbox.position().top;
                this_var_checkbox_position =
                    this_var_checkbox_position + scrollOffset;
                if (treeview_container == "body") {
                    document.body.scrollTop += this_var_checkbox_position;
                    document.documentElement.scrollTop +=
                        this_var_checkbox_position;
                } else {
                    $(dialog + " #" + treeview_container)[0].scrollTop =
                        this_var_checkbox_position;
                }
            });
            if (num_search_results == 1) {
                var one_search_id = $("#" + search_output + " li").attr("id");
                $("#" + one_search_id).trigger("click");
            }
        });
    };
})(jQuery);