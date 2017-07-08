var express = require('express');

var api = express.Router();


api.get('/authorize', function (req, res) {
    res.status(403).json({success: false, message: 'Bạn không có quyền thực hiện!'});
});
api.put('/authorize', function (req, res) {
    res.status(403).json({success: false, message: 'Bạn không có quyền thực hiện!'});
});
api.delete('/authorize', function (req, res) {
    res.status(403).json({success: false, message: 'Bạn không có quyền thực hiện!'});
});
api.get('/notlogin', function (req, res) {
    res.status(401).json({success: false, message: 'Bạn cần đăng nhập!'});
});
api.get('/failure', function (req, res) {
    res.status(500).json({success: false, message: 'Có lỗi xảy ra!'});
});
api.get('/notfound', function (req, res) {
    res.status(404).json({success: false, message: 'Không tìm thấy gì!'});
});
api.get('/exists', function (req, res) {
    res.status(500).json({success: false, message: req.flash('message')});
});

api.get('/notsupport', function(req, res){
   res.status(500).json({success: false, message: 'Không hỗ trợ linh này!'}); 
});

module.exports = api;
