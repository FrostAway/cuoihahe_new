var permission = require('../config/permission');
var errorApi = require('../application/api/errorApi');
var userApi = require('../application/api/userApi');
var optionApi = require('../application/api/optionApi');
var statusApi = require('../application/api/statusApi');
var articleApi = require('../application/api/articleApi');
var categoryApi = require('../application/api/categoryApi');
var tagApi = require('../application/api/tagApi');
var commentApi = require('../application/api/commentApi');
var fileApi = require('../application/api/fileApi');
var scrapeApi = require('../application/api/scrapeApi');
var likeApi = require('../application/api/likeApi');
var permissionApi = require('../application/api/permissionApi');

module.exports = function (app) {
    app.use('/api/error', errorApi);
    app.use('/api/permission', permissionApi);
//    user
    app.use('/api/user', userApi);
//    file
    app.use('/api/file', fileApi);
//    options
    app.use('/api/option', permission.user_can('manage_options'), optionApi);
//    status
    app.use('/api/status', statusApi); 
//    article
    app.use('/api/article', articleApi);
//    category
    app.use('/api/category', categoryApi);
//    tags
    app.use('/api/tag', tagApi);
//    comemnt
    app.use('/api/comment', commentApi);
//    scrape
    app.use('/api/scrape', scrapeApi);
//    likes
    app.use('/api/like', likeApi);
};

