const axios = require("axios").default;
const header = require("../header");
require("dotenv").config({ path: "../dotenv.env" })



async function SearchAnime(name) {
    var values = [];
    name = String(name).replace(" ", "-");
    await axios.get(`https://${process.env.WEBSITE_URL}/secure/search/${name}?limit=200`, { headers: header }).then((value) => {

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
        await axios.get(`https://${process.env.WEBSITE_URL}/secure/titles/${id}?titleId=${id}`, { headers: header }).then((value) => {
            values = value.data.title;

        }).catch((err) => {
            FindAnimeDetail(id)
        })
    }

    return values;
}

async function FindAnimeId(name, _id) {
    var values;
    name = String(name).replace(" ", "-");
    await axios.get(`https://${process.env.WEBSITE_URL}/secure/search/${name}?limit=200`, { headers: header }).then((value) => {
        for (const element of value.data.results) {
            if (element._id === _id) {
                values = element.id;
            }
        }

    })
    return values;
}

async function SearchVideoDetail(id, name, seasonNumber) {
    var values;
    // var caches = [];
    if (id > 0 && name.length > 0 && seasonNumber > 0) {
        name = String(name).replace(" ", "-");
        await axios.get(`https://${process.env.WEBSITE_URL}/secure/titles/${id}?titleId=${id}&titleName=${name}&seasonNumber=${seasonNumber}&perPage=2000`, { headers: header }).then((value) => {
            for (let i = 0; i < value.data.title.season.episodePagination.data.length; i++) {
                value.data.title.season.episodePagination.data[i].id = "0" + value.data.title.season.episodePagination.data[i].id
            }
            values = value.data.title.season.episodePagination.data;
        }).catch(() => {
            SearchVideoDetail(id, name, seasonNumber);
        })
    }
    return values;


}

module.exports = { SearchAnime, FindAnimeDetail, FindAnimeId, SearchVideoDetail }