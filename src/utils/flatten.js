import { get } from 'lodash'
/**
 * 将第一层数组数据解析为 list 字段下的对象数组
 */
const resolvePathValue = (data, fields) => {
  if (fields.length === 0) {
    return data
  }
  const value = get(data, fields[0])
  if (Array.isArray(value)) {
    const res = []
    for (let i = 0; i < value.length; i++) {
      res.push(resolvePathValue(value[i], fields.slice(1)))
    }
    return res
  } else {
    return resolvePathValue(value, fields.slice(1))
  }
}
export default (data, paths) => {
  const pathValue = {}
  for (const prop of Object.keys(paths)) {
    const fields = paths[prop].split('.') || []
    pathValue[prop] = resolvePathValue(data, fields, '')
  }
  const res = {}
  const list = []
  for (const prop of Object.keys(pathValue)) {
    const value = pathValue[prop]
    if (Array.isArray(value)) {
      // 拍平为 list 数组
      for (let i = 0; i < value.length; i++) {
        list[i] = list[i] || {}
        list[i][prop] = value[i]
      }
    } else {
      res[prop] = value
    }
  }
  if (list.length > 0) {
    res.list = list
  }
  return res
}
