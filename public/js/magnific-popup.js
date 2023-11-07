function magnificPopup() {
    $('.image-popup').magnificPopup({
        type: 'image',

        closeOnContentClick: true,
        closeBtnInside: false,
        fixedContentPos: true,
        mainClass: 'mfp-no-margins mfp-with-zoom mfp-img-mobile',
        midClick: true,
        image: {
            verticalFit: true
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