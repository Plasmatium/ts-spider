import axios, { AxiosRequestConfig } from 'axios'
import * as cheerio from 'cheerio'
import * as fs from 'fs'

import {SafeReq, Spider, MDGen, PdfLinkStruct} from './utils'
import {readAllJSON, dedup, refineFileName} from './operate'

let config: AxiosRequestConfig = {}

config.method = 'get'
config.timeout = 7000
config.baseURL = 'http://www.emerson.com/en-us/catalog/liquid-analysis'

let filterAddr = `http://www.emerson.com/dynamic/contentsearch/en-us/60?searchTerm=&docType=document&businessSegmentFacetIds=98390&filterFacetIds=588776&filterFacetIds=588792&filterFacetIds=588772&filterFacetIds=33408&filterFacetIds=33416&filterFacetIds=390366&filterFacetIds=390360&filterFacetIds=33344&filterFacetIds=33334&orderBy=relevance+desc&pageNumber=`

const groupDo = async (start: number, spider: Spider) => {
  let arr: number[] = []
  for (let i = start; i < start + 2; i++) {
    arr.push(i)
  }
  let spawn = arr.map(pageNum => {
    let url = filterAddr + String(pageNum)
    return spider.getUrlStructList(url)
  })
  let hyperSets = await Promise.all(spawn)
  fs.writeFileSync(`./raw_data.${start}.json`, JSON.stringify(hyperSets, null, 2))

  let mdGroups = hyperSets.map(structs => {
    return new MDGen(structs).makeMD()
  })
  
  fs.writeFileSync(`./list.${start}.md`, mdGroups.join('\n# SEP\n'))
}

const run  = async () => {
  let spider = new Spider(config)
  console.time('run time')
  let refined3: PdfLinkStruct[] = JSON.parse(fs.readFileSync('data/refined3.json', 'utf-8'))
  let md = new MDGen(refined3)
  md.closure = {
    lastFNList: '',
    lastMatchedSet: new Set('')
  }
  let mdString = md.makeMD()
  //*/
  fs.writeFileSync('data/final.md', mdString)
} 
run().then(() => {
  console.log('done!')
  console.timeEnd('run time')
})