var ngAdmin = angular.module('ngAdmin', [
    'ngCookies',
    'ui.router',
    'ngSanitize',
    'angularFileUpload',
    'adminRoute',
    'authService',
    'mainCtrl',
    'authCtrl',
    'allService',
    'allCtrl'
]);

ngAdmin.constant('PREFIX', '/backend');

ngAdmin.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
});


ngAdmin.directive('permiss', function (Permission) {
    return {
        restrict: 'E',
        scope: {
            cap: '@'
        },
        link: function (scope, element, attrs) {
            var object = (typeof attrs.object !== "undefined" && attrs.object !== '') ? attrs.object : '{}';
            object = JSON.parse(object);
            scope.$watch('cap', function (newval, oldval) {
                Permission.can(newval, object).success(function (data) {
//                    element.remove();
                }).error(function (err) {
                    element.remove();
                });
            });
        }
    };
}).directive('ngConfirm', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('click', function (e) {
                var message = attrs.ngConfirm;
                if (message && !confirm(message)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                }
            });
        }
    };
}).directive('ngPaginate', function () {
    return {
        restrict: 'A',
        templateUrl: 'backend/views/partials/paginate.html'
    };
}).directive('ngFileupload', function () {
    return {
        link: function (scope, element, attrs) {
            element.on('change', function (evt) {
                var files = evt.target.files;
                scope.filesQueue = files;
            });
        }
    };
}).directive('ngThumbnail', function (fileApi, $timeout) {
    return {
        restrict: 'E',
        scope: {
            id: '@'
        },
        link: function (scope, element, attrs) {
            var fileId = attrs.id;
            var size = attrs.size;
            scope.$watch("id", function (newVal, oldVal) {
                $timeout(function () {
                    fileApi.getThumb(newVal, size).success(function (data) {
                        element.html('<img class="img-responsive" src="' + data + '" alt="thumbnail">');
                    });
                }, 1500);
            });
        }
    };
}).directive('ngAuthor', function (userApi, $timeout) {
    return{
        restrict: 'E',
        link: function (scope, element, attrs) {
            var userId = attrs.id, field = attrs.field;
            $timeout(function () {
                userApi.getItem(userId, [field]).success(function (data) {
                    element.html(data[field]);
                });
            }, 1500);
        }
    };
}).directive('ngCatParent', function (catApi, $timeout) {
    return{
        restrict: 'E',
        scope: {
            id: '@'
        },
        link: function (scope, element, attrs) {
            var field = attrs.field;
            scope.$watch('id', function (newVal, oldVal) {
                $timeout(function () {
                    catApi.getItem(newVal, [field]).success(function (data) {
                        if (data) {
                            element.html(data[field]);
                        } else {
                            element.html('0');
                        }
                    });
                }, 2000);
            });
        }
    };
}).directive('ngCategories', function (catApi, $timeout) {
    return {
        restrict: 'E',
        scope: {
            ids: '@'
        },
        link: function (scope, element, attrs) {
            scope.$watch('ids', function (newVal, oldVal) {
                newVal = JSON.parse(newVal);
                $timeout(function () {
                    catApi.getIn(newVal).success(function (data) {
                        var html = '<ul class="list-cat">';
                        for (var i in data) {
                            var cat = data[i];
                            html += '<li><a><i class="fa fa-check"></i> ' + cat.name + '</a></li>';
                        }
                        html += '</ul>';
                        element.html(html);
                    });
                }, 1500);
            });
        }
    };
}).directive('ngTags', function (tagApi, $timeout) {
    return {
        restrict: 'E',
        scope: {
            ids: '@'
        },
        link: function (scope, element, attrs) {
            scope.$watch('ids', function (newVal, oldVal) {
                var newVal = JSON.parse(newVal);
                $timeout(function () {
                    tagApi.getIn(newVal).success(function (data) {
                        var html = '<div class="itemtags">';
                        for (var i in data) {
                            var tag = data[i];
                            html += '<a>' + tag.name + '</a>, ';
                        }
                        html += '</div>';
                        element.html(html);
                    });
                }, 1500);
            });
        }
    };
}).directive('catsSelect', function(catApi, $timeout){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            catApi.getAll({orderby: 'name', order: 'asc'}).success(function(data){
               scope.cats = data.data; 
               $timeout(function(){
                   $(element).select2({
                      placeholder: 'Chọn thể loại',
                      tags: false
                   });
               }, 500);
            });
        }
    };
})
.directive('tagsSelect', function(tagApi, $timeout){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            tagApi.getAll({orderby: 'name', order: 'asc'}).success(function(data){
               scope.tags = data.data; 
               $timeout(function(){
                   var tagselect = $(element).select2({
                      placeholder: 'Thêm tag',
                      tags: true
                   });
               }, 500);
            });
        }
    };
})

        .directive('ngCatChecklist', function (catApi, $sce, $compile) {
            function checkList(cats, parent, depth, checkeds) {
                checkeds = (typeof checkeds !== "undefined") ? checkeds : [];
                depth = (typeof depth !== "undefined") ? depth : 0;
                var html = '';
                for (var i in cats) {
                    var cat = cats[i];
                    if (cat.parent === parent) {
                        html += '<li><label><input type="checkbox" ng-model="cats[' + cat._id + ']" ng-click="addList()"> ' + cat.name + '</label>';
                        cats.slice(i, 1);
                        html += '<ul class="list-child">';
                        html += checkList(cats, cat._id, depth++, checkeds);
                        html += '</ul>';
                        html += '</li>';
                    }
                }
                return html;
            }
            ;

            return {
                restrict: 'A',
                scope: {
                    addList: '@',
                    cats: '@'
                },
                link: function (scope, element, attrs) {
                    catApi.getAll({orderby: 'name', order: 'asc', per_page: -1}).success(function (data) {
                        var cats = data.data;
                        var html = '<ul class="cat-checklist">' + checkList(cats, null, 0) + '</ul>';
                        scope.catCheckList = html;
//                        var template = angular.element(html);
//                        element.html($compile(template)(scope));
                        element.html(html);
                    });
                }
            };
        })
        .directive('ngmodal', function ($rootScope) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    $rootScope.dismiss = function () {
                        element.modal('hide');
                    };
                }
            };
        })
        ;

ngAdmin.filter('range', function () {
    return function (input, total) {
        total = parseInt(total);
        for (var i = 1; i <= total; i++) {
            input.push(i);
        }
        return input;
    };
}).filter('isChecked', function () {
    return function (item, items) {
        if (typeof items !== "undefined") {
            if (items.indexOf(item) > -1) {
                return true;
            }
        }
        return false;
    };
});




