var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

var api = express.Router();

api.get('/load', function (req, res) {
    var url = req.query.url;
    var urltype = req.query.type;
    request(url, function (err, response, html) {
        if (!err && response.statusCode === 200) {
            var $ = cheerio.load(html);
            if (urltype === 'uplink') {
                if (url.indexOf('pinterest.com') > -1) {
                    var imgsrc = $('.heightContainer img').attr('src');
                    if (imgsrc) {
                        var img = {
                            src: imgsrc,
                            alt: $('.heightContainer img').attr('alt')
                        };
                        res.status(200).json({success: true, data: img});
                    }else{
                        res.json({success: false, message: 'Không tìm thấy gì!'});
                    }
                }else if(url.indexOf('giphy.com') > -1){
                    var elimg = $('.gif-figure-container .gif-figure img');
                    var imgsrc = elimg.attr('src');
                    if(imgsrc){
                        var img = {
                            src: imgsrc,
                            alt: elimg.attr('alt')
                        };
                        res.status(200).json({success: true, data: img});
                    }
                }else if(url.indexOf('haivn.com') > -1){
                    var elimg = $('.content-detail .badge-item-img');
                    var imgsrc = elimg.attr('src');
                    if(imgsrc){
                        var img = {
                            src: imgsrc,
                            alt: elimg.attr('alt')
                        };
                        res.status(200).json({success: true, data: img});
                    }
                }else if(url.indexOf('photobucket.com') > -1){
                    var elimg = $('.currentView img');
                    var imgsrc = elimg.attr('src');
                    if(imgsrc){
                        var img = {
                            src: imgsrc,
                            alt: elimg.attr('alt')
                        };
                        res.status(200).json({success: true, data: img});
                    }
                }else{
                    res.json({success: false, message: 'Không hỗ trợ linh này!'});
                }
            } else if (urltype === 'youtube') {
                if (url.indexOf('youtube.com') > -1) {
                    var ytid = '';
                    var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
                    var match = url.match(regExp);
                    if (match && match[2].length === 11) {
                        ytid = match[2];
                    }
                    if (ytid !== '') {
                        var img = {
                            ytid: ytid,
                            title: $('#eow-title').text(),
                            content: $('#eow-description').text(),
                            src: 'http://img.youtube.com/vi/' + ytid + '/0.jpg'
                        };
                        res.status(200).json({success: true, data: img});
                    }else{
                        res.json({success: false, message: 'Không tìm thấy gì!'});
                    }
                }else{
                    res.json({success: false, message: 'Không hỗ trợ linh này!'});
                }
            } else {
                res.json({success: false, message: 'Không hỗ trợ link này!'});
            }
        } else {
            res.redirect('/api/error/notsupport');
        }
        
//        setTimeout(function(){
//            res.json({success: false, message: 'Không tìm thấy gì'});
//        }, 30000);
    });
});

module.exports = api;


