angular.module('mainCtrl', [])
        .controller('mainCtrl', function ($scope, $state, $rootScope, AuthToken, Auth, $location, $window, PREFIX) {

            $rootScope.navTableLink = 'backend/views/partials/tablebar.html';
            $rootScope.modalFilesLink = 'backend/views/file/modalFiles.html';

            $rootScope.adMenus = [
                {title: 'Dashboard', icon: 'fa fa-dashboard', state: 'backend'},
                {title: 'Trạng thái', icon: 'fa fa-pencil-square', state: 'status'},
//                {title: 'Bài viết', icon: 'fa fa-newspaper-o', state: 'article'},
                {title: 'Tệp tin', icon: 'fa fa-files-o', state: 'file'},
                {title: 'Danh mục', icon: 'fa fa-folder', state: 'category'},
                {title: 'Thẻ', icon: 'fa fa-tags', state: 'tag'},
                {title: 'Bình luận', icon: 'fa fa-comment-o', state: 'comment'},
                {title: 'Thành viên', icon: 'fa fa-group', state: 'user'},
                {title: 'Cài đặt', icon: 'fa fa-gear', state: 'option', hideChild: true, childs: [
                        {title: 'Hỉnh ảnh', state: 'file'},
                        {title: 'Tùy chọn', state: 'option'}
                    ]}
            ];
            $rootScope.toggleChild = function (item) {
                item.hideChild = !item.hideChild;
            };

            $rootScope.doLogout = function () {
                $rootScope.loading = true;
                Auth.logout().success(function () {
                    $rootScope.currentUser = '';
                    $rootScope.isLoggedIn = false;
                    $rootScope.loading = false;
                    AuthToken.setToken();
                    AuthToken.setUser();
                    $state.go('login');
                });
            };

            // kiem tra phan tu thuoc array
            $rootScope.inArray = function (item, items) {
                if (items.indexOf(item) > -1) {
                    return true;
                }
                return false;
            };

            // list lua chon category de quy parent-child
            $rootScope.treeOptionCat = function (cats, parent, line, selected) {
                selected = (typeof selected !== "undefined" && selected) ? selected : '';
                line = (typeof line !== "undefined") ? line : '--';
                var html = '';
                for (var i in cats) {
                    var cat = cats[i];
                    if (cat.parent === parent) {
                        var select = '';
                        if (selected === cat._id) {
                            select = 'selected';
                        }
                        html += '<option value="' + cat._id + '" ' + select + '>' + line + ' ' + cat.name + '</option>';

                        html += $rootScope.treeOptionCat(cats, cat._id, line + '--');
                    }
                }
                return html;
            };

            // tao list category checkbox de quy
            $rootScope.catCheckList = function (cats, parent, depth, checkeds) {
                checkeds = (typeof checkeds !== "undefined") ? checkeds : [];
                depth = (typeof depth !== "undefined") ? depth : 0;
                var html = '';
                for (var i in cats) {
                    var cat = cats[i];
                    if (cat.parent === parent) {
                        html += '<li><label><input type="checkbox" ng-model="cats[cat._id]" ng-click="addList()"> ' + cat.name + '</label>';
                        cats.splice(i, 1);
                        html += '<ul class="list-child">';
                        html += $rootScope.catCheckList(cats, cat._id, depth++, checkeds);
                        html += '</ul>';
                        html += '</li>';
                    }
                }
                return html;
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

            $rootScope.isChecked = function (arrays, id) {
                if (arrays.indexOf(id) > -1) {
                    return true;
                }
                return false;
            };

            // danh sach category parent - children dang table;
            $rootScope.treeTableCat = function (cats, parent, line) {
                line = (typeof line !== "undefined") ? line : '--';
                var html = '';
                for (var i in cats) {
                    var item = cats[i];
                    if (item.parent === parent) {
                        html += '<tr>';
                        html += '<td><input type="checkbox" class="checkItem" ng-model="checkItems[' + item._id + ']" ng-checked="checked"></td>';
                        html += '<td>' + line + ' ' + item.name + '</td>';
                        html += '<td>' + item.slug + '</td>';
                        html += '<td><ng-cat-parent id="' + item.parent + '" field="name"></ng-cat-parent></td>';
                        html += '<td>' + item.type + '</td>';
                        html += '<td>' + item.count + '</td>';
                        html += '<td ng-item-action item="' + item + '">';
                        html += '<a class="btn btn-sm btn-primary" ng-click="loadEdit(' + item + ')" data-toggle="modal" data-target="#editModal"><i class="fa fa-edit"></i></a>';
                        html += '<a class="btn btn-sm btn-danger" ng-click="delItem(' + item._id + ')" ng-confirm="Bạn chắc chắn xóa?"><i class="fa fa-close"></i></a>';
                        html += '</td>';
                        html += '</tr>';
                        cats.splice(i, 1);
                        html += $rootScope.treeTableCat(cats, item._id, line + '--');
                    }
                }
                return html;
            };

            // layouts
            $rootScope.sbCollapse = false;
            $rootScope.collapseSb = function () {
                $rootScope.sbCollapse = !$rootScope.sbCollapse;
            };
            $rootScope.toggleSub = function () {
                $rootScope.sbCollapse = false;
            };
        });


