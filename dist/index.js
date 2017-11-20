"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
let config = {};
config.method = 'get';
config.timeout = 7000;
config.baseURL = 'http://www.emerson.com/en-us/catalog/liquid-analysis';
let url = '?fetchFacets=true#facet:&facetLimit:&productBeginIndex:0&orderBy:&pageView:grid&minPrice:&maxPrice:&pageSize:&';
let x;
(async () => {
    let spider = new utils_1.Spider(config);
    let pUrls = await spider.sweapPage(url);
})().then(() => console.log('done!'));
//# sourceMappingURL=index.js.map