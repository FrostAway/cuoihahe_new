var path = require('path');
var viewPath = path.resolve()+'/backend/views/';

module.exports = function(app, express){
    var route = express.Router();
    app.use(express.static(path.resolve()));
    route.get('/*', function(req, res){
        res.sendFile(viewPath+'index.html');
    });
    
    return route;
};


