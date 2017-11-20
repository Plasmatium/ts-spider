import axios, { AxiosRequestConfig, AxiosAdapter } from 'axios'
import chalk from 'chalk'
import * as cheerio from 'cheerio'

// this is for vscode debug console colorful
let log = console.log

class Spider {
  config: AxiosRequestConfig
  constructor (config: AxiosRequestConfig) {
    this.config = config
  }
  async fetchProductUrlsOnPage (pageUrl: string) {
    let data = await new SafeReq(pageUrl, this.config).getData()
    let $ = cheerio.load(data)
    let anchors = $('.product_name a')
    let productUrls = [].map.call(anchors, (a: CheerioElement) => {
      return a.attribs.href
    })
    
    return productUrls
  }
  async sweapPage (pageUrl: string) {
    // 获取页面
    let productUrls = await this.fetchProductUrlsOnPage(pageUrl)
    let productPages = await Promise.all(productUrls.map((productUrl: string) => {
      return new SafeReq(productUrl, this.config).getData()
    }))

    // TODO: 提取所有pdf链接和对应的文字描述
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
        log(chalk.yellow(info))
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
        log(chalk.green(info))
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