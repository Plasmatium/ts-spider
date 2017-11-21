import axios, { AxiosRequestConfig, AxiosAdapter } from 'axios'
import chalk from 'chalk'
import * as cheerio from 'cheerio'
import { Stream } from 'stream';

interface PdfLinkStruct {
  url: string
  fileName: string
  meta: {
    catId: number
    type: 'PDS' | 'MAN' | null
    size: string
    lang: 'EN' | 'ZH'
  }
}

const fillStruct = (li: CheerioElement) => {
  let struct: PdfLinkStruct = <PdfLinkStruct>{meta: {}}
  // gen url
  struct.url = 'htp:' + cheerio('a', li).attr('href')
  // gen fileName
  struct.fileName = <string> struct.url.split('/').pop()
  // gen type
  if (struct.url.includes('manual-')) struct.meta.type = 'MAN'
  else if (struct.url.includes('product-data')) struct.meta.type = 'PDS'
  else struct.meta.type = null
  // gen lang
  if (struct.url.includes('-zh-')) struct.meta.lang = 'ZH'
  else struct.meta.lang = 'EN'
  // gen catId
  let matched = struct.url.match(/(\d+).pdf$/i)
  struct.meta.catId = Number(matched && matched[1])
  // gen size
  struct.meta.size = cheerio('div.emerson-search-result-size', li).text()

  return struct
}

class Spider {
  config: AxiosRequestConfig
  constructor (config: AxiosRequestConfig) {
    this.config = config
  }

  async getUrlStructList (filterAddr: string) {
    let data = await new SafeReq(filterAddr, this.config).getData()
    let $ = cheerio.load(data)
    let lis = $('ul.grid_mode li')
    
    // 将所有li聚合成PdfLinkStruct
    // 因为fillStruct可能因为既不是MAN也不是PDS，
    // struct.meta.type就是null，所以要filter排除
    return lis.toArray().map((li) => {
      return fillStruct(li)
    }).filter(struct => struct.meta.type !== null) 
  }
}

type StringifyFunc = (struct: PdfLinkStruct) => string

class MDGen {
  dataSet: PdfLinkStruct[]
  defaultStringify: StringifyFunc = (struct) => {
    // type PDS | lang ZH [filename link] | size 1.2M
    let typeStr = `${struct.meta.type}`
    let langStr = `${struct.meta.lang}`
    let sizeStr = `${struct.meta.size}`
    let fileNameLink = `[${struct.fileName}]`
    return `* [**[ ${typeStr} | ${langStr} | ${sizeStr} ]** ${fileNameLink}](${struct.url})`
  }
  constructor (dataSet: PdfLinkStruct[]) {
    this.dataSet = dataSet.sort((a, b) => {
      return Math.sign(a.meta.catId - b.meta.catId)
    })
  }
  makeMD (func: StringifyFunc = this.defaultStringify) {
    let strSet = this.dataSet.map(struct => {
      return this.defaultStringify(struct)
    })
    return strSet.join('\n')
  }
}

class SafeReq {
  url: string
  config: AxiosRequestConfig
  maxRetry: number
  interval: number
  silent: boolean
  data: any = null
  retryCount = 1

  constructor (
    url: string,
    config: AxiosRequestConfig,
    retryCount: number = 3,
    interval: number = 3000,
    silent: boolean = false
  ) {
    this.url = url
    this.config = config
    this.maxRetry = retryCount
    this.interval = interval
    this.silent = silent
  }

  async getData () {
    while (this.retryCount <= this.maxRetry && this.data === null) {
      // delay 100~500
      let delay = Math.random() * 400 + 100
      await new Promise(res => { setTimeout(res, delay)})
      if (!this.silent) {
        let info = `[${this.retryCount}/${this.maxRetry}][D: ${delay}] fetching: ${this.url}`
        console.log(chalk.yellow(info))
      }
      await this.safeGet()
    }
    if (this.retryCount > this.maxRetry) {
      let info = `[max: ${this.maxRetry}] failed fetching: ${this.url}`
      console.log(chalk.red(info))
    }
    return this.data
  }

  async safeGet () {
    try {
      this.data = (await axios(this.url, this.config)).data
      if (!this.silent) {
        let info = `[${this.retryCount}/${this.maxRetry}] fetched: ${this.url}`
        console.log(chalk.green(info))
      }
      // throw Error('test error')
    } catch (err) {
      // delay
      await new Promise(res => { setTimeout(res, this.interval) })
      this.retryCount++
    }
  }
}

export {
  SafeReq,
  Spider,
  MDGen
}