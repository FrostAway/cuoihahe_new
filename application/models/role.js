var mongoose = require('mongoose');
var Schema = mongoose.Schema;

RoleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    cap: {
        type: [String],
        default: ['read']
    }
});

module.exports = mongoose.model('Role', RoleSchema);
