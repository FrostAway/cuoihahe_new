module.exports = {
    port: process.env.PORT || 8080,
    database: 'mongodb://skyfrost07:vanlam07@ds021343.mlab.com:21343/chh_db',
    secretKey: 'pinlakey',
    tokenTime: 1440,
    upload_dir: 'public/uploads/',
    sizes: {
        thumbnail: {width: 100, height: 100, crop: true},
        medium: {width: 300, height: 200, crop: false},
        larg: {width: 800, height: 600, crop: false}
    },
    defaultImg: 'public/images/default.gif',
    per_page: 20,
    smtp_email: 'skyfrost.07@gmail.com',
    smtp_pass: 'sivxcqczegovqplf'
};


