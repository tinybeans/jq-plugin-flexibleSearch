/*
 * flexibleSearch.js
 *
 * Copyright (c) Tomohiro Okuwaki (http://www.tinybeans.net/blog/)
 *
 * Since  : 2010-11-12
 * Update : 2013-07-19
 * Version: 1.0.0
 * Comment:
 *
 * You need to include "mustache.js" before "flexibleSearch.js".
 * Maybe... jQuery 1.3.x later
 *
 */

(function($){
    $.fn.flexibleSearch = function(options){
        var op = $.extend({}, $.fn.flexibleSearch.defaults, options);

        // -------------------------------------------------
        //  Initialize
        // -------------------------------------------------
        var $self = this, timestamp,

            // Selector
            ids = {
                "keyword"         : selectorId(op.searchTextId),
                "submit"          : selectorId(op.searchSubmitId),
                "resultTarget"    : selectorId(op.resultTargetId)
            },
            regs = {
                "page"   : new RegExp ("^" + op.vars.page, ""),
                "hidden" : new RegExp("^" + op.vars.refine_hidden + "-",""),
                "result" : new RegExp ("^" + op.vars.result, "")
            },
            // Element
            $elems = {
                "text"    : $("<input id='" + op.searchTextId + "' type='text' />"),
                "submit"  : $("<input id='" + op.searchSubmitId + "' type='button' value='" + op.searchSubmitText + "' />"),
                "loading" : $("<img id='" + op.vars.loading + "' class='" + op.vars.hidden + "' src='" + op.loadingImgPath + "' alt='loading' />"),
                "close"   : $("<p id='" + op.vars.result_close + "' class='" + op.vars.no_page + op.vars.result_close_c + "'><a href='#" + op.vars.result_container + "'>"+ op.closeBtnText +"</a></p>"),
                "result"  : $("<div id='" + op.vars.result_container + "' class='" + op.vars.hidden + " " + op.vars.result_container_c + "'><div id='" + op.vars.result + "' class='" + op.vars.result_c + "'></div></div>")
            },

            // Conditional
            clicked = false,
            cookieEnable = op.cookie,

            // Paginate
            pnCountInPage = new Number(op.paginateCount); // 1ページ当たりのアイテム数

        // -------------------------------------------------
        //  検索ボックス、ボタン、ローディング画像を挿入
        // -------------------------------------------------

        // -------------------------------------------------
        //  検索対象を絞り込むセレクトボックスやinput:hiddenを生成
        // -------------------------------------------------
        //
        //  <div id="fs-refine-container">
        //      <select id="fs-refine-select">
        //          <option id="fs-refine-select-default" selected="selected" value="">すべての項目</option>
        //          <option id="fs-refine-select-foo" value="foo">bar</option>
        //          ...
        //      </select>
        //      <input type="hidden" id="fs-refine-hidden-foo" class='fs-refine-hidden' title='bar' />
        //      ...
        //  </div>
        //
        var options = [], hidden = [], refineContainer = "";
        if (op.selectFields != null) {
            var multiple = (op.multiple) ? " multiple='multiple'": "",
                selectSize = (op.selectFieldsSize > 0) ? " size='" + op.selectFieldsSize + "'": "",
                select = ["<select id='" + op.vars.refine_select + "'" + multiple + selectSize + ">","</select>"];
            options = ["<option id='" + op.vars.refine_select + "-default' selected='selected' value=''>すべての項目</option>"];
            for (var key in op.selectFields) {
                options.push("<option id='" + op.vars.refine_select + "-"+ key +"' value='"+ key +"'>"+ op.selectFields[key] +"</option>");
            }
            options.unshift(select[0]);
            options.push(select[1]);
        }
        if (op.refineFields != null) {
            for (var key in op.refineFields) {
                hidden.push("<input type='hidden' id='" + op.vars.refine_hidden + "-" + key + "' class='" + op.vars.refine_hidden + "' title='" + op.refineFields[key] + "' value='' />");
            }
        }
        if (op.selectFields != null || op.refineFields != null) {
            refineContainer = "<div id='" + op.vars.refine_container + "' class='" + op.vars.refine_container_c + "'>" + options.join("") + hidden.join("") + "</div>";
        }

        // -------------------------------------------------
        //  Setting
        // -------------------------------------------------

        // DOMにテキストボックス、検索ボタン、ローディング画像、絞り込みボックスを追加
        if (op.searchBoxCreate) {
            $self.append($elems.text, $elems.submit, $elems.loading, refineContainer);
        } else {
            $self.append($elems.loading, refineContainer);
        }

        // 絞り込みするボックスを検索窓の後ろへ移動
        $("#" + op.vars.refine_container).insertAfter(ids.keyword);

        // 検索結果を表示するボックスを挿入
        $(ids.resultTarget)[op.resultBoxInsert]($elems.result);

        // DOMから検索ボタンを取得して、JSONの読み込みが完了する前にクリックした場合の処理をバインド
        var $searchSubmit = $(ids.submit).bind("click", preSuccess);

        // -------------------------------------------------
        //  Main
        // -------------------------------------------------
        $.ajax({
            type: "GET",
            cache: op.cache,
            dataType: "json",
            url: op.searchDataPath,
            error: function(){
                $searchSubmit.unbind("click", preSuccess);
            },
            success: function(json){
                $searchSubmit.unbind("click", preSuccess).click(function(e){
                    e.preventDefault();
                    clicked = false;

                    // 現在時刻を取得
                    var now = new Date ();
                    timestamp = now.getTime();
                    setCookie("fs-timestamp",timestamp);
                    // alert("timestampを書き込みました！");
                    location.hash = op.vars.result + "_" + timestamp;
                    this.blur();
                    return false;
                }); // click

                if (clicked) {
                    setTimeout(function(){
                        $searchSubmit.click();
                    }, 500);
                }

                $(ids.keyword).keyup(function(e){
                    var keycode = e.which || e.keyCode;
                    if (keycode == "13") {
                        e.preventDefault();
                        $searchSubmit.click();
                    }
                });

                // -------------------------------------------------
                //  ブラウザの「戻る」「進む」対応 - hashchange.js
                // -------------------------------------------------
                if (pnCountInPage > 0) {
                    $(window).hashchange(function(){
                        var crtHash = location.hash.replace(/#/,"").split("_"),
                            crtLink = crtHash[0].replace(regs.page,op.vars.link),
                            timestamp = getCookie("fs-timestamp");
//if (timestamp != crtHash[1])  console.debug("★timestampが変わった!!");
                        if (regs.result.test(crtHash[0])) {
                            // console.debug("実行１：通常の検索");
                            if (getCookie("fs-keyword" + crtHash[1]) != "") {
                                searchExe(json,crtHash[1],crtHash[0],"read");
                            } else {
                                searchExe(json,crtHash[1],crtHash[0],"write");
                            }
                        } else if (regs.page.test(crtHash[0]) && getCookie("fs-conditions") == "outer") {
                            // console.debug("実行２：別ページから戻ってきたとき");
                            searchExe(json,crtHash[1],crtHash[0],"read");
                            paginate(crtHash,crtLink);
                        } else if (regs.page.test(crtHash[0]) && timestamp != crtHash[1]) {
                            // console.debug("実行３：タイムスタンプが違ったとき");
                            searchExe(json,crtHash[1],crtHash[0],"read");
                            paginate(crtHash,crtLink);
                        } else if (regs.page.test(crtHash[0])) {
                            // console.debug("実行４：ページネートでの遷移");
                            paginate(crtHash,crtLink);
                        } else {
                            // console.debug("実行５：検索以外のページ");
                            $("#" + op.vars.result).html("").parent().addClass(op.vars.hidden);
                            $(ids.resultTarget).children().not("#" + op.vars.result_container).removeClass(op.vars.hidden);
                        }
                    });
                    $(window).hashchange();
                }

            } // success
        }); // ajax


        // -------------------------------------------------
        //  Functions
        // -------------------------------------------------

        function paginate(crtHash,crtLink){
            var $a = $("#" + crtLink);
            // 次へ・前へリンクの表示・非表示
            if ($a.hasClass(op.vars.first_page)) {
                $("#" + op.vars.link_prev).addClass(op.vars.hidden);
                $("#" + op.vars.link_next).removeClass(op.vars.hidden);
            } else if ($a.hasClass(op.vars.last_page)) {
                $("#" + op.vars.link_prev).removeClass(op.vars.hidden);
                $("#" + op.vars.link_next).addClass(op.vars.hidden);
            } else {
                $("#" + op.vars.link_prev + ",#" + op.vars.link_next).removeClass(op.vars.hidden);
            }
            // ページとcurrentクラスの表示・非表示
            $a.addClass(op.vars.link_current).siblings("." + op.vars.link_current).removeClass(op.vars.link_current);
            $("#" + crtHash[0] + "-block").show().siblings().not("." + op.vars.no_page).hide();
            smoothScroll("#" + op.vars.scroll_target);
            return false;
        }

        function searchExe(json,timestamp,searchHash,mode){
            $elems.loading.show();

            // -------------------------------------------------
            //  検索の初期化
            // -------------------------------------------------

            // cookieが有効の場合に前の検索状態を再現する
            if (cookieEnable && mode == "read") {
                // キーワードをセット
                $(ids.keyword).val(getCookie("fs-keyword" + timestamp));
// console.debug("fs-keyword" + timestamp + " : " + getCookie("fs-keyword" + timestamp));

                // 絞り込みhiddenにセット
                var cookieHidden = getCookie("fs-refine-hidden" + timestamp).split(",");
// console.debug("fs-refine-hidden" + timestamp + " : " + getCookie("fs-refine-hidden" + timestamp));
                if (cookieHidden.length > 0) {
                    $("#" + op.vars.refine_container).find("." + op.vars.refine_hidden).val("");
                    for (var i = 0; i < cookieHidden.length; i = i + 2) {
                        $("#" + op.vars.refine_hidden + "-" + cookieHidden[i]).val(cookieHidden[i + 1]);
                    }
                }

                // セレクトフィールドを選択
                var cookieSelect = getCookie("fs-refine-select" + timestamp).split(",");
// console.debug("fs-refine-select" + timestamp + " : " + getCookie("fs-refine-select" + timestamp));
                if (cookieSelect.length > 0) {
                    $("#" + op.vars.refine_select).find("option").removeAttr("selected");
                    for (var i = 0; i < cookieSelect.length; i++) {
                        $("#" + op.vars.refine_select + "-" + cookieSelect[i]).attr("selected","selected");
                    }
                }
            }

            // 元データを複製
            var result = $.grep(json.item, function (){
                return true;
            });


            // 検索フレーズを配列に変換
            var searchPhrase = $(ids.keyword).val(),
                keywords = keywordsToArray(searchPhrase),
                normalSearch = true;

            // 検索ワードをcookieに保存
            if (cookieEnable && mode == "write") {
                // setCookie("fs-keyword", searchPhrase, 1);
                setCookie("fs-keyword" + timestamp, searchPhrase, 1);
            }

            // -------------------------------------------------
            //  input#fs-refine-hidden-fooによる絞り込み検索
            // -------------------------------------------------

            // 値がある絞り込み検索フィールドのオブジェクトを生成
            var refineHidden = [],
                refineCookie = [];
            if (op.refineFields != null) {
                $("#" + op.vars.refine_container + " ." + op.vars.refine_hidden).each(function(){
                    var value = $(this).val();
                    if (value != "") {
                        var id = $(this).attr("id").replace(regs.hidden,"");
                        if (cookieEnable) {
                            refineCookie.push([id,value]);
                        }
                        refineHidden.push({
                            "key" : id, // ex. tag
                            "name" : $(this).attr("title"), // ex. タグ
                            "value" : keywordsToArray(value) // Movable Type
                        });
                    }
                });
                if (cookieEnable && refineHidden.length > 0 && mode == "write") {
                    // setCookie("fs-refine-hidden", refineCookie.join(","));
                    setCookie("fs-refine-hidden" + timestamp, refineCookie.join(","));
                }
            }
            var refineHiddenLength = refineHidden.length;
// console.debug(refineHidden);
            // 絞り込み検索を実行
            if (op.refineFields != null && refineHiddenLength > 0) {
                // 値がある絞り込みフィールドの数だけループする
                for (var a = -1; ++a < refineHiddenLength;) {
                    var refineKeywords = refineHidden[a].value;
                    result = $.grep(result, function(obj, i){
                        return searchCore(obj,refineKeywords,refineHidden[a],true);
                    }, false);
                }
            }


            // -------------------------------------------------
            //  select#fs-refine-selectによるフィールド限定検索
            // -------------------------------------------------

            // 選択されたセレクトフィールドのオブジェクトを生成
            var selectField = [],
                selectCookie = [];
            if (op.selectFields != null) {
                $("#" + op.vars.refine_select).find(":selected").each(function(){
                    var value = $(this).val();
                    if (cookieEnable) {
                        selectCookie.push(value);
                    }
                    if (value != "") {
                        selectField.push({
                            "key"  : value, // ex. title
                            "name" : $(this).text() // ex. タイトル
                        });
                    }
                });
                if (cookieEnable && selectField.length > 0 && mode == "write") {
                    // setCookie("fs-refine-select", selectCookie.join(","), 1);
                    setCookie("fs-refine-select" + timestamp, selectCookie.join(","), 1);
                }
            }

            var selectFieldLength = selectField.length;

            // セレクトフィールド検索を実行
            if (op.selectFields != null && selectFieldLength > 0) {
                // 選択されたセレクトフィールドの数だけループする
                for (var a = -1; ++a < selectFieldLength;) {
                    result = $.grep(result, function(obj, i){
                        return searchCore(obj,keywords,selectField[a],true);
                    }, false);
                }
                normalSearch = false;
            }

            // -------------------------------------------------
            //  通常の検索を実行
            // -------------------------------------------------

            if (normalSearch) {
                result = $.grep(result, function(obj, i){
                    return searchCore(obj,keywords,null,false);
                }, false);
            }

            // -------------------------------------------------
            //  キーワードからiオプションフラグを削除する
            // -------------------------------------------------

            for (var i = -1, n = keywords.length; ++i < n;) {
                keywords[i] = keywords[i].replace(/^_i_/,"");
            }

            // -------------------------------------------------
            //  検索結果の処理
            // -------------------------------------------------
            //
            //  <div id='fs-result-container'>
            //      <div id='fs-result'>
            //          以下のコードで検索結果（resultItem）をここに挿入する
            //      </div>
            //  </div>
            //

            var resultItemInner = [],
                resultItem = [],
                resultLength = result.length; // 最終的な検索結果総数

            // １件ごとのHTMLを検索結果総数分作成しておく
            if (resultLength > 0) {
                for (var i = -1; ++i < resultLength;) {
                    resultItemInner[i] = [
                        "<li>",
                            "<a href='" + result[i]["url"] + "'>" + result[i]["title"] + "</a>",
                        "</li>"
                    ].join("");
                }

                // Paginateしない場合
                //
                //  <ul>
                //      <li><a href="url">title</a></li>
                //      ...
                //  </ul>
                //
                if (pnCountInPage == 0) {
                    resultItem = "<ul>" + resultItemInner.join("") + "</ul>";
                // Paginateする場合
                //
                //  <ul id="fs-page-1-block" class="fs-page">
                //      <li><a href="url">title</a></li>
                //      ...
                //  </ul>
                //  <ul id="fs-page-2-block" class="fs-page">
                //      <li><a href="url">title</a></li>
                //      ...
                //  </ul>
                //  ...
                //  <p id='fs-page-navi'> <!-- このid名内のa要素にクリックイベントをイベントをバインド -->
                //      <a id='fs-link-prev' href='#fs-page-prev' class='fs-link fs-paginate-prev fs-paginate-order fs-hidden'>&lt; 前のn件 | </a>
                //      <a id='fs-link-1' href='#fs-page-1' class='fs-link'>1</a>
                //       | <a id='fs-link-2' href='#fs-page-2' class='fs-link fs-link-current'>2</a>
                //      ...
                //      <a id='fs-link-next' href='#fs-page-next' class='fs-link fs-paginate-next fs-paginate-order'> | 次のn件 &gt;</a>
                //  </p>
                //

                } else {
                    var pnPageCount = Math.ceil(resultLength / pnCountInPage); // ページ数 = 検索結果総数 / 1ページ当たりのアイテム数
                    for (var i = -1; ++i < pnPageCount;) {
                        var p = i + 1,
                            innerhtml = resultItemInner.slice(i * pnCountInPage, i * pnCountInPage + pnCountInPage).join(""),
                            hiddenClass = "";
                        if (i > 0) {
                            hiddenClass = " " + op.vars.hidden;
                        }
                        resultItem.push("<ul id='" + op.vars.page + "-" + p + "-block' class='" + op.vars.page + "" + hiddenClass + "'>" + innerhtml + "</ul>");
                    }

                    // paginateのページリンクを作成
                    // 2ページ以上ある場合は、前後ページへの移動リンクを入れる
                    if (pnPageCount > 1) {
                        var pnNavi = [],
                            separator = op.paginateSeparator;

                        function createPaginate(i,separator) {
                            var classname = "";
                            if (i == 0) {
                                classname = " " + op.vars.link_current + " " + op.vars.first_page;
                                separator = "";
                            } else if (i == pnPageCount - 1) {
                                classname = " " + op.vars.last_page;
                            }
                            return separator + "<a id='" + op.vars.link + "-" + p + "' href='#" + op.vars.page + "-" + p + "' class='" + op.vars.link + classname + "'>" + p + "</a>";
                        }

                        for (var i = -1; ++i < pnPageCount;) {
                            var p = i + 1;
                            pnNavi[i] = createPaginate(i,separator);
                        }

                        pnNavi.unshift("<span id='" + op.vars.link_prev + "' class='" + op.vars.hidden + "'>&lt; <a href='javascript:void(0);' class='" + op.vars.link + " " + op.vars.page_order + "'>前の" + pnCountInPage + "件</a>" + separator + "</span>");
                        pnNavi.push("<span id='" + op.vars.link_next + "'>" + separator + "<a href='javascript:void(0);' class='" + op.vars.link + " " + op.vars.page_order + "'>次の" + pnCountInPage + "件</a> &gt;</span>");

                        pnNavi.unshift("<p id='" + op.vars.page_navi + "' class='" + op.vars.no_page + op.vars.page_navi_c + "'>"); // #fs-page-navi a にクリックイベントをイベントをバインドしている
                        pnNavi.push("</p>");

                        resultItem.push(pnNavi.join(""));
                    }
                }
            }

            // -------------------------------------------------
            //  検索結果メッセージを作成
            // -------------------------------------------------

            var resultInfo = {
                "elem"   : ["<p id='" + op.vars.result_msg + "' class='" + op.vars.no_page  + op.vars.result_msg_c + "'>","<p id='" + op.vars.result_msg_refine + "' class='" + op.vars.no_page + op.vars.result_msg_refine_c + "'>","</p>"],
                "selected" : [],
                "count"  : resultLength
            };

            // セレクトフィールドで選択したフィールド名を抽出
            if (op.selectFields != null && selectFieldLength > 0) {
                for (var i = -1; ++i < selectFieldLength;) {
                    resultInfo.selected[i] = selectField[i].name;
                }
            }

            // メッセージを作成, 開始タグを入れる
            var resultMsg = [resultInfo.elem[0]]; // 開始タグ

            // 選択されたセレクトフィールドがあった場合
            if (selectFieldLength > 0) {
                resultMsg.push("「" + resultInfo.selected.join(", ") + "」フィールドに");
            }
            // 検索に該当するものがあった場合
            if (resultLength > 0) {
                resultMsg.push("「" + keywords.join(", ") + "」が " + resultLength + " 件見つかりました。");

            // 検索結果がゼロだった場合
            } else {
                resultMsg.push("「" + keywords.join(", ") + "」は見つかりませんでした。");
            }

            // キーワード検索結果をタグで閉じる
            resultMsg.push(resultInfo.elem[2]); // 終了タグ

            // 値のある絞り込みフィールドがあった場合
            if (op.refineFields != null && refineHiddenLength > 0) {
                resultMsg.push(resultInfo.elem[1]); // 開始タグ
                for (var i = -1; ++i < refineHiddenLength;) {
                    resultMsg.push(refineHidden[i].name + " : " + refineHidden[i].value.join(", "));
                    if (i < refineHiddenLength - 1) resultMsg.push("<br />");
                }
                resultMsg.push(resultInfo.elem[2]); // 終了タグ
            }

            // -------------------------------------------------
            //  検索結果を表示
            // -------------------------------------------------

            $(ids.resultTarget).children().not("#" + op.vars.result_container).addClass(op.vars.hidden);
            resultItem.unshift(resultMsg.join(""));
            $("#" + op.vars.result)[0].innerHTML = resultItem.join("");

            // 必要であればcloseボタンを設置
            if (op.closeBtnCreate) {
                $("#" + op.vars.result).append($elems.close);
            }
            $("#" + op.vars.result_container)[op.resultEffect]().removeClass(op.vars.hidden);

            $elems.loading.hide();

            // -------------------------------------------------
            //  イベントをバインド
            // -------------------------------------------------

            // Closeボタンをクリックしたとき
            $elems.close.children("a").click(function(){
                $("#" + op.vars.result_container)[op.closeBtnEffect]();
                smoothScroll(this.hash);
            });

            // Paginateのページ数をクリックしたとき
            $("#" + op.vars.page_navi + " a").not("." + op.vars.page_order).click(function(e){
                e.preventDefault();
                location.hash = $(this).attr("href").replace(/.*?#/,"") + "_" + timestamp;
/*                         smoothScroll("#" + op.vars.result_container); */
                return false;
            });

            // Paginateの前へ・次へをクリックしたとき
            $("#" + op.vars.link_prev + " a").click(function(){
                $("#" + op.vars.page_navi + " a." + op.vars.link_current + "").prev().click();
                return false;
            });
            $("#" + op.vars.link_next + " a").click(function(){
                $("#" + op.vars.page_navi + " a." + op.vars.link_current + "").next().click();
                return false;
            });

            // 検索ページに入ったか離れたかを記録しておく
            setCookie("fs-conditions","inner");
            $(window).unload(function(){
                setCookie("fs-conditions","outer");
            });

/*
            if (pnCountInPage > 0) {
                var submitHash =  location.hash.replace(/#/,"");
                if (submitHash == "") {
                    location.hash = op.vars.result + "_" + timestamp;
                } else if (regs.page.test(submitHash) && getCookie("fs-conditions") != "outer") {
                    location.hash = op.vars.result + "_" + timestamp;
                } else if (regs.page.test(submitHash)) {
                    location.hash +=  + "_" + timestamp;
                    $(window).hashchange();
                }
            }
*/
            location.hash = searchHash + "_" + timestamp;
            smoothScroll("#" + op.vars.scroll_target);
// console.debug("click : " + timestamp);
        }

        // jQueryのidセレクタまたは空文字を返す
        function selectorId(str) {
            return (str != "") ? "#" + str: "";
        }

        // search_data.js読み込み完了前の処理
        function preSuccess(e){
            e.preventDefault();
            $elems.loading.show();
            clicked = true;
        }

        // 検索フレーズをキーワード配列にして返す。"foo bar"は１つの語句とし、全角・半角スペースも区別する
        function keywordsToArray(str, separator){
            str = str.toString();
            var esc = str.match(/".*?"/g);
            if (esc) {
                for (var i = -1, n = esc.length; ++i < n;) {
                    // 半角スペースと全角スペースをそれぞれURLエンコード
                    esc[i] = "_i_" + escape(esc[i].replace(/"/g,""));
                }
                str = str.replace(/".*?"/g, "") + " " + esc.join(" ");
            }
            var arry =  str.replace(/([\/\\\.\*\+\?\|\(\)\[\]\{\}\$\^])/g,"\\$1")
                           .replace(/( +|　+)/g, " ")
                           .replace(/^( |　)|( |　)$/g, "")
                           .split(" ");
            separator = separator ? separator : "";
            for (var i = -1, n = arry.length; ++i < n;) {
                arry[i] = separator + unescape(arry[i]) + separator;
            }
            return arry;
        }

        // cookieのセット
        function setCookie(key, val, days){
            var cookie = escape(key) + "=" + escape(val);
            if(days != null){
                var expires = new Date();
                expires.setDate(expires.getDate() + days);
                cookie += ";expires=" + expires.toGMTString();
            }
            document.cookie = cookie;
        }

        // cookieの取得
        function getCookie(key) {
            if(document.cookie){
                var cookies = document.cookie.split(";");
                for(var i=0; i<cookies.length; i++){
                    var cookie = cookies[i].replace(/\s/g,"").split("=");
                    if(cookie[0] == escape(key)){
                        return unescape(cookie[1]);
                    }
                }
            }
            return "";
        }

        // 検索を実行する
        function searchCore(obj,kws,field,refineType){
            var matched = 0;
            for (var i = -1, n = kws.length; ++i < n;) {
                var kw = "";
                if (/^_i_/.test(kws[i])) {
                        kw = new RegExp(kws[i].replace(/^_i_/,""),"");
                } else {
                        kw = new RegExp(kws[i],"i");
                }
                if (refineType) {
                    if (kw.test(obj[field.key])) {
                        matched++;
                    }
                } else {
                    for (var keys in obj) {
                        if (kw.test(obj[keys])) {
                            matched++;
                            break;
                        }
                    }
                }
            }
            return matched == kws.length;
        }

        // スルスルスクロール
        function smoothScroll(selector) {
            var targetElem = $(selector).offset();
            $("html,body").animate({
                scrollTop: targetElem.top,
                scrollLeft: targetElem.left
            }, {
                queue: false,
                duration: 500/*,
                complete: function() {
                    location.hash = hashStr;
                }*/
            });
        }
    };
    $.fn.flexibleSearch.defaults = {

        // Search box
        searchBoxCreate  : true,
        searchTextId     : "fs-search-keyword", // 検索ボックスのid名
        searchSubmitId   : "fs-search-submit", // 検索ボタンのid名
        searchSubmitText : "Search", // 自動生成する場合の検索ボタンのテキスト

        // Close
        closeBtnCreate   : false,
        closeBtnText     : "Close", // 閉じるボタンのテキスト
        closeBtnEffect   : "hide", // hide, fadeOut, slideUp

        // Result
        resultTargetId   : "fs-result-target",
        resultBoxInsert  : "prepend", // prepend or append
        resultEffect     : "show", // show, fadeIn, slideDown

        // Refine search
        selectFields     : null, // 検索対象を絞り込む場合はオブジェクトを指定
                                 // ex. {"title":"タイトル","keyword":"キーワード","body":"本文","more":"追記"}
        selectFieldsSize : 0, // 検索対象を絞り込む場合はオブジェクトを指定
        multiple         : false,
        refineFields     : null, // 検索対象を絞り込む場合はオブジェクトを指定
                                 // ex. {"title":"タイトル","keyword":"キーワード","body":"本文","tag":"タグ"}
        // Path
        loadingImgPath   : "/flexibleSearch/loading.gif",
        searchDataPath   : "/flexibleSearch/search_data.js",

        // Paginate
        paginateCount    : 10, // hashchange.js 必須
        paginateSeparator: " | ",

        // Performance
        cookie           : true, // cookieを利用する場合はtrue
        cache            : false,

        vars             : {
                            "loading"            : "fs-loading",
                            "hidden"             : "fs-hidden",

                            "result_container"   : "fs-result-container",
                            "result_container_c" : "",
                            "result"             : "fs-result",
                            "result_c"           : "",
                            "result_msg"         : "fs-result-msg",
                            "result_msg_c"       : "",
                            "result_msg_refine"  : "fs-result-msg-refine",
                            "result_msg_refine_c": "",
                            "result_close"       : "fs-result-close",
                            "result_close_c"     : "",

                            "refine_container"   : "fs-refine-container",
                            "refine_container_c" : "",
                            "refine_select"      : "fs-refine-select",
                            "refine_hidden"      : "fs-refine-hidden",

                            "page_order"         : "fs-page-order",
                            "page_navi"          : "fs-page-navi",
                            "page_navi_c"        : "",
                            "page"               : "fs-page",
                            "first_page"         : "first-page",
                            "last_page"          : "last-page",
                            "no_page"            : "fs-no-page",

                            "link"               : "fs-link",
                            "link_prev"          : "fs-link-prev",
                            "link_next"          : "fs-link-next",
                            "link_current"       : "fs-link-current",

                            "scroll_target"      : "fs-result-container"
                        }
    };
})(jQuery);