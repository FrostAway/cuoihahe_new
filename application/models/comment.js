var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    content: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: 'Status'
    },
    clientIP: String,
    agent: String,
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Comment', CommentSchema);


