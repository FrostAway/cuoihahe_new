angular.module('allCtrl', [])
        .controller('homeCtrl', function ($scope, $rootScope, statusApi, $sce) {
            $rootScope.stitle = $sce.trustAsHtml('Trang chủ');
            $scope.sttargs = {
                orderby: 'created_at',
                order: 'desc'
            };
        })
        .controller('authCtrl', function ($scope, $rootScope, $stateParams, Auth, $sce) {
            $rootScope.stitle = $sce.trustAsHtml('Tài khoản');
            $scope.submitEmail = function (valid) {
                this.proccessing = false;
                if (valid) {
                    $rootScope.loading = true;
                    var email = $scope.forgotEmail;
                    Auth.forgetPassword(email).success(function (data) {
                        if (data.success) {
                            $scope.succMess = data.message;
                            $scope.submitEmail = '';
                        } else {
                            $scope.errMess = data.message;
                        }
                        $rootScope.loading = false;
                    }).error(function (err) {
                        $scope.errMess = err.message;
                        $rootScope.loading = false;
                    });
                }
            };

            var token = $stateParams.token || '';
            $scope.resetPassword = function (valid) {
                this.proccessing = false;
                if (valid) {
                    $rootScope.loading = true;
                    var reset = $scope.reset;
                    Auth.resetPassword(token, reset).success(function (data) {
                        if (data.success) {
                            $scope.succMess = data.message;
                            $scope.reset = {};
                        } else {
                            $scope.errMess = data.message;
                        }
                        $rootScope.loading = false;
                    }).error(function (err) {
                        console.log(err);
                        $scope.errMess = err.message;
                        $rootScope.loading = false;
                    });
                }
            };
        })
        .controller('articleCtrl', function ($scope, $rootScope, statusApi) {

        })
        .controller('articleShowCtrl', function ($scope, $rootScope, $stateParams, articleApi) {
            var itemId = $stateParams.id;
            articleApi.getItem(itemId).success(function (data) {
                $scope.showItem = data;
                $rootScope.stitle = data.title;
            });
        })

        .controller('statusCtrl', function ($scope, $stateParams, statusApi) {
            $scope.sttargs = {
                orderby: $stateParams.orderby || 'created_at',
                order: $stateParams.order || 'desc',
                key: $stateParams.key || '',
                page: $stateParams.page || 1,
                type: $stateParams.type || null
            };
            statusApi.getAll({}).success(function (data) {
                $scope.status = data.data;
            });
        })
        .controller('statusShowCtrl', function ($scope, $rootScope, $stateParams, $timeout, statusApi, commentApi, $sce) {
            var itemId = $stateParams.id;
            $scope.itemId = itemId;

            statusApi.getItem(itemId).success(function (data) {
                $scope.showItem = data;
                $rootScope.stitle = $sce.trustAsHtml(data.title);;
                $scope.$broadcast('load-showItem', data);
            });
            $timeout(function () {
                statusApi.addView(itemId).success(function (data) {
                    $scope.showItem.views = data;
                });
            }, 1000);
        })
        .controller('statusCreateCtrl', function ($scope, $rootScope, $sce, $state, FileUploader, fileApi, statusApi, scrapeApi, catApi, tagApi) {
            $scope.tablink = 'upload.html';
            $scope.addTab = function (tabid) {
                $scope.newItem.fromUrl = '';
                $scope.tablink = tabid;
            };

            $scope.newItem = {};
            var uploader = $scope.uploader = new FileUploader({
                url: '/api/file/doupload',
                isHTML5: true,
                queueLimit: 1,
                removeAfterUpload: true
            });
            uploader.filters.push({
                name: 'imageFilter',
                fn: function (item, options) {
                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                    return '|jpg|png|jpeg|gif|pdf|'.indexOf(type) !== -1;
                }
            });

            $scope.pasteUrl = function ($event) {
                var url = $event.originalEvent.clipboardData.getData('text/plain');
                $scope.loaded = $sce.trustAsHtml($rootScope.loadimg);
                $scope.errMess = '';
                switch ($scope.newItem.type) {
                    case 'uplink':
                        scrapeApi.scrape(url, 'uplink').success(function (data) {
                            if (data.success) {
                                var img = data.data;
                                var html = '<img class="img-responsive" src="' + img.src + '">';
                                $scope.newItem.content = img.alt;
                                $scope.newItem.filetype = img.type;
                                $scope.uplinksrc = img.src;
                                $scope.loaded = $sce.trustAsHtml(html);
                            } else {
                                $scope.loaded = null;
                                $scope.errMess = data.message;
                            }
                        }).error(function (err) {
                            $scope.errMess = err.message;
                            $scope.loaded = null;
                        });
                        break;
                    case 'youtube':
                        scrapeApi.scrape(url, 'youtube').success(function (data) {
                            if (data.success) {
                                $scope.newItem.content = data.data.content;
                                $scope.newItem.title = data.data.title;
                                $scope.newItem.videoId = data.data.ytid;
                                $scope.newItem.filetype = 'youtube';
                                $scope.newItem.ytsrc = data.data.src;
                                var html = '<img class="img-responsive" src="' + data.data.src + '">';
                                $scope.loaded = $sce.trustAsHtml(html);
                            } else {
                                $scope.loaded = null;
                                $scope.errMess = data.message;
                            }
                        }).error(function (err) {
                            $scope.loaded = null;
                            $scope.errMess = err.message;
                            $scope.errMess = err.message;
                        });
                }
            };

            function createNew() {
                statusApi.create($scope.newItem).success(function (data) {
                    $scope.succMess = data.message;
                    $scope.newItem = {};
                    $scope.loaded = '';
                    $rootScope.loading = false;
                    $state.go('showStatus', {id: data.data._id, slug: data.data.slug});
                }).error(function (data) {
                    $scope.errMess = data.message;
                    $rootScope.loading = false;
                });
            }

            $scope.addNew = function (valid) {
                this.proccessing = false;
                $rootScope.loading = true;
                if (valid) {
                    console.log($scope.newItem);
                    var type = $scope.newItem.type;
                    switch (type) {
                        case 'upload':
                            for (var i in uploader.queue) {
                                var file = uploader.queue[i];
                                file.upload();
                            }
                            break;
                        case 'uplink':
                            fileApi.doMove($scope.uplinksrc).success(function (data) {
                                console.log(data);
                                $scope.newItem.fileId = data.data._id;

                                createNew();
                            });
                            break;
                        case 'youtube':
                            fileApi.createbyurl($scope.newItem.ytsrc).success(function (data) {
                                console.log(data);
                                $scope.newItem.fileId = data.data._id;

                                createNew();
                            });
                            break;
                        default:
                            createNew();
                            break;
                    }

                }
            };
            uploader.onCompleteItem = function (fileItem, response, status, headers) {
                if (status === 200) {
                    $scope.newItem.fileId = response.data._id;
                    $scope.newItem.filetype = response.data.type;
                    $scope.loaded = $sce.trustAsHtml('<img class="img-responsive" src="' + response.data.url + '">');
                    createNew();
                }
            };
            uploader.onErrorItem = function (fileItem, response, status, headers) {
                $scope.errorMess = response.message;
            };
        })
        // Edit Status
        .controller('statusEditCtrl', function ($scope, statusApi, $stateParams) {
            var itemId = $stateParams.id;
            statusApi.getItem(itemId).success(function (data) {
                $scope.editItem = data;
            });
        })
        //Category
        .controller('catShowCtrl', function ($scope, $rootScope, $stateParams, catApi, $sce) {
            var itemId = $stateParams.id;
            catApi.getItem(itemId).success(function (data) {
                $scope.showItem = data;
                $rootScope.stitle = $sce.trustAsHtml(data.name);
            });
        })
        //Tag
        .controller('tagShowCtrl', function ($scope, $rootScope, $stateParams, tagApi, $sce) {
            var itemId = $stateParams.id;
            tagApi.getItem(itemId).success(function (data) {
                $scope.showItem = data;
                $rootScope.stitle = $sce.trustAsHtml(data.name);;
            });
        })
        // Comment Controller
        .controller('commentCtrl', function ($scope, $rootScope, commentApi) {

        })
        ;