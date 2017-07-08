
angular.module('allService', [])
        .factory('sourceCtrl', function () {
            return {
                index: function (scope, rootScope, elApi) {
                    scope.newData = {};
                    scope.checkItems = [];

                    scope.checkAll = function ($event) {
                        scope.isCheckAll = !scope.isCheckAll;
                        for (var i in scope.items) {
                            var itemId = scope.items[i]._id;
                            scope.addCheck($event, itemId);
                        }
                    };

                    scope.addCheck = function ($event, itemId) {
                        var idx = scope.checkItems.indexOf(itemId);
                        if ($event.target.checked) {
                            if (idx === -1) {
                                scope.checkItems.push(itemId);
                            }
                        } else {
                            if (idx > -1) {
                                scope.checkItems.splice(idx, 1);
                            }
                        }
                    };

                    scope.refreshAll = function (args) {
                        rootScope.loading = true;
                        args = (typeof args !== 'undefined') ? args : {};
                        elApi.getAll(args).success(function (data) {
                            scope.items = data.data;
                            scope.pages = data.pages;
                            scope.page = data.page;
                            scope.nextPage = parseInt(scope.page) + 1;
                            rootScope.loading = false;
                        }).error(function (err) {
                            scope.errorMess = err.message;
                            rootScope.loading = false;
                        });
                    };

                    scope.keyChange = function (newval) {
                        scope.key = newval;
                    };
                    scope.doSort = function ($field) {
                        scope.currentField = $field;
                        var order = scope.orders[$field];
                        order = (order === 'asc') ? 'desc' : 'asc';
                        scope.orders[$field] = order;
                        scope.page = 1;
                        var args = {
                            orderby: $field,
                            order: order,
                            page: scope.page
                        };
                        if (scope.key) {
                            args.key = scope.key;
                        }
                        scope.refreshAll(args);
                    };
                    scope.goPage = function (page) {
                        console.log(scope.currentField + ', ' + scope.orders[scope.currentField]);
                        if (page > 0 && page <= scope.pages) {
                            var args = {
                                page: page,
                                orderby: scope.currentField,
                                order: scope.orders[scope.currentField]
                            };
                            if (scope.key) {
                                args.key = scope.key;
                            }
                            scope.refreshAll(args);
                        }
                    };
                    scope.delItem = function (Id) {
                        rootScope.loading = true;
                        elApi.delete(Id).success(function (data) {
                            scope.succMess = 'Đã xóa!';
                            rootScope.loading = false;
                            scope.refreshAll();
                        }).error(function (err) {
                            scope.errorMess = err.message;
                            rootScope.loading = false;
                        });
                    };
                    scope.multiAction = function (action, valid) {
                        this.processing = false;
                        if (valid) {
                            if (action === 'delete') {
                                elApi.multiDelete(scope.checkItems).success(function (data) {
                                    scope.succMess = data.message;
                                    scope.refreshAll();
                                    action = '';
                                }).error(function (err) {
                                    scope.errorMess = 'Khổng thể xóa được!';
                                });
                            }
                        }
                    };
                    scope.doSearch = function (key) {
                        this.processing = false;
                        scope.page = 1;
                        var args = {
                            key: key,
                            page: scope.page
                        };
                        scope.refreshAll(args);
                    };

                    return {
                        loadNew: function () {
                            scope.errorMess = '';
                            scope.succMess = '';
                        },
                        addNew: function (valid) {
                            this.processing = false;
                            if (valid) {
                                rootScope.loading = true;
                                console.log(scope.newData);
                                elApi.create(scope.newData).success(function (data) {
                                    scope.succMess = data.message;
                                    scope.newData = {}; 
                                    rootScope.loading = false;
                                }).error(function (err) {
                                    scope.errorMess = err.message;
                                    rootScope.loading = false;
                                });
                            }
                        }
                    };
                },
                edit: function (scope, rootScope, elApi) {
                    scope.errorMess = '';
                    scope.succMess = '';
                    return{
                        getItem: function (itemId, fields) {
                            elApi.getItem(itemId, fields).success(function (data) {
                                scope.editData = data;
                            }).error(function (err) {
                                scope.editData = {};
                                scope.errorMess = err.message;
                            });
                        },
                        doEdit: function (valid) {
                            this.processing = false;
                            if (valid) {
                                rootScope.loading = true;
                                elApi.update(scope.editData._id, scope.editData).success(function (data) {
                                    scope.succMess = data.message;
                                    scope.editData = data.data;
                                    rootScope.loading = false;
                                }).error(function (err) {
                                    scope.errorMess = err.message;
                                    rootScope.loading = false;
                                });
                            }
                        }
                    };
                }
            };
        })

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
                        delete: function (itemId) {
                            return $http.delete(api + '/delete/' + itemId);
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
            factory.getedit = function (itemId, fields){
                return  $http.get('/api/status/viewedit', {params: {itemId: itemId, fields: fields}});
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
        .factory('commentApi', function (sourceApi) {
            var factory = sourceApi.__construct('/api/comment');
            return factory;
        });
;


