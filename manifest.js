const manifest = {

    id: 'org.animecix-stremio-addon',
    version: '1.0.3',
    
    name: 'Animecix',
    description:"Animecix'den türkçe animeleri stremionuza getirir",
    logo: "https://animecix.net/storage/branding_media/myZDSpWRkH8K7PGgb4vQlnhO1wGe3fT3mRsCveIe.png",
    background: "https://play-lh.googleusercontent.com/5y8mo10uB4LrE_zOY672TKFELOFXWWpLQDU9zJ_JiU4ftj5VNGIH3BH7Jzf-yXqFtb0",
    catalogs: [{
        type:"series",
        id:"animecix",
        extra: [{
            name: "search",
            isRequired: false
        }]
    }],
    resources: ['stream','meta'],
    types: ["movie",'series',"anime"],
    idPrefixes: ["6"]
}

module.exports = manifest;