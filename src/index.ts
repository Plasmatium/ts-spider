import axios, { AxiosRequestConfig } from 'axios'
import * as cheerio from 'cheerio'

let config: AxiosRequestConfig = {}

config.method = 'get'
config.baseURL = 'http://www.emerson.com/en-us/catalog/liquid-analysis'
let url = '?fetchFacets=true#facet:&facetLimit:&productBeginIndex:0&orderBy:&pageView:grid&minPrice:&maxPrice:&pageSize:&'

let $: any

const fetchProductUrlsOnPage = async (pageUrl: string) => {
  let res = await axios(pageUrl, config)
  $ = cheerio.load(res.data)
  let anchors = $('.product_name a')
  let productUrls = [].map.call(anchors, (a: CheerioElement) => {
    return a.attribs.href
  })
  debugger
  return productUrls
}

(async () => {
  await fetchProductUrlsOnPage(url)
})().then(() => console.log('done!'))