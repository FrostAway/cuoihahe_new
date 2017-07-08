var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MenuSchema = new Schema({
    title: String,
    order: Number,
    parent: Schema.Types.ObjectId,
    link: String,
    item_type: {
        type: String,
        default: 'category'
    },
    item_id: Schema.Types.ObjectId,
    target: {
        Type: String,
        default: ''
    },
    class: String
});

module.exports = mongoose.model('Menu', MenuSchema);
