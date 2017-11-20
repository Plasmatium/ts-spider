import axios, { AxiosRequestConfig } from 'axios'
import * as cheerio from 'cheerio'

import {SafeReq, Spider} from './utils'

let config: AxiosRequestConfig = {}

config.method = 'get'
config.timeout = 7000
config.baseURL = 'http://www.emerson.com/en-us/catalog/liquid-analysis'

let url = '?fetchFacets=true#facet:&facetLimit:&productBeginIndex:0&orderBy:&pageView:grid&minPrice:&maxPrice:&pageSize:&'


let x
(async () => {
  let spider = new Spider(config)
  let pUrls = await spider.sweapPage(url)
})().then(() => console.log('done!'))