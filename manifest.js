const manifest = {

    id: 'org.animecix-stremio-addon',
    version: '1.0.8',
    
    name: 'Animecix',
    description:"Animecix'den türkçe animeleri stremionuza getirir.  Proxy Kullandığımız için eklenti yavaş çalışabilir.",
    contactEmail: "eyup.elitass@gmail.com",
    logo: "https://animecix.net/storage/branding_media/myZDSpWRkH8K7PGgb4vQlnhO1wGe3fT3mRsCveIe.png",
    background: "https://play-lh.googleusercontent.com/5y8mo10uB4LrE_zOY672TKFELOFXWWpLQDU9zJ_JiU4ftj5VNGIH3BH7Jzf-yXqFtb0",
    behaviorHints:{
        configurable :true,
        configurationRequired: false,
    },
    config:[{
        key:"animecix",
        required:false
    }],
    catalogs: [{
        type:"series",
        id:"animecix",
        extra: [{
            name: "search",
            isRequired: false
        }]
    }],
    resources: ['stream','meta','subtitles'],
    types: ["movie",'series',"anime"],
    idPrefixes: ["0"]
}

module.exports = manifest;