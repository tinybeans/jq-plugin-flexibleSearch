/*
* flexibleSearch.js
*
* Copyright (c) Tomohiro Okuwaki (http://www.tinybeans.net/blog/)
*
* Since  : 2010-11-12
* Update : 2013-07-29
* Version: 2.0.0 beta1
* Comment: Please use this with Movable Type :)
*
* You have to include "mustache.js" before "flexibleSearch.js".
* Maybe... jQuery 1.7.x later
*
*/

(function($){
    $.fn.flexibleSearch = function(options){
        var op = $.extend({}, $.fn.flexibleSearch.defaults, options);

        // -------------------------------------------------
        //  Initialization
        // -------------------------------------------------
        var $this = this;//, timestamp,

        // -------------------------------------------------
        //  Template
        // -------------------------------------------------

        // Advanced Form HTML <start> - 詳細検索
        var advancedFormTmpl = [];
        var advancedFormHTML = "";
        if (op.advancedForm !== null) {
            // input:hidden
            if ("hidden" in op.advancedForm) {
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
            if ("text" in op.advancedForm) {
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
            if ("checkbox" in op.advancedForm) {
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
            if ("radio" in op.advancedForm) {
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

            // input:select
            var hasSelect = false;
            if ("select" in op.advancedForm) {
                hasSelect = true;
                var advancedFormSelect = {
                    "selects": op.advancedForm.select,
                    "options": function(){
                        var optionObj = this.option;
                        var optionSet = [];
                        for (var i = 0, l = optionObj.length; i < l; i++) {
                            var slctd = optionObj[i].selected ? " selected": "";
                            optionSet.push('<option value="' + optionObj[i].value + '"' + slctd + '>' + optionObj[i].label +'</option>');
                        }
                        return optionSet.join("");
                    }
                }
                var advancedFormSelectTmpl = [
                    '<div class="fs-advanced-select">',
                    '{{#selects}}',
                        '<select{{#id}} id="{{id}}"{{/id}}{{#name}} for="{{name}}"{{/name}}{{#size}} size="{{size}}"{{/size}}{{#multiple}} multiple{{/multiple}} class="fs-select{{#name}} fs-{{name}}{{/name}}">',
                            '{{{options}}}',
                        '</select>',
                    '{{/selects}}',
                    '</div>'
                ].join("");
            }

            advancedFormHTML = Mustache.render(advancedFormTmpl.join(""), op.advancedForm);
        }

        if (hasSelect) {
            advancedFormHTML += Mustache.render(advancedFormSelectTmpl, advancedFormSelect);
        }
        // Advanced Form HTML </end>

        // Search Form <start> - 検索フォーム全体
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
        var searchFormHTML = [
            '<form action="{{action}}" method="GET">',
                '<input type="hidden" name="flexiblesearch" value="1">', // This element is required.
                '<input type="hidden" name="offset" value="0">',
                '<input type="hidden" name="limit" value="' + op.paginateCount + '">',
                '<input type="{{type}}" name="search" placeholder="{{placeholder}}" class="fs-text fs-search">',
                '<input type="submit" value="{{submitBtnText}}" class="fs-btn fs-submit">',
                advancedFormHTML, // Advanced Form
            '</form>'
        ];
        // Search Form </end>

        // Search Result Loading Image <start> - ローディング画像
        //
        var resultLoadingHTML = "";
        if (op.loadingImgHtml !== null) {
            resultLoadingHTML = op.loadingImgHtml;
        }
        else if (op.loadingImgPath) {
            resultLoadingHTML = '<span class="fs-loading"><img src="' + op.loadingImgPath + '" alt=""></span>';
        }
        // Search Result Message </end>

        // Search Result Message <start> - 検索結果メッセージ
        //
        // * {{keywords}}
        // * {{count}}
        // * {{firstPage}}
        // * {{lastPage}}
        // * {{currentPage}}
        var resultMsgHTML = "";
        if (op.resultMsgHTML !== null) {
            resultMsgHTML = op.resultMsgHTML;
        }
        else {
            resultMsgHTML = [
                '<div id="' + op.resultBlockId + '-msg">',
                    '<p>',
                        '{{#keywords}}「{{keywords}}」が {{/keywords}}{{count}} 件見つかりました。',
                        '（{{firstPage}}〜{{lastPage}} ページ中 {{currentPage}} ページ目を表示）',
                    '</p>',
                '</div>'
            ].join("");
        }
        // Search Result Message </end>

        // Search Result Item <start> - 検索結果一覧
        //
        // keys used in Result Items:
        // * keys used in your JSON
        var resultItemHTML = "";
        if (op.resultItemHTML !== null) {
            resultItemHTML = op.resultItemHTML;
        }
        else {
            resultItemHTML = [
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

        // Paginate <start> - 検索結果ページ分割
        //
        // keys used in Paginate:
        // * {{paginateId}}
        // * {{&current}}
        // * {{.}}
        var paginateHTML = [
            '<div id="{{paginateId}}">',
                '<ul>',
                    '{{#page}}',
                    '<li{{&current}}><span><a href="#" title="{{.}}">{{.}}</a></span></li>',
                    '{{/page}}',
                '</ul>',
            '</div>'
        ];
        // Paginate </end>

        // -------------------------------------------------
        //  Rendering
        // -------------------------------------------------

        // Search Form HTML
        if (op.searchFormCreation == true) {
            searchFormHTML = (op.searchFormHtml !== "") ? op.searchFormHtml : Mustache.render(searchFormHTML.join(""), searchFormObj);
            if (searchFormHTML) {
                $this[0].innerHTML = searchFormHTML;
            }
        }

        // Get query
        var paramStr = decodeURIComponent(location.search.replace(/^\?/, ""));
        if (! /flexibleSearch=1/i.test(paramStr)) {
            switch (typeof op.searchDataPathPreload) {
                case "string":
                    $.ajax({
                        type: "GET",
                        cache: op.cache,
                        dataType: "json",
                        url: op.searchDataPathPreload
                    });
                    break;
                case "object":
                    if (op.searchDataPathPreload.length) {
                        for (var i = -1, n = op.searchDataPathPreload.length; ++i < n;) {
                            $.ajax({
                                type: "GET",
                                cache: op.cache,
                                dataType: "json",
                                url: op.searchDataPathPreload[i]
                            });
                        }
                    }
                    else {
                        for (var key in op.searchDataPathPreload) {
                            $.ajax({
                                type: "GET",
                                cache: op.cache,
                                dataType: "json",
                                url: op.searchDataPathPreload[key]
                            });
                        }
                    }
                    break;
            }
            return false;
        }

        // Search Result Loading Image
        if (resultLoadingHTML) {
            document.getElementById(op.resultBlockId).innerHTML = resultLoadingHTML;
        }

        // Set jsonPath
        var jsonPath = "";
        var dataId = "";
        var dataApi = 0;
        switch (typeof op.searchDataPath) {
            case "string":
                jsonPath = op.searchDataPath;
                break;
            case "object":
                dataId = paramStr.match(/DataId=(\w+)/i);
                if (dataId === null) {
                    break;
                }
                else {
                    jsonPath = op.searchDataPath[dataId[1]];
                }
                if (/^api_/.test(dataId[1]) || /^api1_/.test(dataId[1])) {
                    dataApi = 1;
                }
                else if (/^api2_/.test(dataId[1])) {
                    dataApi = 2;
                }
                break;
        }

        var dataApiParam = "";
        if (/DataAPI=1/i.test(paramStr) || dataApi === 1) {
            dataApi = 1;
            dataApiParam = paramStr.replace(/([\?&])(search=[^+&]+)([^&]*)/, "$1$2");
            jsonPath = (jsonPath.indexOf("?") === -1) ? jsonPath + "?" + dataApiParam
                                                     : jsonPath + "&" + dataApiParam;
        }
        else if (/DataAPI=2/i.test(paramStr) || dataApi === 2) { // No limit
            dataApi = 2;
            dataApiParam = paramStr.replace(/([\?&])(search=[^+&]+)([^&]*)/, "$1$2");
            dataApiParam = dataApiParam.replace(/([\?&])(limit=[^+&]+)/, "");
            jsonPath = (jsonPath.indexOf("?") === -1) ? jsonPath + "?" + dataApiParam
                                                     : jsonPath + "&" + dataApiParam;
        }

        // Bind an event handler to the submit event
        $this.find("form").eq(0).on("submit", function(){
            $(this).find("[name='offset']").val(0);
            var $search = $(this).find("[name='search']");
            $search.val($.trim($search.val().replace("　", " ")));
            // var query = $(this).serialize();
        });

        // Set parameter list to exclude from search.
        var excludeParams = ["search", "flexiblesearch", "dataid", "dataapi", "offset", "limit"];
        if (op.excludeParams !== "") {
            var opExcludeParams = op.excludeParams.toLowerCase().split(",");
            for (var i = -1, n = opExcludeParams.length; ++i < n;) {
                excludeParams.push($.trim(opExcludeParams));
            }
        }

        // Set values to Search Form
        var searchWords = [];
        var paramObj = {};
        var offset = 0;
        var limit = 10;
        var _paramAry = paramStr.split(/&|%26/);

        for (var i = -1, n = _paramAry.length; ++i < n;) {
            var key = _paramAry[i].split("=")[0];
            var value = _paramAry[i].split("=")[1];
            value = (value === "+") ? "" : value; // If value is " ", it is "+" on URL.
            // Set "paramObj" and "searchWords"
            var keyLower = key.toLowerCase();
            if (value !== "" && keyLower === "search") {
                searchWords = value.split("+");
            }
            else if (keyLower === "offset" && value !== 0) {
                offset = value;
            }
            else if (keyLower === "limit" && value !== 10) {
                limit = value;
            }

            // Reproduce search condition
            $this.find("[name='" + key + "']").each(function(){
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
                                $(this).val(value.replace("+"," "));
                            } else {
                                $(this).val(value);
                            }
                        }
                    break;
                    case "select":
                        $(this).find("option").each(function(){
                            if ($(this).val() === value) {
                                $(this).prop("selected", true);
                            }
                            else if (value === "" && $(this).val() === " ") {
                                $(this).prop("selected", true);
                            }
                        });
                    break;
                } // switch
            }); // each
            if (value !== "") {
                if ($.inArray(keyLower, excludeParams) !== -1) {
                    continue;
                }
                if (key.indexOf("[]") !== -1) {
                    key = key.replace("[]", "");
                    if (paramObj[key]) {
                        paramObj[key].push(value);
                    }
                    else {
                        paramObj[key] = [value];
                    }
                }
                else {
                    paramObj[key] = value;
                }
            }
        } // for

        // Set paramKeyCount
        var paramKeyCount = 0;
        for (var key in paramObj) {
            paramKeyCount++;
        }
        // -------------------------------------------------
        //  Main
        // -------------------------------------------------
        $.ajax({
            type: "GET",
            cache: op.cache,
            dataType: "json",
            url: jsonPath,
            error: function(){
                // result block にエラーを表示;
            },
            success: function(json){
                // Clone the items
                var cloneItems = $.grep(json.items, function (){
                    return true;
                });

                // Perform a search
                var isParamObj = false;
                for (var key in paramObj) {
                    isParamObj = true;
                }
                if (dataApi === 0 && isParamObj) {
                    cloneItems = $.grep(cloneItems, function(item, i){
                        return jsonAdvancedSearch (item, paramObj, paramKeyCount, "like");
                    });
                }
                if (dataApi === 0 || dataApi === 2) {
                    cloneItems = $.grep(cloneItems, function(item, i){
                        return jsonKeywordsSearch (item, searchWords);
                    });
                }

                // Set totalResults
                var totalResults = 0;
                if (dataApi === 0 || dataApi === 2) {
                    totalResults = cloneItems.length;
                }
                else if (dataApi === 1) {
                    totalResults = json.totalResults;
                }

                // Result count
                var resultJSON = {
                    "totalResults": totalResults
                };

                // Paginate
                var limitIdx = Number(limit) + Number(offset);
                var currentPage = Math.ceil(offset / limit);
                currentPage++;
                var resultItems = (dataApi === 1) ? cloneItems : $.grep(cloneItems, function(item, i){
                    if (i < offset) {
                        return false;
                    }
                    if (i >= limitIdx) {
                        return false;
                    }
                    return true;
                });
                var pageList = [];
                for (var i = 0, n = Math.ceil(resultJSON.totalResults / limit); ++i <= n;) {
                    pageList.push(i);
                }
                var paginate = {
                    page: pageList,
                    current: function(){
                        if (this === currentPage) {
                            return ' class="fs-current"';
                        }
                        else {
                            return "";
                        }
                    },
                    paginateId: op.paginate.paginateId
                };
                paginateHTML = Mustache.render(paginateHTML.join(""), paginate);

                // Result message
                var resultMsgJSON = {
                    keywords: searchWords.join(", "),
                    count: resultJSON.totalResults,
                    firstPage: function(){
                        return paginate.page[0];
                    },
                    lastPage: function(){
                        return paginate.page[paginate.page.length-1];
                    },
                    currentPage: currentPage
                };
                resultMsgHTML = Mustache.render(resultMsgHTML, resultMsgJSON);
                // Result items
                resultJSON.items = resultItems;

                // Show result
                resultItemHTML = Mustache.render(resultItemHTML, resultJSON);

                // Search Result Block HTML
                document.getElementById(op.resultBlock.blockId).innerHTML = resultMsgHTML + resultItemHTML + paginateHTML;

                // Bind pageLink() to paginate link
                $("#" + op.paginate.paginateId).on("click", "a", function(e){
                    e.preventDefault();
                    var page = $(this).attr("title");
                    var offset = (Number(page) - 1) * Number(limit);
                    offset = "offset=" + offset;
                    var url = location.href.split("?");
                    var query = url[1].replace(/offset=[0-9]+/, offset);
                    location.href = url[0] + "?" + query;
                });
            } // success
        }); // ajax


        // -------------------------------------------------
        //  Functions
        // -------------------------------------------------

        function jsonAdvancedSearch (obj, paramObj, paramKeyCount, matchType) {
            var matched = 0;
            if (matchType === "like") {
                for (var key in paramObj) {
                    if (typeof paramObj[key] === "string") {
                        paramObj[key] = [ paramObj[key] ];
                    }
                    for (var i = -1, n = paramObj[key].length; ++i < n;) {
                        var reg = new RegExp(paramObj[key][i], "i");
                        if (typeof obj[key] === "string" && reg.test(obj[key])) {
                            matched++;
                            break;
                        }
                        // else if (obj[key] && typeof obj[key] === "object" && obj[key].length) {
                        //     for (var i = -1, n = obj[key].length; ++i < n;) {
                        //         if (reg.test(obj[key])) return true;
                        //     }
                        // }
                    }
                }
                return matched === paramKeyCount;
            }
            else {
                for (var key in paramObj) {
                    if (obj[key] && typeof obj[key] === "string" && obj[key] !== paramObj[key]) {
                        return false;
                    }
                    // else if (obj[key] && typeof obj[key] === "object" && obj[key].length) {
                    //     for (var i = -1, n = obj[key].length; ++i < n;) {
                    //         return paramObj[key] === obj[key][i];
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
                var reg = new RegExp(keywordsArray[i], "i");
                // if (reg.test(obj[key])) keyMatch++;
                for (var key in obj) {
                    if (reg.test(obj[key])) {
                        keywordsMutchCount++;
                        break;
                    }
                }
            }
            return (keywordsCount === keywordsMutchCount) ? true : false;
        }
    };
    $.fn.flexibleSearch.defaults = {
        // Path
        searchDataPath: "/flexibleSearch/search_data.js",
        searchDataPathPreload: "/flexibleSearch/search_data.js",

        // Performance
        cache:  true, // I recommend "true".

        // Search Form
        searchFormCreation: true,
        searchFormHtml: "",
        searchFormAction: "",
        searchFormInputType: "search",
        searchFormInputPlaceholder: "Search words",
        searchFormSubmitBtnText: "Search",

        // Advanced Search Form
        advancedForm: null,

        // Result Block
        resultBlock: {
            blockId: "fs-result",
            loadingImgPath: ""
        },

        // Paginate
        paginate: {
            count: 10,
            paginateId : "fs-paginate"
        },

        excludeParams: "" // This is an optional parameter. The comma separated parameter list to exclude from search.
    };
})(jQuery);