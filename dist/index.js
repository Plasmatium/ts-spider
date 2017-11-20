"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const cheerio = require("cheerio");
let config = {};
config.method = 'get';
config.baseURL = 'http://www.emerson.com/en-us/catalog/liquid-analysis';
let url = '?fetchFacets=true#facet:&facetLimit:&productBeginIndex:0&orderBy:&pageView:grid&minPrice:&maxPrice:&pageSize:&';
let $;
const fetchProductUrlsOnPage = async (pageUrl) => {
    let res = await axios_1.default(pageUrl, config);
    $ = cheerio.load(res.data);
    let anchors = $('.product_name a');
    let productUrls = [].map.call(anchors, (a) => {
        return a.attribs.href;
    });
    debugger;
    return productUrls;
};
(async () => {
    await fetchProductUrlsOnPage(url);
})().then(() => console.log('done!'));
//# sourceMappingURL=index.js.map