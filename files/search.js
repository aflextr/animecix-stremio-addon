const axios = require("axios").default;
const header = require("../header");
require("dotenv").config({ path: "../dotenv.env" })
const NodeCache = require("node-cache");

//var cache = new NodeCache({ stdTTL: 7200, checkperiod: 120, deleteOnExpire: true });
var ids= [];
var NameId;
async function SearchAnime(name) {
    var values = [];
   // var caches = [];
    name = String(name).replace(" ", "-");
    NameId = name;
    await axios.get(`https://${process.env.WEBSITE_URL}/secure/search/${name}?limit=200`, { headers: header }).then((value) => {
        values = value.data.results;
        value.data.results.forEach(element => {
            const obj = {
                id: element.id,
                _id: element._id,
            }
            ids.push(obj);
           // caches.push(obj);


        });
        //cache.set(NameId, caches);
    })
    return values;
}

async function FindAnimeDetail(id) {
    var values;
    await axios.get(`https://${process.env.WEBSITE_URL}/secure/titles/${id}?titleId=${id}`, { headers: header }).then((value) => {
        values = value.data.title;

    })
    return values;
}

async function FindAnimeId(_id) {
    var values;
    ids.forEach(element => {
        if (element._id === _id) {
            values = element.id;

        }
    });


    return values;
}

async function SearchVideoDetail(id, name, seasonNumber) {
    var values;
   // var caches = [];

    name = String(name).replace(" ", "-");
    await axios.get(`https://${process.env.WEBSITE_URL}/secure/titles/${id}?titleId=${id}&titleName=${name}&seasonNumber=${seasonNumber}&perPage=2000`, { headers: header }).then((value) => {
        values = value.data.title.season.episodePagination.data;
        values.forEach(element => {
            const obj = {
                id: element.id,
                _id: element._id,
            }
            //caches.push(obj);
            ids.push(obj);
        });
        
       // cache.set(id, caches)
    })
    return values;


}

module.exports = { SearchAnime, FindAnimeDetail, FindAnimeId, SearchVideoDetail }