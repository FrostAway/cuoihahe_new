var path = require('path');
var permiss = require('../config/permission');

module.exports = function (express) {
    var api = express.Router();
    api.get('/*', function (req, res) {
        res.sendFile(path.join(__dirname, '../backend/views/index.html'));
    });
    return api;
};


