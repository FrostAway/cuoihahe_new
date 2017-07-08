var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var path = require('path');
var fns = require('../../helper/functions');

var FileSchema = new Schema({
    title: String,
    mimetype: String,
    type: String,
    url: {type: String, required: true},
    size: Number,
    author: {type: Schema.Types.ObjectId , ref: 'User'},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

FileSchema.pre('save', function(next){
    var file = this;
    if(typeof file.title !== "undefined"){
        file.title = path.basename(file.url);
    }
    next();
});

FileSchema.methods.getImageSize = function(size){
    var file = this;
    console.log(file);
    return fns.imageSize(file.url, size);
};

module.exports = mongoose.model('File', FileSchema);