var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LikeSchema = new Schema({
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    clienIP: String,
    itemId: {type: Schema.Types.ObjectId},
    object: String,
    type: {type: String, default: 'like'},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Like', LikeSchema);

