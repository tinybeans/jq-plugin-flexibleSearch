/*
* flexibleSearch.js
*
* Copyright (c) Tomohiro Okuwaki (http://www.tinybeans.net/blog/)
*
* Since  : 2010-11-12
* Update : 2013-12-20
* Version: 2.0.0
* Comment: Please use this with Movable Type :)
*
* You have to include "mustache.js" before "flexibleSearch.js".
* Maybe... jQuery 1.7.x later
*
*/

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
                '<div id="' + op.resultBlockId + '-msg">',
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
                '<div id="{{id}}">',
                    '<ul>',
                        '{{#page}}',
                        '<li{{&current}}><span><a href="#" title="{{.}}">{{.}}</a></span></li>',
                        '{{/page}}',
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
                    params[i].value = $.trim(params[i].value.replace("　", " "));
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
        var paramExistArry = [];
        var advancedSearchObj = {};
        var offset = 0;
        var limit = 10;
        var jsonPath = "";
        var dataId = "";
        var api = false;
        var excludeParams = ["search", "dataId", "offset", "limit"];
        if (op.excludeParams !== null) {
            $.merge(excludeParams, op.excludeParams.toLowerCase().split(","));
        }

        for (var i = -1, n = paramAry.length; ++i < n;) {
            var param = paramAry[i].split("=");
            var key = param[0];
            var value = param[1] || "";
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
                    limit = value;
                    break;
                case "dataId":
                    dataId = value;
                    break;
            }

            // Restore search condition
            if (key === "offset" || key === "limit") {
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
                                $(this).val(value.replace("+"," "));
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
            if (value !== "" ) {
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
                        return jsonAdvancedSearch (item, advancedSearchObj, paramKeyCount, "like");
                    });

                    // Search by keywords
                    cloneItems = $.grep(cloneItems, function (item, i) {
                        return jsonKeywordsSearch (item, searchWords);
                    });

                    // Set resultJSON
                    var limitIdx = Number(limit) + Number(offset);
                    resultJSON.totalResults = cloneItems.length;
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
                var pageList = [];
                for (var i = 0, n = Math.ceil(resultJSON.totalResults / limit); ++i <= n;) {
                    pageList.push(i);
                }
                var paginateJSON = {
                    id: op.paginateId,
                    page: pageList,
                    current: function () {
                        if (this === currentPage) {
                            return ' class="fs-current"';
                        }
                        else {
                            return "";
                        }
                    }
                };
                var paginateHTML = Mustache.render(paginateTmpl, paginateJSON);

                // Result message
                var resultMsgObj = {
                    keywords: searchWords.join(", "),
                    count: resultJSON.totalResults,
                    firstPage: function () {
                        return paginateJSON.page[0];
                    },
                    lastPage: function () {
                        return paginateJSON.page[paginateJSON.page.length-1];
                    },
                    currentPage: currentPage
                };
                var resultMsgHTML = Mustache.render(resultMsgTmpl, resultMsgObj);

                // Show result
                var resultItemHTML = Mustache.render(resultItemTmpl, resultJSON);

                // Search Result Block HTML
                document.getElementById(op.resultBlockId).innerHTML = resultMsgHTML + resultItemHTML + paginateHTML;

                // Bind pageLink() to paginate link
                $("#" + op.paginateId).on("click", "a", function (e) {
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

        //
        //  Search </end>
        // -----------------------------------------------------------------------

        // =======================================================================
        //  Functions <start>
        //

        function jsonAdvancedSearch (obj, advancedSearchObj, paramKeyCount, matchType) {
            var matched = 0;
            if (matchType === "like") {
                for (var key in advancedSearchObj) {
                    var valueArray = advancedSearchObj[key].split(",");
                    for (var i = -1, n = valueArray.length; ++i < n;) {
                        var reg = new RegExp(valueArray[i], "i");
                        if (typeof obj[key] === "undefined" || typeof obj[key] === "string" && reg.test(obj[key])) {
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
                var reg = new RegExp(keywordsArray[i], "i");
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

        //
        //  Functions </end>
        // -----------------------------------------------------------------------
    };
    $.fn.flexibleSearch.defaults = {
        // Path
        searchDataPath: "/flexibleSearch/search.json", // Required!
        searchDataPathPreload: "/flexibleSearch/search.json",

        // Data API
        dataApiDataIds: null, // array
        dataApiParams: null, // object

        // Performance
        cache:  true, // I recommend "true".

        // Search Form
        searchFormCreation: true,
        searchFormHTML: null,
        searchFormAction: "", // Required!
        searchFormInputType: "search",
        searchFormInputPlaceholder: "Search words",
        searchFormSubmitBtnText: "Search",

        // Advanced Search Form
        advancedFormObj: null,

        // Result Block
        loadingImgPath: "/flexibleSearch/loading.gif", // Required!
        loadingImgHTML: null,
        resultBlockId: "fs-result",
        resultMsgTmpl: null,
        resultItemTmpl: null,

        // Paginate
        paginateId: "fs-paginate",
        paginateTmpl: null,
        paginateCount: 10,

        // Submit
        submitAction: function (paramArray) {
            return paramArray;
        },

        // Ajax
        ajaxError: function (jqXHR, textStatus, errorThrown) {
            window.alert(textStatus);
        },

        excludeParams: null, // This is an optional parameter. The comma separated parameter list to exclude from search.
        dummy: false
    };
})(jQuery);