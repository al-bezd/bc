function UploadApp() {
    let initialized = function (event) {
        window.downloader.get(url_to_base+'/barcode2020/hs/barcode/app-debug.apk');
        event.target.removeEventListener(event.name, initialized);
    };

    document.addEventListener('DOWNLOADER_initialized', initialized);

    window.downloader.init({
      folder: 'Download'
        //folder: './',
        //unzip: true,
        //check: false,
        //noMedia: true,
        //wifiOnly: false
    });
}
