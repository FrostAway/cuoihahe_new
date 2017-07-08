var appCtrl = angular.module('appCtrl', []).controller('appCtrl', function ($rootScope, $sce, $window, $state, Auth, AuthToken) {
    $rootScope.loading = false;

    $rootScope.articleGrid = 'frontend/views/article/loopGrid.html';
    $rootScope.statusGrid = 'frontend/views/status/loopGrid.html';
    $rootScope.statusMedia = 'frontend/views/status/loopMedia.html';
    $rootScope.statusRow = 'frontend/views/status/loopRow.html';
    $rootScope.commentTpl = 'frontend/views/partials/comments.html';
    $rootScope.leftbar = 'frontend/views/partials/leftbar.html';
    $rootScope.rightbar = 'frontend/views/partials/rightbar.html';
    $rootScope.userbar = 'frontend/views/auth/userbar.html';

    $rootScope.loadimg = '<img class="img-responsive" src="/public/images/loading.gif">';

    $rootScope.menus = [
        {title: 'Video', state: 'status({type:"youtube"})', icon: 'fa fa-video-camera'},
        {title: 'Hình ảnh', state: 'status({type:"image"})', icon: 'fa fa-image'},
        {title: 'Ảnh động', state: 'status({type:"gif"})', icon: 'fa fa-play-circle'}
    ];
    
    $rootScope.sharefb = function(id, slug){
        $window.open('https://facebook.com/sharer/sharer.php?u='+$state.href('showStatus', {id: id, slug: slug}, {absolute: true}), 'facebook-share-dialog', 'width=626,height=436');
    };
    $rootScope.sharegplus = function(id, slug){
        $window.open('https://plus.google.com/share?url='+$state.href('showStatus', {id: id, slug: slug}, {absolute: true}), '_blank');
    };
    $rootScope.sharetw = function(id, slug){
        $window.open('https://twitter.com/home?status='+$state.href('showStatus', {id: id, slug: slug}, {absolute: true}), '_blank');
    };

    $rootScope.user = {};
    $rootScope.doLogin = function (valid) {
        if (valid) {
            $rootScope.loading = true;
            var user = $rootScope.user;
            Auth.login(user.email, user.password).success(function (data) {
                $rootScope.loading = false;
                $rootScope.isLoggedIn = true;
                $rootScope.currentUser = data.user;
                AuthToken.setToken(data.token);
                AuthToken.setUser({
                    name: data.user.name,
                    email: data.user.email
                });
                $state.go('home');
            }).error(function (err) {
                console.log(err);
                $rootScope.loading = false;
                $rootScope.loginMessage = err.message;
            });
        } else {
            console.log(valid);
        }
        this.processing = false;
    };

    $rootScope.newuser = {};
    $rootScope.doSignup = function (snValid) {
        $rootScope.errMess = false;
        if (snValid) {
            $rootScope.loading = true;
            var newUser = $rootScope.newuser;
            console.log(newUser);
            Auth.signup(newUser).success(function (data) {
                $rootScope.loading = false;
                if (data.success) {
                    $rootScope.newuser = '';
                    $state.go('login');
                } else {
                    $rootScope.errMess = data.message;
                }
            });
        } else {
            console.log(snValid);
        }
        this.processing = false;
    };

    $rootScope.updateUser = function (valid) {
        if (valid) {
            Auth.update($rootScope.currentUser).success(function (data) {
                $rootScope.succMess = data.message;
               delete $rootScope.currentUser.password;
               delete $rootScope.currentUser.repassword;
                AuthToken.setUser($rootScope.currentUser);
            }).error(function (err) {
                $rootScope.errMess = err.message;
            });
        }
    };

    $rootScope.doLogout = function () {
        $rootScope.loading = true;
        Auth.logout().success(function () {
            $rootScope.currentUser = '';
            $rootScope.isLoggedIn = false;
            $rootScope.loading = false;
            AuthToken.setToken();
            AuthToken.setUser();
            $state.go('home');
        });
    };

    // chuyen doi mang thanh cay de quy parent - child
    $rootScope.toArrayTree = function (items, parent) {
        var result = [];
        for (var i in items) {
            var item = items[i];
            var itemparent = item.parent;
            if (item.parent !== null) {
                itemparent = item.parent._id;
            }
            if (itemparent === parent) {
                result.push(item);
                var idx = result.indexOf(item);
                result[idx].childs = $rootScope.toArrayTree(items, item._id);
            }
        }
        return result;
    };

    $rootScope.shareurl = 'frontend/views/partials/sharebox.html';
    $rootScope.toSeconds = function (createTime) {
        var seconds = new Date(createTime).getTime();
        return seconds;
    };

    $rootScope.trustLink = function (link) {
        return $sce.trustAsResourceUrl(link);
    };

    $rootScope.itemIcon = function (type) {
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
        return $sce.trustAsHtml(icon);
    };

});

function mosaicGrid(selector, target, cols) {

    var clen = cols.length;
    var allTarget = $('body').find(selector).find(target);
    if (0 === allTarget.length)
        return;

    var itemMargin = 20;
    var containWidth = $(selector).width();
    var itemWidth = containWidth / clen;

    allTarget.one('load', function (e) {
        console.log('load');
 //       setTimeout(function () {
            var pos = minPos(cols);
            var x = itemWidth * pos;
            var y = cols[pos];

            var itemthis = $(this).closest('.grid');

            itemthis.css("left", x + "px");
            itemthis.css("top", y + "px");
            itemthis.css("width", itemWidth + "px");

            var itemHeight = itemthis.height() + itemMargin;
            cols[pos] += itemHeight;
            $(selector).height(maxVal(cols));
            $(this).off(e);
//        }, 1500);

    }).each(function () {
        if (this.complete) {
            $(this).trigger('load');
        }
    });

    var height = $(selector).height();
    $(selector).height(height + 50).css('opacity', 1);
    
}

function minPos(arr) {
    var min = 1000000;
    var imin = 0;
    for (var i in arr) {
        if (arr[i] < min) {
            min = arr[i];
            imin = i;
        }
    }
    return imin;
}

function maxVal(arr) {
    var max = 0;
    for (var i in arr) {
        if (arr[i] > max) {
            max = arr[i];
        }
    }
    return max;
}
function sttGrid(cb) {
    $(document).ready(function () {
        $(window).resize(function () {
            var cols = [0, 0, 0, 0];
            if ($(window).width() < 992) {
                cols = [0, 0, 0];
            }
            if ($(window).width() < 768) {
                cols = [0, 0];
            }
            if ($(window).width() < 480) {
                cols = [0];
            }
            setTimeout(function () {
                mosaicGrid('.dynamic-grid', '.grid .img-thumb', cols);
                cb();
            }, 1500);
        }).resize();
    });
}

appCtrl.directive('listStatus', function (statusApi, $rootScope, $stateParams) {
    function loadStt(args, scope) {
//        $('.dynamic-grid').css('opacity', 0);
        $rootScope.loading = true;
        statusApi.getAll(args).success(function (data) {
            scope.statuss = data.data;
            scope.page = data.page;
            scope.nextPage = parseInt(data.page) + 1;
            scope.pages = data.pages;
        });
    }
    
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            loadStt(scope.sttargs, scope);

//            $(window).scroll(function(){
//               if($(window).scrollTop() == $(document).height() - $(window).height()){
//                   scope.loadMore(scope.nextPage);
//               } 
//            });

            scope.loadMore = function (page) {
                if (page <= scope.pages) {
                    scope.sttargs.page = page;
                    loadStt(scope.sttargs, scope);
                }
            };
        }
    };
}).directive('appRepeat', function ($rootScope) {
    return function (scope, element, attrs) {
        if (scope.$last) {
            sttGrid(function () {
                $rootScope.loading = false;
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
});

