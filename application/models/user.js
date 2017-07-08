var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'author'
    }, 
    resetPasswordToken: String,
    resetPssswordExpires: Date,
    created_at: { type: Date, default: Date.now()},
    updated_at: {type: Date, default: Date.now}
});

UserSchema.pre('save', function (next) {
    var user = this;
    if (user.isModified('password') || user.isNew) {
        bcrypt.hash(user.password, null, null, function (err, hash) {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    } else {
        return next();
    }
});

UserSchema.methods.comparePassword = function (password) {
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);

