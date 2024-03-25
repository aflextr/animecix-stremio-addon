

function ParseUrlTAU(url) {
    var values;
    switch (url) {
        case "i6b652d6a69757369o73697465z.oszar.com":
            values = "ke-jiusi.site";
            break;
        case "i78752d71696e67o73697465z.oszar.com":
            values = "xu-qing.site";
            break;
        case "i66616e672d64616f7a69o73697465z.oszar.com":
            values = "fang-daozi.site";
            break;
        case "i6f6c6976656d696c6b79776179646f7279626565o636664z.oszar.com":
            values = "olivemilkywaydorybee.cfd";
            break;
        case "i6b652d79756e686169o73697465z.oszar.com":
            values = "ke-yunhai.site";
            break;
        case "i6368752d797579616eo73697465z.oszar.com":
            values = "chu-yuyan.site";
            break;
        case "i6f6c6976656d696c6b79776179646f7279626565o6175746f73z.oszar.com":
            values = "olivemilkywaydorybee.autos";
            break;
        case "i6f6c6976656d696c6b79776179646f7279626565o626561757479z.oszar.com":
            values = "olivemilkywaydorybee.beauty";
            break;
        case "i66616e672d78757a686f6e67o73697465z.oszar.com":
            values = "fang-xuzhong.site";
            break;
        case "i66616e672d6c696e6865o73697465z.oszar.com":
            values = "fang-linhe.site";
            break;
        case "i6569676874682d70617261676f6eo73697465z.oszar.com":
            values = "eighth-paragon.site";
            break;
        case "i686f6e672d62696eo73697465z.oszar.com":
            values = "hong-bin.site";
            break;
        case "i696874617532o6f6e6c696e65z.oszar.com":
            values = "ihtau2.online";
            break;
        case "i696c74617532o6f6e6c696e65z.oszar.com":
            values = "iltau2.online";
            break;
        case "i777777o6261636b626c617a65o636f6dz.oszar.com":
            values = "ictau2.site";
            break;
        case "i697274617531o6f6e6c696e65z.oszar.com":
            values = "irtau1.online";
            break;
        case "i6c69752d7a69636875616eo73697465z.oszar.com":
            values = "liu-zichuan.site";
            break;
        case "i777777o6261636b626c617a65o636f6dz.oszar.com":
            values = "li-dafu.site";
            break;
        default:
            values = false;
            break;
    }
    return values;
}

function ParseUrlVideoProviders(url, provider) {
    var value;
    var newUrl = new URL(url);
    if (provider === "Sibnet" || provider === "Sibnet ") {
        value = `https://video.sibnet.ru${newUrl.pathname}${newUrl.search}`;
    } else if (provider === "Streamtape" || provider === "Streamtape ") {
        value = `https://streamtape.com${newUrl.pathname}${newUrl.search}`;
    } else if (provider === "Abcvideo" || provider === "Abcvideo ") {
        value = `https://abcvideo.cc${newUrl.pathname}${newUrl.search}`;
    } else if (provider === "Vudeo" || provider === "Vudeo ") {
        value = `https://vudeo.net${newUrl.pathname}${newUrl.search}`;
    } else if (provider === "Doodstream" || provider === "Doodstream ") {
        value = `https://dood.watch${newUrl.pathname}${newUrl.search}`;
    } else if (provider === "Cloudvideo" || provider === "Cloudvideo ") {
        value = `https://cloudvideo.tv${newUrl.pathname}${newUrl.search}`;
    } else if (provider === "Uqload" || provider === "Uqload ") {
        value = `https://uqload.com${newUrl.pathname}${newUrl.search}`;
    } else if (provider === "Voe" || provider === "Voe ") {
        value = `https://voe.sx${newUrl.pathname}${newUrl.search}`;
    } else if (provider === "Mail" || provider === "Mail ") {
        value = `https://my.mail.ru${newUrl.pathname}${newUrl.search}`;
    } else if (provider === "Ok" || provider === "Ok ") {
        value = `https://odnoklassniki.ru${newUrl.pathname}${newUrl.search}`;
    } else if (provider === "Dailymotion" || provider === "Dailymotion ") {
        value = `https://www.dailymotion.com${newUrl.pathname}${newUrl.search}`;
    } else {

    }
    return value;
}

module.exports = { ParseUrlTAU, ParseUrlVideoProviders };