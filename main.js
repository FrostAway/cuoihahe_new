var express = require('express');
var path = require('path');
var config = require('./config/constant');
var passport = require('passport');
var bodyParser = require('body-parser');
var mongoose = require('mongoose'); 
var session = require('express-session');
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
var flash = require('connect-flash');
var validator = require('express-validator');

var app = express();

mongoose.connect(config.database, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to database!');
    }
});

app.use(flash());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
//app.use(validator());
app.use(session({
    secret: config.secretKey,
    saveUninitialized: true,
    resave: true
}));

app.use(express.static(path.join(__dirname, '/')));

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

var authApi = require('./application/api/authApi')(express, passport);
app.use('/auth', authApi);

var backendRoute = require('./routes/backend')(express);
app.use('/backend', backendRoute);

require('./routes/apiRoute')(app);

var frontendRoute = require('./routes/fontend')(express);
app.use('/index', frontendRoute);

app.get('/', function(req, res){
    res.redirect('/index');
});

app.listen(config.port, function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log('Server is running on port ' + config.port);
    }
});
