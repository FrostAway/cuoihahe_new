var Option = require('../application/models/option');

function getValue(keyname, cb) {
    Option.findOne({key: keyname}, function (err, data) {
        if (err)
            cb(null);
        else if (!data)
            cb(null);
        else { 
            cb(data.keyval);
        }
    });
}

function updateValue(keyname, keyval, cb) {
    Option.findOneAndUpdate({key: keyname}, {$set: {keyval: keyval}}, function (err, updoc) {
        if (err)
            cb(false);
        if (!updoc) {
            var option = new Option({
                key: keyname,
                keyval: keyval
            });
            option.save(function (err) {
                if (err)
                    cb(false);
            });
        }
        cb(true);
    });
}

module.exports = {
    get: getValue,
    update: updateValue
};

