(function ($) {
    $("#search").flexibleSearch({
        // // The limit parameter is overwritten and locked as this value.
        // limit: null,
        // // Path
        // searchDataPath: "/flexibleSearch/search.json",
        // searchDataPathPreload: null,

        // // Data API
        // dataApiDataIds: null,
        // dataApiParams: null,

        // // Performance
        // cache:  true, // I recommend "true".

        // // Search Form
        // searchFormCreation: true,
        // searchFormHTML: null,
        // searchFormAction: "",
        // searchFormInputType: "search",
        // searchFormInputPlaceholder: "Search words",
        // searchFormSubmitBtnText: "Search",

        // // Advanced Search Form
        // advancedFormObj: null,
        // advancedSearchCond: 'OR', // 'AND'

        // // Result Block
        // loadingImgPath: "/flexibleSearch/loading.gif",
        // loadingImgHTML: null,

        // resultBlockId: "fs-result",
        // resultItemTmpl: null,

        // resultMsgId: null,
        // resultMsgClassName: "fs-result-msg",
        // resultMsgTmpl: null,

        // resultMetaTitleTmpl: null,

        // // You can set an array including plane object which has two properties,
        // // method property and selector property.
        // // e.g.
        // //     resultMsgInsertMethods: [
        // //         {
        // //             "selector": "foo",
        // //             "method": "append"
        // //         }
        // //     ],
        // resultMsgInsertMethods: null,

        // // Paginate
        // paginateId: null,
        // paginateClassName: "fs-paginate",
        // paginateTmpl: null,
        // paginateCount: 10,
        // hidePageNumber: false,
        // showTurnPage: true,
        // prevPageText: 'Prev',
        // nextPageText: 'Next',
        // maxPageCount: 10,
        // // You can set an array including plane object which has two properties,
        // // method property and selector property.
        // // e.g.
        // //     paginateInsertMethods: [
        // //         {
        // //             "selector": "foo",
        // //             "method": "append"
        // //         }
        // //     ],
        // paginateInsertMethods: null,

        // // Submit
        // submitAction: function (paramArray) {
        //     return paramArray;
        // },

        // // Ajax
        // ajaxError: function (jqXHR, textStatus, errorThrown) {
        //     window.alert(textStatus);
        // },

        // // Callbacks

        // // you can search in your logic.
        // // e.g.
        // //     customSearch: function(item, paramObj){
        // //         // item : Each item in items
        // //         // paramObj : Plane object of parameters
        // //         // The item is removed when return false
        // //         return true or false;
        // //     },
        // customSearch: null,

        // // You can modify the search result JSON.
        // // e.g.
        // //     modifyResultJSON = function(json){
        // //         json["fullName"] = function(){
        // //             return this.firstName + " " + this.lastName;
        // //         };
        // //         return json;
        // //     },
        // modifyResultJSON: null,
        // modifyResultMsgHTML: null,
        // modifyResultItemHTML: null,
        // modifyPaginateHTML: null,
        // resultComplete: null,

        // excludeParams: null,
        dummy: false
    });
})(jQuery);