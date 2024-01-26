const axiosRetry = require('axios-retry').default;
const axios = require("axios").default;
const crypto = require("crypto");
const https = require("https");
const header = require("../header");
require("dotenv").config({ path: "../.env" })

const allowLegacyRenegotiationforNodeJsOptions = {
    httpsAgent: new https.Agent({
        // for self signed you could also add
        // rejectUnauthorized: false,
        // allow legacy server
        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
    }),
};

axiosRetry(axios, { retries: 3 });
async function SearchAnime(name) {
    var values = [];
    name = String(name).replace(" ", "-");
    await axios.get(`https://${process.env.PROXY_URL}/secure/search/${name}?limit=200`, { ...allowLegacyRenegotiationforNodeJsOptions, headers: header   }).then((value) => {

        for (let i = 0; i < value.data.results.length; i++) {
            value.data.results[i].id = "0" + value.data.results[i].id;

        }
        values = value.data.results;
    })
    return values;
}

async function FindAnimeDetail(id) {
    var values;
    if (id > 0) {
        await axios.get(`https://${process.env.PROXY_URL}/secure/titles/${id}?titleId=${id}`, { ...allowLegacyRenegotiationforNodeJsOptions, headers: header   }).then((value) => {
            values = value.data.title;

        })
    }

    return values;
}

async function FindAnimeId(name, _id) {
    var values;
    name = String(name).replace(" ", "-");
    await axios.get(`https://${process.env.PROXY_URL}/secure/search/${name}?limit=200`, { ...allowLegacyRenegotiationforNodeJsOptions, headers: header   }).then((value) => {
        for (const element of value.data.results) {
            if (element._id === _id) {
                values = element.id;
            }
        }

    })
    return values;
}

async function SearchVideoDetail(type, id, name, seasonNumber) {
    var values;
    // var caches = [];
    if (id > 0 && name.length > 0 && seasonNumber > 0) {
        name = String(name).replace(" ", "-");
        if (type === "series") {
            await axios.get(`https://${process.env.PROXY_URL}/secure/titles/${id}?titleId=${id}&titleName=${name}&seasonNumber=${seasonNumber}&perPage=2000`, { ...allowLegacyRenegotiationforNodeJsOptions, headers: header   }).then((value) => {
                for (let i = 0; i < value.data.title.season.episodePagination.data.length; i++) {
                    value.data.title.season.episodePagination.data[i].id = "0" + value.data.title.season.episodePagination.data[i].id
                }
                values = value.data.title.season.episodePagination.data;
            })
        }else{
            await axios.get(`https://${process.env.PROXY_URL}/secure/titles/${id}?titleId=${id}&titleName=${name}`, { ...allowLegacyRenegotiationforNodeJsOptions, headers: header   }).then((value) => {
                for (let i = 0; i < value.data.title.videos.length; i++) {
                    value.data.title.videos[i].id = "0" + value.data.title.videos[i].id
                }
                values = value.data.title;
            })
        }

    }
    return values;


}

module.exports = { SearchAnime, FindAnimeDetail, FindAnimeId, SearchVideoDetail }