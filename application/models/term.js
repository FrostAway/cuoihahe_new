var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var fns = require('../../helper/functions');

var TermSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    icon: String,
    slug: {
        type: String
    },
    type: {
        type: String,
        default: 'cat'
    },
    order: String,
    description: String,
    parent: {
        type: Schema.Types.ObjectId,
        default: null,
        ref: 'Term'
    },
    count: {
        type: Number,
        default: 0
    },
    keyword: String,
    meta_description: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

TermSchema.pre('save', function (next) {
    var term = this;

    if (typeof term.parent !== "undefined" && term.parent == 0) {
        term.parent = null;
    }
    var slug = (typeof term.slug !== "undefined") ? term.slug : term.name;
    term.slug = fns.toSlug(slug);

    next();
});

TermSchema.pre('findByIdAndUpdate', function (next) {
    var term = this;
    term.updated_at = Date.now;
    console.log('before update');
    next();
});


module.exports = mongoose.model('Term', TermSchema);


