var express = require('express');
var Tag = require('../models/term');
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
    var orderby = params.orderby || 'name';
    var order = params.order || 'asc';
    var findQuery = {type: 'tag'};
    var excerpt = params.excerpt || [];
    if(excerpt.length > 0){
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
    
    Tag.find(findQuery).sort([[orderby, order]]).limit(per_page).skip(per_page*(page-1)).exec(function (err, items) {
        if (err) {
            res.redirect('/api/error/failure');
        }
        Tag.count(findQuery, function(err, count){
            if(err) res.redirect('/api/error/failure');
            var totalPage = Math.ceil(count/per_page);
            res.json({data: items, pages: totalPage, page: page});
        });
    });
});

api.get('/getin', function(req, res){
    var ids = req.query.ids;
    Tag.find({_id: {$in: ids}}, function(err, data){
       if(err) res.status(404).json({success: false});
       res.json(data);
    });
});

api.get('/view', function(req, res){
   var itemId = req.query.itemId;
   if(typeof itemId !== "undefined" && itemId){
       var fields = req.query.fields;
       Tag.findById(itemId).select(fields).exec(function(err, data){
          if(err) res.redirect('/api/error/failure');
          res.json(data);
       });
   }else{
       res.redirect('/api/error/notfound');
   }
});

api.post('/create', permis.user_can('manage_tags'), function (req, res) {
    var newdata = req.body;
    
    var slug = (typeof newdata.slug !== "undefined" && newdata.slug) ? newdata.slug : newdata.name;
    slug = fns.toSlug(slug);
    
    Tag.findOne({slug: slug}, function(err, data){
       if(err){
          res.redirect('/api/error/failure');
       } 
       if(data){
           res.json({success: true, message: 'Thẻ này đã có sẵn!', data: data});
       }else{
            newdata.type = 'tag';
            var newTag = new Tag(newdata);
            newTag.save(function (err) {
                if (err) 
                    res.redirect('/api/error/failure');
                else
                    res.status(200).json({success: true, message: 'Thêm mới thành công!', data: newTag});
            });
       }
    });
    
    
});

api.put('/update/:id', permis.user_can('manage_tags'),function (req, res) {
    var updateData = req.body;
    var slug = (typeof updateData.slug !== "undefined" && updateData.slug) ? updateData.slug : updateData.name;
    updateData.slug = fns.toSlug(slug);
    Tag.findByIdAndUpdate(req.params.id, {$set: updateData}, {new : true}, function (err, doc) {
        if (err)
            throw err;
        res.json({message: 'Cập nhật thành công', data: doc});
    });
});

api.delete('/delete/:id', permis.user_can('manage_tags'),function (req, res) {
    Tag.findByIdAndRemove(req.params.id, function (err, offer) {
        if (err)
            throw err;
        res.json({message: 'Đã xóa!'});
    });
});

api.post('/multidelete', permis.user_can('manage_tags'), function (req, res) {
    var items = req.body;
    Tag.remove({_id: {$in: items}}, function (err) {
        if (err)
            throw err;
        res.json({message: 'Xóa thành công!'});
    });
});

module.exports = api;

