const axios = require("axios").default;
const header = require("../header");
require("dotenv").config({path:"../dotenv.env"})

var ids= [];
async function SearchAnime(name) {
    var values = [];
    name = String(name).replace(" ","-");
    await axios.get(`https://${process.env.WEBSITE_URL}/secure/search/${name}?limit=20`,{headers:header}).then((value)=>{
        values = value.data.results;
        values.forEach(element => {
            const obj = {
                id:element.id,
                _id:element._id,
            }
            ids.push(obj);
        });
    })
    return values;
}

async function FindAnimeDetail(id){
    var values;
    await axios.get(`https://${process.env.WEBSITE_URL}/secure/titles/${id}?titleId=${id}`,{headers:header}).then((value)=>{
        values = value.data.title;
       
    })
    return values;
}

async function FindAnimeId(_id){
    var values;
    ids.forEach(element => {
        if (element._id === _id) {
            values = element.id;
            
        }
    });
    return values;
}

async function SearchVideoDetail(id,name,seasonNumber){
    var values;
    name = String(name).replace(" ","-");
    await axios.get(`https://${process.env.WEBSITE_URL}/secure/titles/${id}?titleId=${id}&titleName=${name}&seasonNumber=${seasonNumber}`,{headers:header}).then((value)=>{
        values = value.data.title.season.episodePagination.data;
        values.forEach(element => {
            const obj = {
                id:element.id,
                _id:element._id,
            }
            ids.push(obj);
        });
        
    })
    return values;
}

module.exports = {SearchAnime,FindAnimeDetail,FindAnimeId,SearchVideoDetail}