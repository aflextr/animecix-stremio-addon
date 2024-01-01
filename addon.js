const { addonBuilder, serveHTTP, publishToCentral } = require('stremio-addon-sdk')
require("dotenv").config({ path: "./dotenv.env" })
const search = require("./files/search")
const manifest = require("./manifest");
const NodeCache = require("node-cache");
const videos = require("./files/videos");


const builder = new addonBuilder(manifest)


//var cache = new NodeCache({ stdTTL: 7200, checkperiod: 120,deleteOnExpire:true});

builder.defineCatalogHandler(async (args) => {
    var metaData = [];
    if (args.type == "series" && args.id == "animecix") {
        // var cached = cache.has(args.extra.search);
        // if (cached) {
        //     var array = cache.get(args.extra.search);
        //     return Promise.resolve({ metas: array });
        // } 
        var anime = await search.SearchAnime(args.extra.search);
        anime.forEach(element => {
            metaData.push({
                id: element._id,
                type: "series",
                name: element.name_english,
                poster: element.poster,
                description: element.description,
                genres: ["Animation", "Short", "Comedy"]
            })
        });
        //cache.set(args.extra.search, metaData);
        return Promise.resolve({ metas: metaData });

    } else {
        return Promise.resolve({ metas: [] });
    }
})
var id;
var meta = [];
builder.defineMetaHandler(async function (args) {
    var findId = await search.FindAnimeId(args.id);
    if (args.type === 'series' && args.id) {
        // var cached = cache.has(args.id);
        // if (cached) {

        //     var array = cache.get(args.id);
        //     id = findId;
        //     return Promise.resolve({ meta: array });
        // } 
            id = 0;


            var find = await search.FindAnimeDetail(findId);


            var metaObj = {
                id: find._id,
                type: 'series',
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

            id = find.id;

            // anime türü
            find.genres.forEach(element => {
                metaObj.genres.push(element.display_name)
            });

            for (let i = 0; i < find.season_count; i++) {
                var animeler = await search.SearchVideoDetail(findId, find.name_english, i + 1);
                animeler.forEach(element => {
                    metaObj.videos.push({
                        id: element._id,
                        type: "series",
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
           // cache.set(args.id, metaObj);
            return Promise.resolve({ meta: metaObj })
        
    } else {
        // otherwise return no meta
        return Promise.resolve({ meta: {} })
    }
})



builder.defineStreamHandler(async function (args) {

    if (args.type === 'series' && args.id) {

        var detail = {};
        for (let index = 0; index < meta.length; index++) {
            meta[index].forEach((element) => {
                if (element.id === args.id) {
                    const obj = {
                        id: element.id,
                        season: element.season,
                        episode: element.episode,
                    }
                    detail = obj;
                }

            })



        }
        var stream = [];
        var getVideo = await videos.GetVideos(id, detail.episode, detail.season);
        var streamLinks = await videos.ParseVideo(getVideo);

        streamLinks.forEach(element => {
            if (element.support == "stremio") {
                if (new URL(element.url).hostname === "tau-video.xyz") {
                    stream.push({
                        externalUrl: element.parseUrl,
                        name: element.label + "\n" + element.subName,
                        description: element.videoProvider + "\n" + element.size,

                    });
                }else{
                    stream.push({
                    url: element.parseUrl,
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

        return Promise.resolve({ streams: stream })
    } else {
        // otherwise return no streams
        return Promise.resolve({ streams: [] })
    }
})

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 })
publishToCentral("https://animecix-stremio-addon.onrender.com/manifest.json");
