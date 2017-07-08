var express = require('express');
var mongoose = require('mongoose');
var Status = require('../models/status');
var config = require('../../config/constant');
var fns = require('../../helper/functions');
var permiss = require('../../config/permission');
var TermMeta = require('../models/termmeta');
var Tag = require('../models/term');
var Like = require('../models/like');

var api = express.Router();

function getAll(findquery, req, res) {
    var params = req.query;
    var page = params.page || 1;
    var per_page = parseInt(params.per_page) || config.per_page;
    if (per_page === -1) {
        per_page = 1000;
    }
    var orderby = params.orderby || 'created_at';
    var order = params.order || 'desc';
    var key = params.key || '';

    if (key) {
        findquery = {$and: [
                {$or: [{title: new RegExp(key, 'i')}, {slug: new RegExp(fns.toSlug(key), 'i')}]},
                findquery
            ]};
    }
    Status.find(findquery).sort([[orderby, order]]).limit(per_page).skip(per_page * (page - 1))
            .populate('author', 'name')
            .exec(function (err, items) {
                if (err)
                    res.redirect('/api/error/failure');
                Status.count(findquery, function (err, count) {
                    if (err) {
                        console.log(err);
                        res.redirect('/api/error/failure');
                    } else {
                        var totalPage = Math.ceil(count / per_page);
                        res.status(200).json({data: items, pages: totalPage, page: page});
                    }
                });
            });
}

api.get('/all', function (req, res) {
    var params = req.query;
    var excerpt = params.excerpt || [];

    var filetype = params.type || '';
    var cats = params.cats || [];

    var findquery = {};
    if (excerpt) {
        findquery._id = {$nin: excerpt};
    }
    if (filetype) {
        findquery.filetype = filetype;
    }
    var tags = params.tags || [];
    if(tags && tags.length > 0){
        tags = Array.isArray(tags) ? tags : [tags];
        findquery.tags = {$in: tags};
    }
    if (cats && cats.length > 0) {
        cats = Array.isArray(cats) ? cats : [cats];
        TermMeta.find({term_id: {$in: cats}}, 'child_id', function (err, childs) {
            if (err)
                res.redirect('/api/error/failure');
            for (var i in childs) {
                cats.push(childs[i].child_id);
            }
            findquery.cats = {$in: cats};
            getAll(findquery, req, res);
        });
    } else {
        getAll(findquery, req, res);
    }
});

api.get('/bywishlist', permiss.isAuthenticated, function (req, res) {
    var userid = req.user._id;
    Like.find({author: userid, type: 'wish', object: 'status'}, 'itemId', function (err, items) {
        if (err)
            res.json('/api/error/failure');
        var ids = [];
        for (var i in items) {
            var itemid = items[i].itemId;
            ids.push(itemid);
        }
        Status.find({_id: {$in: ids}}).populate('author', 'name').exec(function (err, data) {
            if (err)
                res.json('/api/error/failure');
            res.json(data);
        });
    });
});

api.get('/byauthor', permiss.isAuthenticated, function (req, res) {
    var userid = req.user._id;
    Status.find({author: userid}).populate('author', 'name').exec(function (err, data) {
        if (err)
            res.json('/api/error/failure');
        res.json(data);
    });
});

api.get('/view', function (req, res) {
    var itemId = req.query.itemId;
    var fields = req.query.fields;
    Status.findById(itemId).select(fields)
            .populate('author', 'name')
            .populate('tags', 'name slug')
            .populate('cats', 'name slug')
            .exec(function (err, data) {
                if (err)
                    res.redirect('/api/error/failure');
                res.json(data);
            });
});
api.get('/viewedit', function (req, res) {
    var itemId = req.query.itemId;
    var fields = req.query.fields;
    Status.findById(itemId).select(fields)
            .exec(function (err, data) {
                if (err)
                    res.redirect('/api/error/failure');
                res.json(data);
            });
});

api.get('/addview/:id', function (req, res) {
    var itemId = req.params.id;
    Status.findById(itemId, 'views', function (err, item) {
        if (err || !item)
            console.log('fail add view');
        else {
            var nview = (item.views) ? item.views + 1 : 1;
            Status.findByIdAndUpdate(itemId, {$set: {views: nview}}, function (err, doc) {
                if (err)
                    console.log('fail add view');
                res.json(doc.views);
            });
        }
    });
});

function createStatus(newdata, res) {
    newdata.save(function (err) {
        if (err)
            res.redirect('/api/error/failure');
        res.json({message: 'Thêm mới thành công!', data: newdata});
    });
}

api.post('/create', permiss.user_can('publish_posts'), function (req, res) {
    var newdata = req.body;
    var user = req.user;
    newdata.author = user._id;

    var newtags = newdata.newtags;
    if (newtags !== "undefined" && newtags) {
        newtags = Array.isArray(newtags) ? newtags : [newtags];
        var tagarray = [];
        for (var i in newtags) {
            var name = newtags[i];
            tagarray.push({
                type: 'tag',
                name: name,
                slug: fns.toSlug(name)
            });
        }
        Tag.create(tagarray, function (err, list) {
            if (err)
                res.redirect('/api/error/failure');
            if (!newdata.tags) {
                newdata.tags = [];
            }
            newdata.tags = Array.isArray(newdata.tags) ? newdata.tags : [newdata.tags];
            for (var j in list) {
                var item = list[j];
                newdata.tags.push(item._id);
            }
            var newStatus = new Status(newdata);
            createStatus(newStatus, res);
        });
    } else {
        var newStatus = new Status(newdata);
        createStatus(newStatus, res);
    }
});

api.put('/update/:id', permiss.user_can('edit_private_post'), function (req, res) {
    var updata = req.body;
    var slug = updata.slug;
    if (typeof slug === "undefined" && !slug) {
        updata.slug = fns.toSlug(updata.name);
    }
    var newtags = updata.newtags;
    if (newtags !== "undefined" && newtags) {
        newtags = Array.isArray(newtags) ? newtags : [newtags];
        var tagarray = [];
        for (var i in newtags) {
            var name = newtags[i];
            console.log(name);
            tagarray.push({
                type: 'tag',
                name: name,
                slug: fns.toSlug(name)
            });
        }
        Tag.create(tagarray, function (err, list) {
            if (err)
                res.redirect('/api/error/failure');

            if (!updata.tags) {
                updata.tags = [];
            }
            updata.tags = Array.isArray(updata.tags) ? updata.tags : [updata.tags];
            for (var j in list) {
                var item = list[j];
                updata.tags.push(item._id);
            }
            Status.findByIdAndUpdate(req.params.id, {$set: updata}, {new : true}, function (err, doc) {
                if (err)
                    res.redirect('/api/error/failure');
                res.json({message: 'Cập nhật thành công', data: doc});
            });
        });
    } else {
        Status.findByIdAndUpdate(req.params.id, {$set: updata}, {new : true}, function (err, doc) {
            if (err)
                res.redirect('/api/error/failure');
            res.json({message: 'Cập nhật thành công', data: doc});
        });
    }
});

api.delete('/delete/:id', permiss.user_can('delete_private_post'), function (req, res) {
    Status.findByIdAndRemove(req.params.id, function (err, offer) {
        if (err)
            res.redirect('/api/error/failure');
        res.json({message: 'Đã xóa!'});
    });
});

api.post('/multidelete', permiss.user_can('delete_other_posts'), function (req, res) {
    var items = req.body;
    Status.remove({_id: {$in: items}}, function (err) {
        if (err)
            throw err;
        res.json({message: 'Xóa thành công!'});
    });
});


module.exports = api;

