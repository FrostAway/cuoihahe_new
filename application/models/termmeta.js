var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TermmetaSchema = new Schema({
   term_id: {type: Schema.Types.ObjectId, ref: 'Term'},
   child_id: {type: Schema.Types.ObjectId, ref: 'Term'},
   far: {type: Number, default: 1}
});

module.exports = mongoose.model('TermMeta', TermmetaSchema);


