require("dotenv").config({path:"./.env"})
const header = {
"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
"Accept-Encoding": "gzip, deflate, br",
"Accept-Language": "tr,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
"Cache-Control": "max-age=0",
"Connection": "keep-alive",
"Cookie": "animecix_net=%7B%22HttpHost%22%3A%22animecix.net%22%2C%22HttpDomain%22%3A%22animecix.net%22%2C%22Protokol%22%3A%22http%22%2C%22Port%22%3A80%2C%22KulAdSifre%22%3Anull%2C%22UrlAdresi%22%3A%22%5C%2F%22%2C%22GetVeri%22%3Anull%2C%22GitOpjeId%22%3Anull%2C%22DnsAdresi%22%3A0%2C%22URL_Adresi%22%3A%22http%3A%5C%2F%5C%2Fanimecix.net%5C%2F%22%2C%22GirisIP%22%3A%22172.67.72.143%22%7D; cf_clearance=Xa69PwVJNuscWkCIenXwQiOEoOVrJlKdCPEynF1VGXc-1706283440-1-Aa3VY6XtytKyoQRw1nf6nKxUWpLwZ+r9l/cJA7mPOi3sxRGWzSlj64iUY9NMXkY+oFwSngzfU5CCyPtP3BIz87s=; theme=Dark;",
"Referer":`https://${process.env.PROXY_URL}/`,

"Sec-Fetch-Dest": "document",
"Sec-Fetch-Mode": "navigate",
"Sec-Fetch-Site": "none",
"Sec-Fetch-User": "?1",
"Upgrade-Insecure-Requests": 1,
"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
"sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Microsoft Edge";v="120"',
"sec-ch-ua-mobile": "?0",
"sec-ch-ua-platform": "Windows"
}

module.exports = header;

