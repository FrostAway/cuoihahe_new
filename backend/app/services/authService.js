angular.module('authService', [])
        .factory('Auth', function ($http, AuthToken) {
            return {
                login: function (email, password) {
                    return $http.post('/auth/login', {
                        email: email,
                        password: password
                    });
                },
                signup: function (user) {
                    return $http.post('/auth/signup', user);
                },
                logout: function () {
                    return $http.get('/auth/logout');
                },
                isLoggedIn: function () {
                    if (AuthToken.getToken()) {
                        return true;
                    }
                    return false;
                },
                checkLogin: function () {
                    return $http.get('/auth/checklogin');
                },
                getUser: function () {
//                    return $http.get('/auth/me');
                    return AuthToken.getUser();
                },
                update: function(user){
                    return $http.post('/auth/update', user);
                }
            };
        })
        .factory('AuthToken', function ($cookieStore) {
            return {
                setToken: function (token) {
                    if (token) {
                        $cookieStore.put('accessToken', token);
                    } else {
                        $cookieStore.remove('accessToken');
                    }
                },
                getToken: function () {
                    return $cookieStore.get('accessToken');
                },
                setUser: function (user) {
                    if (user) {
                        delete user.password;
                        $cookieStore.put('currentUser', user);
                    } else {
                        $cookieStore.remove('currentUser');
                    }
                },
                getUser: function () {
                    return $cookieStore.get('currentUser');
                }
            };
        })
        .factory('Permission', function ($http) {
            return {
                can: function(cap, object){
                    return $http.post('/api/permission/check', {cap: cap, object: object});
                }
            };
        })
        .factory('AuthInterceptor', function ($q, $location, $rootScope, AuthToken, PREFIX) {
            return {
                request: function (config) {
                    var token = AuthToken.getToken();
                    if (token) {
                        config.headers['x-access-token'] = token;
                    }
                    return config;
                },
                responseError: function (response) {
                    if (response.status === 403) {
                        AuthToken.setToken();
                        AuthToken.setUser();
                        $rootScope.isLoggedIn = false;
                        $rootScope.currentUser = '';
                        $rootScope.loading = false;
                        $location.path(PREFIX + '/login');
                    }
                    return $q.reject(response);
                }
            };
        });

