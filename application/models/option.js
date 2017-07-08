var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var OptionSchema = new Schema({
    key: String,
    keyval: String
});

module.exports = mongoose.model('Option', OptionSchema);


