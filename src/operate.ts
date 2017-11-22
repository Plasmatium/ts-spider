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
    god.set(struct.meta.catId, struct)
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
export const matchCount = (strList1: string[], strList2: string[]) => {
  return strList1.reduce((count: number, currStr: string) => {
    return count + Number(strList2.includes(currStr))
  }, 0)
}

export const genSep: StringifyFunc = (struct, closure) => {
  // sep if match count (3 or closure.matchThreshold)
  return ''
}