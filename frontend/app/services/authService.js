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
                update: function(user){
                    return $http.post('/auth/update', user);
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
                forgetPassword: function(email){
                    return $http.post('/auth/forgetpassword', {email: email});
                },
                resetPassword: function(token, reset){
                    return $http.post('/auth/resetpassword', {token: token, resetPass: reset});
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
                can: function (cap, object) {
                    return $http.post('/api/permission/check', {cap: cap, object: object});
                }
            };
        })
        .factory('AuthInterceptor', function ($q, $rootScope, AuthToken) {
            return {
                request: function (config) {
                    var token = AuthToken.getToken();
                    if (token) {
                        config.headers['x-access-token'] = token;
                    }
                    return config;
                },
                responseError: function (response) {
                    if (response.status === 401) {
                        AuthToken.setToken();
                        AuthToken.setUser();
                        $rootScope.isLoggedIn = false;
                        $rootScope.currentUser = '';
                        $rootScope.loading = false;
                        $rootScope.$broadcast('error-modal', true);
                    }
                    return $q.reject(response);
                }
            };
        });

