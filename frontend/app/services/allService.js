angular.module('allService', [])

        .factory('sourceApi', function ($http) {
            return {
                __construct: function (api) {
                    return {
                        getAll: function (args) {
                            return $http.get(api + '/all', {params: args});
                        },
                        getItem: function (itemId, fields) {
                            fields = (typeof fields !== "undefined") ? fields : '';
                            return $http.get(api + '/view', {params: {itemId: itemId, fields: fields}});
                        },
                        create: function (data) {
                            return $http.post(api + '/create', data);
                        },
                        update: function (itemId, upData) {
                            return $http.put(api + '/update/' + itemId, upData);
                        },
                        delete: function (itemId, delData) {
                            delData = (delData !== "undefined") ? delData: {};
                            return $http.delete(api + '/delete/' + itemId, {params: delData});
                        },
                        multiDelete: function (items) {
                            return $http.post(api + '/multidelete', items);
                        }
                    };
                }
            };
        })
//        User
        .factory('userApi', function (sourceApi, $http) {
            var factory = sourceApi.__construct('/api/user');
            return factory;
        })
        //Files
        .factory('fileApi', function (sourceApi, $http) {
            var factory = sourceApi.__construct('/api/file');
            factory.getThumb = function (fileId, size) {
                return $http.get('/api/file/thumbnail', {params: {fileId: fileId, size: size}});
            };
            factory.doMove = function (fileUrl) {
                return $http.post('/api/file/domove', {fileUrl: fileUrl});
            };
            factory.createbyurl = function(fileurl){
              return $http.post('/api/file/createbyurl', {fileurl: fileurl});  
            };
            return factory;
        })
        //Options
        .factory('optionApi', function (sourceApi, $http) {
            var factory = sourceApi.__construct('/api/option');
            return factory;
        })
// Status
        .factory('statusApi', function (sourceApi, $http) {
            var factory = sourceApi.__construct('/api/status');
            factory.addView = function (itemId) {
                return $http.get('/api/status/addview/' + itemId);
            };
            factory.getbywishlist = function(){
                return $http.get('/api/status/bywishlist');
            };
            factory.getbyauthor = function(){
                return $http.get('/api/status/byauthor');
            };
            return factory;
        })
// Article
        .factory('articleApi', function (sourceApi, $http) {
            var factory = sourceApi.__construct('/api/article');
            return factory;
        })
        // Category
        .factory('catApi', function (sourceApi, $http) {
            var factory = sourceApi.__construct('/api/category');
            factory.loadParents = function (itemId) {
                itemId = (typeof itemId !== "undefined") ? itemId : 0;
                return $http.get('/api/category/parents/?itemId=' + itemId);
            };
            factory.getIn = function (ids) {
                return $http.get('/api/category/getin', {params: {ids: ids}});
            };
            return factory;
        })
//        Tag
        .factory('tagApi', function (sourceApi, $http) {
            var factory = sourceApi.__construct('/api/tag');
            factory.getIn = function (ids) {
                return $http.get('/api/tag/getin', {params: {ids: ids}});
            };
            return factory;
        })
        .factory('commentApi', function (sourceApi, $http) {
            var factory = sourceApi.__construct('/api/comment');
            return factory;
        })
        .factory('scrapeApi', function ($http) {
            var factory = {};
            factory.scrape = function (url, type) {
                return $http.get('/api/scrape/load', {params: {url: url, type: type}});
            };
            return factory;
        })
        .factory('likeApi', function ($http) {
            return {
                checklike: function (itemId) {
                    return $http.get('/api/like/checklike', {params: {itemId: itemId}});
                },
                addlike: function (itemId, type) {
                    return $http.get('/api/like/addlike', {params: {itemId: itemId, type: type}});
                }
            };
        })
        .factory('wishApi', function ($http) {
            return {
                checkWish: function (itemId) {
                    return $http.get('/api/like/checkwish', {params: {itemId: itemId}});
                },
                addWish: function (itemId, type) {
                    return $http.get('/api/like/addwish', {params: {itemId: itemId, type: type}});
                }
            };
        });
;



