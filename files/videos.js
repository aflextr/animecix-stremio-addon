const axiosRetry = require('axios-retry').default;
const axios = require("axios").default;
const header = require("../header");
const Parser = require("../files/parser");
const crypto = require("crypto");
const https = require("https");
require("dotenv").config({ path: "../dotenv.env" });

const allowLegacyRenegotiationforNodeJsOptions = {
    httpsAgent: new https.Agent({
      // for self signed you could also add
      // rejectUnauthorized: false,
      // allow legacy server
      secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
    }),
  };
axiosRetry(axios, { retries: 3 });

async function GetVideos(id, episode, season) {
    var values = [];
    if (id>0 && episode>0 && season>0) {
        await axios.get(`https://${process.env.WEBSITE_URL}/secure/episode-videos?titleId=${id}&episode=${episode}&season=${season}`, {...allowLegacyRenegotiationforNodeJsOptions, headers: header  }).then((value) => {
        values = value.data;
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
                    //var newUrl = new URL(element2.url);
                    //var linkss = Parser.ParseUrlTAU(newUrl.hostname);
                   // if (linkss ===false) linkss = "tau-video.xyz";
                    //element2.url = `https://${linkss}${newUrl.pathname}`
                    size = Math.round(size).toString();
                    values.push({
                        url:element.url,
                        parseUrl:element2.url,
                        label:element2.label,
                        support:"stremio",
                        size:size+" MB",
                        subName: element.extra,
                        videoProvider:"Tau Video " + "|| Stremiodan izlenebilir"
                    })
                });

                break;

            default:
                //var url = Parser.ParseUrlVideoProviders(element.url,element.name);
                values.push({
                    url:element.url,
                    support:"browser",
                    size:"Boyut Bilinmiyor",
                    subName: element.extra,
                    videoProvider:`${element.name} || Tarayıcıdan izlenebilir`
                })
                break;
        }

    }
    return values;
}


async function TauVideoApi(url) {
    var values = [];
    var cookie = {
        "Cookie": "_ga=GA1.3.442292345.1704378719; turkcealtyazi_org=%7B%22HttpHost%22%3A%22turkcealtyazi.org%22%2C%22Protokol%22%3A%22https%22%2C%22Port%22%3A443%2C%22KulAdSifre%22%3Anull%2C%22UrlAdresi%22%3A%22%5C%2Findex.php%22%2C%22GetVeri%22%3Anull%2C%22GitOpjeId%22%3Anull%2C%22DnsAdresi%22%3A%220%22%2C%22URL_Adresi%22%3A%22https%3A%5C%2F%5C%2Fturkcealtyazi.org%5C%2Findex.php%22%2C%22GirisIP%22%3A%22188.114.97.9%22%7D; tau-video_xyz=%7B%22HttpHost%22%3A%22tau-video.xyz%22%2C%22Protokol%22%3A%22https%22%2C%22Port%22%3A443%2C%22KulAdSifre%22%3Anull%2C%22UrlAdresi%22%3A%22%5C%2F%22%2C%22GetVeri%22%3Anull%2C%22GitOpjeId%22%3Anull%2C%22DnsAdresi%22%3A%220%22%2C%22URL_Adresi%22%3A%22https%3A%5C%2F%5C%2Ftau-video.xyz%5C%2F%22%2C%22GirisIP%22%3A%22104.21.234.158%22%7D; YoncuKoruma=149.86.128.83; OsSavSec-v1=EC49A647D0D584394FC7BE233FB6F17C; __Secure-YoncuSec=EC49A647D0D584394FC7BE233FB6F17C; __Host-YoncuSec=EC49A647D0D584394FC7BE233FB6F17C"
    }
    if (url.length>0) {
        var code = String(url).replace(`https://tau-video.xyz/embed/`, "");
        url = `https://tau-video-dot-xyz.gateway.web.tr/api/video/${code}`;
        await axios.get(url, {...allowLegacyRenegotiationforNodeJsOptions, headers:cookie  } ).then((value) => {
            values = value.data;
        })
    }
    
    return values;
}


module.exports = { GetVideos, ParseVideo }