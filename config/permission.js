var roles = {
    administrator: {
        title: 'Quản lý',
        caps: [
            'administrator',
            'manage_options', 'manage_menus',
            'edit_other_posts', 'publish_posts', 'edit_private_post', 'delete_private_post', 'delete_other_posts',
            'edit_private_user', 'edit_other_users', 'publish_users', 'delete_private_user', 'delete_other_users',
            'manage_cats', 'manage_tags', 'edit_other_comments', 'edit_private_comment', 'publish_comments', 'delete_private_comment', 'delete_other_comments',
            'read',
            'upload_files', 'edit_other_files', 'edit_private_file', 'delete_other_files', 'delete_private_file'
        ]
    },
    editor: {
        title: 'Biên tập viên',
        caps: [
            'editor',
            'edit_other_posts', 'publish_posts', 'edit_private_post', 'delete_private_post', 'delete_other_posts',
            'edit_private_user',
            'manage_cats', 'manage_tags', 'edit_other_comments', 'edit_private_comment', 'publish_comments', 'delete_private_comment', 'delete_other_comments',
            'read',
            'upload_files', 'edit_other_files', 'edit_private_file', 'delete_other_files', 'delete_private_file'
        ]
    },
    author: {
        title: 'Thành viên',
        caps: [
            'author',
            'edit_private_post', 'publish_posts', 'delete_private_post',
            'edit_private_user',
            'edit_private_comment', 'publish_comments', 'delete_private_comment',
            'read',
            'upload_files', 'edit_private_file', 'delete_private_file'
        ]
    }
};

function get_user_caps(user) {
    var user_caps = [];
    var user_role = user.role;
    var uridx = roles[user_role];
    if (uridx) {
        user_caps = roles[user_role].caps;
    }
    return user_caps;
}

module.exports = {
    roles: roles,
    isAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/api/error/notlogin');
    },
    check: function (req, res, next) {
        var flag = false;
        if (req.isAuthenticated()) {
            var user = req.user;
            var user_caps = get_user_caps(user);

            function has_cap(capability) {
                if (user_caps.indexOf(capability) > -1) {
                    return true;
                }
                return false;
            }

            var cap = req.body.cap;
            var object = req.body.object;

            switch (cap) {
                case 'edit_private_post':
                case 'edit_private_page':
                    var author_id = object.author;
                    if ((has_cap(cap) && user._id == author_id) || has_cap('edit_other_posts') || has_cap('edit_other_pages')) {
                        flag = true;
                    }
                    break;
                case 'delete_private_post':
                case 'delete_private_page':
                    var author_id = object.author;
                    if ((has_cap(cap) && user._id == author_id) || (has_cap('delete_other_posts') || has_cap('delete_other_pages'))) {
                        flag = true;
                    }
                    break;
                case 'edit_private_comment':
                    var author_id = object.author;
                    if ((has_cap(cap) && user._id == author_id) || (has_cap('edit_other_comments'))) {
                        flag = true;
                    }
                    break;
                case 'delete_private_comment':
                    var author_id = object.author;
                    if ((has_cap(cap) && user._id == author_id) || has_cap('delete_other_comments')) {
                        flag = true;
                    }
                    break;
                case 'edit_private_user':
                    var user_id = object._id;
                    if ((has_cap(cap) && user._id == user_id) || has_cap('edit_other_users')) {
                        flag = true;
                    }
                    break;
                case 'delete_private_user':
                    var user_id = object._id;
                    if ((has_cap(cap) && user._id == user_id) || has_cap('delete_other_users')) {
                        flag = true;
                    }
                    break;
                case 'edit_private_file':
                    var user_id = object.author;
                    if ((has_cap(cap) && user._id == user_id) || has_cap('edit_other_files')) {
                        flag = true;
                    }
                    break;
                case 'delete_private_file':
                    var user_id = object.author;
                    if ((has_cap(cap) && user._id == user_id) || has_cap('delete_other_files')) {
                        flag = true;
                    }
                    break;
                default:
                    if (has_cap(cap)) {
                        flag = true;
                    } else {
                        flag = false;
                    }
                    break;
            }

        }
        if (!flag) {
            res.status(503).json({success: false, message: 'Bạn không có quyền vào mục này!'});
        } else {
            return next();
        }
    },
    user_can: function (cap, object) {
        return function (req, res, next) {
            var flag = false;
            if (req.isAuthenticated()) {
                var user = req.user;
                var user_caps = get_user_caps(user);

                function has_cap(capability) {
                    if (user_caps.indexOf(capability) > -1) {
                        return true;
                    }
                    return false;
                }
                object = (typeof object !== "undefined") ? object : {};
                
                var author_id = "undefined";
                if(Object.keys(object).length > 0){
                    author_id = object.author;
                }else if(req.body.author_id !== undefined){
                    author_id = req.body.author_id;
                }else if(req.body.author !== undefined){
                    author_id = req.body.author;
                }else{
                    author_id = req.query.author;
                }
                
                switch (cap) {
                    case 'edit_private_post':
                    case 'edit_private_page':
                        if ((has_cap(cap) && user._id == author_id) || has_cap('edit_other_posts') || has_cap('edit_other_pages')) {
                            flag = true;
                        }
                        break;
                    case 'delete_private_post':
                    case 'delete_private_page':
                        if ((has_cap(cap) && user._id == author_id) || (has_cap('delete_other_posts') || has_cap('delete_other_pages'))) {
                            flag = true;
                        }
                        break;
                    case 'edit_private_comment':
                        if ((has_cap(cap) && user._id == author_id) || (has_cap('edit_other_comments'))) {
                            flag = true;
                        }
                        break;
                    case 'delete_private_comment':
                        if ((has_cap(cap) && user._id == author_id) || has_cap('delete_other_comments')) {
                            flag = true;
                        }
                        break;
                    case 'edit_private_user':
                        if ((has_cap(cap) && user._id == user_id) || has_cap('edit_other_users')) {
                            flag = true;
                        }
                        break;
                    case 'delete_private_user':
                        if ((has_cap(cap) && user._id == user_id) || has_cap('delete_other_users')) {
                            flag = true;
                        }
                        break;

                    case 'edit_private_file':
                        var user_id = (Object.keys(object).length > 0) ? object.author : req.body.author;
                        if ((has_cap(cap) && user._id == user_id) || has_cap('edit_other_files')) {
                            flag = true;
                        }
                        break;
                    case 'delete_private_file':
                        if ((has_cap(cap) && user._id == user_id) || has_cap('delete_other_files')) {
                            flag = true;
                        }
                        break;
                    default:
                        if (has_cap(cap)) {
                            flag = true;
                        } else {
                            flag = false;
                        }
                        break;
                }

            }
            if (!flag) {
                res.redirect('/api/error/authorize');
            } else {
                return next();
            }
        };
    }
};

