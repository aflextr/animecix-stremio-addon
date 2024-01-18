const { addonBuilder, serveHTTP, publishToCentral } = require('stremio-addon-sdk')
require("dotenv").config({ path: "./dotenv.env" })
const search = require("./files/search")
const manifest = require("./manifest");
const NodeCache = require("node-cache");
const videos = require("./files/videos");
const Path = require("path");
const header = require('./header');
const axios = require("axios").default;
const crypto = require("crypto");
const https = require("https");
const fs = require('fs')
const subsrt = require('subtitle-converter');

const allowLegacyRenegotiationforNodeJsOptions = {
    httpsAgent: new https.Agent({
        // for self signed you could also add
        // rejectUnauthorized: false,
        // allow legacy server
        secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
    }),
};
const builder = new addonBuilder(manifest)

//clear meta in 4 hours
setInterval(() => {
    meta = [];
    subs = [];
}, 14400000)


const CACHE_MAX_AGE = 1 * 60 * 60; // 1 hours in seconds
var meta = [];
var subs = [];


builder.defineCatalogHandler(async (args) => {
    var metaData = [];

    var anime = await search.SearchAnime(args.extra.search);

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
        if (args.type === element.type && args.id === 'animecix') {

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

    return Promise.resolve({ metas: metaData });


})

builder.defineMetaHandler(async function (args) {

    var findId = String(args.id).substring(1);
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



    if (args.type === "series" && args.id) {
        metaObj = {
            id: args.id,
            type: find.type,
            name: find.name_english,
            background: find.backdrop,
            country: find.country,
            genres: [],
            season: find.season_count,
            videos: [{}],
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
                    type: find.type,
                    title: element.name,
                    released: new Date(element.release_date),
                    season: element.season_number,
                    episode: element.episode_number,
                    overview: element.description,
                    thumbnail: element.poster,
                    description: element.description
                });
            });
        }
        meta.push(metaObj.videos);

        return Promise.resolve({ meta: metaObj })

    } else if (args.type === "movie" && args.id) {
        metaObj = {
            id: args.id,
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
        var animeler = await search.SearchVideoDetail(find.type, findId, find.name_english, 1);
        var videos = [];
        videos.push({
            id: "0"+animeler.id,
            _id: findId,
            anime:animeler

        });
        meta.push(videos);

        return Promise.resolve({ meta: metaObj })

    }
})



builder.defineStreamHandler(async function (args) {
    var stream = [];
    if (args.type === 'series' && args.id) {
        var id = String(args.id).substring(1);

        var detail = {};
        for await (let metaItem of meta) {
            for await (let element of metaItem) {
                if (element.id === args.id) {
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
            if (element.extra === 'Yapay Çeviri' || element.extra === '' || element.extra === 'Yapay Çeviri ' ) {
                if (element.name === "Tau Video" || element.name === "Tau Video ") {
                    subs.push({
                        id: args.id,
                        lang: element.captions[0].language,
                        url: element.captions[0].url,
                    })
                    break;
                }
                
            }
        }
        
        streamLinks.forEach(element => {
            if (element.support == "stremio") {
                if (new URL(element.url).hostname === "tau-video.xyz") {

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
    } else if (args.type === 'movie' && args.id) {
        var detail = {};
        for await (let metaItem of meta) {
            for await (let element of metaItem) {
                if (element.id === args.id) {
                    const obj = {
                        id: element.id,
                        _id: element._id,
                        anime: element.anime,
                        
                    };
                    detail = obj;
                }
            }
        }

        var streamLinks = await videos.ParseVideo(detail.anime.videos);
        //Yapay çeviri altyazısı varsa diziye eklenir sonradan videoya eklenmek için işlenir
        for (const element of detail.anime.videos) {
            if (element.extra === 'Yapay Çeviri' || element.extra === ''  || element.extra === 'Yapay Çeviri ') {
                subs.push({
                    id: args.id,
                    lang: element.captions[0].language,
                    url: element.captions[0].url,
                })
                break;
            }
        }

        streamLinks.forEach(element => {
            if (element.support == "stremio") {
                if (new URL(element.url).hostname === "tau-video.xyz") {

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

    return Promise.resolve({ streams: stream })

})

builder.defineSubtitlesHandler(async (args) => {
    for await (const element of subs) {
        if (args.id === element.id) {
            //video id bulunduktan sonra yapılacaklar
            var newUrl = "https://cdn-dot-mangacix-dotnet.gateway.web.tr" + new URL(element.url).pathname
            if (Path.extname(newUrl) !== ".srt") {
                var response = await axios.get(newUrl, { ...allowLegacyRenegotiationforNodeJsOptions, method: "GET", headers: header });
                const outputExtension = '.srt'; // conversion is based on output file extension
                const options = {
                    removeTextFormatting: true,
                };

                const { subtitle, status } = subsrt.convert(response.data, outputExtension, options)
                if (subtitle !== '') {
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

                    if (!fs.existsSync(Path.dirname(`./subs/${args.id}/${args.id}.srt`))) {
                        fs.mkdirSync(Path.dirname(`./subs/${args.id}/${args.id}.srt`), { recursive: true });
                    }

                    fs.writeFileSync(`./subs/${args.id}/${args.id}.srt`, subtitle, { encoding: "utf8" });


                    const subtitles = {
                        lang: "tur",
                        url: "https://" + process.env.HOST_URL + `/subs/${args.id}/${args.id}.srt`
                    }
                    return Promise.resolve({ subtitles: [subtitles] })
                }
            }
            const subtitle = {
                lang: "tur",
                url: newUrl
            }
            return Promise.resolve({ subtitles: [subtitle] })
        }
    }
})

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000, static: "/subs", cacheMaxAge: CACHE_MAX_AGE })
publishToCentral(`https://${process.env.HOST_URL}/manifest.json`);
