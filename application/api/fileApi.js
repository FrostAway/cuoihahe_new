var express = require('express');
var File = require('../models/file');
var OP = require('../../helper/options');
var path = require('path');
var config = require('../../config/constant');
var fns = require('../../helper/functions');
var jimp = require('jimp');
var multer = require('multer');
var fs = require('fs');
var dest = 'public/uploads/';
var permiss = require('../../config/permission');

function getType(mimetype) {
    var type = 'image';
    switch (mimetype) {
        case 'image/gif':
        case 'gif':
            type = 'gif';
            break;
        default:
            break;
    }
    return type;
}

//file extension
function expExt(filename) {
    var splName = filename.split('.');
    var len = splName.length;
    var ext = splName[len - 1];
    delete splName[len - 1];
    var nameNoExt = splName.join('.');
    nameNoExt = nameNoExt.slice(0, nameNoExt.length - 1);
    return {ext: ext, name: nameNoExt};
}

var storage = multer.diskStorage({
    destination: dest,
    filename: function (req, file, cb) {
        var name = file.originalname;
        if (fs.existsSync(dest + name)) {
            var expName = expExt(name);
            name = expName.name + '_1.' + expName.ext;
        }
        cb(null, name);
    }
});

var api = express.Router();

api.get('/all', function (req, res) {
    var params = req.query;
    var page = params.page || 1;
    var per_page = parseInt(params.per_page) || config.per_page;
    if (per_page === -1) {
        per_page = 1000;
    }
    var orderby = params.orderby || 'created_at';
    var order = params.order || 'desc';
    var excerpt = params.excerpt || [];
    var findQuery = {};
    if (excerpt.length > 0) {
        findQuery._id = {$nin: excerpt};
    }
    var key = params.key || '';
    if (key) {
        findQuery.name = new RegExp(key, 'i');
    }

    File.find(findQuery).sort([[orderby, order]]).limit(per_page).skip(per_page * (page - 1)).exec(function (err, items) {
        if (err) {
            throw err;
        }
        File.count(findQuery, function (err, count) {
            if (err)
                throw err;
            var totalPage = Math.ceil(count / per_page);
            res.json({data: items, pages: totalPage, page: page});
        });
    });
});

api.get('/view', function (req, res) {
    var itemId = req.query.itemId;
    var fields = req.query.fields;
    File.findById(itemId).select(fields).exec(function (err, file) {
        if (err)
            res.redirect('/api/error/failure');
        res.json(file);
    });
});

api.get('/thumbnail', function (req, res) {
    var size = req.query.size;
    var fileId = req.query.fileId;
    File.findById(fileId).select('url').exec(function (err, file) {
        if (err || !file) {
            res.status(200).json(config.defaultImg);
        } else {
            var url = file.url;
            res.json(fns.imageSize(url, size));
        }
    });
});

api.post('/create', permiss.user_can('upload_files'), function (req, res) {
    res.json({success: true, message: 'Tải lên thành công!'});
});

api.post('/createbyurl', permiss.user_can('upload_files'), function (req, res) {
    var fileurl = req.body.fileurl;
    var extname = fns.extName(fileurl);
    var newFile = new File({
        title: path.basename(fileurl),
        mimetype: extname.ext,
        type: 'image',
        url: fileurl,
        author: req.user._id
    });
    newFile.save(function (err) {
        if (err)
            res.redirect('/api/error/failure');
        res.json({message: 'Tạo file thành công!', data: newFile});
    });
});

api.put('/update/:id', permiss.user_can('edit_private_file'), function (req, res) {
    File.findByIdAndUpdate(req.params.id, {$set: req.body}, {new : true}, function (err, doc) {
        if (err)
            throw err;
        res.json({message: 'Cập nhật thành công', data: doc});
    });
});

api.delete('/delete/:id', permiss.user_can('delete_private_file'), function (req, res) {
    File.findByIdAndRemove(req.params.id, function (err, offer) {
        if (err)
            res.redirect('/api/error/failure');

        var sizes = config.sizes;
        var url = offer.url;
        if (fs.existsSync(url)) {
            fs.unlinkSync(url);
        }
        for (var size in sizes) {
            var extName = expExt(url);
            var imgsize = sizes[size];
            var urlsize = extName.name + '_' + imgsize.width + 'x' + imgsize.height + '.' + extName.ext;
            if (fs.existsSync(urlsize)) {
                fs.unlinkSync(urlsize);
            }
        }
        res.json({message: 'Đã xóa!'});
    });
});

api.post('/multidelete', permiss.user_can('delete_other_files'), function (req, res) {
    var items = req.body;
    var sizes = config.sizes;
    for (var i in items) {
        (function (i) {
            var id = items[i];
            File.findByIdAndRemove(id, function (err, offer) {
                var sizes = config.sizes;
                var url = offer.url;
                if (fs.existsSync(url)) {
                    fs.unlinkSync(url);
                }
                for (var size in sizes) {
                    var extName = expExt(url);
                    var imgsize = sizes[size];
                    var urlsize = extName.name + '_' + imgsize.width + 'x' + imgsize.height + '.' + extName.ext;
                    if (fs.existsSync(urlsize)) {
                        fs.unlinkSync(urlsize);
                    }
                }
            });
        })(i);
    }
    res.json({message: 'Đã xóa!'});
});

api.post('/doupload', permiss.user_can('upload_files'), multer({
    storage: storage
}).single('file'), function (req, res) {
    var file = req.file;
    var fileUrl = file.destination + file.filename;
    var extName = expExt(file.filename);

    //resize image
    var sizes = config.sizes;
    if(extName.ext !== 'gif')
    for (var size in sizes) {
        (function (size) {
            jimp.read(fileUrl).then(function (image) {
                var w = sizes[size].width, h = sizes[size].height, isCrop = sizes[size].crop;
                var iw = image.bitmap.width, ih = image.bitmap.height;
                if (w < iw || h < ih) {
                    var rh = 0, rw = 0, sw = 0, sh = 0;
                    if (iw / w > ih / h) {
                        rh = h;
                        rw = iw * (h / ih);
                        sw = (rw - w) / 2;
                    } else {
                        rw = w;
                        rh = ih * (w / iw);
                        sh = (rh - h) / 2;
                    }
                    image.resize(rw, rh);
                    if (isCrop) {
                        image.crop(sw, sh, w, h);
                    }
                    image.quality(80).write(file.destination + extName.name + '_' + w + 'x' + h + '.' + extName.ext);
                }
            }).catch(function (err) {
                console.log(err);
            });
        })(size);
    }
    //end resize;

    var newFile = new File({
        title: file.filename,
        mimetype: file.mimetype,
        type: getType(file.mimetype),
        url: fileUrl,
        size: file.size,
        author: req.user._id
    });
    newFile.save(function (err) {
        if (err)
            res.redirect('/api/error/failure');
        res.json({message: 'Tải lên thành công!', data: newFile});
    });
});

api.post('/domove', permiss.user_can('upload_files'), function (req, res) {
    var fileUrl = req.body.fileUrl;
    if(fileUrl.indexOf('http:') === -1){
        fileUrl = 'http:'+fileUrl;
    }
    console.log(fileUrl);
    var sizes = config.sizes;
    var upload_dir = config.upload_dir;
    var extName = fns.extName(path.basename(fileUrl));
    console.log(extName);
    if (extName.ext != 'gif') {
        for (var size in sizes) {
            (function (size) {
                jimp.read(fileUrl).then(function (image) {
                    var w = sizes[size].width, h = sizes[size].height, isCrop = sizes[size].crop;
                    var iw = image.bitmap.width, ih = image.bitmap.height;
                    if (w < iw || h < ih) {
                        var rh = 0, rw = 0, sw = 0, sh = 0;
                        if (iw / w > ih / h) {
                            rh = h;
                            rw = iw * (h / ih);
                            sw = (rw - w) / 2;
                        } else {
                            rw = w;
                            rh = ih * (w / iw);
                            sh = (rh - h) / 2;
                        }
                        image.resize(rw, rh);
                        if (isCrop) {
                            image.crop(sw, sh, w, h);
                        }
                        console.log(upload_dir + extName.name + '_' + w + 'x' + h + '.' + extName.ext);
                        image.quality(80).write(upload_dir + extName.name + '_' + w + 'x' + h + '.' + extName.ext);
                    }
                }).catch(function (err) {
                    console.log(err);
                });
            })(size);
        }
    }
    //end resize;
    jimp.read(fileUrl).then(function (image) {
        var filename = upload_dir + path.basename(fileUrl);
        image.write(filename);
        var newFile = new File({
            title: path.basename(fileUrl),
            mimetype: image._originalMime,
            type: getType(image._originalMime),
            url: filename,
            author: req.user._id
        });
        newFile.save(function (err) {
            if (err)
                res.redirect('/api/error/failure');
            res.json({message: 'Tải lên thành công!', data: newFile});
        });
    }).catch(function (err) {
        var http = require('http');
        if(fileUrl.indexOf('https') > -1){
            http = require('https');
        }
        var rand = Math.floor(Math.random()*(9999999));
        var filename = upload_dir + rand+'_'+path.basename(fileUrl);
        http.get(fileUrl, function (response) {
            if (response.statusCode === 200) {
                var file = fs.createWriteStream(filename);
                response.pipe(file);

                var newFile = new File({
                    title: path.basename(fileUrl),
                    mimetype: extName.ext,
                    type: getType(extName.ext),
                    url: filename,
                    author: req.user._id
                });
                newFile.save(function (err) {
                    if (err)
                        res.redirect('/api/error/failure');
                    res.json({message: 'Tải lên thành công!', data: newFile});
                });
            }else{
                res.status(404).json({message: 'Không hỗ trợ link này!'});
            }
        });
    });
});

module.exports = api;

