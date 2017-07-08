var express = require('express');
var Cat = require('../models/term');
var TermMeta = require('../models/termmeta');
var config = require('../../config/constant');
var fns = require('../../helper/functions');
var permiss = require('../../config/permission');

var api = express.Router();

api.get('/all', function (req, res) {
    var params = req.query;
    var page = params.page || 1;
    var per_page = parseInt(params.per_page) || config.per_page;
    if (per_page === -1) {
        per_page = 1000;
    }
    var orderby = params.orderby || 'name';
    var order = params.order || 'asc';
    var findQuery = {type: 'cat'};
    var excerpt = params.excerpt || [];
    if (excerpt.length > 0) {
        findQuery._id = {$nin: excerpt};
    }
    var key = params.key || '';
    if (key) {
        findQuery = {
            $and: [
                {$or: [{name: new RegExp(key, 'i')}, {slug: new RegExp(fns.toSlug(key), 'i')}]},
                findQuery
            ]
        };
    }

    Cat.find(findQuery).sort([[orderby, order]]).limit(per_page).skip(per_page * (page - 1))
            .populate('parent', 'name')
            .exec(function (err, items) {
                if (err) {
                    res.redirect('/api/error/failure');
                }
                Cat.count(findQuery, function (err, count) {
                    if (err)
                        res.redirect('/api/error/failure');
                    var totalPage = Math.ceil(count / per_page);
                    res.json({data: items, pages: totalPage, page: page});
                });
            });
});

api.get('/parents', function (req, res) {
    var Id = req.query.itemId;
    var findquery = {type: 'cat'};
    if (typeof Id !== "undefined" && parseInt(Id) !== 0) {
        findquery = {$and: [{_id: {'$ne': Id}}, {type: 'cat'}]};
    }
    Cat.find(findquery, function (err, data) {
        if (err)
            res.redirect('/api/error/failure');
        else
            res.json(data);
    });
});

api.get('/getin', function (req, res) {
    var ids = req.query.ids;
    Cat.find({_id: {$in: ids}}, function (err, data) {
        if (err)
            res.redirect('/api/error/failure');
        res.json(data);
    });
});

api.get('/view', function (req, res) {
    if (typeof req.query.itemId !== "undefined" && req.query.itemId) {
        var itemId = req.query.itemId;
        var fields = req.query.fields;
        Cat.findById(itemId).select(fields).exec(function (err, data) {
            if (err)
                res.redirect('/api/error/failure');
            res.json(data);
        });
    } else {
        res.redirect('/api/error/notfound');
    }
});

api.post('/create', permiss.user_can('manage_cats'), function (req, res) {
    var newdata = req.body;
    var newCat = new Cat(newdata);
    newCat.save(function (err) {
        if (err)
            res.redirect('/api/error/failure');
        if (newCat.parent) {
            var termmeta = new TermMeta({
                term_id: newCat.parent,
                child_id: newCat._id
            });
            termmeta.save(function (err) {
                if (err)
                    console.log(err);

                res.json({message: 'Thêm mới thành công!'});
            });
        } else {
            res.json({message: 'Thêm mới thành công!'});
        }
    });
});

api.put('/update/:id', permiss.user_can('manage_cats'), function (req, res) {
    var updateData = req.body;
    var slug = (typeof updateData.slug !== "undefined" && updateData.slug) ? updateData.slug : updateData.name;
    updateData.slug = fns.toSlug(slug);
    if (typeof updateData.parent !== "undefined" && updateData.parent == 0) {
        updateData.parent = null;
    }
    Cat.findByIdAndUpdate(req.params.id, {$set: updateData}, {new : true}, function (err, doc) {
        if (err)
            res.redirect('/api/error/failure');
        if (doc.parent) {
            TermMeta.findOneAndRemove({child_id: doc._id}, function (err, offer) {
                if (err)
                    console.log(err);

                var termmeta = new TermMeta({
                    term_id: doc.parent,
                    child_id: doc._id
                });
                termmeta.save(function (err) {
                    if (err)
                        console.log(err);

                    res.json({message: 'Cập nhật thành công', data: doc});
                });
            });
        } else {
            TermMeta.findOneAndRemove({child_id: doc._id}, function(err, offer){
                if(err) console.log(err);
                res.json({message: 'Cập nhật thành công', data: doc});
            });
        }
    });
});

api.delete('/delete/:id', permiss.user_can('manage_cats'), function (req, res) {
    Cat.findByIdAndRemove(req.params.id, function (err, offer) {
        if (err)
            res.redirect('/api/error/failure');
        TermMeta.findOneAndRemove({child_id: req.params.id}, function(err, offer2){
           if(err) console.log(err);
           res.json({message: 'Đã xóa!'});
        });
    });
});

api.post('/multidelete', permiss.user_can('manage_cats'), function (req, res) {
    var items = req.body;
    Cat.remove({_id: {$in: items}}, function (err, offers) {
        if (err)
            res.redirect('/api/error/failure');
        TermMeta.remove({child_id: {$in: items}}, function(err){
            if(err){
                console.log(err);
            }
            res.json({message: 'Xóa thành công!'});
        });
    });
});

module.exports = api;

