(function ($) {

    var wheight = screen.height;
    $(window).scroll(function () {
        var scTop = $(window).scrollTop();
        if (scTop > (wheight / 2)) {
            $('#backtop').removeClass('hidden');
        } else {
            $('#backtop').addClass('hidden');
        }
    });

    $('#backtop').click(function (e) {
        e.preventDefault();
        $('body, html').animate({scrollTop: 0}, 1000);
    });

})(jQuery);




