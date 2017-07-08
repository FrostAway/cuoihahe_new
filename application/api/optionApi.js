var Option = require('../models/option');
var express = require('express');
var config = require('../../config/constant');
var fns = require('../../helper/functions');

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
        findQuery.key = new RegExp(key, 'i');
    }
    Option.find(findQuery).sort([[orderby, order]]).limit(per_page).skip(per_page * (page - 1)).exec(function (err, rows) {
        if (err) {
            throw err;
        }
        Option.count(findQuery, function (err, count) {
            if (err)
                res.status(500).json(err);
            var totalPage = Math.ceil(count / per_page);
            res.json({data: rows, pages: totalPage, page: page});
        });
    });
});
api.post('/create', function (req, res) {
    var key = req.body.key;
    var keyval = req.body.keyval;
    Option.findOne({key: key}, function (err, option) {
        if (err)
            throw err;
        if (option) {
            Option.findOneAndUpdate({key: key}, {$set: {keyval: keyval}}, function(err){
               if(err) throw err;
               res.json({message: 'Thêm mới thành công!'});
            });
        }else{
            var newop = new Option({
                key: key,
                keyval: keyval
            });
            console.log(newop);
            newop.save(function(err){
               if(err) throw err;
               res.json({message: 'Thêm mới thành công!'});
            });
        }
    });
});
api.put('/update/:id', function (req, res) {
    Option.findByIdAndUpdate(req.params.id, {$set: {keyval: req.body.keyval, key: req.body.key}}, function(err, doc){
        if(err) throw err;
        res.json({message: 'Thêm mới thành công!', data: doc});
    });
});
api.delete('/delete/:id', function (req, res) {
    Option.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            throw err;
        res.json({message: 'Đã xóa'});
    });
});
api.post('/multidelete', function (req, res) {
    var items = req.body;
    Option.remove({_id: {$in: items}}, function (err) {
        if (err)
            throw err;
        res.json({message: 'Xóa thành công!'});
    });
});

module.exports = api;

