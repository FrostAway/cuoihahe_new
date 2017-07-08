var LocalStrategy = require('passport-local').Strategy;
var User = require('../application/models/user');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        return done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            if (err)
                return done(err, false);
            if (!user)
                return done('Không tìm thấy tài khoản này!', false);
            return done(null, user);
        });
    });

    passport.use('login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, done) {
        User.findOne({email: email}, function (err, user) {
            if (err)
                return done(err);
            if (!user)
                return done(null, false, req.flash('loginMessage', 'Tài khoản không tồn tại!'));
            if (!user.comparePassword(password))
                return done(null, false, req.flash('loginMessage', 'Mật khẩu không đúng!'));
            return done(null, user);
        });
    }));

    passport.use('signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, email, password, done) {
        User.findOne({email: email}, function (err, user) {
            if (err){
                return done(err, false);
            }
            if (user) {
                return done(null, false, req.flash('signupMessage', 'Email này đã tồn tại!'));
            }
            var newuser = new User({
                email: email,
                password: password,
                name: req.name
            });
            newuser.save(function (err) {
                if (err)
                    throw err;
                return done(null, newuser);
            });
        });
    }));
};

