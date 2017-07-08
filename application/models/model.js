
module.exports = function(schema){
    return {
        getAll: function(args, cb){
            var page = 1;
            var per_page = 20;
            var fields = ['*'];
            var key = '';
            var searchFields = ['title', 'slug'];
            var orderby = 'created_at';
            var order = 'desc';
            var findqr = {
            };
            schema.find(args);
        },
        create: function(data, cb){
            var newdata = new scheam(data);
            newdata.save(cb);
        },
        update: function(id, data, cb){
            schema.findByIdAndUpdate(id, data, cb);
        },
        delete: function(id, cb){
            schema.findByIdAndRemove(id, cb);
        }
    };
};

