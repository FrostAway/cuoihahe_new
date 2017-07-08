angular.module('appRoute', [])
        .run(function ($rootScope, $state, Auth, $sce) {
            $rootScope.$on('$stateChangeStart', function (event, next, prev) {
                $rootScope.stitle = $sce.trustAsHtml('Trang chủ');
                $rootScope.loading = true;
                $rootScope.bodyClass = (next.bodyClass) ? next.bodyClass : '';
                $rootScope.errMess = '';
                $rootScope.succMess = '';

                $rootScope.currentUser = Auth.getUser();
                $rootScope.isLoggedIn = Auth.isLoggedIn();

                if (next.authorize) {
                    if (!$rootScope.isLoggedIn) {
                        event.preventDefault();
                        $rootScope.loading = false;
                        $state.go('login');
                    }
                }
                if (next.throwAuthorize) {
                    if ($rootScope.isLoggedIn) {
                        event.preventDefault();
                        $rootScope.loading = false;
                        $state.go('home');
                    }
                }
            });
            $rootScope.$on('$stateChangeSuccess', function(){
               $rootScope.loading = false; 
            });
        })
        .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

            var PRE = '/index';
            var viewPath = '/frontend/views';

            $stateProvider.state('login', {// Login
                url: PRE + '/login/?redirect',
                templateUrl: viewPath + '/auth/login.html',
                controller: 'appCtrl',
                bodyClass: 'login-page',
                throwAuthorize: true
            }).state('signup', {// Signup
                url: PRE + '/signup',
                templateUrl: viewPath + '/auth/signup.html',
                controller: 'appCtrl',
                bodyClass: 'signup-page',
                throwAuthorize: true
            }).state('forgotPassword', { // Forgot Password
                url: PRE + '/fogot_password',
                templateUrl: viewPath + '/auth/forgotpassword.html',
                controller: 'authCtrl',
                bodyClass: 'fogot-page',
                throwAuthorize: true
            }).state('resetPassword', { // Reset Password
                url: PRE + '/reset_password/:token',
                templateUrl: viewPath + '/auth/resetpassword.html',
                controller: 'authCtrl',
                bodyClass: 'reset-password-page'
            }).state('profile', {// Profile
                url: PRE + '/profile',
                templateUrl: viewPath + '/auth/profile.html',
                controller: 'appCtrl',
                bodyClass: 'profile-page',
                authorize: true
            }).state('wishlist', {
                url: PRE + '/wishlist',
                templateUrl: viewPath + '/auth/wishlist.html',
                controller: 'appCtrl',
                bodyClass: 'wishlist-page',
                authorize: true
            }).state('mystatus', {
                url: PRE + '/mystatus',
                templateUrl: viewPath + '/auth/mystatus.html',
                controller: 'appCtrl',
                bodyClass: 'mystatus-page',
                authorize: true
            }).state('home', {// Home
                url: PRE,
                templateUrl: viewPath + '/home/index.html',
                controller: 'homeCtrl',
                bodyClass: 'home-page'
            }).state('articles', {// Article
                url: PRE + '/articles',
                templateUrl: viewPath + '/article/index.html',
                controller: 'articleCtrl',
                bodyClass: 'article-page'
            }).state('showArticle', {
                url: PRE + '/article/:id/:slug',
                templateUrl: viewPath + '/article/single.html',
                controller: 'articleShowCtrl',
                bodyClass: 'single-article'
            }).state('status', {// Status
                url: PRE + '/status/?orderby&order&key&type',
                templateUrl: viewPath + '/status/index.html',
                controller: 'statusCtrl',
                bodyClass: 'status-page'
            }).state('showStatus', {
                url: PRE + '/status/:id/:slug',
                templateUrl: viewPath + '/status/single.html',
                controller: 'statusShowCtrl'
            }).state('createStatus', {
                url: PRE + '/status/create',
                templateUrl: viewPath + '/status/create.html',
                controller: 'statusCreateCtrl',
                bodyClass: 'status-page',
                authorize: true
            }).state('editStatus', {
                url: PRE + '/status/edit/:id',
                templateUrl: viewPath + '/status/edit.html',
                controller: 'statusEditCtrl',
                authorize: true
            }).state('category', {// Category
                url: PRE + '/category',
                templateUrl: viewPath + '/category.index.html',
                controller: 'catCtrl'
            }).state('showCat', {
                url: PRE + '/category/:id/:slug',
                templateUrl: viewPath + '/category/show.html',
                controller: 'catShowCtrl',
                bodyClass: 'category-page'
            }).state('showTag', {
                url: PRE + '/tag/:id/:slug',
                templateUrl: viewPath + '/tag/show.html',
                controller: 'tagShowCtrl',
                bodyClass: 'tag-page'
            });

            $urlRouterProvider.otherwise('/home');
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });
            $locationProvider.hashPrefix('!');
        })
        ;


