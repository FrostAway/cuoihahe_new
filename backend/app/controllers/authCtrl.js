angular.module('authCtrl', [])
        .controller('authCtrl', function ($scope, $rootScope, $location, $window, Permission, Auth, AuthToken, PREFIX) {
           
            $rootScope.doLogin = function (valid) {
                if (valid) {
                    $rootScope.loading = true;
                    var user = $scope.user;
                    Auth.login(user.email, user.password).success(function (data) {
                        $rootScope.loading = false;
                        $rootScope.isLoggedIn = true;
                        $rootScope.currentUser = data.user;
                        AuthToken.setToken(data.token);
                        AuthToken.setUser(data.user);
                        Permission.can('manage_cats').success(function (data) {
                            $location.path(PREFIX);
                        }).error(function (err) {
                            $window.location.href = '/index';
                        });
                    }).error(function (err) {
                        $rootScope.loading = false;
                        $rootScope.loginMessage = err.message;
                    });
                } else {
                    console.log(valid);
                }
                this.processing = false;
            };
            
            $rootScope.doSignup = function (snValid) {
                $scope.errMess = false;
                if (snValid) {
                    $rootScope.loading = true;
                    var newUser = $scope.newuser;
                    Auth.signup(newUser).success(function (data) {
                        $rootScope.loading = false;
                        if (data.success) {
                            $scope.newuser = '';
                            $location.path(PREFIX+'login');
                        } else {
                            $scope.errMess = data.message;
                        }
                    });
                } else {
                    console.log(snValid);
                }
                this.processing = false;
            };
            
            $rootScope.doUpdate = function(valid){
                if(valid){
                    $rootScope.succMess = '';
                    $rootScope.errMess = '';
                    Auth.update($rootScope.currentUser).success(function(data){
                        $rootScope.succMess = data.message;
                        delete $rootScope.currentUser.password;
                        delete $rootScope.currentUser.repassword;
                        AuthToken.setUser($rootScope.currentUser);
                    }).error(function(err){
                        $rootScope.errMess = err.message;
                    });
                }
            };
        });


