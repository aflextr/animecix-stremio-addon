const { addonBuilder, serveHTTP, publishToCentral, getRouter } = require('stremio-addon-sdk')
require("dotenv").config({ path: "./.env" })
const search = require("./files/search")
const manifest = require("./manifest");
const NodeCache = require("node-cache");
const videos = require("./files/videos");
const Path = require("path");
const header = require('./header');
const axios = require("axios").default;
const fs = require('fs')
const express = require("express");
const subsrt = require('subtitle-converter');
const path = require('path');
var addon = express();


const CACHE_MAX_AGE = 24 * 60 * 60; // 24 hours in seconds
var meta = [];
var subs = [];


var respond = (res, data) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', `max-age=${CACHE_MAX_AGE}`)
    res.send(data);

}



addon.use("/subs", express.static("subs"));

addon.get('/manifest.json', function (req, res) {
    respond(res, manifest);
});

addon.get('/', function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Content-Type', 'text/html');
    var indexPage = fs.readFileSync(path.join(__dirname, "indexPage.html"))

    res.send(indexPage);
});

addon.get('/configure', function (req, res) {
    return res.redirect("/")
});



//20 days
var clearData = 1728000000;
//clear meta in clearData veriable hours
setInterval(() => {
    meta = [];
    subs = [];
}, clearData)

addon.param('type', function (req, res, next, val) {
    if (manifest.types.includes(val)) {
        next();
    } else {
        next("Unsupported type " + val);
    }
});



addon.get('/catalog/:type/:id/search=:search', async function (req, res, next) {
    var { type, id } = req.params;
    var Search = req.params.search;
    Search = String(Search).replace(".json", "");

    var metaData = [];
    if (!Search.includes("animecix") && !Search.includes("ax") && !Search.includes("ac")) {
        return respond(res, { metas: [] });
    }
    var anime = await search.SearchAnime(Search);

    for await (const element of anime) {
        if (element.name_english == '') {
            element.name_english = element.name
        }
        if (element.type === null || element.type === '') {
            if (element.title_type === "anime") {
                element.title_type = "series"
            }
            element.type = element.title_type;
        }
        if (type === element.type && id === 'animecix') {

            metaData.push({
                id: element.id,
                type: element.type,
                name: element.name_english,
                poster: element.poster,
                description: element.description,
                genres: ["Animation", "Short", "Comedy"]
            })
        }
    }
    return respond(res, { metas: metaData });


})


addon.get('/meta/:type/:id/', async function (req, res, next) {
    var { type, id } = req.params;
    id = String(id).replace(".json", "");
    var findId = String(id).substring(1);

    var metaObj = {};

    var find = await search.FindAnimeDetail(findId);
    if (find.name_english == '') {
        find.name_english = find.name
    }
    if (find.type === null || find.type === '') {
        if (find.title_type === "anime") {
            find.title_type = "series"
        }
        find.type = find.title_type;
    }



    if (type === "series" && id) {
        metaObj = {
            id: id,
            type: find.type,
            name: find.name_english,
            background: find.backdrop,
            country: find.country || "JP",
            genres: [],
            season: find.season_count,
            videos: [],
            imdbRating: find.rating,
            description: find.description,
            releaseInfo: find.year,
            poster: find.poster,
            posterShape: 'poster',

        }
        // anime türü
        find.genres.forEach(element => {
            metaObj.genres.push(element.display_name)
        });
        for (let i = 0; i < find.season_count; i++) {
            var animeler = await search.SearchVideoDetail(find.type, findId, find.name_english, i + 1);
            animeler.forEach(element => {
                metaObj.videos.push({
                    id: element.id,
                    _id: findId,
                    title: element.name,
                    released: new Date(element.release_date),
                    season: element.season_number,
                    episode: element.episode_number,
                    overview: element.description,
                    thumbnail: element.poster
                });
            });
        }
        meta.push(metaObj.videos);

        return respond(res, { meta: metaObj });

    } else if (type === "movie" && id) {
        metaObj = {
            id: id,
            type: find.type,
            name: find.name_english,
            background: find.backdrop,
            country: find.country,
            genres: [],
            imdbRating: find.rating,
            description: find.description,
            releaseInfo: find.year,
            poster: find.poster,
            posterShape: 'poster',

        }
        // anime türü
        find.genres.forEach(element => {
            metaObj.genres.push(element.display_name)
        });
        var animeler = await search.SearchVideoDetail(type, findId, find.name_english, 1);
        var videos = [];
        videos.push({
            id: "0" + animeler.id,
            _id: findId,
            anime: animeler

        });
        meta.push(videos);

        return respond(res, { meta: metaObj });

    }
})



addon.get('/stream/:type/:id/', async function (req, res, next) {
    var stream = [];
    var { type, id } = req.params;
    id = String(id).replace(".json", "");
    if (type === 'series' && id) {
        // id = String(id).substring(1);

        var detail = {};
        if (meta.length == 0) {

        }
        for await (let metaItem of meta) {
            for await (let element of metaItem) {
                if (element.id === id) {
                    const obj = {
                        id: element.id,
                        _id: element._id,
                        season: element.season,
                        episode: element.episode,
                    };
                    detail = obj;
                }
            }
        }



        var getVideo = await videos.GetVideos(detail._id, detail.episode, detail.season);

        var streamLinks = await videos.ParseVideo(getVideo);
        //Yapay çeviri altyazısı varsa diziye eklenir sonradan videoya eklenmek için işlenir
        for (const element of getVideo) {
            if (element.extra === 'Yapay Çeviri' || element.extra === '' || element.extra === 'Yapay Çeviri ') {
                if (element.name === "Tau Video" || element.name === "Tau Video ") {
                    subs.push({
                        id: id,
                        lang: element.captions[0].language,
                        url: element.captions[0].url,
                    })
                    break;
                }

            }
        }

        streamLinks.forEach(element => {
            if (element.support == "stremio") {
                if (new URL(element.url).hostname === "i7461752d766964656fo78797az.oszar.com") {

                    stream.push({
                        url: element.parseUrl,
                        name: element.label + "\n" + element.subName,
                        description: element.videoProvider + "\n" + element.size,

                    });
                } else {
                    stream.push({
                        externalUrl: element.parseUrl,
                        name: element.label + "\n" + element.subName,
                        description: element.videoProvider + "\n" + element.size,

                    });
                }

            } else {
                stream.push({
                    externalUrl: element.url,
                    name: "Animecix \n" + element.subName,
                    description: element.videoProvider + "\n" + element.size,

                });
            }
            
        });
        return respond(res, { streams: stream });
    } else if (type === 'movie' && id) {
        var detail = {};
        for await (let metaItem of meta) {
            for await (let element of metaItem) {
                if (element.id === id) {
                    const obj = {
                        id: element.id,
                        _id: element._id,
                        anime: element.anime,

                    };
                    detail = obj;
                }
            }
        }
        if (detail && typeof (detail.anime) !== "undefined") {
            var streamLinks = await videos.ParseVideo(detail.anime.videos);
            //Yapay çeviri altyazısı varsa diziye eklenir sonradan videoya eklenmek için işlenir
            for (const element of detail.anime.videos) {
                if (element.extra === 'Yapay Çeviri' || element.extra === '' || element.extra === 'Yapay Çeviri ') {
                    subs.push({
                        id: id,
                        lang: element.captions[0].language,
                        url: element.captions[0].url,
                    })
                    break;
                }
            }

            streamLinks.forEach(element => {
                if (element.support == "stremio") {
                    if (new URL(element.url).hostname === "i7461752d766964656fo78797az.oszar.com") {

                        stream.push({
                            url: element.parseUrl,
                            name: element.label + "\n" + element.subName,
                            description: element.videoProvider + "\n" + element.size,

                        });
                    } else {
                        stream.push({
                            externalUrl: element.parseUrl,
                            name: element.label + "\n" + element.subName,
                            description: element.videoProvider + "\n" + element.size,

                        });
                    }

                } else {
                    stream.push({
                        externalUrl: element.url,
                        name: "Animecix \n" + element.subName,
                        description: element.videoProvider + "\n" + element.size,

                    });
                }

            });
        }

        return respond(res, { streams: stream });

    }


})

addon.get('/subtitles/:type/:id/:query?.json', async function (req, res, next) {
    var { type, id } = req.params;
    id = String(id).replace(".json", "");
    for await (const element of subs) {
        if (id === element.id) {
            //video id bulunduktan sonra yapılacaklar
            var newUrl = `https://${process.env.SUBTITLEAI_URL}` + new URL(element.url).pathname
            if (Path.extname(newUrl) !== ".srt") {
                var altyazi = "";
                try {
                    var response = await axios.get(newUrl, { method: "GET", headers: header });
                    if (response && response.status == 200 && response.statusText == "OK") {
                        const outputExtension = '.srt'; // conversion is based on output file extension
                        const options = {
                            removeTextFormatting: true,
                        };

                        altyazi = subsrt.convert(response.data, outputExtension, options).subtitle;
                    }
                } catch (errors) {
                    const error = {
                        lang: "altyazi yüklenemedi",
                        url: ""
                    }
                    return respond(res, { subtitles: [error] });
                }

                if (altyazi !== '') {
                    const folderPath = './subs/';

                    if (!fs.existsSync(folderPath)) {
                        fs.mkdirSync(folderPath);
                    }

                    const files = fs.readdirSync(folderPath);

                    if (files.length > 15) {
                        files.forEach((file) => {
                            const filePath = Path.join(folderPath, file);
                            const fileStats = fs.statSync(filePath);

                            if (fileStats.isFile()) {
                                fs.unlinkSync(filePath);
                            } else if (fileStats.isDirectory()) {
                                // Dizin içinde dosya varsa onları da silmek için
                                fs.rmdirSync(filePath, { recursive: true });
                            }
                        });
                    }

                    if (!fs.existsSync(Path.dirname(`./subs/${id}/${id}.srt`))) {
                        fs.mkdirSync(Path.dirname(`./subs/${id}/${id}.srt`), { recursive: true });
                    }

                    fs.writeFileSync(`./subs/${id}/${id}.srt`, altyazi, { encoding: "utf8" });


                    const subtitles = {
                        lang: "tur",
                        url: "https://" + process.env.HOSTING_URL + `/subs/${id}/${id}.srt`
                    }
                    return respond(res, { subtitles: [subtitles] });

                }
            }
            const subtitle = {
                lang: "tur",
                url: newUrl
            }
            return respond(res, { subtitles: [subtitle] });
        }
    }
})

var port = process.env.PORT || 7000;
addon.listen(port, function () {
    console.log(`Add-on Repository URL: http://127.0.0.1:${port}/manifest.json`);
});




//publishToCentral(`https://${process.env.HOSTING_URL}/manifest.json`);
