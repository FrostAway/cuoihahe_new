var express = require('express');
var User = require('../models/user');
var OP = require('../../helper/options');
var config = require('../../config/constant');
var permiss = require('../../config/permission');

var api = express.Router();

api.get('/all', function (req, res) {
    var params = req.query;
    var page = params.page || 1;
    var per_page = parseInt(params.per_page) || config.per_page;
    if(per_page === -1){
        per_page = 1000;
    }
    var orderby = params.orderby || 'created_at';
    var order = params.order || 'desc';
    var findQuery = {};
    var excerpt = params.excerpt || [];
    if(excerpt.length > 0){
       findQuery._id = {$nin: excerpt}; 
    }
    var key = params.key || '';
    if (key) {
        findQuery = {
            $and: [
                {name: new RegExp(key, 'i')},
                findQuery
            ]
        };
    }

    User.find(findQuery).sort([[orderby, order]]).limit(per_page).skip(per_page * (page - 1)).exec(function (err, users) {
        if (err) {
            throw err;
        }
        User.count(findQuery, function (err, count) {
            if (err)
                throw err;
            var totalPage = Math.ceil(count / per_page);
            res.json({data: users, pages: totalPage, page: page});
        });
    });
});

api.get('/view', function (req, res) {
    var userId = req.query.itemId;
    var fields = req.query.fields;
    User.findById(userId).select(fields).exec(function (err, user) {
        if (err) {
            res.redirect('/api/error/failure');
        }
        if(!user){
            res.redirect('/api/error/notfound');
        }else {
            res.json(user);
        }
    });
});

api.post('/create', permiss.user_can('publish_users'), function (req, res) {
    var data = req.body;
    User.findOne({email: data.email}, function (err, user) {
        if (err){
           res.redirect('/api/error/failure'); 
        } 
        if(user) {
            req.flash('message', 'Tài khoản đã tồn tại!');
            res.redirect('/api/error/exists');
        } else {
            var newUser = new User(data);
            newUser.save(function (err) {
                if (err) 
                    res.redirect('/api/error/failure');
                else
                res.json({message: 'Thêm mới thành công!'});
            });
        }
    });
});

api.put('/update/:id', permiss.user_can('edit_private_user'), function (req, res) {
    User.findByIdAndUpdate(req.params.id, {$set: {
            email: req.body.email,
            role: req.body.role
        }}, {new : true}, function (err, doc) {
        if (err)
            throw err;
        res.json({message: 'Cập nhật thành công', data: doc});
    });
});

api.delete('/delete/:id', permiss.user_can('delete_private_user'), function (req, res) {
    User.findByIdAndRemove(req.params.id, function (err, offer) {
        if (err)
            res.redirect('/api/error/failure');
        res.json({message: 'Đã xóa!'});
    });
});

api.post('/multidelete', permiss.user_can('delete_other_users'), function (req, res) {
    var items = req.body;
    User.remove({_id: {$in: items}}, function (err) {
        if (err)
            throw err;
        res.json({message: 'Xóa thành công!'});
    });
});

module.exports = api;



