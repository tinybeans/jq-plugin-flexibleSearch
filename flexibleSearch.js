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
* You must need to include "mustache.js" before "flexibleSearch.js".
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
        var advancedFormHTML = [
            // input:hidden
            '<div class="fs-advanced-hidden"{{^hidden}} style="display:none;"{{/hidden}}>',
            '{{#hidden}}',
                '<input type="hidden" name="{{name}}" value="{{value}}">',
            '{{/hidden}}',
            '</div>',

            // input:text
            '<div class="fs-advanced-text"{{^text}} style="display:none;"{{/text}}>',
            '{{#text}}',
                '<label for="{{name}}" class="fs-text fs-{{name}}"><input type="text" name="{{name}}" value="{{value}}" placeholder="{{placeholder}}">{{label}}</label>',
            '{{/text}}',
            '</div>',

            // input:checkbox
            '<div class="fs-advanced-text"{{^checkbox}} style="display:none;"{{/checkbox}}>',
            '{{#checkbox}}',
                '<label for="{{name}}" class="fs-checkbox fs-{{name}}"><input type="checkbox" name="{{name}}" value="{{value}}"{{#checked}} checked{{/checked}}>{{label}}</label>',
            '{{/checkbox}}',
            '</div>',

            // input:radio
            '<div class="fs-advanced-text"{{^radio}} style="display:none;"{{/radio}}>',
            '{{#radio}}',
                '<label for="{{name}}" class="fs-radio fs-{{name}}"><input type="radio" name="{{name}}" value="{{value}}"{{#checked}} checked{{/checked}}>{{label}}</label>',
            '{{/radio}}',
            '</div>',

            // select
            '<div class="fs-advanced-text"{{^select}} style="display:none;"{{/select}}>',
            '{{#select}}',
                '<select name="{{name}}"{{#size}} size="{{size}}"{{/size}}{{#multiple}} multiple{{/multiple}} class="fs-select">',
                    '{{#option}}',
                    '<option value="{{.}}">{{.}}</option>',
                    '{{/option}}',
                '</select>',
            '{{/select}}',
            '</div>'
        ];
        advancedFormHTML = Mustache.render(advancedFormHTML.join(""), op.advancedForm);
        // Advanced Form HTML </end>

        // Search Form <start> - 検索フォーム全体
        //
        // keys used in Search Form:
        // * {{action}} (= op.searchForm.action)
        // * {{searchPlaceholder}} (= op.searchForm.searchPlaceholder)
        // * {{submitBtnText}} (= op.searchForm.submitBtnText)
        // * {{&loadingImgPath}} (= op.searchForm.loadingImgPath)
        var searchFormHTML = [
            '<form action="{{action}}" method="GET">',
                '<input type="hidden" name="flexiblesearch" value="1">', // This element is required.
                '<input type="hidden" name="offset" value="0">',
                '<input type="hidden" name="limit" value="' + op.paginate.count + '">',
                '<input type="search" name="search" placeholder="{{searchPlaceholder}}" class="fs-text fs-search">',
                '<input type="submit" value="{{submitBtnText}}" class="fs-btn fs-submit">',
                advancedFormHTML, // Advanced Form
            '</form>'
        ];
        // Search Form </end>

        // Search Result Loading Image <start> - ローディング画像
        //
        // keys used in Loading Image:
        // * {{loadingImgPath}} (= op.resultBlock.loadingImgPath)
        var resultLoadingHTML = [
            '{{#loadingImgPath}}',
            '<span class="fs-loading">',
                '<img src="{{&loadingImgPath}}" alt="">',
            '</span>',
            '{{/loadingImgPath}}'
        ];
        // Search Result Message </end>

        // Search Result Message <start> - 検索結果メッセージ
        //
        // keys used in Result Message:
        // * {{keywords}}
        // * {{count}}
        // * {{firstPage}}
        // * {{lastPage}}
        // * {{currentPage}}
        var resultMsgHTML = [
            '<div id="' + op.resultBlock.blockId + '-msg">',
                '<p>',
                    '{{#keywords}}「{{keywords}}」が {{/keywords}}{{count}} 件見つかりました。',
                    '（{{firstPage}}〜{{lastPage}} ページ中 {{currentPage}} ページ目を表示）',
                '</p>',
            '</div>'
        ];
        // Search Result Message </end>

        // Search Result Item <start> - 検索結果一覧
        //
        // keys used in Result Items:
        // * keys used in your JSON
        var resultItemHTML = [
            '<div id="' + op.resultBlock.blockId + '-items">',
                '<ul>',
                '{{#items}}',
                    '<li>{{&title}}</li>',
                '{{/items}}',
                '</ul>',
            '</div>'
        ];
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
        searchFormHTML = op.searchForm.html ? op.searchForm.html : Mustache.render(searchFormHTML.join(""), op.searchForm);
        if (searchFormHTML) $this[0].innerHTML = searchFormHTML;

        // Get query
        var paramStr = location.search.replace(/^\?/, "");
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
        if (op.resultBlock.loadingImgPath) {
            resultLoadingHTML = Mustache.render(resultLoadingHTML.join(""), op.resultBlock);
            document.getElementById(op.resultBlock.blockId).innerHTML = resultLoadingHTML;
        }

        // Set jsonPath
        var jsonPath = "";
        var dataId = ""
        var dataApi = 0;
        switch (typeof op.searchDataPath) {
            case "string":
                jsonPath = op.searchDataPath;
                break;
            case "object":
                dataId = paramStr.match(/DataId=(\w+)/i);
                if (dataId == null) {
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
        if (/DataAPI=1/i.test(paramStr) || dataApi == 1) {
            dataApi = 1;
            dataApiParam = paramStr.replace(/([\?&])(search=[^+&]+)([^&]*)/, "$1$2");
            jsonPath = (jsonPath.indexOf("?") == -1) ? jsonPath + "?" + dataApiParam
                                                     : jsonPath + "&" + dataApiParam;
        }
        else if (/DataAPI=2/i.test(paramStr) || dataApi == 2) { // No limit
            dataApi = 2;
            dataApiParam = paramStr.replace(/([\?&])(search=[^+&]+)([^&]*)/, "$1$2");
            dataApiParam = dataApiParam.replace(/([\?&])(limit=[^+&]+)/, "");
            jsonPath = (jsonPath.indexOf("?") == -1) ? jsonPath + "?" + dataApiParam
                                                     : jsonPath + "&" + dataApiParam;
        }

        // Bind an event handler to the submit event
        var $form = $this.find("form").eq(0).on("submit", function(e){
            $(this).find("[name='offset']").val(0);
            var $search = $(this).find("[name='search']");
            $search.val($.trim($search.val().replace("　", " ")));
            // var query = $(this).serialize();
        });

        // Set values to Search Form
        var searchWords = [];
        var paramObj = {};
        var offset = 0;
        var limit = 10;
        var _paramAry = paramStr.split(/&|%26/);

        for (var i = -1, n = _paramAry.length; ++i < n;) {
            var key = _paramAry[i].split("=")[0];
            var value = _paramAry[i].split("=")[1];
            value = (value == "+") ? "" : decodeURIComponent(value);
            // Set "paramObj" and "searchWords"
            var keyLower = key.toLowerCase();
            if (value != "" && keyLower == "search") {
                searchWords = value.split("+");
            }
            else if (keyLower == "offset" && value != 0) {
                offset = value;
            }
            else if (keyLower == "limit" && value != 10) {
                limit = value;
            }
            else if (value != "" && keyLower != "flexiblesearch" && keyLower != "dataapi" && keyLower != "limit") {
                paramObj[key] = value;
            }

            // Reproduce search condition
            $("[name='" + key + "']").each(function(){
                var tagname = this.tagName.toLowerCase();
                switch (tagname) {
                    case "input":
                        var type = $(this).attr('type');
                        if (type == "checkbox" && $(this).val() == value) {
                            $(this).prop("checked", true);
                        }
                        else if (type == "radio" && $(this).val() == value) {
                            $(this).prop("checked", true);
                        }
                        else if (type == "text" || type == "search" || type == "hidden") {
                            if (key == "search") {
                                $(this).val(value.replace("+"," "));
                            } else {
                                $(this).val(value);
                            }
                        }
                    break;
                    case "select":
                        $(this).find("option").each(function(){
                            if ($(this).val() == value) {
                                $(this).prop("selected", true);
                            }
                            else if (value == "" && $(this).val() == " ") {
                                $(this).prop("selected", true);
                            }
                        });
                    break;
                } // switch
            }); // each
        } // for

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

                if (dataApi == 0) {
                    cloneItems = $.grep(cloneItems, function(item, i){
                        return jsonAdvancedSearch (item, paramObj, "like");
                    });
                }
                if (dataApi == 0 || dataApi == 2) {
                    cloneItems = $.grep(cloneItems, function(item, i){
                        return jsonKeywordsSearch (item, searchWords);
                    });
                }

                // Set totalResults
                var totalResults = (json.totalResults) ? json.totalResults : cloneItems.length;

                // Result count
                var resultJSON = {
                    "totalResults": totalResults
                }

                // Paginate
                var limitIdx = Number(limit) + Number(offset);
                var currentPage = Math.ceil(offset / limit);
                currentPage++;
                var resultItems = (dataApi == 1) ? cloneItems : $.grep(cloneItems, function(item, i){
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
                        if (this == currentPage) {
                            return ' class="fs-current"';
                        }
                        else {
                            return "";
                        }
                    },
                    paginateId: op.paginate.paginateId
                }
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
                resultMsgHTML = Mustache.render(resultMsgHTML.join(""), resultMsgJSON);
                // Result items
                resultJSON["items"] = resultItems;

                // Show result
                resultItemHTML = Mustache.render(resultItemHTML.join(""), resultJSON);

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

        function jsonAdvancedSearch (obj, paramObj, matchType) {
            var matched = false;
            if (matchType == "like") {
                for (var key in paramObj) {
                    var reg = new RegExp(paramObj[key], "i");
                    if (typeof obj[key] == "string" && reg.test(obj[key])) {
                        return true;
                    }
                    // else if (obj[key] && typeof obj[key] == "object" && obj[key].length) {
                    //     for (var i = -1, n = obj[key].length; ++i < n;) {
                    //         if (reg.test(obj[key])) return true;
                    //     }
                    // }
                }
            }
            else {
                for (var key in paramObj) {
                    if (obj[key] && typeof obj[key] == "string" && obj[key] != paramObj[key]) {
                        return false
                    }
                    // else if (obj[key] && typeof obj[key] == "object" && obj[key].length) {
                    //     for (var i = -1, n = obj[key].length; ++i < n;) {
                    //         return paramObj[key] == obj[key][i];
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
            return (keywordsCount == keywordsMutchCount) ? true : false;
        }
    };
    $.fn.flexibleSearch.defaults = {
        // Path
        searchDataPath: "/flexibleSearch/search_data.js",
        searchDataPathPreload: "/flexibleSearch/search_data.js",

        // Performance
        cache:  true, // I recommend "true".

        // Search Form
        searchForm: {
            html: null,
            action: null,
            searchPlaceholder: "Search words",
            submitBtnText:     "Search"
        },

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
        }
    };
})(jQuery);