var ngApp = angular.module('ngApp', [
    'ui.router',
    'ngCookies',
    'angularFileUpload',
    'appRoute',
    'authService',
    'allService',
    'appCtrl',
    'allCtrl'
]);

ngApp.constant('PRE', 'index');
ngApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
});
ngApp.directive('permiss', function (Permission, statusApi) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var object = (typeof attrs.object !== "undefined" && attrs.object !== '') ? attrs.object : '{}';
            object = JSON.parse(object);
            attrs.$observe('permiss', function (cap) {
                Permission.can(cap, object).success(function (data) {
//                    element.remove();
                }).error(function (err) {
                    element.remove();
                });
            });

            scope.delItem = function (item) {
                statusApi.delete(item._id, {author: item.author._id}).success(function (data) {
                    $(element).closest('.post').remove();
                });
            };
        }
    };
}).directive('relatedStatus', function (statusApi) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var args = {per_page: 5};
            if (scope.itemId) {
                args = {excerpt: [scope.itemId], per_page: 5};
            }
            statusApi.getAll(args).success(function (data) {
                scope.relateds = data.data;
            });
        }
    };
}).directive('catbox', function (catApi, $rootScope) { // list category
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            catApi.getAll().success(function (data) {
                scope.cats = $rootScope.toArrayTree(data.data, null);
            });
        }
    };
}).directive('tagbox', function (tagApi) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            tagApi.getAll({orderby: 'name', order: 'asc'}).success(function (data) {
                scope.tags = data.data;
            });
        }
    };
}).directive('catStatus', function (statusApi, $timeout) {
    function getStatus(args, scope) {
        statusApi.getAll(args).success(function (data) { console.log(data);
            scope.statuss = data.data;
            scope.pages = data.pages;
            scope.page = data.page;
            scope.nextPage = data.page + 1;
        });
    }
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var type = attrs.type;
            attrs.$observe('catid', function (catid) {
                scope.catid = catid; console.log(catid);
                if (catid) {
                    var args = {page: scope.page || 1};
                    if (type === 'cats') {
                        args.cats = [catid];
                    } else{
                        args.tags = [catid];
                    }
                    getStatus(args, scope);
                }
            });

            scope.goPage = function (page) {
                if (page > 0 && page <= scope.pages) {
                    var args = {page: page};
                    if (type === 'cats') {
                        args.cats = [scope.catid];
                    } else {
                        args.tags = [scope.catid];
                    }
                    getStatus(args, scope);
                }
            };
        }
    };
}).directive('mediaStatus', function (statusApi, $timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var type = attrs.type;
            switch (type) {
                case 'author':
                    statusApi.getbyauthor().success(function (data) {
                        scope.statuss = data;
                    });
                    break;
                case 'wishlist':
                    statusApi.getbywishlist().success(function (data) {
                        scope.statuss = data;
                    });
                    break;
                default:
                    break;
            }
        }
    };
}).directive('ngThumb', function (fileApi, $timeout) {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            var size = attrs.size;
            attrs.$observe("id", function (newVal) {
                if (newVal)
//                    $timeout(function () {
                        fileApi.getThumb(newVal, size).success(function (data) {
                            element.html('<img class="img-responsive img-thumb" src="' + data + '" alt="' + data + '">');
//                        sttGrid();
                        });
//                    }, 300);
            });
        }
    };
}).directive('iIcon', function () {
    return {
        restrict: 'E',
        link: function (scope, element, attrs) {
            var type = attrs.type;
            var icon = '';
            switch (type) {
                case 'youtube':
                    icon = '<img src="/public/images/video-icon.png">';
                    break;
                case 'gif':
                    icon = '<img src="/public/images/gif-icon.png">';
                    break;
                default:
                    break;
            }
            element.html(icon);
        }
    };
}).directive('catsSelect', function (catApi) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            catApi.getAll({orderby: 'name'}).success(function (data) {
                scope.crcats = data.data;
                element.select2({
                    placeholder: 'Chọn thể loại',
                    tags: false
                });
            });
        }
    };
}).directive('tagsSelect', function (tagApi) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            tagApi.getAll({orderby: 'name', order: 'asc'}).success(function (data) {
                scope.crtags = data.data;
                element.select2({
                    placeholder: 'Thêm thẻ',
                    tags: true
                });
            });
        }
    };
}).directive('likebtn', function (likeApi, $timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            attrs.$observe('likebtn', function (itemId) {
                if (itemId) {
                    scope.showItemId = itemId;
                    $timeout(function () {
                        likeApi.checklike(itemId).success(function (data) {
                            if (data.liked) {
                                $(element).addClass('liked');
                            } else {
                                $(element).removeClass('liked');
                            }
                        }).error(function (err) {
                            $(element).removeClass('liked');
                        });
                    }, 1000);
                }
            });
            scope.addLike = function (itemId, type) {
                type = (typeof type !== "undefined") ? type : 'status';
                itemId = (typeof itemId !== "undefined") ? itemId : scope.showItemId;
                likeApi.addlike(itemId, type).success(function (data) {
                    if (data.success) {
                        $(element).find('.num').text(data.numlike);
                        if (data.liked) {
                            $(element).removeClass('liked');
                        } else {
                            $(element).addClass('liked');
                        }
                    } else {
                        scope.errorMess = data.message;
                    }
                }).error(function (err) {
                    scope.errorMess = err.message;
                });
            };
        }
    };
}).directive('wishbtn', function (wishApi, $timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            attrs.$observe('wishbtn', function (itemId) {
                if (itemId) {
                    scope.showItemId = itemId;
                    $timeout(function () {
                        wishApi.checkWish(itemId).success(function (data) {
                            if (data.added) {
                                $(element).addClass('added');
                            } else {
                                $(element).removeClass('added');
                            }
                        });
                    }, 500);
                }
            });
            scope.addWish = function (itemId, type) {
                type = (typeof type !== "undefined") ? type : 'status';
                itemId = (typeof itemId !== "undefined") ? itemId : scope.showItemId;
                wishApi.addWish(itemId, type).success(function (data) {
                    console.log(data);
                    if (data.success) {
                        $(element).find('.num').text(data.numadd);
                        if (data.added) {
                            $(element).removeClass('added');
                        } else {
                            $(element).addClass('added');
                        }
                    } else {
                        scope.errorMess = data.message;
                    }
                }).error(function (err) {
                    console.log(err);
                    scope.errorMess = err.message;
                });
            };
        }
    };
}).directive('ngSearchForm', function (statusApi, $state) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.doSearch = function (valid) {
                this.processing = false;
                if (valid) {
                    $state.go('status', {key: scope.searchKey});
                }
            };
        }
    };
}).directive('commentbox', function (commentApi, $rootScope, $timeout) {

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            function loadComment(itemId) {
                commentApi.getAll({postid: itemId}).success(function (data) {
                    scope.comments = data.data;
                });
            }
            attrs.$observe('itemid', function (itemId) {
                if(itemId){
                    scope.sItemId = itemId;
                    scope.newComment.post = itemId;
                    loadComment(itemId);
                }
            });

            scope.postComment = function (valid) {
                this.proccessing = false;
                if (valid) {
                    commentApi.create(scope.newComment).success(function (data) {
                        loadComment(scope.newComment.post);
                        scope.newComment = {};
                        scope.errMess = '';
                    }).error(function (err) {
                        scope.errMess = err.message;
                    });
                }
            };
            
            scope.cmedit = {};
            scope.loadEdit = function(item){
                scope.cmedit = item;
            };
            
            scope.edit_comment = function(valid){
                $rootScope.loading = true;
                if(valid){
                    var author_id = scope.cmedit.author._id;
                    scope.cmedit.author_id = author_id;
                    commentApi.update(scope.cmedit._id, scope.cmedit).success(function(data){
                        $(element).find('#edit_comment').modal('hide');
                        $rootScope.loading = false;
                    }).error(function(err){
                        scope.cmError = err.message;
                        $rootScope.loading = false;
                    });
                }
            };
            
            scope.del_comment = function(item){
                commentApi.delete(item._id, {author: item.author._id}).success(function(data){
                    loadComment(scope.sItemId);
                });
            };
        }
    };
}).directive('ngPaginate', function () {
    return {
        restrict: 'A',
        templateUrl: 'frontend/views/partials/paginate.html'
    };
}).directive('errmodal', function ($rootScope) {
    return{
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.$on('error-modal', function (event, data) {
                if (data) {
                    $rootScope.errMess = 'Bạn cần đăng nhập!';
                    $(element).modal('show');
                }
            });
        }
    };
});

ngApp.filter('range', function () {
    return function (input, total) {
        total = parseInt(total);
        for (var i = 1; i <= total; i++) {
            input.push(i);
        }
        return input;
    };
});

