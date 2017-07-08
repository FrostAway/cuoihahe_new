var path = require('path');

module.exports = function (express) {
    var api = express.Router();
    api.get('/*', function (req, res) {
        res.sendFile(path.join(__dirname, '../frontend/views/index.html'));
    });
    return api;
};
