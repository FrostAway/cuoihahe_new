var permiss = require('../../config/permission');
var express = require('express');

var api = express.Router();

api.post('/check', permiss.check, function(req, res){
    res.json({success: true});
});

module.exports = api;

