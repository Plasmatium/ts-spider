import axios, { AxiosRequestConfig } from 'axios'

let config: AxiosRequestConfig = {}

config.method = 'get'
config.baseURL = 'http://www.emerson.com/en-us/catalog/liquid-analysis'

let rslt: any
axios('', config).then(res => {
  rslt = res
  console.log('done')
})