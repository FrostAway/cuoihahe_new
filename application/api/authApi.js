var User = require('../models/user');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');
var config = require('../../config/constant');
var mailer = require('nodemailer');

function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({success: false, message: 'Bạn cần đăng nhập'});
}

module.exports = function (express, passport) {
    var api = express.Router();

    api.get('/loginFailure', function (req, res) {
        res.status(401).json({success: false, message: req.flash('loginMessage')});
    });

    api.get('/signupFailure', function (req, res) {
        res.status(401).json({success: false, message: req.flash('signupMessage')});
    });

    api.get('/loginToken', function (req, res) {
        res.status(401).json({success: false, message: 'Lỗi token!'});
    });

    api.post('/login', passport.authenticate('login', {
        failureRedirect: '/auth/loginFailure',
        failureFlash: true
    }), function (req, res) {
        jwt.sign({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role
        }, config.secretKey, {expiresIn: config.tokenTime}, function (err, token) {
            if (err) {
                res.redirect('/auth/loginToken');
            } else {
                res.json({success: true, user: req.user, token: token});
            }
        });
    });

    api.post('/signup', function (req, res) {
        var name = req.body.name;
        var email = req.body.email;
        var password = req.body.password;
        var repassword = req.body.repassword;

        if (!email || !password || !repassword) {
            return res.json({success: false, message: 'Hãy nhập đầy đủ thông tin!'});
        }
        User.findOne({email: email}, function (err, user) {
            if (err)
                res.redirect('/api/error/failure');
            if (user) {
                return res.json({success: false, message: 'Email đã tồn tại!'});
            }
            if (password !== repassword) {
                return res.json({success: false, message: 'Mật khẩu không khớp!'});
            }
            var newUser = new User({
                name: name,
                email: email,
                password: password
            });
            newUser.save(function (err) {
                if (err)
                    res.redirect('/api/error/failure');
                return res.json({success: true, message: 'Đăng ký thành công!'});
            });
        });
    });

    api.get('/me', isAuthenticated, function (req, res) {
        res.json(req.user);
    });

    api.post('/update', isAuthenticated, function (req, res) {
        var udUser = req.body;
        bcrypt.hash(udUser.password, null, null, function (err, hash) {
            if (err) {
                res.redirect('/api/error/failure');
            }
            udUser.password = hash;
            User.findOneAndUpdate({email: udUser.email}, {$set: udUser}, function (err, udItem) {
                if (err || !udItem)
                    res.redirect('/api/error/failure');
                else {
                    res.json({success: true, message: 'Cập nhật thành công!'});
                }
            });
        });
    });

    api.get('/checklogin', isAuthenticated, function (req, res) {
        res.status(200).json({success: true, message: 'Bạn đã đăng nhập!'});
    });

    api.get('/logout', function (req, res) {
        if (req.isAuthenticated()) {
            req.logout();
        }
        res.json({success: true, message: 'Đã đăng xuất!'});
    });

    function randomStr(m) {
        var m = m || 9;
        s = '', r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < m; i++) {
            s += r.charAt(Math.floor(Math.random() * r.length));
        }
        return s;
    }

    api.post('/forgetpassword', function (req, res) {
        var email = req.body.email;
        User.findOne({email: email}, function (err, user) {
            if (err)
                res.redirect('/api/error/failure');
            if (!user) {
                res.json({success: false, message: 'Không tồn tại email này'});
            } else {
                var token = randomStr(21);
                user.resetPasswordToken = token;
                user.resetPssswordExpires = Date.now() + 1800000;
                user.save(function (err) {
                    if (err)
                        res.redirect('/api/error/failure');
                    var mailOptions = {
                        to: user.email,
                        from: config.smtp_email,
                        subject: 'Đặt lại mật khẩu trên trang cuoihahe',
                        text: 'Bạn đã yêu cầu đặt lại mật khẩu trên trang cuoihahe \n\n Vui lòng chọn vào đường dẫn dưới đây để đặt lại mật khẩu: \n\n' +
                                'http://' + req.headers.host + '/index/reset_password/' + token + '\n\n'
                    };
                    var smtpTransport = mailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: config.smtp_email,
                            pass: config.smtp_pass
                        }
                    });
                    smtpTransport.sendMail(mailOptions, function (err) {
                        if (err) {
                            console.log(err);
                            res.redirect('/api/error/failure');
                        } else {
                            res.json({success: true, message: 'Một email đã được gửi đến ' + user.email + '. Vui lòng làm theo hướng dẫn trong email để lấy lại mật khẩu!'});
                        }
                    });
                });
            }
        });
    });

    api.post('/resetpassword', function (req, res) {
        var token = req.body.token;
        var resetData = req.body.resetPass;
        User.findOne({resetPasswordToken: token, resetPssswordExpires: {$gt: Date.now()}}, function (err, user) {
            if (err) {
                res.redirect('/api/error/failure');
            }
            if (!user) {
                res.json({success: false, message: 'Đã hết thời gian đặt lại mật khẩu!'});
            } else {
                if (resetData.password !== resetData.repassword) {
                    res.json({success: false, message: 'Mật khẩu không khớp'});
                }else{
                    user.password = resetData.password;
                    user.resetPasswordToken = undefined;
                    user.resetPssswordExpires = undefined;
                    user.save(function(err){
                        if(err) res.redirect('/api/error/failure');
                        res.json({success: true, message: 'Đặt lại mật khẩu thành công!'});
                    });
                }
            }
        });
    });

    return api;
};


