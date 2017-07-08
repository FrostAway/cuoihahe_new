var express = require('express');
var Like = require('../models/like');
var config = require('../../config/constant');
var fns = require('../../helper/functions');
var Status = require('../models/status');
var permis = require('../../config/permission');

var api = express.Router();

function checkLike(items, userid) {
    for (var i in items) {
        var like = items[i];
        if (like.author.equals(userid)) {
            return true;
        }
    }
    return false;
}

api.get('/checklike', function (req, res) {
    if (!req.isAuthenticated() || req.query.itemId === "undefined") {
        res.json({liked: false});
    } else {
        var itemId = req.query.itemId; 
        var user_id = req.user._id;
        Like.count({itemId: itemId, author: user_id, type: 'like'}, function (err, count) {
            if (err || count === 0) {
                res.status(200).json({liked: false});
            } else {
                res.json({liked: true});
            }
        });
    }
});

api.get('/addlike', permis.isAuthenticated, function (req, res) {
    var itemId = req.query.itemId;
    var object = req.query.type;
    var user = req.user;
    var findquery = {itemId: itemId, type: 'like', author: user._id};
    
    Like.findOne(findquery, function(err, data){
        if(err) res.redirect('/api/error/failure');
        else if(!data){
            var newlike = new Like({
                author: user._id,
                itemId: itemId,
                object: object
            });
            newlike.save(function (err) {
                if (err)
                    res.redirect('/api/error/failure');
                else {
                    switch (object) {
                        case 'status':
                            Status.findByIdAndUpdate(itemId, {$push: {likes: newlike._id}}, function (err, stt) {
                                if (err)
                                    res.redirect('/api/error/failure');
                                else if(stt) res.json({success: true, liked: false, numlike: (typeof stt.likes !== "undefined" && stt.likes) ? stt.likes.length + 1 : 1});
                                
                            });
                            break;
                        default:
                            res.json({success: false, message: 'Lỗi không xác định được dạng bài!'});
                            break;
                    }
                }
            });
        }else{
            Like.findByIdAndRemove(data._id, function(err, offer){
               if(err) res.redirect('/api/error/failure');
               switch (object){ 
                   case 'status':
                       Status.findByIdAndUpdate(itemId, {$pull: {likes: offer._id}}, function(err, stt){
                           if(err) res.redirect('/api/error/failure');
                           else if(stt) res.json({success: true, liked: true, numlike: (typeof stt.likes !== "undefined" && stt.likes) ? stt.likes.length -1 : 0});
                       });
                       break;
                   default:
                       res.json({success: false, message: 'Không xác định được dạng bài!'});
                       break;
               }
            });
        }
    });
});


api.get('/checkwish', function (req, res) {
    if (!req.isAuthenticated() || req.query.itemId === "undefined") {
        res.json({added: false});
    } else {
        var itemId = req.query.itemId;
        var user_id = req.user._id;
        Like.count({itemId: itemId, author: user_id, type: 'wish'}, function (err, count) {
            if (err || count === 0) {
                res.status(200).json({added: false});
            } else {
                res.json({added: true});
            }
        });
    }
});

api.get('/addwish', permis.isAuthenticated, function (req, res) {
    var itemId = req.query.itemId;
    var object = req.query.type;
    var user = req.user;
    Like.findOne({itemId: itemId, type: 'wish', author: user._id}, function (err, data) {
        if (err)
            res.redirect('/api/error/failure');
        else if (!data) {
            var newwish = new Like({
                author: user._id,
                itemId: itemId,
                object: object,
                type: 'wish'
            });
            newwish.save(function (err) {
                if (err)
                    res.redirect('/api/error/failure');
                else {
                    switch (object) {
                        case 'status':
                            Status.findByIdAndUpdate(itemId, {$push: {wishs: newwish._id}}, function (err, stt) {
                                if (err)
                                    res.redirect('/api/error/failure');
                                else if(stt) res.json({success: true, added: false, numadd: (typeof stt.wishs !== "undefined" && stt.wishs) ? stt.wishs.length + 1 : 1});
                            });
                            break;
                        default:
                            res.json({success: false, message: 'Lỗi không xác định được dạng bài!'});
                            break;
                    }
                }
            });
        } else {
            Like.findByIdAndRemove(data._id, function(err, offer){
               if(err) res.redirect('/api/error/failure');
               switch (object){ 
                   case 'status':
                       Status.findByIdAndUpdate(itemId, {$pull: {wishs: offer._id}}, function(err, stt){
                           if(err) res.redirect('/api/error/failure');
                           else if(stt) res.json({success: true, added: true, numadd: (typeof stt.wishs !== "undefined" && stt.wishs) ? stt.wishs.length -1 : 0});
                       });
                       break;
                   default:
                       res.json({success: false, message: 'Không xác định được dạng bài!'});
                       break;
               }
            });
        }
    });
});

module.exports = api;


