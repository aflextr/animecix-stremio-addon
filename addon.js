const { addonBuilder, serveHTTP, publishToCentral } = require('stremio-addon-sdk')
require("dotenv").config({ path: "./dotenv.env" })
const search = require("./files/search")
const manifest = require("./manifest");
const NodeCache = require("node-cache");
const videos = require("./files/videos");


const builder = new addonBuilder(manifest)

//clear meta in 4 hours
setInterval(()=>{
    meta = []
},14400000)


const CACHE_MAX_AGE = 1 * 60 * 60; // 1 hours in seconds




builder.defineCatalogHandler(async (args) => {
    var metaData = [];
    if (args.type == "series" && args.id == "animecix") {
        var anime = await search.SearchAnime(args.extra.search);

        for await (const element of anime) {
            if (element.name_english =='') {
                element.name_english = element.name
            }
            metaData.push({
                id: element.id,
                type: "series",
                name: element.name_english,
                poster: element.poster,
                description: element.description,
                genres: ["Animation", "Short", "Comedy"]
            })
        }
        return Promise.resolve({ metas: metaData });

    } else {
        return Promise.resolve({ metas: [] });
    }
})
var meta = [];
builder.defineMetaHandler(async function (args) {
    
    var findId = String(args.id).substring(1);
    if (args.type === 'series' && args.id) {

            var find = await search.FindAnimeDetail(findId);
            if (find.name_english =='') {
                find.name_english = find.name
            }
            var metaObj = {
                id: args.id,
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

            // anime türü
            find.genres.forEach(element => {
                metaObj.genres.push(element.display_name)
            });

            for (let i = 0; i < find.season_count; i++) {
                var animeler = await search.SearchVideoDetail(findId, find.name_english, i + 1);
                animeler.forEach(element => {
                    metaObj.videos.push({
                        id: element.id,
                        _id:findId,
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

            return Promise.resolve({ meta: metaObj })
        
    } else {
        // otherwise return no meta
        return Promise.resolve({ meta: {} })
    }
})



builder.defineStreamHandler(async function (args) {

    if (args.type === 'series' && args.id) {
        var id = String(args.id).substring(1);

        var detail = {};
        for await (let metaItem of meta) {
            for  await(let element of metaItem) {
              if (element.id === args.id) {
                const obj = {
                  id: element.id,
                  _id : element._id,
                  season: element.season,
                  episode: element.episode,
                };
                detail = obj;
              }
            }
          }
          

        var stream = [];
        var getVideo = await videos.GetVideos(detail._id, detail.episode, detail.season);
        var streamLinks = await videos.ParseVideo(getVideo);

        streamLinks.forEach(element => {
            if (element.support == "stremio") {
                if (new URL(element.url).hostname === "tau-video.xyz") {
                    stream.push({
                        url: element.parseUrl,
                        name: element.label + "\n" + element.subName,
                        description: element.videoProvider + "\n" + element.size,

                    });
                }else{
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

        return Promise.resolve({ streams: stream })
    } else {
        // otherwise return no streams
        return Promise.resolve({ streams: [] })
    }
})

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000})
publishToCentral(`https://${process.env.HOST_URL}/manifest.json`);
