function magnificPopup() {
    $('.image-popup').magnificPopup({
        type: 'image',

        closeOnContentClick: true,
        closeBtnInside: false,
        fixedContentPos: true,
        mainClass: 'mfp-no-margins mfp-with-zoom mfp-img-mobile',
        midClick: true,
        image: {
            verticalFit: true,
            tError: '<a href="%url%">The image #%curr%</a> could not be loaded.',
            navigateByImgClick: true,
            titleSrc: function (item) {
                return item.el.attr('title') + ' &middot; <a class="image-source-link" target="_blank" download="' + item.el.attr('title') + '" href="' + item.el.attr('href') + '" >image source</a>';
            }
        },
        gallery: {
            enabled: true
        },
        zoom: {
            enabled: true,
            duration: 300,
            easing: 'ease-in-out',
        }
    });
}