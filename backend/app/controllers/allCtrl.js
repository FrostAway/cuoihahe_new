angular.module('allCtrl', [])
        .run(function ($rootScope) {
        })
        // Home controller
        .controller('homeCtrl', function($scope, $rootScope, userApi, statusApi, commentApi){
            statusApi.getAll({per_page: 5}).success(function(data){
               $scope.statuss = data.data; 
            });
            commentApi.getAll({per_page: 5}).success(function(data){
               $scope.comments = data.data; 
            });
            userApi.getAll({per_page: 5}).success(function(data){
               $scope.users = data.data; 
            });
        })
        // User controller
        .controller('userCtrl', function ($scope, $rootScope, userApi, sourceCtrl) {
            $scope.createState = 'userCreate';
            $scope.publishCap = 'publish_users';
            $scope.orders = {
                email: 'asc',
                role: 'asc',
                created_at: 'asc'
            };
            $scope.currentField = 'created_at';
            var ctrlApi = sourceCtrl.index($scope, $rootScope, userApi);
            $scope.refreshAll();
            $scope.addNew = ctrlApi.addNew;
        })
        .controller('userEditCtrl', function ($scope, $rootScope, $stateParams, Permission, userApi, sourceCtrl) {
            var itemId = $stateParams.id;
            var ctrlApi = sourceCtrl.edit($scope, $rootScope, userApi);
            $scope.getItem = ctrlApi.getItem;
            $scope.getItem(itemId, 'name email role');
            $scope.doEdit = ctrlApi.doEdit;
        })
        //File Controller
        .controller('fileCtrl', function ($scope, $rootScope, fileApi, FileUploader, sourceCtrl) {
            $scope.createState = 'createFile';
            $scope.publishCap = 'upload_files';
            $scope.orders = {
                title: 'asc',
                created_at: 'desc'
            };
            $scope.currentField = 'created_at';

            var uploader = $scope.uploader = new FileUploader({
                url: '/api/file/doupload',
                isHTML5: true,
                queueLimit: 10,
                removeAfterUpload: true
            });
            uploader.filters.push({
                name: 'imageFilter',
                fn: function (item, options) {
                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                    return '|jpg|png|jpeg|gif|pdf|'.indexOf(type) !== -1;
                }
            });

            uploader.onCompleteItem = function (fileItem, response, status, headers) {
                $scope.refreshAll();
            };
            uploader.onCompleteAll = function () {
                $scope.refreshAll();
            };

            var ctrlApi = sourceCtrl.index($scope, $rootScope, fileApi);
            $scope.refreshAll();

            $scope.addNew = ctrlApi.addNew;
            $scope.loadNew = ctrlApi.loadNew;
            $scope.loadEdit = ctrlApi.loadEdit;
            $scope.doEdit = ctrlApi.doEdit;
        })
        .controller('fileEditCtrl', function ($scope, $rootScope, $stateParams, fileApi, sourceCtrl) {
            var itemId = $stateParams.id;
            var ctrlApi = sourceCtrl.edit($scope, $rootScope, fileApi);
            $scope.getItem = ctrlApi.getItem;
            $scope.getItem(itemId);
            $scope.doEdit = ctrlApi.doEdit;
        })
        // File Modal Controller
        .controller('fileModalCtrl', function ($scope, $rootScope, fileApi, FileUploader) {
            $scope.files = {};
            $scope.pages = 1;
            $scope.page = 1;
            $scope.nextPage = 2;
            $scope.multi = false;
            $scope.checkedItem = [];

            $scope.refreshAll = function (args) {
                args = (typeof args !== "undefined") ? args : {};
                fileApi.getAll(args).success(function (data) {
                    $scope.files = data.data;
                    $scope.pages = data.pages;
                    $scope.page = data.page;
                    $scope.nextPage = parseInt($scope.page) + 1;
                }).error(function (err) {
                    $scope.errorMess = err.message;
                });
            };
            $rootScope.loadFiles = function (multi) {
                if (typeof (multi) !== "undefined" && multi) {
                    $scope.multi = true;
                }
                $scope.refreshAll({
                    per_page: 20
                });
            };

            $scope.selectItem = function (item) {
                if ($scope.checkedItem.indexOf(item) > -1) {
                    var idex = $scope.checkedItem.indexOf(item);
                    $scope.checkedItem.splice(idex, 1);
                } else {
                    if ($scope.multi) {
                        $scope.checkedItem.push(item);
                    } else {
                        $scope.checkedItem = [];
                        $scope.checkedItem.push(item);
                    }
                }
            };

            $scope.smChoosed = function () {
                $scope.$emit('smCheckedItem', $scope.checkedItem);
            };

            $rootScope.removeThumb = function () {
                $scope.$emit('rmCheckedItem', {});
            };

            var uploader = $scope.uploader = new FileUploader({
                url: '/api/file/doupload',
                autoUpload: true,
                removeAfterUpload: true,
                isHTML5: true,
                queueLimit: 10
            });
            uploader.filters.push({
                name: 'imageFilter',
                fn: function (item, options) {
                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                    return '|jpg|png|jpeg|gif|pdf|'.indexOf(type) !== -1;
                }
            });

            uploader.onCompleteItem = function (fileItem, response, status, headers) {
                $scope.files.unshift(response.data);
            };

            $scope.goPage = function (page) {
                if (page > 0 && page <= $scope.pages) {
                    var args = {
                        page: page
                    };
                    $scope.refreshAll(args);
                }
            };
        })
        //Option controller
        .controller('optionCtrl', function ($scope, $rootScope, optionApi, sourceCtrl) {
            $scope.hideAddBtn = true;
            $scope.createState = 'option';
            $scope.publishCap = 'manage_options';
            $scope.orders = {
                key: 'asc',
                keyval: 'asc'
            };
            $scope.currentField = 'key';

            var ctrlApi = sourceCtrl.index($scope, $rootScope, optionApi);

            $scope.refreshAll();

            $scope.addNew = function (valid) {
                this.processing = false;
                if (valid) {
                    $rootScope.loading = true;
                    console.log($scope.newData);
                    optionApi.create($scope.newData).success(function (data) {
                        $scope.succMess = data.message;
                        $scope.newData = {};
                        $scope.refreshAll();
                        $rootScope.loading = false;
                    }).error(function (err) {
                        $scope.errorMess = err.message;
                        $rootScope.loading = false;
                    });
                }
            };

            $scope.loadEdit = function (editData) {
                $scope.newData = editData;
            };
        })
//      Status controller
        .controller('statusCtrl', function ($scope, $rootScope, statusApi, sourceCtrl) {
            $scope.createState = 'createStatus';
            $scope.publishCap = 'publish_posts';
            $scope.orders = {
                title: 'asc',
                author: 'asc',
                created_at: 'asc'
            };
            $scope.currentField = 'title';

            var ctrlApi = sourceCtrl.index($scope, $rootScope, statusApi);

            $scope.refreshAll();
            
            $scope.$on('smCheckedItem', function (event, data) {
                for (var i in data) {
                    var thumbnail = data[i];
                    $scope.newData.fileId = thumbnail._id;
                }
            });

            $scope.removeThumb = function () {
                $scope.newData.fileId = '';
            };

            $scope.addNew = ctrlApi.addNew;
        })
        .controller('statusEditCtrl', function ($scope, $rootScope, $stateParams, statusApi, sourceCtrl) {
            var itemId = $stateParams.id;
            var ctrlApi = sourceCtrl.edit($scope, $rootScope, statusApi);
//            $scope.getItem = ctrlApi.getItem;
              statusApi.getedit(itemId).success(function (data) {
                    $scope.editData = data;
                }).error(function (err) {
                    $scope.editData = {};
                    $scope.errorMess = err.message;
                });
//            $scope.getItem(itemId);
            
            $scope.$on('smCheckedItem', function (event, data) {
                for (var i in data) {
                    var thumbnail = data[i];
                    $scope.editData.fileId = thumbnail._id;
                }
            });

            $scope.removeThumb = function () {
                $scope.editData.fileId = '';
            };
            
            $scope.doEdit = ctrlApi.doEdit;
        })
//        Article Controller
        .controller('articleCtrl', function ($scope, $rootScope, articleApi, catApi, tagApi, sourceCtrl) {
            $scope.createState = 'createArticle';
            $scope.publishCap = 'publish_posts';
            $scope.orders = {
                title: 'asc',
                author: 'asc',
                created_at: 'asc'
            };
            $scope.currentField = 'created_at';
            var ctrlApi = sourceCtrl.index($scope, $rootScope, articleApi);
            $scope.refreshAll();

            $scope.$on('smCheckedItem', function (event, data) {
                for (var i in data) {
                    var thumbnail = data[i];
                    $scope.newData.thumbnail_id = thumbnail._id;
                    $scope.newData.thumbnail_url = thumbnail.url;
                }
            });

            $scope.removeThumb = function () {
                $scope.newData.thumbnail_id = '';
                $scope.newData.thumbnail_url = '';
            };

            catApi.getAll({}).success(function (data) {
                $scope.catCheckList = $rootScope.toArrayTree(data.data, null);
            });

            $scope.addCat = function ($event, catid) {
                var cats = ($scope.newData.cats) ? $scope.newData.cats : [];
                var idx = cats.indexOf(catid);
                if ($event.target.checked) {
                    if (idx === -1) {
                        cats.push(catid);
                    }
                } else {
                    if (idx > -1) {
                        cats.splice(idx, 1);
                    }
                }
                $scope.newData.cats = cats;
            };

            tagApi.getAll({}).success(function (data) {
                $scope.listTags = data.data;
            });

            $scope.selectTags = [];
            $scope.addTag = function (tag) {
                var tags = ($scope.newData.tags) ? $scope.newData.tags : [];
                var idx = tags.indexOf(tag._id);
                if (idx > -1) {
                    tags.splice(idx, 1);
                    $scope.selectTags.splice(idx, 1);
                } else {
                    tags.push(tag._id);
                    $scope.selectTags.push(tag);
                }
                $scope.newData.tags = tags;
            };

            $scope.newTag = '';
            $scope.addNewTag = function () {
                var newtag = {name: $scope.newTag};
                tagApi.create(newtag).success(function (data) {
                    $scope.newTag = '';
                    $scope.addTag(data.data);
                }).error(function (err) {
                    $scope.errorMess = err.message;
                });
            };

            $scope.addNew = function (valid) {
                this.processing = false;
                if (valid) {
                    $rootScope.loading = true;
                    console.log($scope.newData);
                    articleApi.create($scope.newData).success(function (data) {
                        $scope.succMess = data.message;
                        $scope.newData = {};
                        $scope.selectTags = [];
                        $rootScope.loading = false;
                    }).error(function (err) {
                        $scope.errorMess = err.message;
                        $rootScope.loading = false;
                    });
                }
            };
        })
        .controller('articleEditCtrl', function ($scope, $rootScope, $stateParams, articleApi, catApi, tagApi, sourceCtrl) {
            var itemId = $stateParams.id;
            var ctrlApi = sourceCtrl.edit($scope, $rootScope, articleApi);

            $scope.editTags = [];
            $scope.getItem = articleApi.getItem(itemId).success(function (data) {
                $scope.editData = data;
                $scope.selectTags = data.tags;

                for (var i in data.tags) {
                    var tag = data.tags[i];
                    $scope.editTags.push(tag._id);
                }
                $scope.editData.tags = $scope.editTags;
            }).error(function (err) {
                $scope.editData = {};
                $scope.errorMess = err.message;
            });

            $scope.$on('smCheckedItem', function (event, data) {
                for (var i in data) {
                    var thumbnail = data[i];
                    $scope.editData.thumbnail_id = thumbnail._id;
                    $scope.editData.thumbnail_url = thumbnail.url;
                }
            });

            $scope.removeThumb = function () {
                $scope.editData.thumbnail_id = '';
                $scope.editData.thumbnail_url = '';
            };

            catApi.getAll({}).success(function (data) { 
                $scope.catCheckList = $rootScope.toArrayTree(data.data, null);
            });

            $scope.addEditCat = function ($event, catid) {
                var cats = ($scope.editData.cats) ? $scope.editData.cats : [];
                var idx = cats.indexOf(catid);
                if ($event.target.checked) {
                    if (idx === -1) {
                        cats.push(catid);
                    }
                } else {
                    if (idx > -1) {
                        cats.splice(idx, 1);
                    }
                }
                $scope.editData.cats = cats;
            };

            tagApi.getAll({}).success(function (data) {
                $scope.listTags = data.data;
            });

            $scope.addTag = function (tag) {
                var tags = $scope.editTags;
                var idx = tags.indexOf(tag._id);
                if (idx > -1) {
                    tags.splice(idx, 1);
                    $scope.selectTags.splice(idx, 1);
                } else {
                    tags.push(tag._id);
                    $scope.selectTags.push(tag);
                }
                $scope.editData.tags = tags;
            };

            $scope.newTag = '';
            $scope.addNewTag = function () {
                var newtag = {name: $scope.newTag};
                tagApi.create(newtag).success(function (data) {
                    $scope.newTag = '';
                    $scope.addTag(data.data);
                }).error(function (err) {
                    $scope.errorMess = err.message;
                });
            };

            $scope.doEdit = function (valid) {
                this.processing = false;
                if (valid) {
                    $rootScope.loading = true;
                    articleApi.update($scope.editData._id, $scope.editData).success(function (data) {
                        $scope.succMess = data.message;
                        $scope.editData = data.data;
                        $rootScope.loading = false;
                    }).error(function (err) {
                        $scope.errorMess = err.message;
                        $rootScope.loading = false;
                    });
                }
            };
        })
        .controller('catCtrl', function ($scope, $rootScope, $sce, catApi, sourceCtrl) {
            $scope.createState = 'createCat';
            $scope.publishCap = 'manage_cats';
            $scope.orders = {
                name: 'asc',
                parent: 'asc',
                count: 'desc',
                created_at: 'asc'
            };
            $scope.currentField = 'parent';

            var ctrlApi = sourceCtrl.index($scope, $rootScope, catApi);

            $scope.refreshAll();

            catApi.loadParents().success(function (data) {
                $scope.treeCatHtml = $sce.trustAsHtml('<option value="0">Chọn thể loại</opiton>' + $rootScope.treeOptionCat(data, null, '--'));
            });
            
            $scope.addNew = ctrlApi.addNew;
        })
        .controller('catEditCtrl', function ($scope, $rootScope, $sce, $stateParams, catApi, sourceCtrl) {
            var ctrlApi = sourceCtrl.edit($scope, $rootScope, catApi);
            var itemId = $stateParams.id;
            catApi.getItem(itemId).success(function(data){
                $scope.editData = data;
            });
            catApi.loadParents(itemId).success(function(data){
               $scope.treeCatHtml = $sce.trustAsHtml('<option value="0">Chọn thể loại</opiton>' + $rootScope.treeOptionCat(data, null, '--', $scope.editData.parent)); 
            });
            
            $scope.doEdit = ctrlApi.doEdit;
        })
        .controller('tagCtrl', function ($scope, $rootScope, tagApi, sourceCtrl) {
            $scope.createState = 'createTag';
            $scope.publishCap = 'manage_tags';
            $scope.orders = {
                name: 'asc',
                count: 'desc',
                created_at: 'asc'
            };
            $scope.currentField = 'name';

            var ctrlApi = sourceCtrl.index($scope, $rootScope, tagApi);
            
            $scope.refreshAll();
            
            $scope.addNew = ctrlApi.addNew;
        }).controller('tagEditCtrl', function($scope, $rootScope, $stateParams, tagApi, sourceCtrl){
            var itemId = $stateParams.id;
            var editCtrl = sourceCtrl.edit($scope, $rootScope, tagApi);
            
            $scope.getItem = editCtrl.getItem;
            $scope.getItem(itemId);
            $scope.doEdit = editCtrl.doEdit;
        })
        .controller('commentCtrl', function ($scope, $rootScope, commentApi, sourceCtrl) {
            $scope.createState = 'createComment';
            $scope.publishCap = 'publish_comments';
            $scope.orders = {
                content: 'asc',
                author: 'desc',
                created_at: 'asc'
            };
            $scope.currentField = 'created_at';

            var ctrlApi = sourceCtrl.index($scope, $rootScope, commentApi);
            
            $scope.refreshAll();
            
            $scope.addNew = ctrlApi.addNew;
        }).controller('commentEditCtrl', function($scope, $rootScope, $stateParams, commentApi, sourceCtrl){
            var itemId = $stateParams.id;
            var editCtrl = sourceCtrl.edit($scope, $rootScope, commentApi);
            
            $scope.getItem = editCtrl.getItem;
            $scope.getItem(itemId);
            $scope.doEdit = editCtrl.doEdit;
        })
        ;

