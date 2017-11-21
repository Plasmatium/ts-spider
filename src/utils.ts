import axios, { AxiosRequestConfig, AxiosAdapter } from 'axios'
import chalk from 'chalk'
import * as cheerio from 'cheerio'

interface PdfLinkStruct {
  url: string
  meta: {
    catId: number
    type: 'PDS' | 'MAN'
    size: string
    lang: 'EN' | 'ZH'
  }
}

const fillStruct = (li: CheerioElement) => {
  let struct: PdfLinkStruct = <PdfLinkStruct>{meta: {}}
  // validate url
  struct.url = cheerio('a', li).attr('href')
  // validate lang
  if (struct.url.includes('-zh-')) struct.meta.lang = 'ZH'
  else struct.meta.lang = 'EN'
  // validate type
  if (struct.url.includes('manual-')) struct.meta.type = 'MAN'
  else struct.meta.type = 'PDS'
  // validate catId
  let matched = struct.url.match(/(\d+).pdf$/i)
  struct.meta.catId = Number(matched && matched[1])
  // validate size
  struct.meta.size = cheerio('div.emerson-search-result-size', li).text()
  debugger
  return struct
}

class Spider {
  config: AxiosRequestConfig
  constructor (config: AxiosRequestConfig) {
    this.config = config
  }

  async getUrlList (filterAddr: string) {
    let data = await new SafeReq(filterAddr, this.config).getData()
    let $ = cheerio.load(data)
    let lis = $('ul.grid_mode li')
    let struct = fillStruct(lis[4])
    debugger
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
      if (!this.silent) {
        let info = `[${this.retryCount}/${this.maxRetry}] fetching: ${this.url}`
        console.log(chalk.yellow(info))
      }
      await this.safeGet()
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
  Spider
}