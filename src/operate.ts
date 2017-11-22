import * as fs from 'fs'
import {PdfLinkStruct, StringifyFunc} from './utils'
import * as path from 'path'

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

// refine from name matching count
export const matchedGroup = (strList1: string[], strList2: string[]) => {
  return strList1.reduce((group: string[], currStr: string) => {
    strList2.includes(currStr) && group.push(currStr)
    return group
  }, [])
}

export interface ClosureForGenSep {
  lastFileName: string
  readonly matchThreshold: number
}

export const genSep = (struct: PdfLinkStruct, closure: ClosureForGenSep) => {
  // sep if match count (3 or closure.matchThreshold)
  // closure.matchThreshold: number
  // closure.last
  let sep = ''
  let matched = matchedGroup(
    closure.lastFileName.split('-'),
    struct.fileName.split('-')
  )
  if (matched.length < closure.matchThreshold) {
    sep = `## Group ID: **${Math.floor(struct.meta.catId / 100)}**\n`
  }
  closure.lastFileName = struct.fileName
  return sep
}