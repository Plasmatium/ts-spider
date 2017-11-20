"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var config = {};
config.method = 'get';
config.baseURL = 'http://www.emerson.com/en-us/catalog/liquid-analysis';
var rslt;
axios_1.default('', config).then(function (res) {
    rslt = res;
    console.log('done');
});
//# sourceMappingURL=index.js.map