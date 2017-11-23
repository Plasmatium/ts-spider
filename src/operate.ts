import * as fs from 'fs'
import {PdfLinkStruct, StringifyFunc} from './utils'
import * as path from 'path'
import * as FuzzyMatching from 'fuzzy-matching'

export const readAllJSON = () => {
  let dirList = fs.readdirSync('./data/json')
  // union all json to one object
  let dataSet = dirList.reduce((rslt: PdfLinkStruct[], fn) => {
    let filePath = path.resolve(__dirname, '../data', 'json', fn)
    let data = fs.readFileSync(filePath, 'utf-8')
    let obj: PdfLinkStruct[][] = JSON.parse(data)
    return rslt.concat(...obj)
  }, [])
  return dataSet
}

// md refinary
// dedup
export const dedup = (dataSet: PdfLinkStruct[]) => {
  console.log('dataSet.length:', dataSet.length)
  let god = new Map()
  dataSet.forEach(struct => {
    god.has(struct.meta.catId) && god.set(struct.meta.catId, struct)
  })
  console.log('god.size:', god.size)
  return [...god.values()]
}

// refine filename
// main regexp is /(?:manual-|product-data-)(.+)(?:-en-.+|-zh-.+)/
export const refineFileName = (dataSet: PdfLinkStruct[]) => {
  dataSet.forEach(struct => {
    let matched = struct.url.match(/(?:manual-|product-data-)(.+)(?:-en-.+|-zh-.+)/)
    struct.fileName = String(matched && matched[1]) // matched possible 'null
  })
}

// match and fuzzy match
// use its own includes and Array.prototype.reduce
export interface Matchable<MonoType> {
  [Symbol.iterator]: () => MonoType,
  ['includes']: Function
  ['length']: number
}

export interface ClosureForGenSep {
  lastFNList: string[]
  lastMatchedSet: Set<string>
}

// generate a seperator, if matched count less than 3
export const genSep = (struct: PdfLinkStruct, closure: ClosureForGenSep) => {
  let sep = ''

  let fm = new FuzzyMatching(closure.lastFNList)
  let fnList = struct.fileName.split('-')

  let fuzzyMatched = fnList.reduce((matchedSet: Set<string>, currStr) => {
    let m = fm.get(currStr)
    if (m.distance >= 0.75) {
      matchedSet.add(<string>m.value)
    }
    return matchedSet
  }, new Set<string>())

  // 如果本次匹配不足两个，那么就增加一次分隔符
  // 但是分隔符之前，需要添加一个ref words，
  // 这个ref words指的是之前一次的匹配，记录在
  // closure.lastMatchedSet里面
  if (fuzzyMatched.size < 2) {
    let catNum = Math.floor(struct.meta.catId / 100)
    let refWords = [...closure.lastMatchedSet].join(' ')
    sep = `> Ref Words: *${refWords}*\n## Cat ID: ${catNum}\n`
  }

  closure.lastFNList = fnList
  closure.lastMatchedSet = fuzzyMatched
  return sep
}