angular.module('adminRoute', [])
        .run(function ($rootScope, $state, Auth, Permission, $location, $window, PREFIX) {
            $rootScope.$on('$stateChangeStart', function (event, next, current) {
                $rootScope.bodyClass = (next.bodyClass) ? next.bodyClass : '';
                $rootScope.errMess = '';
                $rootScope.succMess = '';

                $rootScope.currentUser = Auth.getUser();
                $rootScope.isLoggedIn = Auth.isLoggedIn();

                if ($rootScope.isLoggedIn) {
                    Permission.can('manage_cats').error(function (err) {
                        $window.location.href = '/index';
                    });
                }

                if (next.authorize) {
                    if (!$rootScope.isLoggedIn) {
                        event.preventDefault();
                        $state.transitionTo('login');
                    }
                }
                if (next.throwAuthorize) {
                    if ($rootScope.isLoggedIn) {
                        event.preventDefault();
                        $state.transitionTo('backend');
                    }
                }
            });
        })
        .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
            var PREFIX = '/backend';
            var viewPath = 'backend/views/';
            $stateProvider.state('backend', {
                url: PREFIX,
                templateUrl: viewPath + 'partials/home.html',
                controller: 'homeCtrl',
                bodyClass: 'home-page',
                authorize: true
            }).state('login', {// Login
                url: PREFIX + '/login',
                templateUrl: viewPath + 'partials/login.html',
                controller: 'authCtrl',
                bodyClass: 'login-page',
                throwAuthorize: true
            }).state('signup', {// Signup
                url: PREFIX + '/signup',
                templateUrl: viewPath + 'partials/signup.html',
                controller: 'authCtrl',
                bodyClass: 'signup-page',
                throwAuthorize: true
            }).state('logout', {// Logout
                url: PREFIX + '/logout',
                loggedIn: true,
                controller: 'authCtrl'
            }).state('profile', {// Profile
                url: PREFIX + '/profile',
                templateUrl: viewPath + 'partials/profile.html',
                controller: 'authCtrl',
                authorize: true
            }).state('user', {// User
                url: PREFIX + '/user',
                templateUrl: viewPath + 'user/index.html',
                controller: 'userCtrl',
                bodyClass: 'user-page',
                cap: 'read',
                authorize: true
            }).state('userCreate', {//Crete User
                url: PREFIX + '/user/create',
                templateUrl: viewPath + 'user/create.html',
                controller: 'userCtrl',
                bodyClass: 'user-page',
                cap: 'publish_users',
                authorize: true
            }).state('userEdit', {// Edit User
                url: PREFIX + '/user/edit/:id',
                templateUrl: viewPath + 'user/edit.html',
                controller: 'userEditCtrl',
                bodyClass: 'user-page',
                cap: 'edit_private_user',
                authorize: true
            }).state('option', {// Option
                url: PREFIX + '/option',
                templateUrl: viewPath + 'option/index.html',
                controller: 'optionCtrl',
                bodyClass: 'option-page',
                authorize: true
            }).state('status', {//Status
                url: PREFIX + '/status',
                templateUrl: viewPath + 'status/index.html',
                controller: 'statusCtrl',
                bodyClass: 'status-page',
                authorize: true
            }).state('editStatus', {//Edit Status
                url: PREFIX + '/status/edit/:id',
                templateUrl: viewPath + 'status/edit.html',
                controller: 'statusEditCtrl',
                bodyClass: 'status-page',
                authorize: true
            }).state('createStatus', {//Create Status
                url: PREFIX + '/status/create',
                templateUrl: viewPath + 'status/create.html',
                controller: 'statusCtrl',
                bodyClass: 'status-page',
                authorize: true
            }).state('article', {//Article
                url: PREFIX + '/article',
                templateUrl: viewPath + 'article/index.html',
                controller: 'articleCtrl',
                bodyClass: 'article-page',
                authorize: true
            }).state('editArticle', {//Edit Article
                url: PREFIX + '/article/edit/:id',
                templateUrl: viewPath + 'article/edit.html',
                controller: 'articleEditCtrl',
                bodyClass: 'article-page',
                authorize: true
            }).state('createArticle', {// Create Article
                url: PREFIX + '/article/create',
                templateUrl: viewPath + 'article/create.html',
                controller: 'articleCtrl',
                bodyClass: 'article-page',
                authorize: true
            }).state('file', {//Files
                url: PREFIX + '/file',
                templateUrl: viewPath + 'file/index.html',
                controller: 'fileCtrl',
                bodyClass: 'file-page',
                authorize: true
            }).state('editFile', {// Edit File
                url: PREFIX + '/file/edit/:id',
                templateUrl: viewPath + 'file/edit.html',
                controller: 'fileEditCtrl',
                bodyClass: 'file-page',
                authorize: true
            }).state('createFile', {// Create File
                url: PREFIX + '/file/create',
                templateUrl: viewPath + 'file/create.html',
                controller: 'fileCtrl',
                bodyClass: 'file-page',
                authorize: true
            }).state('category', {// Category
                url: PREFIX + '/category',
                templateUrl: viewPath + 'category/index.html',
                controller: 'catCtrl',
                bodyClass: 'category-page',
                authorize: true
            }).state('editCat', {
                url: PREFIX + '/category/edit/:id',
                templateUrl: viewPath + 'category/edit.html',
                controller: 'catEditCtrl',
                bodyClass: 'category-page',
                authorize: true
            }).state('createCat', {
                url: PREFIX + '/category/create',
                templateUrl: viewPath + '/category/create.html',
                controller: 'catCtrl',
                bodyClass: 'category-page',
                authorize: true
            }).state('tag', {// Tag
                url: PREFIX + '/tag',
                templateUrl: viewPath + 'tag/index.html',
                controller: 'tagCtrl',
                bodyClass: 'tag-page',
                authorize: true
            }).state('createTag', {
                url: PREFIX + '/tag/create',
                templateUrl: viewPath + 'tag/create.html',
                controller: 'tagCtrl',
                bodyClass: 'tag-page',
                authorize: true
            }).state('editTag', {
                url: PREFIX + '/tag/edit/:id',
                templateUrl: viewPath + 'tag/edit.html',
                controller: 'tagEditCtrl',
                bodyClass: 'tag-page',
                authorize: true
            }).state('comment', {
                url: PREFIX + '/comment',
                templateUrl: viewPath + 'comment/index.html',
                controller: 'commentCtrl',
                bodyClass: 'comment-page',
                authorize: true
            }).state('editComment', {
                url: PREFIX + '/comment/edit/:id',
                templateUrl: viewPath + 'comment/edit.html',
                controller: 'commentEditCtrl',
                bodyClass: 'comment-page',
                authorize: true
            }).state('createComment', {
                url: PREFIX + '/comment/crete',
                templateUrl: viewPath + 'comment/create.html',
                controller: 'commentCtrl',
                bodyClass: 'comment-page',
                authorize: true
            });

            $urlRouterProvider.otherwise('/backend');
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });
            $locationProvider.hashPrefix('!');
        });

