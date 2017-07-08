var Menu = require('../models/menu');
var config = require('../../config/constant');
var fns = require('../../helper/functions');
var express = require('express');

var api = express.Router();

api.get('/all', function(req, res){
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
    
    Menu.find(findQuery).sort([[orderby, order]]).limit(per_page).skip(per_page*(page-1)).exec(function (err, items) {
        if (err) {
            throw err;
        }
        Menu.count(findQuery, function(err, count){
            if(err) throw err;
            var totalPage = Math.ceil(count/per_page);
            res.json({data: items, pages: totalPage, page: page});
        });
    });
});

module.exports = api;


