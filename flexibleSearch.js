/*
 * flexibleSearch.js
 *
 * Copyright (c) Tomohiro Okuwaki / bit part LLC (http://bit-part.net/)
 *
 * Since  : 2010-11-12
 * Update : 2017-05-02
 * Version: 2.3.0
 * Comment: Please use this with Movable Type :)
 *
 * You have to include "mustache.js" before "flexibleSearch.js".
 * Maybe... jQuery 1.7.x later
 *
-*/

(function ($) {
    $.fn.flexibleSearch = function (options) {
        var op = $.extend({}, $.fn.flexibleSearch.defaults, options);
        var $this = this;

        // =======================================================================
        //  Search Form HTML <start>
        //

        if (op.searchFormCreation) {

            // Advanced Form HTML <start>
            var advancedFormTmpl = [];
            var advancedFormHTML = "";
            if (op.advancedFormObj !== null) {
                // input:hidden
                if ("hidden" in op.advancedFormObj) {
                    advancedFormTmpl.push([
                        '<div class="fs-advanced-hidden" style="display:none;">',
                        '{{#hidden}}',
                            '<input type="hidden"',
                                '{{#id}} id="{{id}}"{{/id}}',
                                '{{#name}} name="{{name}}"{{/name}}',
                                '{{#value}} value="{{value}}"{{/value}}>',
                        '{{/hidden}}',
                        '</div>'
                    ].join(""));
                }

                // input:text
                if ("text" in op.advancedFormObj) {
                    advancedFormTmpl.push([
                        '<div class="fs-advanced-text">',
                        '{{#text}}',
                            '{{#label}}',
                            '<label{{#id}} id="{{id}}-label"{{/id}}{{#name}} for="{{name}}"{{/name}} class="fs-text{{#name}} fs-{{name}}{{/name}}">',
                            '{{/label}}',
                                '<input type="text"',
                                    '{{#id}} id="{{id}}"{{/id}}',
                                    '{{#name}} name="{{name}}"{{/name}}',
                                    '{{#value}} value="{{value}}"{{/value}}',
                                    '{{#placeholder}} placeholder="{{placeholder}}"{{/placeholder}}>',
                            '{{#label}}',
                            '{{label}}</label>',
                            '{{/label}}',
                        '{{/text}}',
                        '</div>'
                    ].join(""));
                }

                // input:checkbox
                if ("checkbox" in op.advancedFormObj) {
                    advancedFormTmpl.push([
                        '<div class="fs-advanced-checkbox">',
                        '{{#checkbox}}',
                            '{{#label}}',
                            '<label{{#id}} id="{{id}}-label"{{/id}}{{#name}} for="{{name}}"{{/name}} class="fs-checkbox{{#name}} fs-{{name}}{{/name}}">',
                            '{{/label}}',
                                '<input type="checkbox"',
                                    '{{#id}} id="{{id}}"{{/id}}',
                                    '{{#name}} name="{{name}}"{{/name}}',
                                    '{{#value}} value="{{value}}"{{/value}}',
                                    '{{#checked}} checked="checked"{{/checked}}>',
                            '{{#label}}',
                            '{{label}}</label>',
                            '{{/label}}',
                        '{{/checkbox}}',
                        '</div>'
                    ].join(""));
                }

                // input:radio
                if ("radio" in op.advancedFormObj) {
                    advancedFormTmpl.push([
                        '<div class="fs-advanced-radio">',
                        '{{#radio}}',
                            '{{#label}}',
                            '<label{{#id}} id="{{id}}-label"{{/id}}{{#name}} for="{{name}}"{{/name}} class="fs-radio{{#name}} fs-{{name}}{{/name}}">',
                            '{{/label}}',
                                '<input type="radio"',
                                    '{{#id}} id="{{id}}"{{/id}}',
                                    '{{#name}} name="{{name}}"{{/name}}',
                                    '{{#value}} value="{{value}}"{{/value}}',
                                    '{{#checked}} checked="checked"{{/checked}}>',
                            '{{#label}}',
                            '{{label}}</label>',
                            '{{/label}}',
                        '{{/radio}}',
                        '</div>'
                    ].join(""));
                }

                // Make HTML of hidden, text, checkbox and radio
                advancedFormHTML = Mustache.render(advancedFormTmpl.join(""), op.advancedFormObj);

                // input:select
                if ("select" in op.advancedFormObj) {
                    var advancedFormSelectObj = {
                        "selects": op.advancedFormObj.select,
                        "options": function () {
                            var optionObj = this.option;
                            var optionSet = [];
                            for (var i = 0, l = optionObj.length; i < l; i++) {
                                var slctd = optionObj[i].selected ? " selected": "";
                                optionSet.push('<option value="' + optionObj[i].value + '"' + slctd + '>' + optionObj[i].label +'</option>');
                            }
                            return optionSet.join("");
                        }
                    };
                    var advancedFormSelectTmpl = [
                        '<div class="fs-advanced-select">',
                        '{{#selects}}',
                            '<select{{#id}} id="{{id}}"{{/id}}{{#name}} name="{{name}}"{{/name}}{{#size}} size="{{size}}"{{/size}}{{#multiple}} multiple{{/multiple}} class="fs-select{{#name}} fs-{{name}}{{/name}}">',
                                '{{{options}}}',
                            '</select>',
                        '{{/selects}}',
                        '</div>'
                    ].join("");

                    // Make HTML of select
                    advancedFormHTML += Mustache.render(advancedFormSelectTmpl, advancedFormSelectObj);
                }
            }
            // Advanced Form HTML </end>

            // Search Form <start>
            //
            // * {{action}} (= op.searchFormAction)
            // * {{type}} (= op.searchFormInputType)
            // * {{placeholder}} (= op.searchFormInputPlaceholder)
            // * {{submitBtnText}} (= op.searchFormSubmitBtnText)
            var searchFormObj = {
                action: op.searchFormAction,
                type: op.searchFormInputType,
                placeholder: op.searchFormInputPlaceholder,
                submitBtnText: op.searchFormSubmitBtnText
            };
            var searchFormHTML = "";
            if (op.limit !== null && typeof op.limit === 'number') {
                op.paginateCount = op.limit;
            }
            if (op.searchFormHTML !== null) {
                searchFormHTML = op.searchFormHTML;
            }
            else {
                var searchFormTmpl = [
                    '<form action="{{action}}" method="GET">',
                        '<input type="hidden" name="offset" value="0">',
                        '<input type="hidden" name="limit" value="' + op.paginateCount + '">',
                        '<input type="{{type}}" name="search" placeholder="{{placeholder}}" class="fs-text fs-search">',
                        '<input type="submit" value="{{submitBtnText}}" class="fs-btn fs-submit">',
                        advancedFormHTML, // Advanced Form
                    '</form>'
                ].join("");

                // Make search form HTML
                searchFormHTML = Mustache.render(searchFormTmpl, searchFormObj);
            }
            // Search Form </end>

            // Insert into DOM
            $this[0].innerHTML = searchFormHTML;
        }

        //
        //  Search Form HTML </end>
        // -----------------------------------------------------------------------

        // =======================================================================
        //  Result Block Template <start>
        //

        // Search Result Loading Image <start>
        var resultLoadingHTML = "";
        if (op.loadingImgHTML !== null) {
            resultLoadingHTML = op.loadingImgHTML;
        }
        else if (op.loadingImgPath) {
            resultLoadingHTML = '<span class="fs-loading"><img src="' + op.loadingImgPath + '" alt=""></span>';
        }
        // Search Result Loading Image </end>

        // Search Result Message <start>
        //
        // * {{keywords}}
        // * {{count}}
        // * {{firstPage}}
        // * {{lastPage}}
        // * {{currentPage}}
        var resultMsgTmpl = "";
        if (op.resultMsgTmpl !== null) {
            resultMsgTmpl = op.resultMsgTmpl;
        }
        else {
            resultMsgTmpl = [
                '<div{{#id}} id="{{id}}"{{/id}}{{#classname}} class="{{classname}}"{{/classname}}>',
                    '<p>',
                        '{{#keywords}}「{{keywords}}」が {{/keywords}}',
                        '{{#count}}{{count}} 件見つかりました。{{/count}}',
                        '{{^count}}見つかりませんでした。{{/count}}',
                        '{{#count}}（{{lastPage}} ページ中 {{currentPage}} ページ目を表示）{{/count}}',
                        // '（{{firstPage}}〜{{lastPage}} ページ中 {{currentPage}} ページ目を表示）',
                    '</p>',
                '</div>'
            ].join("");
        }
        // Search Result Message </end>

        // Search Result Item <start>
        //
        // * keys used in your JSON
        var resultItemTmpl = "";
        if (op.resultItemTmpl !== null) {
            resultItemTmpl = op.resultItemTmpl;
        }
        else {
            resultItemTmpl = [
                '<div id="' + op.resultBlockId + '-items">',
                    '<ul>',
                    '{{#items}}',
                        '<li>{{&title}}</li>',
                    '{{/items}}',
                    '</ul>',
                '</div>'
            ].join("");
        }
        // Search Result Item </end>

        // Paginate <start>
        //
        // * {{paginateId}}
        // * {{&current}}
        // * {{.}}
        var paginateTmpl = "";
        if (op.paginateTmpl !== null) {
            paginateTmpl = op.paginateTmpl;
        }
        else {
            paginateTmpl = [
                '<div{{#id}} id="{{id}}"{{/id}}{{#classname}} class="{{classname}}"{{/classname}}>',
                    '<ul>',

                        '{{#showTurnPage}}',
                        '{{#exceptFirst}}',
                        '<li class="fs-prev"><span><a class="fs-prev-link fs-turn-page-link" href="#" title="{{prevPageText}}">{{prevPageText}}</a></span></li>',
                        '{{/exceptFirst}}',
                        '{{/showTurnPage}}',

                        '{{#page}}',
                        '{{#checkRange}}',
                        '<li class="{{current}}"{{#hidePageNumber}} style="display:none;"{{/hidePageNumber}}><span><a class="fs-page-link {{currentLink}}" href="#" title="{{pageNumber}}">{{pageNumber}}</a></span></li>',
                        '{{/checkRange}}',
                        '{{/page}}',

                        '{{#showTurnPage}}',
                        '{{#exceptLast}}',
                        '<li class="fs-next"><span><a class="fs-next-link fs-turn-page-link" href="#" title="{{nextPageText}}">{{nextPageText}}</a></span></li>',
                        '{{/exceptLast}}',
                        '{{/showTurnPage}}',

                    '</ul>',
                '</div>'
            ].join("");
        }
        // Paginate </end>

        //
        //  Result Block Template </end>
        // -----------------------------------------------------------------------

        // =======================================================================
        //  Get parameters and serialize parameters <start>
        //

        // Serialize parameters
        $this.find("form").on("submit", function (e) {
            e.preventDefault();
            var url = $(this).attr("action") || location.href.replace(/\?.*/, "");
            var params = $(this).serializeArray();
            for (var i = -1, n = params.length; ++i < n;) {
                if (params[i].name === "search") {
                    params[i].value = $.trim(params[i].value.replace(/[ |　]+/g, " "));
                }
            }
            params = op.submitAction(params);
            var serializeParams = $.param(params);
            if (serializeParams) {
                url = url + "?" + serializeParams;
            }
            location.href = url;
            return false;
        });

        var paramStr = decodeURIComponent(location.search.replace(/^\?/, ""));

        // Set initial parameters
        if (paramStr === '' && op.initialParameter !== null && typeof op.initialParameter === 'string') {
            paramStr = decodeURIComponent(op.initialParameter.replace(/^\?/, ""));
        }

        //
        //  Get parameters and serialize parameters </end>
        // -----------------------------------------------------------------------

        // =======================================================================
        //  Preload search data files <start>
        //

        if (paramStr === "") {
            switch (typeof op.searchDataPathPreload) {
                case "string":
                    $.ajax({
                        type: "GET",
                        cache: true,
                        dataType: "json",
                        url: op.searchDataPathPreload
                    });
                    break;
                case "object":
                    if (op.searchDataPathPreload === null || op.searchDataPathPreload === "") {
                        break;
                    }
                    if (op.searchDataPathPreload.length) {
                        for (var i = -1, n = op.searchDataPathPreload.length; ++i < n;) {
                            $.ajax({
                                type: "GET",
                                cache: true,
                                dataType: "json",
                                url: op.searchDataPathPreload[i]
                            });
                        }
                    }
                    else {
                        for (var key in op.searchDataPathPreload) {
                            $.ajax({
                                type: "GET",
                                cache: true,
                                dataType: "json",
                                url: op.searchDataPathPreload[key]
                            });
                        }
                    }
                    break;
            }
            return false;
        }

        //
        //  Preload search data files </end>
        // -----------------------------------------------------------------------

        // Search Result Loading Image
        if (resultLoadingHTML) {
            document.getElementById(op.resultBlockId).innerHTML = resultLoadingHTML;
        }

        // Set values to Search Form
        var searchWords = [];
        var paramAry = paramStr.split(/&|%26/);
        var paramObj = {};
        var paramExistArry = [];
        var advancedSearchObj = {};
        var limit = (op.limit !== null && typeof op.limit === 'number') ? op.limit: 10;
        var offset = 0;
        var sortBy = "";
        var sortOrder = "";
        var sortType = "";
        var jsonPath = "";
        var dataId = "";
        var api = false;
        var excludeParams = ["search", "dataId", "offset", "limit", "sortBy", "sortOrder", "sortType"];
        if (op.simplePaginate === true) {
            excludeParams.push("page");
        }
        if (op.excludeParams !== null) {
            $.merge(excludeParams, op.excludeParams.toLowerCase().split(","));
        }

        for (var i = -1, n = paramAry.length; ++i < n;) {
            var param = paramAry[i].split("=");
            var key = param[0];
            var value = param[1] || "";
            paramObj[key] = value;
            // Set "advancedSearchObj" and "searchWords"
            switch (key) {
                case "search":
                    value = (value === "+") ? "" : value; // If value is " ", it is "+" on URL.
                    searchWords = value.split(/\+| |%20/);
                    break;
                case "offset":
                    offset = value;
                    break;
                case "limit":
                    limit = (op.limit !== null && typeof op.limit === 'number') ? op.limit: value;
                    break;
                case "dataId":
                    dataId = value;
                    break;
                case "sortBy":
                    sortBy = value.toLowerCase();
                    break;
                case "sortOrder":
                    sortOrder = value.toLowerCase();
                    break;
                case "sortType":
                    sortType = value.toLowerCase();
                    break;
            }

            // Restore search condition
            if (key === "offset" || key === "limit") {
                continue;
            }
            if (op.simplePaginate === true && key === "page") {
                continue;
            }
            $this.find("[name='" + key + "']").each(function () {
                var tagname = this.tagName.toLowerCase();
                switch (tagname) {
                    case "input":
                        var type = $(this).attr('type');
                        if (type === "checkbox" && $(this).val() === value) {
                            $(this).prop("checked", true);
                        }
                        else if (type === "radio" && $(this).val() === value) {
                            $(this).prop("checked", true);
                        }
                        else if (type === "text" || type === "search" || type === "hidden") {
                            if (key === "search") {
                                $(this).val(value.replace(/\+/g," "));
                            } else {
                                $(this).val(value);
                            }
                        }
                    break;
                    case "select":
                        $(this).find("option").each(function () {
                            if ($(this).val() === value) {
                                $(this).prop("selected", true);
                            }
                            else if (value === "" && $(this).val() === " ") {
                                $(this).prop("selected", true);
                            }
                        });
                    break;
                }
            });

            // Set advancedSearchObj. This object is used in original search.
            if (value !== "") {
                value = value.replace(/\+/g, " ");
                if ($.inArray(key, excludeParams) !== -1) {
                    continue;
                }
                if ($.inArray(key, paramExistArry) !== -1) {
                    advancedSearchObj[key] += "," + value;
                }
                else {
                    advancedSearchObj[key] = value;
                }
            }
            paramExistArry.push(key);
        } // for

        // For simple paginate option
        if (op.simplePaginate === true && typeof paramObj["page"] !== 'undefined') {
            if (/all/i.test(paramObj["page"])) {
                offset = 0;
                limit = 100000000;
            }
            else {
                offset = (paramObj["page"] - 1) * limit;
            }
        }

        // Set paramKeyCount
        var paramKeyCount = 0;
        for (var key in advancedSearchObj) {
            paramKeyCount++;
        }

        // =======================================================================
        //  Set JSON path and using Data API <start>
        //

        // Set jsonPath
        switch (typeof op.searchDataPath) {
            case "string":
                jsonPath = op.searchDataPath;
            break;
            case "object":
                if (dataId === "") {
                    window.alert("dataId is required.");
                    return;
                }
                else {
                    if (op.dataApiDataIds !== null && $.inArray(dataId, op.dataApiDataIds.split(",")) !== -1) {
                        api = true;
                        if (op.dataApiParams !== null) {
                            paramStr += (paramStr !== "") ? "&" + $.param(op.dataApiParams): $.param(op.dataApiParams);
                        }
                    }
                    jsonPath = op.searchDataPath[dataId];
                }
            break;
        }

        //
        //  Set JSON path and using Data API </end>
        // -----------------------------------------------------------------------

        // =======================================================================
        //  Search <start>
        //
        if (api) {
            jsonPath += "?" + paramStr;
        }
        $.ajax({
            type: "GET",
            cache: op.cache,
            dataType: "json",
            url: jsonPath,
            error: function (jqXHR, textStatus, errorThrown) {
                op.ajaxError(jqXHR, textStatus, errorThrown);
            },
            success: function (response) {
                var resultJSON = {};
                if (api) {
                    // Data API
                    resultJSON = response;
                }
                else {
                    // Original JSON
                    // Clone the items
                    var cloneItems = $.grep(response.items, function () {
                        return true;
                    });
                    // Advanced Search
                    cloneItems = $.grep(cloneItems, function (item, i) {
                        return jsonAdvancedSearch (item, advancedSearchObj, paramKeyCount, "like", op.advancedSearchCond);
                    });

                    // Search by keywords
                    cloneItems = $.grep(cloneItems, function (item, i) {
                        return jsonKeywordsSearch (item, searchWords);
                    });

                    // Do custom search
                    if (op.customSearch !== null && typeof op.customSearch === "function") {
                        cloneItems = $.grep(cloneItems, function (item, i) {
                            return op.customSearch(item, paramObj);
                        });
                    }

                    // Set resultJSON
                    var limitIdx = Number(limit) + Number(offset);
                    resultJSON.totalResults = cloneItems.length;

                    // Sort
                    if (resultJSON.totalResults !== 0 && sortBy !== "" && sortBy in cloneItems[0]) {
                        if (sortOrder !== "ascend") {
                            sortOrder = "descend";
                        }
                        if (sortType !== "numeric") {
                            sortType = "string";
                        }
                        objectSort(cloneItems, sortBy, sortOrder, sortType);
                    }

                    // Custom Sort
                    if (op.customSort !== null && typeof op.customSort === "function") {
                        cloneItems = op.customSort(cloneItems, paramObj);
                    }

                    resultJSON.items = $.grep(cloneItems, function (item, i) {
                        if (i < offset) {
                            return false;
                        }
                        else if (i >= limitIdx) {
                            return false;
                        }
                        else {
                            return true;
                        }
                    });
                }
                // Paginate
                var currentPage = Math.ceil(offset / limit) + 1;
                var realMaxPageCount = Math.ceil(resultJSON.totalResults / limit);
                var maxPageCount = op.maxPageCount ? op.maxPageCount : 100;
                var forwordRange = ((maxPageCount % 2) == 0) ? (maxPageCount / 2) - 1 : Math.floor(maxPageCount / 2);
                var backwardRange = ((maxPageCount % 2) == 0) ? maxPageCount / 2 : Math.floor(maxPageCount / 2);
                var startPage, lastPage;
                if (realMaxPageCount <= maxPageCount) {
                    startPage = 1;
                    lastPage = realMaxPageCount;
                }
                else {
                    startPage = currentPage - forwordRange;
                    lastPage = currentPage + backwardRange;
                    if (startPage < 1) {
                        startPage = 1;
                        lastPage = maxPageCount;
                    }
                    else {
                      if (lastPage > realMaxPageCount) {
                          backwardRange = realMaxPageCount - currentPage;
                          lastPage = realMaxPageCount;
                          forwordRange = maxPageCount - backwardRange;
                          startPage = currentPage - forwordRange;
                      }
                    }
                }
                var pageList = [];
                for (var i = 0, n = realMaxPageCount; ++i <= n;) {
                    pageList.push({pageNumber: i});
                }
                var paginateJSON = {
                    id: op.paginateId,
                    classname: op.paginateClassName,
                    page: pageList,
                    hidePageNumber: op.hidePageNumber,
                    showTurnPage: op.showTurnPage,
                    prevPageText: op.prevPageText,
                    nextPageText: op.nextPageText,
                    isFirst: function(){
                        return currentPage === 1;
                    },
                    isLast: function(){
                        if (!pageList.length) {
                            return true;
                        }
                        return currentPage === pageList.length;
                    },
                    exceptFirst: function(){
                        return currentPage !== 1;
                    },
                    exceptLast: function(){
                        return pageList.length > 0 && currentPage !== pageList.length;
                    },
                    checkRange: function(){
                        return this.pageNumber >= startPage && this.pageNumber <= lastPage;
                    },
                    current: function () {
                        if (this.pageNumber === currentPage) {
                            return 'fs-current';
                        }
                        else if (this.pageNumber === (currentPage - 1)) {
                            return "fs-current-prev";
                        }
                        else if (this.pageNumber === (currentPage + 1)) {
                            return "fs-current-next";
                        }
                        else {
                            return "";
                        }
                    },
                    isCurrent: function(){
                      return this.pageNumber === currentPage;
                    },
                    lastPage: function () {
                        return paginateJSON.page.length;
                    },
                    currentLink: function () {
                        if (this.pageNumber === currentPage) {
                            return 'fs-current-link';
                        }
                        else if (this.pageNumber === (currentPage - 1)) {
                            return "fs-current-prev-link";
                        }
                        else if (this.pageNumber === (currentPage + 1)) {
                            return "fs-current-next-link";
                        }
                        else {
                            return "";
                        }
                    },
                    currentCountFrom: function () {
                        return offset - 0 + 1;
                    },
                    currentCountTo: function () {
                        var num = offset - 0 + limit;
                        var res = num < resultJSON.totalResults ? num : resultJSON.totalResults;
                        return res - 0;
                    },
                    totalResults: resultJSON.totalResults,
                    count: resultJSON.totalResults,
                    currentPage: currentPage
                };
                var paginateHTML = Mustache.render(paginateTmpl, paginateJSON);

                // Result message
                var resultMsgObj = {
                    id: op.resultMsgId ? op.resultMsgId : '',
                    classname: op.resultMsgClassName ? op.resultMsgClassName : '',
                    keywords: searchWords.join(', '),
                    keywordArray: searchWords.join('') !== '' ? searchWords : null,
                    count: resultJSON.totalResults,
                    metaTitle: document.title,
                    firstPage: function () {
                        return paginateJSON.page[0].pageNumber;
                    },
                    lastPage: function () {
                        return paginateJSON.page.length;
                    },
                    currentPage: currentPage
                };
                var resultMsgHTML = Mustache.render(resultMsgTmpl, resultMsgObj);

                // Set the meta title
                if (op.resultMetaTitleRewrite) {
                    var resultMetaTitleTmpl = (op.resultMetaTitleTmpl) ? op.resultMetaTitleTmpl : [
                            // '{{#keywords}}{{keywords}}{{/keywords}}',
                            '{{#keywordArray}}{{.}} {{/keywordArray}}',
                            '{{#count}} {{count}}件{{/count}}',
                            '{{#count}} {{currentPage}}/{{lastPage}}{{/count}}',
                            '{{#metaTitle}} | {{metaTitle}}{{/metaTitle}}'
                        ].join("");
                    var resultMetaTitleHTML = Mustache.render(resultMetaTitleTmpl, resultMsgObj);
                    document.title = resultMetaTitleHTML;
                }

                // Show result
                if (op.modifyResultJSON !== null && typeof op.modifyResultJSON === "function") {
                    resultJSON = op.modifyResultJSON(resultJSON);
                }
                var resultItemHTML = Mustache.render(resultItemTmpl, resultJSON);

                // Callback
                if (op.modifyResultMsgHTML !== null && typeof op.modifyResultMsgHTML === "function") {
                    resultMsgHTML = op.modifyResultMsgHTML(resultMsgHTML);
                }
                if (op.modifyResultItemHTML !== null && typeof op.modifyResultItemHTML === "function") {
                    resultItemHTML = op.modifyResultItemHTML(resultItemHTML);
                }
                if (op.modifyPaginateHTML !== null && typeof op.modifyPaginateHTML === "function") {
                    paginateHTML = op.modifyPaginateHTML(paginateHTML);
                }

                // Search Result Block HTML
                var resultAllHTML = '';

                // Add result message HTML
                if (op.resultMsgInsertMethods === null) {
                    resultAllHTML += resultMsgHTML;
                }
                // Add result items HTML
                resultAllHTML += resultItemHTML;
                // Add paginate HTML
                if (realMaxPageCount === 1 && op.hideOnePagePaginate === true) {
                    // nothing to do
                }
                else if (op.paginateInsertMethods === null) {
                    resultAllHTML += paginateHTML;
                }

                // Add all of result HTML to DOM
                document.getElementById(op.resultBlockId).innerHTML = resultAllHTML;

                // Add result message HTML to DOM
                if (op.resultMsgInsertMethods !== null) {
                    for (var i = 0, l = op.resultMsgInsertMethods.length; i < l; i++) {
                        $(op.resultMsgInsertMethods[i].selector)[op.resultMsgInsertMethods[i].method](resultMsgHTML);
                    }
                }
                // Add paginate HTML to DOM
                if (realMaxPageCount === 1 && op.hideOnePagePaginate === true) {
                    // nothing to do
                }
                else if (op.paginateInsertMethods !== null) {
                    for (var i = 0, l = op.paginateInsertMethods.length; i < l; i++) {
                        $(op.paginateInsertMethods[i].selector)[op.paginateInsertMethods[i].method](paginateHTML);
                    }
                }

                // Callback
                if (op.resultComplete !== null && typeof op.resultComplete === "function") {
                    op.resultComplete(resultJSON.totalResults);
                }

                // Bind pageLink() to paginate link
                var paginateSelector = op.paginateId ? "#" + op.paginateId : "." + op.paginateClassName;
                $(paginateSelector)
                    .on("click", "a.fs-page-link", function (e) {
                        e.preventDefault();
                        var page = $(this).attr("title");
                        var offset = (Number(page) - 1) * Number(limit);
                        var url = location.href.replace(/\?.*/g, '');
                        var query = location.search ? location.search.replace(/^\?/, '') : op.initialParameter;
                        if (op.simplePaginate === true) {
                            if (query.indexOf('page=') === -1) {
                                query += query ? '&page=' + page : 'page=' + page;
                            }
                            else {
                                query = query.replace(/page=[0-9]+/, 'page=' + page);
                            }
                            query = query.replace(/&?offset=[0-9]+/g, '');
                        }
                        else {
                            if (query.indexOf('offset=') === -1) {
                                query += query ? '&offset=' + offset : 'offset=' + offset;
                            }
                            else {
                                query = query.replace(/offset=[0-9]+/, 'offset=' + offset);
                            }
                            query = query.replace(/&?offset=0/, '');
                        }
                        if (query) {
                            url += "?" + query.replace(/^&+/, '');
                        }
                        location.href = url;
                    })
                    .on("click", "a.fs-turn-page-link", function (e) {
                        e.preventDefault();
                        if ($(this).hasClass('fs-prev-link')) {
                            $(e.delegateTarget).find('.fs-current-prev-link').trigger('click');
                        }
                        else if ($(this).hasClass('fs-next-link')) {
                            $(e.delegateTarget).find('.fs-current-next-link').trigger('click');
                        }
                    });
            } // success
        }); // ajax

        //
        //  Search </end>
        // -----------------------------------------------------------------------

        // =======================================================================
        //  Functions <start>
        //

        function jsonAdvancedSearch (obj, advancedSearchObj, paramKeyCount, matchType, cond) {
            var matched = 0;
            if (matchType === "like") {
                for (var key in advancedSearchObj) {
                    var valueArray = advancedSearchObj[key].split(",");
                    var valueArrayLength = valueArray.length;
                    var _matched = 0;
                    for (var i = -1, n = valueArrayLength; ++i < n;) {
                        var reg = new RegExp(valueArray[i].replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1"), "i");
                        if (typeof obj[key] === "undefined" || typeof obj[key] === "string" && reg.test(obj[key])) {
                            if (cond === 'AND' || cond === 'and') {
                                _matched++;
                            }
                            else {
                                matched++;
                                break;
                            }
                        }
                        // else if (obj[key] && typeof obj[key] === "object" && obj[key].length) {
                        //     for (var i = -1, n = obj[key].length; ++i < n;) {
                        //         if (reg.test(obj[key])) return true;
                        //     }
                        // }
                    }
                    if (cond === 'AND' || cond === 'and') {
                        if (_matched === valueArrayLength) {
                            matched++;
                        }
                    }
                }
                return matched === paramKeyCount;
            }
            else {
                for (var key in advancedSearchObj) {
                    if (obj[key] && typeof obj[key] === "string" && obj[key] !== advancedSearchObj[key]) {
                        return false;
                    }
                    // else if (obj[key] && typeof obj[key] === "object" && obj[key].length) {
                    //     for (var i = -1, n = obj[key].length; ++i < n;) {
                    //         return advancedSearchObj[key] === obj[key][i];
                    //     }
                    // }
                }
            }
            return matched;
        }

        function jsonKeywordsSearch (obj, keywordsArray) {
            var keywordsCount = keywordsArray.length;
            var keywordsMutchCount = 0;
            for (var i = -1; ++i < keywordsCount;) {
                var reg = new RegExp(keywordsArray[i].replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1"), "i");
                // if (reg.test(obj[key])) keyMatch++;
                for (var key in obj) {
                    if (reg.test(obj[key])) {
                        keywordsMutchCount++;
                        break;
                    }
                }
            }
            return (keywordsCount === keywordsMutchCount);
        }

        // Sort object.
        // @paran {Array} array JSON
        // @paran {String} sortBy Sort by this property's value.
        // @paran {String} sortOrder ascend or descend.
        // @paran {String} sortType numeric or string.
        function objectSort (array, sortBy, sortOrder, sortType) {
            if (!sortBy && typeof sortBy !== "string") {
                return;
            }
            sortOrder = (sortOrder === 'ascend') ? -1 : 1;
            array.sort(function(obj1, obj2){
                var v1 = obj1[sortBy];
                var v2 = obj2[sortBy];
                if (sortType === 'numeric') {
                    v1 = v1 - 0;
                    v2 = v2 - 0;
                }
                else if (sortType === 'string') {
                    v1 = '' + v1;
                    v2 = '' + v2;
                }
                if (v1 < v2) {
                    return 1 * sortOrder;
                }
                if (v1 > v2) {
                    return -1 * sortOrder;
                }
                return 0;
            });
        }

        //
        //  Functions </end>
        // -----------------------------------------------------------------------
    };
    $.fn.flexibleSearch.defaults = {
        initialParameter: null,
        // The limit parameter is overwritten and locked as this value.
        limit: null,
        // If you want to use 'page' parameter without 'limit' and 'offset', set true to this option.
        simplePaginate: false,
        // Path
        searchDataPath: "/flexibleSearch/search.json",
        searchDataPathPreload: null,

        // Data API
        dataApiDataIds: null,
        dataApiParams: null,

        // Performance
        cache:  true, // I recommend "true".

        // Search Form
        searchFormCreation: true,
        searchFormHTML: null,
        searchFormAction: "",
        searchFormInputType: "search",
        searchFormInputPlaceholder: "Search words",
        searchFormSubmitBtnText: "Search",

        // Advanced Search Form
        advancedFormObj: null,
        advancedSearchCond: 'OR', // 'AND'

        // Result Block
        loadingImgPath: "/flexibleSearch/loading.gif",
        loadingImgHTML: null,

        resultBlockId: "fs-result",
        resultItemTmpl: null,

        resultMsgId: null,
        resultMsgClassName: "fs-result-msg",
        resultMsgTmpl: null,

        resultMetaTitleRewrite: true,
        resultMetaTitleTmpl: null,

        // You can set an array including plane object which has two properties,
        // method property and selector property.
        // e.g.
        //     resultMsgInsertMethods: [
        //         {
        //             "selector": "foo",
        //             "method": "append"
        //         }
        //     ],
        resultMsgInsertMethods: null,

        // Paginate
        paginateId: null,
        paginateClassName: "fs-paginate",
        paginateTmpl: null,
        paginateCount: 10,
        hidePageNumber: false,
        showTurnPage: true,
        prevPageText: 'Prev',
        nextPageText: 'Next',
        maxPageCount: 10,
        // If you want to hide one page pagination, set true.
        hideOnePagePaginate: false,
        // You can set an array including plane object which has two properties,
        // method property and selector property.
        // e.g.
        //     paginateInsertMethods: [
        //         {
        //             "selector": "foo",
        //             "method": "append"
        //         }
        //     ],
        paginateInsertMethods: null,

        // Submit
        submitAction: function (paramArray) {
            return paramArray;
        },

        // Ajax
        ajaxError: function (jqXHR, textStatus, errorThrown) {
            window.alert(textStatus);
        },

        // Callbacks

        // you can search in your logic.
        // e.g.
        //     customSearch: function(item, paramObj){
        //         // item : Each item in items
        //         // paramObj : Plane object of parameters
        //         // The item is removed when return false
        //         return true or false;
        //     },
        customSearch: null,

        // You can modify the search result JSON.
        // e.g.
        //     modifyResultJSON = function(json){
        //         json["fullName"] = function(){
        //             return this.firstName + " " + this.lastName;
        //         };
        //         return json;
        //     },
        modifyResultJSON: null,
        modifyResultMsgHTML: null,
        modifyResultItemHTML: null,
        modifyPaginateHTML: null,
        resultComplete: null,

        excludeParams: null,
        dummy: false
    };
})(jQuery);
