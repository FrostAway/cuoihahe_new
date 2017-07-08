var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var fns = require('../../helper/functions');

var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    thumbnail_id: {type: Schema.Types.ObjectId, ref: 'File'},
    thumbnail_url: String,
    type: {
        type: String,
        default: 'post'
    },
    content: String,
    excerpt: String,
    cats: [{type: Schema.Types.ObjectId, ref: 'Term'}],
    tags: [{type: Schema.Types.ObjectId, ref: 'Term'}],
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    keyword: String,
    meta_description: String,
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

function preCheck(article){
    console.log(article);
    var slug = (typeof article.slug !== "undefined" && (article.slug.trim() !== '')) ? article.slug : article.title;
    article.slug = fns.toSlug(slug);

    if (typeof article.thumbnail_id !== "undefined") {
        var thumbnail_id = article.thumbnail_id;
        if (!mongoose.Types.ObjectId.isValid(thumbnail_id)) {
            article.thumbnail_id = mongoose.Types.ObjectId(thumbnail_id);
        }
    }
    return article;
}

ArticleSchema.pre('save', function (next) {
    var article = this;
    article = preCheck(article);
    next();
});


module.exports = mongoose.model('Article', ArticleSchema);

