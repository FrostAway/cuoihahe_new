var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var fns = require('../../helper/functions');

var StatusSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    fileId: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },
    filetype: {type: String, default: 'image'},
    fromUrl: String,
    videoId: String,
    type: {type: String, default: 'upload'},
    youtubeId: String,
    content: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    source: String,
    cats: [{type: Schema.Types.ObjectId, ref: 'Term'}],
    tags: [{type: Schema.Types.ObjectId, ref: 'Term'}],
    views: {
        type: Number, default: 0
    },
    likes: [{type: Schema.Types.ObjectId, ref: 'Like'}],
    wishs: [{type: Schema.Types.ObjectId, ref: 'Like'}],
    status: {type: Number, default: 1},
    key_word: String,
    meta_description: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_ad: {
        type: Date,
        default: Date.now
    }
});

StatusSchema.pre('save', function(next){
   var status = this;
   var slug = (typeof status.slug !== "undefined") ? status.slug : status.title;
   status.slug = fns.toSlug(slug);
   next();
});

module.exports = mongoose.model('Status', StatusSchema);


