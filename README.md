flexibleSearch.js - jQuery plugin
=========================

あらかじめ用意したJSONファイルを検索することにより超高速JavaScript検索を実現するjQueryプラグインです。
**JSONファイルさえ用意できればどのようなサイトにでも導入することができます。**

CMSの種類、静的なHTMLサイト、動的なPHPサイト、スマホサイトなど、様々なシーンでご利用ください。

なお、Movable Type 6 で使う場合は、Data API にパラメータを渡して検索することもできます。検索は Data API で行い、ページングは flexibleSearch.js の機能を使うという方法が可能になります。

## 前バージョンとの違い

前バージョン（v1系）はURLにハッシュを付け、その検索条件をcookieに保存するなど少し特殊な方法でしたが、本バージョン（v2系）からは通常の検索と同様にURLにパラメータを付けてGETリクエストするような方法で検索します。

したがって、前バージョンではやりにくかった下記の運用が可能です。

 - search.html など検索結果表示ページを用意する通常検索
 - 検索結果ページをブックマークさせる
 - 特定の検索条件のページにリンクを貼る

## 使い方

### ファイルのアップロードとHTMLの準備

サーバー上のドメインルートに下記のファイルをアップロードします。アップロード先を変更する場合は、適宜置き換えてください。

* /flexibleSearch/flexibleSearch.js
* /flexibleSearch/flexibleSearch-config.js
* /flexibleSearch/mustache.js
* /flexibleSearch/loading.gif

mustache.jsはHTMLを簡単に書き出せるJavaScript用のテンプレートエンジンです。

* [janl/mustache.js](https://github.com/janl/mustache.js)

### HTMLの用意

検索結果を表示するHTMLページを用意し、jQuery、mustache.js、flexibleSearch.js、flexibleSearch-config.jsの順番で読み込みます。

ここでは以下の様に、サイトのトップページとしてindex.htmlを、検索結果表示ページとしてsearch.htmlを用意します。

なお、flexibleSearch-config.jsはflexibleSearchを実行するための設定を書くファイルです。flexibleSearch.jsより後ろに位置していれば、scriptタグでHTMLファイルに直接書いても、他のJavaScriptファイルに書いても構いません。

#### index.html

```
<!doctype html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>flexibleSearch.js</title>
</head>
<body>
<h1>flexibleSearch.js</h1>
<h2>あらかじめ用意したJSONファイルを検索することにより超高速JavaScript検索を実現するjQueryプラグインです。</h2>
<div id="search"></div>

<script src="http://code.jquery.com/jquery-1.10.2.min.js"></script>
<script src="/flexibleSearch/mustache.js"></script>
<script src="/flexibleSearch/flexibleSearch.js"></script>
<script src="/flexibleSearch/flexibleSearch-config.js"></script>
</body>
</html>
```

#### search.html

```
<!doctype html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>flexibleSearch.js</title>
</head>
<body>
<h1>検索結果</h1>
<div id="search"></div>
<div id="fs-result"></div>

<script src="http://code.jquery.com/jquery-1.10.2.min.js"></script>
<script src="/flexibleSearch/mustache.js"></script>
<script src="/flexibleSearch/flexibleSearch.js"></script>
<script src="/flexibleSearch/flexibleSearch-config.js"></script>
</body>
</html>
```

### JSONファイルの用意

検索用のJSONファイルを用意します。JSONの書式は以下の通りです。

```
{"items": [
	{"title": "タイトル", "contents": "コンテンツ", ...(省略)... },
	{"title": "タイトル", "contents": "コンテンツ", ...(省略)... }
]}
```

ルートのitemsは必須です。その値に、各記事ごとのオブジェクトが入った配列並べるスタイルになります。

なお、Movable Typeで記事とウェブページに関するJSONを書き出すときのテンプレートは以下の様になります。カスタムフィールド等も検索対象にする場合は適宜加えてください。

#### Movable TypeのインデックステンプレートでJSONを書き出すテンプレート

```
<mt:Unless name="compress" regex_replace="/^\s*\n/gm","">
<mt:SetVar name="items">
<mt:Entries include_blogs="all" lastn="0">
<mt:SetVarBlock name="item{title}"><mt:EntryTitle></mt:SetVarBlock>
<mt:SetVarBlock name="item{url}"><mt:EntryPermalink></mt:SetVarBlock>
<mt:SetVarBlock name="item{body}"><mt:EntryBody remove_html="1" regex_replace="/\n|\t| |　/g",""></mt:SetVarBlock>
<mt:SetVarBlock name="item{more}"><mt:EntryMore remove_html="1" regex_replace="/\n|\t| |　/g",""></mt:SetVarBlock>
<mt:SetVarBlock name="item{tag}">,<mt:EntryTags glue=","><mt:TagName regex_replace="/ |　/g","%20"></mt:EntryTags>,</mt:SetVarBlock>
<mt:SetVarBlock name="item{category}"><mt:EntryCategories glue=","><mt:CategoryLabel></mt:EntryCategories></mt:SetVarBlock>
<mt:SetVarBlock name="items" function="push"><mt:var name="item" to_json="1"></mt:SetVarBlock>
</mt:Entries>
<mt:Pages include_blogs="all" lastn="0">
<mt:SetVarBlock name="item{title}"><mt:PageTitle></mt:SetVarBlock>
<mt:SetVarBlock name="item{url}"><mt:PagePermalink></mt:SetVarBlock>
<mt:SetVarBlock name="item{body}"><mt:PageBody remove_html="1" regex_replace="/\n|\t| |　/g",""></mt:SetVarBlock>
<mt:SetVarBlock name="item{more}"><mt:PageMore remove_html="1" regex_replace="/\n|\t| |　",""></mt:SetVarBlock>
<mt:SetVarBlock name="item{tag}">,<mt:PageTags glue=","><mt:TagName regex_replace="/ |　/g","%20"></mt:PageTags>,</mt:SetVarBlock>
<mt:SetVarBlock name="item{folder}"><mt:PageFolder><mt:FolderLabel></mt:PageFolder></mt:SetVarBlock>
<mt:SetVarBlock name="items" function="push"><mt:var name="item" to_json="1"></mt:SetVarBlock>
</mt:Pages>
{"items":[
<mt:Loop name="items" glue=","><mt:Var name="__value__"></mt:Loop>
]}
</mt:Unless>
```

検索対象とするブログを特定する場合は `mt:Entries` タグや `mt:Pages` タグの `include_blogs` モディファイアを調整してください（ [include_blogs](http://www.movabletype.jp/documentation/mt5/design/multiblog/tags.html#blogids) ）。

### flexibleSearchの実行

flexibleSearch-config.jsにオプション等を記述してflexibleSearchを実行します。flexibleSearchはform要素を包含するdiv等のブロック要素に適用します。

必須のオプションはケースによって異なりますが、searchDataPath、searchFormAction、loadingImgPathは指定しておくと良いでしょう。  
各オプションの説明は後述します。

```
jQuery(function($) {
    $('#search').flexibleSearch({
        searchDataPath: "/flexibleSearch/search.json",
        searchFormAction: "/flexibleSearch/search.html",
        loadingImgPath: "/flexibleSearch/loading.gif",
        dummy: null
    });
});
```

flexibleSearch-config.jsに書く内容は以下のとおりです。flexibleSearch-config.jsには使用できるオプションがコメントアウトされているので、必要に応じてコメントを外して設定を変更してください。

dummy: null は不要ですが、最後のカンマを入れたり入れなかったり変更するのが面倒な場合は最終行に入れておくと良いかもしれません :-)

設定できるオプションは後述します。

## <a name="sort"></a>検索結果のソート <span style="font-size: 0.7em;">(version added: 2.2.0)</span>

検索結果の並び順は、デフォルトの状態だとJSONの並び順に準拠します。

この並び順を``sortBy``、``sortOrder``、``sortType``の3つのURLパラメータを使って並べ替えることができます。この機能はv2.2.0で追加されました。

### sortBy

並び替えの基準となるキーを指定します。並べ替える場合は必須です。

### sortOrder

並び順を``ascend``（昇順）または``descend``（降順）で指定します。初期値は``descend``です。

### sortType

数値として並び変える場合は``numeric``を、文字列として並び変える場合は``string``を指定します。初期値は``string``です。

## オプション

指定出来るオプションは以下の通りです。詳細は後述します。  
なお、下記の説明に出てくる「Data API」とは、Movable Type 6 から実装された [Data API](http://www.movabletype.jp/documentation/mt6/developer/movable-type-api.html) のことを指します。Movable Type 以外で flexibleSearch.js を利用する場合は読み飛ばしていただいて構いません。

| オプション名 | 設定値 | 初期値 | 説明 |
|:--|:--|:--|:--|
| [limit](#limit) | Number | null | limit オプションを指定すると URL の limit パラメータは無視され、ここで指定した値が常に優先されます。<br>(Add: v2.2.0)  |
| [searchDataPath](#searchDataPath) | String<br>Object | "/flexibleSearch/search.json"  | flexibleSearchで検索対象とするJSONファイルのパスを指定します。文字列で１つ指定する方法と、オブジェクトで複数指定する方法があります。 |
| [searchDataPathPreload](#searchDataPathPreload) | String<br>Array<br>Object | "/flexibleSearch/search.json" | 検索実行ページ以外で、検索対象とするJSONファイルをあらかじめ読み込んでおきキャッシュすることができます。文字列で１つ指定する方法と、配列またはオブジェクトで複数指定する方法があります。 |
| [dataApiDataIds](#dataApiDataIds) | String | null | MTのData APIを利用するdataIdを指定します。複数ある場合はカンマ区切りで指定します。dataIdとは、searchDataPathオプションをオブジェクトで指定した場合のプロパティ名のことを指します。 |
| [dataApiParams](#dataApiParams) | Object | null | Data APIを利用する場合に、検索フォームとは別にエンドポイントに渡すパラメータを設定できます。 |
| [cache](#cache) | Boolean |  true | JSONファイルをキャッシュするかどうかを指定します。 |
| [searchFormCreation](#searchFormCreation) | Boolean | true | 検索フォームをJavaScriptで書き出すかどうかを設定します。ここでfalesを設定すれば、HTMLに書かれた静的なフォームを利用することができます。ただし、必須のname項目があります。 |
| [searchFormHTML](#searchFormHTML) | String | null | JavaScriptで書き出す検索フォームをHTML文字列で設定する場合に使用します。 |
| [searchFormAction](#searchFormAction) | String | (空文字) | form要素のaction属性を指定します。検索結果ページを用意する場合は必ず指定してください。 |
| [searchFormInputType](#searchFormInputType) | String | "search" | form要素のキーワード入力欄のtype属性を指定します。 |
| [searchFormInputPlaceholder](#searchFormInputPlaceholder) | String | "Search words" | form要素のキーワード入力欄に入れるplaceholder属性を指定します。 |
| [searchFormSubmitBtnText](#searchFormSubmitBtnText) | String | "Search" | form要素の検索実行ボタンのテキストを指定します。 |
| [advancedFormObj](#advancedFormObj) | String | null | advancedFormObjオプションにオブジェクトを設定することでキーワード入力欄以外のフォーム要素を簡単に作成できます。 |
| [advancedSearchCond](#advancedSearchCond) | String | "OR" | searchパラメータ以外の検索項目の検索条件を"OR"検索か"AND"検索か指定します。 |
| [loadingImgPath](#loadingImgPath) | String | "/flexibleSearch/loading.gif" | ローディング画像のパスを指定します。 |
| [loadingImgHTML](#loadingImgHTML) | String | null | ローディング画像を直接HTMLで指定することができます。このオプションを指定した場合はloadingImgPathオプションの設定は無視されます。 |
| [resultBlockId](#resultBlockId) | String | "fs-result" | 検索結果やローディング画像入れるブロック要素のIDを指定します。 |
| [resultItemTmpl](#resultItemTmpl) | String | null | 検索結果を表示するMustacheテンプレートです。  |
| [resultMsgId](#resultMsgId) | String | null | 検索結果のメッセージを表示する要素のidを指定します。<br>(Add: v2.2.0)  |
| [resultMsgClassName](#resultMsgClassName) | String | "fs-result-msg" | 検索結果のメッセージを表示する要素のclass名を指定します。<br>(Add: v2.2.0)  |
| [resultMsgTmpl](#resultMsgTmpl) | String | null | 検索結果のメッセージを表示するMustacheテンプレートです。 |
| [resultMsgInsertMethods](#resultMsgInsertMethods) | Array | null | 検索結果のメッセージを表示する要素のセレクタと挿入方法を指定します。<br>(Add: v2.2.0)  |
| [resultMetaTitleTmpl](#resultMetaTitleTmpl) | String | null | 検索結果ページのmeta title用のMustacheテンプレートです。<br>(Add: v2.2.0)  |
| [paginateId](#paginateId) | String | null | 検索結果のページ送りを表示するブロックのIDを指定します。 |
| [paginateClassName](#paginateClassName) | String | "fs-paginate" | 検索結果のページ送りを表示するブロックのclass名を指定します。<br>(Add: v2.2.0)  |
| [paginateTmpl](#paginateTmpl) | String | null | 検索結果が複数ページにわたる場合のページ送りを表示するMustacheテンプレートです。 |
| [paginateCount](#paginateCount) | Number | 10 | 1ページに表示する件数をしていします。この値がlimitパラメータになります。 |
| [hidePageNumber](#hidePageNumber) | Boolean | false | trueを設定するとページ分割のページ番号を非表示にします。<br>(Add: v2.2.0) |
| [showTurnPage](#showTurnPage) | Boolean | true | falseを設定するとページ分割の「Prev」「Next」のページ送りを非表示にします。<br>(Add: v2.2.0)  |
| [prevPageText](#prevPageText) | String | "Prev" | ページ分割の前のページへ送るリンクのテキストを指定します。<br>(Add: v2.2.0)  |
| [nextPageText](#nextPageText) | String | "Next" | ページ分割の次のページへ送るリンクのテキストを指定します。<br>(Add: v2.2.0)  |
| [maxPageCount](#maxPageCount) | Number | 10 | ページ分割時に表示する最大ページ数を指定します。例えば、maxPageCountオプションを10に設定して、検索結果が全部で30ページになったとすると、そのうちの、現在のページを中心にして最大何ページ表示するか、という意味です。<br>(Add: v2.2.0)  |
| [paginateInsertMethods](#paginateInsertMethods) | Array | null | ページ分割ナビゲーションを表示する要素のセレクタと挿入方法を指定します。<br>(Add: v2.2.0)  |
| [submitAction](#submitAction) | Function | function (paramArray) { return paramArray; } | フォームがsubmitされ、ページが遷移する前に呼ばれる関数を設定できます。この関数にはシリアライズされたパラメータの配列paramArrayが渡されます。 |
| [ajaxError](#ajaxError) | Function | function (jqXHR, textStatus, errorThrown) { window.alert(textStatus); } | jQuery.ajaxでエラーが起きたときに呼ばれる関数を設定できます。 |
| [customSearch](#customSearch) | Function | null | 独自の検索ロジックを追加することができます。<br>(Add: v2.2.0)  |
| [modifyResultJSON](#modifyResultJSON) | Function | null | 検索結果をHTMLに出力する直前にJSONを加工することができます。<br>(Add: v2.2.0)  |
| [modifyResultMsgHTML](#modifyResultMsgHTML) | Function | null | 検索結果メッセージのHTMLを加工することができます。 |
| [modifyResultItemHTML](#modifyResultItemHTML) | Function | null | 検索結果一覧のHTMLを加工することができます。 |
| [modifyPaginateHTML](#modifyPaginateHTML) | Function | null | ページ分割のHTMLを加工することができます。 |
| [resultComplete](#resultComplete) | Function | null | 検索結果をページのDOMに挿入した後に呼ばれる関数を設定します。 |
| [excludeParams](#excludeParams) | String | null | パラメータのうち検索から除外する項目をカンマ区切りで指定します。 |

### <a name="limit"></a>limit <span style="font-size: 0.7em;">(version added: 2.2.0)</span>

limitオプションを指定するとURLのlimitパラメータは無視され、ここで指定した値が常に優先されます。このオプションはv2.2.0で追加されました。

searchFormCreationオプションがtrueのときに書き出されるフォームのlimit値、つまりlimitパラメータの値は [paginateCount](#paginateCount) で指定してください。

**設定例**

```
limit: 10,
```

### <a name="searchDataPath"></a>searchDataPath

flexibleSearchで検索対象とするJSONファイルのパスを指定します。文字列で１つ指定する方法と、オブジェクトで複数指定する方法があります。

**設定例**

```
loadingImgPath: "/flexibleSearch/loading.gif",

または

searchDataPath: {
    static: "/flexibleSearch/search_data.js",
    entries: "/mt/mt-data-api.cgi/v1/sites/1/entries"
},
```

searchDataPathオプションをオブジェクトで指定した場合は、どのJSONを検索対象とするのかをdataIdパラメータで指定します。

例えば、上記の例で言えば、下記のようなラジオボタンを設置して検索対象を切り替える方法があります。

```
<p>
    <label><input type="radio" name="dataId" value="static">Search static</label>
    <label><input type="radio" name="dataId" value="entries">Search entries</label>
</p>
```

例えば検索カテゴリを必ず選択させるといった検索方法の場合、カテゴリごとにJSONファイルを用意して、dataIdパラメータで検索対象のJSONを切り替えれば、1つのJSONファイルのファイルサイズを減らすことができます。

### <a name="searchDataPathPreload"></a>searchDataPathPreload

検索実行ページ以外で、検索対象とするJSONファイルをあらかじめ読み込んでおきキャッシュすることができます。文字列で１つ指定する方法と、配列またはオブジェクトで複数指定する方法があります。

**設定例**

```
loadingImgPath: "/flexibleSearch/loading.gif",

または

searchDataPath: [
    "/flexibleSearch/search_data.js",
    "/mt/mt-data-api.cgi/v1/sites/1/entries"
],

または

searchDataPath: {
    static: "/flexibleSearch/search_data.js",
    entries: "/mt/mt-data-api.cgi/v1/sites/1/entries"
},
```

### <a name="dataApiDataIds"></a>dataApiDataIds

MTのData APIを利用するdataIdを指定します。複数ある場合はカンマ区切りで指定します。dataIdとは、searchDataPathオプションをオブジェクトで指定した場合のプロパティ名のことを指します。

**設定例**

```
dataApiDataIds: "entries,categories",
```

### <a name="dataApiParams"></a>dataApiParams

Data APIを利用する場合に、検索フォームとは別にエンドポイントに渡すパラメータを設定できます。

**設定例**

```
dataApiParams: {
    fields: "title,keywords",
    searchFields: "title,body,keywords"
},
```

### <a name="cache"></a>cache

JSONファイルをキャッシュするかどうかを指定します。

**設定例**

```
cache: false,
```

### <a name="searchFormCreation"></a>searchFormCreation

検索フォームをJavaScriptで書き出すかどうかを設定します。ここでfalesを設定すれば、HTMLに書かれた静的なフォームを利用することができます。ただし、以下のname値を持つ要素は必須です。

* search
* offset
* limit（limitオプションを指定した場合は不要）

**設定例**

```
searchFormCreation: false,
```

### <a name="searchFormHTML"></a>searchFormHTML

JavaScriptで書き出す検索フォームをHTML文字列で設定する場合に使用します。

**設定例**

```
searchFormHTML: [
    '<form action="/search.html" method="GET">',
        '<input type="hidden" name="offset" value="0">',
        '<input type="hidden" name="limit" value="10">',
        '<input type="text" name="search" value="">',
        '<input type="radio" name="category" value="cat1">',
        '<input type="radio" name="category" value="cat2">',
        '<input type="submit" value="Search">',
    '</form>'
].join(""),
```

### <a name="searchFormAction"></a>searchFormAction

form要素のaction属性を指定します。検索結果ページを用意する場合は必ず指定してください。

**設定例**

```
searchFormAction: "search.html",
```

### <a name="searchFormInputType"></a>searchFormInputType

form要素のキーワード入力欄のtype属性を指定します。

**設定例**

```
searchFormInputType: "text",
```

### <a name="searchFormInputPlaceholder"></a>searchFormInputPlaceholder

form要素のキーワード入力欄に入れるplaceholder属性を指定します。

**設定例**

```
searchFormInputPlaceholder: "キーワードを入力",
```

### <a name="searchFormSubmitBtnText"></a>searchFormSubmitBtnText

form要素の検索実行ボタンのテキストを指定します。

**設定例**

```
searchFormSubmitBtnText: "検索",
```

### <a name="advancedFormObj"></a>advancedFormObj

searchFormCreationオプションがtrueのとき、advancedFormObjオプションにオブジェクトを設定することでキーワード入力欄以外のフォーム要素を作成できます。

このオプションでは以下の要素を書き出すことができます。

* input:hidden
* input:text
* input:checkbox
* input:radio
* select

基本的な設定方法は以下の書式になります。

```
advancedFormObj: {
    要素タイプ: [
        {属性名: "属性値", 属性名: "属性値" ... },
        ...（いくつでも設定できます）
    ]
}
```

属性値を空にするか、属性名の指定をしないものは、その属性自体が書き出されなくなります。

詳細は下記の個別項目を参照してください。なお、「HTML出力例」は実際には改行なしの1行になります。

#### input:hidden要素

**設定例**

```
advancedFormObj: {
    hidden: [
        {id: "id値", name: "name値", value: "value値"},
        ...（いくつでも設定できます）
    ]
}
```

**HTML出力例**

```
<div class="fs-advanced-hidden" style="display:none;">
    <input type="hidden" id="id値" name="name値" value="value値">
</div>
```

#### input:text要素

**設定例**

```
advancedFormObj: {
    text: [
        {id: "id値", name: "name値", value: "value値", placeholder: "placeholder値", label: "label値"},
        {id: "id値", name: "name値", value: "value値", placeholder: "", label: ""},
        ...（いくつでも設定できます）
    ]
}
```

**HTML出力例**

```
<div class="fs-advanced-text">
    <label id="id値-label" for="name値" class="fs-text fs-name値">
        <input id="id値" type="text" name="name値" value="value値" placeholder="placeholder値">
        label値
    </label>
    <input id="id値" type="text" name="name値" value="value値">
</div>
```

#### input:checkbox要素

**設定例**

```
advancedFormObj: {
    checkbox: [
        {id: "id値", name: "name値", value: "value値", label: "label値"},
        ...（いくつでも設定できます）
    ]
}
```

**HTML出力例**

```
<div class="fs-advanced-checkbox">
    <label id="id値-label" for="name値" class="fs-checkbox fs-name値">
        <input type="checkbox" id="id値" name="name値" value="value値">
        label値
    </label>
</div>
```

#### input:radio要素

**設定例**

```
advancedFormObj: {
    radio: [
        {id: "id値", name: "name値", value: "value値", label: "label値"},
        ...（いくつでも設定できます）
    ]
}
```

**HTML出力例**

```
<div class="fs-advanced-radio">
    <label id="id値-label" for="name値" class="fs-radio fs-name値">
        <input type="radio" id="id値" name="name値" value="value値">
        label値
    </label>
</div>
```

#### select要素

**設定例**

```
advancedFormObj: {
    select: [
        {id: "id値", name: "name値", size: "", multiple: "", option: [
            {label: "選択してください", value: ""},
            {label: "opt_label1", value: "opt_value1"},
            {label: "opt_label2", value: "opt_value2"},
            {label: "opt_label3", value: "opt_value3"}
        ]},
        ...（いくつでも設定できます）
    ]
}
```

**HTML出力例**

```
<div class="fs-advanced-select">
    <select id="id値" for="name値" class="fs-select fs-name値">
        <option value="">選択してください</option>
        <option value="opt_value1">opt_label1</option>
        <option value="opt_value2">opt_label2</option>
        <option value="opt_value3">opt_label3</option>
    </select>
</div>
```

**advancedFormObj全体の設定例**

```
advancedFormObj: {
    hidden: [
        {id: "id値", name: "name値1", value: "value値"}
    ],
    text: [
        {id: "id値1", name: "name値2", value: "value値1", placeholder: "placeholder値1", label: "label値1"},
        {id: "id値2", name: "name値3", value: "value値2", placeholder: "placeholder値2", label: "label値2"}
    ],
    checkbox: [
        {id: "id値1", name: "name値4", value: "value値1", label: "label値1"},
        {id: "id値2", name: "name値5", value: "value値2", label: "label値2"}
    ],
    radio: [
        {id: "id値1", name: "name値6", value: "value値1", label: "label値1"},
        {id: "id値2", name: "name値6", value: "value値2", label: "label値2"}
    ],
    select: [
        {id: "id値1", name: "name値7", size: "", multiple: "", option: [
            {label: "選択してください", value: ""},
            {label: "opt_label1", value: "opt_value1"},
            {label: "opt_label2", value: "opt_value2"},
            {label: "opt_label3", value: "opt_value3"}
        ]},
        {id: "id値2", name: "name値8", size: "3", multiple: "multiple", option: [
            {label: "opt_label1", value: "opt_value1"},
            {label: "opt_label2", value: "opt_value2"},
            {label: "opt_label3", value: "opt_value3"}
        ]}
    ]
},
```

### <a name="advancedSearchCond"></a>advancedSearchCond

searchパラメータ以外の検索項目の検索条件を"OR"検索か"AND"検索か指定します。

**設定例**

```
advancedSearchCond: "AND",
```

### <a name="loadingImgPath"></a>loadingImgPath

ローディング画像のパスを指定します。

**設定例**

```
loadingImgPath: "/loading.gif",
```

loadingImgPathを指定すると、自動的に次のようなHTMLが検索結果表示ブロックの中に書き出されます。  
なお、検索結果表示ブロックの中身はappendやprependではなくinnerHTMLでまるごと書き換わるので注意してください。

```
<span class="fs-loading"></span>
```

このHTMLを変更する場合は、次のloadingImgHTMLオプションを指定してください。

### <a name="loadingImgHTML"></a>loadingImgHTML

ローディング画像を直接HTMLで指定することができます。このオプションを指定した場合はloadingImgPathオプションの設定は無視されます。

**設定例**

```
loadingImgHTML: '<img src="loading.gif" alt="読み込み中">',
```

### <a name="resultBlockId"></a>resultBlockId

検索結果やローディング画像入れるブロック要素のIDを指定します。

**設定例**

```
resultBlockId: "contents-inner",
```

### <a name="resultItemTmpl"></a>resultItemTmpl

検索結果を表示するMustacheテンプレートです。このオプションを指定しない場合は、次のテンプレートが使用されます。

```
<div id="fs-result-items">
    <ul>
    {{#items}}
        <li>{{&title}}</li>
    {{/items}}
    </ul>
</div>
```

{{#items}}〜{{/items}}で囲まれている部分が検索結果件の数だけループし、その中の{{項目名}}の部分はitemsのプロパティ名を指定します。

Mustacheテンプレートの書き方は [janl/mustache.js](https://github.com/janl/mustache.js) を参照してください。

**設定例**

```
resultItemTmpl: [
	'<div id="' + op.resultBlockId + '-items">',
    	'<ul>',
    	'{{#items}}',
        	'<li><a href="{{permalink}}">{{&title}}</a></li>',
	    '{{/items}}',
    	'</ul>',
	'</div>'
].join(""),
```

### <a name="resultMsgId"></a>resultMsgId <span style="font-size: 0.7em;">(version added: 2.2.0)</span>

検索結果のメッセージをデフォルトのテンプレートで利用する場合のdiv要素のid名を指定します。このオプションはv2.2.0で追加されました。

もしそれ以前のバージョンのデフォルトテンプレートと揃えたい場合は、このオプションに `fs-result-msg` を指定してください。

**設定例**

```
resultMsgId: "fs-result-msg",
```

### <a name="resultMsgClassName"></a>resultMsgClassName <span style="font-size: 0.7em;">(version added: 2.2.0)</span>

検索結果のメッセージをデフォルトのテンプレートで利用する場合のdiv要素のclass名を指定します。このオプションはv2.2.0で追加されました。

**設定例**

```
resultMsgClassName: "fs-result-msg",
```

### <a name="resultMsgTmpl"></a>resultMsgTmpl

検索結果の上部に表示するメッセージのMustacheテンプレートです。このオプションを指定しない場合は、次のテンプレートが使用されます。

```
<div{{#id}} id="{{id}}"{{/id}}{{#classname}} class="{{classname}}"{{/classname}}>
    <p>
        {{#keywords}}「{{keywords}}」が {{/keywords}}
        {{#count}}{{count}} 件見つかりました。{{/count}}
        {{^count}}見つかりませんでした。{{/count}}
        {{#count}}（{{lastPage}} ページ中 {{currentPage}} ページ目を表示）{{/count}}
    </p>
</div>
```

{{項目名}}の部分は適宜該当する項目に置き換わりますので、resultMsgTmplオプションを指定する場合は、上記を参考に{{項目名}}を入れてください。

**設定例**

```
resultMsgTmpl: [
    '<div id="fs-result-msg">',
        '<p>{{#keywords}}「{{keywords}}」が {{/keywords}}{{count}} 件見つかりました。',
        '（{{firstPage}}〜{{lastPage}} ページ中 {{currentPage}} ページ目を表示）</p>',
    '</div>'
].join(""),
```

Mustacheテンプレートの書き方は[janl/mustache.js](https://github.com/janl/mustache.js)を参照してください。

### <a name="resultMsgInsertMethods"></a>resultMsgInsertMethods <span style="font-size: 0.7em;">(version added: 2.2.0)</span>

検索結果のメッセージを表示する場所を指定します。このオプションはv2.2.0で追加されました。

このオプションを指定しない場合は、検索結果一覧の上部にメッセージが表示されます。

このオプションでは、下記の設定例のようにselecterとmethodの2つのキーを持つオブジェクトで指定します。methodに指定出来るのは、jQueryのappend、prependなど、DOMに挿入したりHTMLを書き換えたりするメソッドです。

下記のようにページの上部と下部など、異なるセレクタで複数箇所に挿入することもできます。

**設定例**

```
resultMsgInsertMethods: [
    {
        "selector": "#page-title",
        "method": "html"
    },
    {
        "selector": "div.search-message",
        "method": "append"
    }
],
```

### <a name="resultMetaTitleTmpl"></a>resultMetaTitleTmpl <span style="font-size: 0.7em;">(version added: 2.2.0)</span>

検索結果ページのmeta title用のMustacheテンプレートです。このオプションを指定しない場合は下記のテンプレートが使用されます（実際には1行になります）。このオプションはv2.2.0で追加されました。

```
{{#keywordArray}}{{.}} {{/keywordArray}}
{{#count}} {{count}}件{{/count}}
{{#count}} {{currentPage}}/{{lastPage}}{{/count}}
{{#metaTitle}} | {{metaTitle}}{{/metaTitle}}
```

このテンプレートで利用している `{{#keywordArray}}{{.}} {{/keywordArray}}` については、
キーワードが複数のときは `{{.}}` 部分にキーワードが入り、 `{{#keywordArray}}` と `{{/keywordArray}}` の内部がキーワード数分繰り返されます。

また `{{#keywords}}{{keywords}}{{/keywords}}` とすると、キーワードが複数のときは `, ` でキーワードが区切られたテキストになります。

**設定例**

```
resultMetaTitleTmpl: "{{#keywordArray}}{{.}} {{/keywordArray}}の検索結果",
```

### <a name="paginateId"></a>paginateId

検索結果のページ送りを表示するブロックのIDを指定します。

**設定例**

```
paginateId: "paginate",
```

### <a name="paginateClassName"></a>paginateClassName <span style="font-size: 0.7em;">(version added: 2.2.0)</span>

検索結果のページ送りを表示するブロックのclass名を指定します。このオプションはv2.2.0で追加されました。

**設定例**

```
paginateClassName: "fs-paginate",
```

### <a name="paginateTmpl"></a>paginateTmpl

検索結果が複数ページにわたる場合のページ送りを表示するMustacheテンプレートです。このオプションを指定しない場合は、次のテンプレートが使用されます。

```
<div{{#id}} id="{{id}}"{{/id}}{{#classname}} class="{{classname}}"{{/classname}}>
    <ul>
        {{#showTurnPage}}
        {{#exceptFirst}}
        <li class="fs-prev"><span><a class="fs-prev-link fs-turn-page-link" href="#" title="{{prevPageText}}">{{prevPageText}}</a></span></li>
        {{/exceptFirst}}
        {{/showTurnPage}}

        {{#page}}
        {{#checkRange}}
        <li class="{{current}}"{{#hidePageNumber}} style="display:none;"{{/hidePageNumber}}><span><a class="fs-page-link {{currentLink}}" href="#" title="{{pageNumber}}">{{pageNumber}}</a></span></li>
        {{/checkRange}}
        {{/page}}

        {{#showTurnPage}}
        {{#exceptLast}}
        <li class="fs-next"><span><a class="fs-next-link fs-turn-page-link" href="#" title="{{nextPageText}}">{{nextPageText}}</a></span></li>
        {{/exceptLast}}
        {{/showTurnPage}}
    </ul>
</div>
```

{{#page}}〜{{/page}}で囲まれている内部がページ数分ループします。{{current}}はカレントページの時に``fs-current``が出力されます。{{pageNumber}}がページ番号です。paginateHTMLオプションでHTMLを指定する場合は、上記HTMLと同様に{{項目名}}の各項目を入れてください。

テンプレートの書き方は[janl/mustache.js](https://github.com/janl/mustache.js)を参照してください。

**設定例**

```
paginateTmpl: [
    '<div id="fs-paginate">',
        '<ul>',
            '{{#page}}',
            '<li{{&current}}><a href="#" title="{{.}}">{{.}}</a></li>',
            '{{/page}}',
        '</ul>',
    '</div>'
].join(""),
```

### <a name="paginateCount"></a>paginateCount

1ページに表示する件数をしていします。この値がlimitパラメータになります。

前述した [limit](#limit) オプションに値を設定した場合は、このpaginateCountオプションは無視されます。

**設定例**

```
paginateCount: 20,
```

### <a name="hidePageNumber"></a>hidePageNumber <span style="font-size: 0.7em;">(version added: 2.2.0)</span>

trueを設定するとページ分割のページ番号を非表示にします。このオプションはv2.2.0で追加されました。

**設定例**

```
hidePageNumber: true,
```

### <a name="showTurnPage"></a>showTurnPage <span style="font-size: 0.7em;">(version added: 2.2.0)</span>

falseを設定するとページ分割の「前へ」「次へ」のページ送りを非表示にします。このオプションはv2.2.0で追加されました。

**設定例**

```
showTurnPage: false,
```

### <a name="prevPageText"></a>prevPageText <span style="font-size: 0.7em;">(version added: 2.2.0)</span>

ページ分割の前のページへ送るリンクのテキストを指定します。このオプションはv2.2.0で追加されました。

**設定例**

```
prevPageText: "前のページへ",
```

### <a name="nextPageText"></a>nextPageText <span style="font-size: 0.7em;">(version added: 2.2.0)</span>

ページ分割の次のページへ送るリンクのテキストを指定します。このオプションはv2.2.0で追加されました。

**設定例**

```
nextPageText: "Next",
```
### <a name="maxPageCount"></a>maxPageCount <span style="font-size: 0.7em;">(version added: 2.2.0)</span>

ページ分割時に表示する最大ページ数を指定します。このオプションはv2.2.0で追加されました。

例えば、maxPageCountオプションを10に設定して、検索結果が全部で30ページになったとすると、そのうちの、現在のページを中心にして最大何ページ表示するか、という意味です。

**設定例**

```
maxPageCount: 5,
```

### <a name="paginateInsertMethods"></a>paginateInsertMethods <span style="font-size: 0.7em;">(version added: 2.2.0)</span>

ページ分割ナビゲーションを表示する要素のセレクタと挿入方法を指定します。このオプションはv2.2.0で追加されました。

このオプションを指定しない場合は、検索結果一覧の下部にナビゲーションが表示されます。

このオプションでは、下記の設定例のようにselecterとmethodの2つのキーを持つオブジェクトで指定します。methodに指定出来るのは、jQueryのappend、prependなど、DOMに挿入したりHTMLを書き換えたりするメソッドです。

下記のようにページの上部と下部など、異なるセレクタで複数箇所に挿入することもできます。

**設定例**

```
paginateInsertMethods: [
    {
        "selector": "#content-header",
        "method": "append"
    },
    {
        "selector": "div.paginate",
        "method": "html"
    }
],
```

### <a name="submitAction"></a>submitAction

フォームがsubmitされ、ページが遷移する前に呼ばれる関数を設定できます。この関数にはシリアライズされたパラメータの配列paramArrayが渡されます。

**設定例**

```
submitAction: function (paramArray) {
    var dataapi = false, l = paramArray.length;
    for (var i = 0; i < l; i++) {
        if (paramArray[i].name === "category" && paramArray[i].value === "movabletype") {
            dataapi = true;
        }
    }
    if (dataapi) {
        for (var i = 0; i < l; i++) {
            if (paramArray[i].name === "dataId") {
                paramArray[i].value = "entries";
            }
        }
    }
    return paramArray;
},
```

### <a name="ajaxError"></a>ajaxError

jQuery.ajaxでエラーが起きたときに呼ばれる関数を設定できます。

**設定例**

```
ajaxError: function (jqXHR, textStatus, errorThrown) {
	window.alert(textStatus);
},
```

### <a name="customSearch"></a>customSearch <span style="font-size: 0.7em;">(version added: 2.2.0)</span>

通常の検索で絞り込まれた検索結果JSONを、独自の検索ロジックでフィルターすることができます。このオプションはv2.2.0で追加されました。

このオプションに設定した関数に検索結果JSONの1アイテムずつが渡され、この関数でfalseを返すと、そのアイテムは検索結果JSONから削除されます。

このオプションに設定した関数には下記の2つの引数が渡されます。

```
function(item, paramObj){
  // do something
}
```

 - item : 検索結果JSONから渡される1アイテムのプレーンオブジェクト
 - paramObj : パラメータオブジェクト。パラメータの値は``paramObj["キー"]``で取り出すことができます。

**設定例**

```
customSearch: function(item, paramObj){
    // ageプロパティの値が20以上の場合は検索結果に残す
    return item.age >= 20;
},
```

### <a name="modifyResultJSON"></a>modifyResultJSON <span style="font-size: 0.7em;">(version added: 2.2.0)</span>

検索結果をHTMLに出力する直前に検索結果JSONを加工することができます。このオプションはv2.2.0で追加されました。

このオプションに設定した関数に検索結果JSON全体が渡され、この関数で返したJSONが検索結果のHTML出力に使われます。

このオプションに設定した関数には下記の1つの引数が渡されます。

```
function(resultJSON){
  // do something
}
```

 - resultJSON : 検索結果のHTMLを出力する直前の検索結果JSON

resultJSONはtotalResultsとitemsのプロパティを持つオブジェクトで、
``resultJSON.totalResults``で検索結果総数に、
``resultJSON.items``で検索結果のアイテムオブジェクトが並んだ配列にアクセスすることができます。

**設定例**

```
modifyResultJSON: function(resultJSON){
    for (var i = 0, l = resultJSON.items.length; i < l; i++) {
        // do something
    }
    return resultJSON;
},
```

### <a name="modifyResultMsgHTML"></a>modifyResultMsgHTML

検索結果メッセージのHTMLを加工することができます。

このオプションに設定した関数に検索結果メッセージのHTMLが渡され、この関数で返したHTMLが検索結果メッセージのHTML出力に使われます。

このオプションに設定した関数には下記の1つの引数が渡されます。

```
function(html){
  // do something
}
```

 - html : 検索結果メッセージのHTML

**設定例**

```
// 全角数字を半角数字に変換する
modifyResultMsgHTML: function(html){
    var zenkaku = {
        "０":"0",
        "１":"1",
        "２":"2",
        "３":"3",
        "４":"4",
        "５":"5",
        "６":"6",
        "７":"7",
        "８":"8",
        "９":"9"
    };
    html = html.replace(/([０１２３４５６７８９])/g, function(match, p1, offset, string){
        return zenkaku[p1];
    });
    return html;
},
```

### <a name="modifyResultItemHTML"></a>modifyResultItemHTML

検索結果一覧のHTMLを加工することができます。

このオプションに設定した関数に検索結果一覧のHTMLが渡され、この関数で返したHTMLが検索結果一覧のHTML出力に使われます。

このオプションに設定した関数には下記の1つの引数が渡されます。

```
function(html){
  // do something
}
```

 - html : 検索結果一覧のHTML

**設定例**

```
// URL文字列をリンクにする
modifyResultItemHTML: function(html){
    return html.replace(/(https?:\/\/[\w\/:%#\$&\?\(\)~\.=\+\-]+)/gi, "<a href=\"$1\">$1</a>");
},
```

### <a name="modifyPaginateHTML"></a>modifyPaginateHTML

ページ分割のHTMLを加工することができます。

このオプションに設定した関数にページ分割のHTMLが渡され、この関数で返したHTMLがページ分割のHTML出力に使われます。

このオプションに設定した関数には下記の1つの引数が渡されます。

```
function(html){
  // do something
}
```

 - html : ページ分割のHTML

**設定例**

```
// URL文字列をリンクにする
modifyPaginateHTML: function(html){
    // do something
    return html;
},
```

### <a name="resultComplete"></a>resultComplete

検索結果をページのDOMに挿入した後に呼ばれる関数を設定します。このオプションに設定した関数の戻り値は特に影響を及ぼしません。直接DOMを操作するなどしてください。

このオプションに設定した関数には下記の1つの引数が渡されます。

```
function(totalResults){
  // do something
}
```

 - totalResults : 検索結果総数

**設定例**

```
// URL文字列をリンクにする
resultComplete: function(totalResults){
    // メタタイトルと同じ物をog:titleにセットする
    $('meta[property="og:title"]').attr('content', document.title);
    return;
},
```

### <a name="excludeParams"></a>excludeParams

パラメータのうち検索から除外する項目をカンマ区切りで指定します。

excludeParamsにはあらかじめ下記の項目が設定されています。つまり、下記の項目の値は検索には利用できません。

 - search
 - dataId
 - offset
 - limit
 - sortBy
 - sortOrder
 - sortType

**設定例**

```
excludeParams: "tags,prices",
```
