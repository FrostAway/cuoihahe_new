var config = require('../config/constant');
var sizes = config.sizes;
var fs = require('fs');

function extName(filename) {
    var splName = filename.split('.');
    var len = splName.length;
    var ext = splName[len - 1];
    delete splName[len - 1];
    var nameNoExt = splName.join('.');
    nameNoExt = nameNoExt.slice(0, nameNoExt.length - 1);
    return {ext: ext, name: nameNoExt};
}

function genUrlSize(url) {
    var pathSize = [];
    var splName = extName(url);
    for (var size in sizes) {
        var imgsize = sizes[size];
        pathSize.push(splName.name + '_' + imgsize.width + 'x' + imgsize.height + '.' + splName.ext);
    }
    return pathSize;
} 

module.exports = {
    extName: extName, 
    imageSize: function (url, size) {
        if (typeof sizes[size] !== "undefined") {
            var splName = extName(url);
            var imgsize = sizes[size];
            var filePath = splName.name + '_' + imgsize.width + 'x' + imgsize.height + '.' + splName.ext;
            if(fs.existsSync(filePath)){
                return filePath;
            }
        }
        return url;
    },
    toSlug: function (title) {
        var slug = title.toLowerCase();
        //Đổi ký tự có dấu thành không dấu
        slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
        slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
        slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
        slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
        slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
        slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
        slug = slug.replace(/đ/gi, 'd');
        //Xóa các ký tự đặt biệt
        slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|\'|\"|\:|\;|_/gi, '');
        //Đổi khoảng trắng thành ký tự gạch ngang
        slug = slug.replace(/ /gi, "-");
        //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
        //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
        slug = slug.replace(/\-\-\-\-\-/gi, '-');
        slug = slug.replace(/\-\-\-\-/gi, '-');
        slug = slug.replace(/\-\-\-/gi, '-');
        slug = slug.replace(/\-\-/gi, '-');
        //Xóa các ký tự gạch ngang ở đầu và cuối
        slug = '@' + slug + '@';
        slug = slug.replace(/\@\-|\-\@|\@/gi, '');
        return slug;
    }
};
