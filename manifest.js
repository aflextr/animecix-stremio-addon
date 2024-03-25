const manifest = {

    id: 'org.animecix-stremio-addon',
    version: '1.1.2',

    name: 'Animecix',
    description: "Animecix'den türkçe animeleri stremionuza getirir.  Proxy Kullandığımız için eklenti yavaş çalışabilir. Arama yerinin en sonuna animecix yada ax veyahut ac yazarsanız çalışır.\n <a target='_blank' href='https://github.com/aflextr/animecix-stremio-addon'>GitHub</a>",
    contactEmail: "eyup.elitass@gmail.com",
    logo: "/files/images/animecix.png",
    background: "/files/images/background.png",
    behaviorHints: {
        configurable: true,
        configurationRequired: false,
    },
    config: [{
        key: "animecix",
        required: false
    }],
    catalogs: [{
        type: "series",
        id: "animecix",
        extra: [{
            name: "search",
            isRequired: false
        }, { name: "skip", isRequired: false }]},
         {
        type: "movie",
        id: "animecix",
        extra: [{
            name: "search",
            isRequired: false
        }, { name: "skip", isRequired: false }]
    }],
    resources: ['stream', 'meta', 'subtitles'],
    types: ["movie", 'series', "anime"],
    idPrefixes: ["0"]
}

module.exports = manifest;