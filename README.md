flexibleSearch.js - jQuery plugin
=========================

超高速JavaScript検索を実現するjQueryプラグインです。

## オプション

## advancedForm

advancedForm オプションにオブジェクトを設定することでキーワード入力欄以外のフォーム要素を作成できます。このオプションでは以下の要素を書き出すことができます。

* input:hidden
* input:text
* input:checkbox
* input:radio
* select

基本的な設定方法は以下の書式になります。

```
advancedForm: {
    要素タイプ: [
        {属性名: "属性値", 属性名: "属性値" ... },
        ...（いくつでも設定できます）
    ]
}
```

属性値を空にするか、属性名の指定をしないものは、その属性自体が書き出されなくなります。

詳細は下記の個別項目を参照してください。なお、「HTML出力例」は実際には改行なしの1行になります。

### デフォルト

```
advancedForm: null
```

### input:hidden要素

```
advancedForm: {
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

### input:text要素

```
advancedForm: {
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

### input:checkbox要素

```
advancedForm: {
    checkbox: [
        {id: "id値", name: "name値", value: "value値", checked: "checked", label: "label値"},
        ...（いくつでも設定できます）
    ]
}
```

**HTML出力例**

```
<div class="fs-advanced-checkbox">
    <label id="id値-label" for="name値" class="fs-checkbox fs-name値">
        <input type="checkbox" id="id値" name="name値" value="value値" checked="checked">
        label値
    </label>
</div>
```

### input:radio要素

```
advancedForm: {
    radio: [
        {id: "id値", name: "name値", value: "value値", checked: "checked", label: "label値"},
        ...（いくつでも設定できます）
    ]
}
```

**HTML出力例**

```
<div class="fs-advanced-radio">
    <label id="id値-label" for="name値" class="fs-radio fs-name値">
        <input type="radio" id="id値" name="name値" value="value値" checked="checked">
        label値
    </label>
</div>
```

### select要素

```
advancedForm: {
    select: [
        {id: "id値", name: "name値", size: "", multiple: "", option: [
            {label: "選択してください", value: ""},
            {label: "opt_label1", value: "opt_value1", selected: "selected"},
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
        <option value="opt_value1" selected>opt_label1</option>
        <option value="opt_value2">opt_label2</option>
        <option value="opt_value3">opt_label3</option>
    </select>
</div>
```

### 設定方法サンプル

```
$('#search').flexibleSearch({
    advancedForm: {
        hidden: [
            {id: "id値", name: "name値", value: "value値"}
        ],
        text: [
            {id: "id値", name: "name値", value: "value値", placeholder: "placeholder値", label: "label値"},
            {id: "id値", name: "name値", value: "value値", placeholder: "placeholder値", label: "label値"}
        ],
        checkbox: [
            {id: "id値", name: "name値", value: "value値", checked: "checked", label: "label値"},
            {id: "id値", name: "name値", value: "value値", checked: "", label: "label値"}
        ],
        radio: [
            {id: "id値", name: "name値", value: "value値", checked: "checked", label: "label値"},
            {id: "id値", name: "name値", value: "value値", checked: "", label: "label値"}
        ],
        select: [
            {id: "id値", name: "name値", size: "", multiple: "", option: [
                {label: "選択してください", value: ""},
                {label: "opt_label1", value: "opt_value1", selected: "selected"},
                {label: "opt_label2", value: "opt_value2"},
                {label: "opt_label3", value: "opt_value3"}
            ]},
            {id: "id値", name: "name値", size: "3", multiple: "multiple", option: [
                {label: "opt_label1", value: "opt_value1"},
                {label: "opt_label2", value: "opt_value2"},
                {label: "opt_label3", value: "opt_value3", selected: "selected"}
            ]}
        ]
    }
});
```

