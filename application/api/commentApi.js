var express = require('express');
var Comment = require('../models/comment');
var config = require('../../config/constant');
var fns = require('../../helper/functions');
var permis = require('../../config/permission');

var api = express.Router();

api.get('/all', function (req, res) {
    var params = req.query;
    var page = params.page || 1;
    var per_page = parseInt(params.per_page) || config.per_page;
    var orderby = params.orderby || 'created_at';
    var order = params.order || 'desc';
    var postid = params.postid || null;
    var findQuery = {};
    if(postid){
        findQuery = {post: postid};
    }
    if (params.key) {
        var key = params.key;
        findQuery.content = new RegExp(key, 'i');
    }
    Comment.find(findQuery).sort([[orderby, order]]).limit(per_page).skip(per_page * (page - 1))
            .populate('author', 'name')
            .populate('post', 'title')
            .exec(function (err, items) {
                if (err) {
                    res.redirect('/api/error/failure');
                }
                Comment.count(findQuery, function (err, count) {
                    if (err)
                        res.redirect('/api/error/failure');
                    var totalPage = Math.ceil(count / per_page);
                    res.json({data: items, pages: totalPage, page: page});
                });
            });
});

api.get('/view', function (req, res) {
    var itemId = req.query.itemId;
    if (typeof itemId !== "undefined" && itemId) {
        var fields = req.query.fields;
        Comment.findById(itemId).select(fields).exec(function (err, data) {
            if (err)
                res.redirect('/api/error/failure');
            res.json(data);
        });
    } else {
        res.redirect('/api/error/notfound');
    }
});

api.post('/create', permis.user_can('publish_comments'), function (req, res) {
    var newdata = req.body;
    newdata.clientIP = req.ip;
    newdata.agent = req.headers['user-agent'];
    newdata.author = req.user._id;
    var newcomment = new Comment(newdata);
    newcomment.save(function (err) {
        if (err)
            res.redirect('/api/error/failure');
        else
            res.status(200).json({success: true, message: 'Thêm mới thành công!', data: newcomment});
    });

});

api.put('/update/:id', permis.user_can('edit_private_comment'), function (req, res) {
    var updateData = req.body;
    Comment.findByIdAndUpdate(req.params.id, {$set: updateData}, {new : true}, function (err, doc) {
        if (err)
           res.redirect('/api/error/failure');
        res.json({message: 'Cập nhật thành công', data: doc});
    });
});

api.delete('/delete/:id', permis.user_can('delete_private_comment'), function (req, res) {
    Comment.findByIdAndRemove(req.params.id, function (err, offer) {
        if (err)
            res.redirect('/api/error/failure');
        res.json({message: 'Đã xóa!'});
    });
});

api.post('/multidelete', permis.user_can('delete_other_comments'), function (req, res) {
    var items = req.body;
    Comment.remove({_id: {$in: items}}, function (err) {
        if (err)
            res.redirect('/api/error/failure');
        res.json({message: 'Xóa thành công!'});
    });
});

module.exports = api;

