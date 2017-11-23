import * as fs from 'fs'
import {PdfLinkStruct, StringifyFunc} from './utils'
import * as path from 'path'
import FuzzyMatching from 'fuzzy-matching'

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

// export const getMatchedGroup = <MonoType>
// ( iterable1: Matchable<MonoType>,
//   iterable2: Matchable<MonoType>
// ) => {
//   return <MonoType[]> ([].reduce.call(iterable1, (group: MonoType[], currStr: MonoType) => {
//     iterable2.includes(currStr) && group.push(currStr)
//     return group
//   }, []))
// }
// // ratio applied on short iterable if greed is true
// // this makes them match more easily
// export const fuzzyMatch = <MonoType>
// ( iterable1: Matchable<MonoType>,
//   iterable2: Matchable<MonoType>,
//   ratio: number,
//   greed: boolean 
// ) => {
//   let matched = getMatchedGroup(iterable1, iterable2)
//   let cmpLen = greed
//   ? Math.min(iterable1.length, iterable2.length)
//   : Math.max(iterable1.length, iterable2.length)
//   return matched.length / cmpLen >= ratio
// }

// export interface ClosureForGenSep {
//   lastFileName: string
//   readonly matchThreshold: number
// }

// export const genSep = (struct: PdfLinkStruct, closure: ClosureForGenSep) => {
//   // sep if match count (3 or closure.matchThreshold)
//   // closure.matchThreshold: number
//   // closure.last
//   let sep = ''
//   let matched = getMatchedGroup(
//     closure.lastFileName.split('-'),
//     struct.fileName.split('-')
//   )
//   if (matched.length < closure.matchThreshold) {
//     sep = `## Group ID: **${Math.floor(struct.meta.catId / 100)}**\n`
//   }
//   closure.lastFileName = struct.fileName
//   return sep
// }

export interface ClosureForGenSep {
  lastFNList: string[]
}

// generate a seperator, if matched count less than 3
export const genSep = (struct: PdfLinkStruct, closure: ClosureForGenSep) => {
  let sep = ''

  let fm = new FuzzyMatching(closure.lastFNList)
  let fnList = struct.fileName.split('-')
  let matchedValue = new Set<string>()
  debugger

  let fuzzyMatched = fnList.reduce((matchedList: string[], currStr) => {
    let m = fm.get(currStr)
    if (m.distance >= 0.75) {
      matchedList.push(<string>m.value)
    }
    return matchedList
  }, [])
  closure.lastFNList = fnList

  if (fuzzyMatched.length < 3) {
    let catNum = Math.floor(struct.meta.catId / 100)

    sep = `> Ref Words: *${fuzzyMatched}*\n## Cat ID: ${struct}\n`
  }
  
  return sep
}