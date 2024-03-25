const axiosRetry = require('axios-retry').default;
const axios = require("axios").default;
const header = require("../header");
const Parser = require("./parser");
;
require("dotenv").config({ path: "../.env" });


axiosRetry(axios, { retries: 3 });

async function GetVideos(id, episode, season) {
    var values = [];
    if (id > 0 && episode > 0 && season > 0) {
        await axios.get(`https://${process.env.PROXY_URL}/secure/episode-videos?titleId=${id}&episode=${episode}&season=${season}`, { headers: header }).then((value) => {
            if (value && value.status == 200 && value.statusText == "OK") {
                values = value.data;
            }
        })
    }

    return values;
}


async function ParseVideo(list) {
    var values = [];

    for (let element of list) {

        switch (element.name) {
            case "Tau Video":
                var links = await TauVideoApi(element.url);
                links.urls.forEach(element2 => {
                    var size = element2.size / 1024000;
                    var newUrl = new URL(element2.url);
                    var linkss = Parser.ParseUrlTAU(newUrl.hostname);
                    if (linkss === false) linkss = "tau-video.xyz";
                    element2.url = `https://${linkss}${newUrl.pathname}`
                    size = Math.round(size).toString();
                    values.push({
                        url: element.url,
                        parseUrl: element2.url,
                        label: element2.label,
                        support: "stremio",
                        size: size + " MB",
                        subName: element.extra,
                        videoProvider: "Tau Video " + "|| Stremiodan izlenebilir"
                    })
                });

                break;

            default:
                var url = Parser.ParseUrlVideoProviders(element.url, element.name);
                values.push({
                    url: url,
                    support: "browser",
                    size: "Boyut Bilinmiyor",
                    subName: element.extra,
                    videoProvider: `${element.name} || Tarayıcıdan izlenebilir`
                })
                break;
        }

    }
    return values;
}


async function TauVideoApi(url) {
    var values = [];
    if (url.length > 0) {
        var code = String(url).replace(`https://i7461752d766964656fo78797az.oszar.com/embed/`, "");
        url = `https://i7461752d766964656fo78797az.oszar.com/api/video/${code}`;
        await axios.get(url, { headers: header }).then((value) => {
            if (value && value.status == 200 && value.statusText == "OK") {
                values = value.data;
            }
        })
    }

    return values;
}


module.exports = { GetVideos, ParseVideo }