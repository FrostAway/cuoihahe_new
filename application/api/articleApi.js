var express = require('express');
var Article = require('../models/article');
var config = require('../../config/constant');
var fns = require('../../helper/functions');
var permis = require('../../config/permission');

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
    var excerpt = params.excerpt || [];
    if(excerpt.length > 0){
       findQuery._id = {$nin: excerpt}; 
    }
    var key = params.key || '';
    if (key) {
        findQuery = {
            $and: [
                {$or: [{title: new RegExp(key, 'i')}, {slug: new RegExp(fns.toSlug(key), 'i')}]},
                findQuery
            ]
        };
    }

    Article.find(findQuery).sort([[orderby, order]]).limit(per_page).skip(per_page * (page - 1))
            .populate('cats', 'name')
            .populate('tags', 'name')
            .populate('author', 'email')
            .exec(function (err, items) {
                if (err) {
                    throw err;
                }
                Article.count(findQuery, function (err, count) {
                    if (err)
                        throw err;
                    var totalPage = Math.ceil(count / per_page);
                    res.json({data: items, pages: totalPage, page: page});
                });
            });
});

api.get('/view', function(req, res){
    var itemId = req.query.itemId;
    var fields = req.query.fields;
    Article.findById(itemId).select(fields).populate('tags', 'name').exec(function(err, data){
        if(err) res.redirect('/api/error/failure');
        res.json(data);
    });
});

api.post('/create', permis.user_can('publish_posts'), function (req, res) {
    var newdata = req.body;
    var user = req.user;
    newdata.author = user._id;

    var newArticle = new Article(newdata);

    newArticle.save(function (err) {
        if (err)
            res.redirect('api/error/failure');
        res.json({message: 'Thêm mới thành công!'});
    });
});

api.put('/update/:id', permis.user_can('edit_private_post'), function (req, res) {
    var updateData = req.body;
    var slug = (typeof updateData.slug !== "undefined" && updateData.slug) ? updateData.slug : updateData.title;
    updateData.slug = fns.toSlug(slug);

    Article.findByIdAndUpdate(req.params.id, {$set: updateData}, {new : true}, function (err, doc) {
        if (err)
            console.log(err);
        res.json({message: 'Cập nhật thành công', data: doc});
    });
});

api.delete('/delete/:id', permis.user_can('delete_private_post'), function (req, res) {
    Article.findByIdAndRemove(req.params.id, function (err, offer) {
        if (err)
            throw err;
        res.json({message: 'Đã xóa!'});
    });
});

api.post('/multidelete', permis.user_can('delete_other_posts'), function (req, res) {
    var items = req.body;
    Article.remove({_id: {$in: items}}, function (err) {
        if (err)
            throw err;
        res.json({message: 'Xóa thành công!'});
    });
});

module.exports = api;


