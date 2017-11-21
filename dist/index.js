"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
let config = {};
config.method = 'get';
config.timeout = 7000;
config.baseURL = 'http://www.emerson.com/en-us/catalog/liquid-analysis';
let url = '?fetchFacets=true#facet:&facetLimit:&productBeginIndex:0&orderBy:2&pageView:grid&minPrice:&maxPrice:&pageSize:&';
let filterAddr = 'http://www.emerson.com/dynamic/contentsearch/en-us/60?searchTerm=&docType=document&businessSegmentFacetIds=98390&filterFacetIds=588776&filterFacetIds=588792&filterFacetIds=588772&filterFacetIds=33408&filterFacetIds=33416&filterFacetIds=390366&filterFacetIds=390360&filterFacetIds=33344&filterFacetIds=33334&orderBy=relevance+desc&pageNumber=1';
const run = async () => {
    let spider = new utils_1.Spider(config);
    await spider.getUrlList(filterAddr);
    debugger;
};
run().then(() => console.log('done!'));
//# sourceMappingURL=index.js.map