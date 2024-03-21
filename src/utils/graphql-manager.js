import { visit, print as printGql } from 'graphql'
import { cloneDeep, isEmpty, isEqual, isPlainObject, get } from 'lodash'

export default class GraphqlManager {
  static cache = new Map()

  get queryName() {
    return get(this.query, 'definitions.0.selectionSet.selections.0.name.value', '')
  }

  constructor({ query, paths }) {
    this.query = query
    this.paths = paths
  }

  /**
   *@see [visit函数]{@link https://graphql.org/graphql-js/language/#visit}
   */
  sliceGqlByPaths() {
    const cache = this.getCache()
    if (isPlainObject(cache)) {
      return cache
    }
    let result
    if (isEmpty(this.paths)) {
      result = {
        query: this.query,
        paths: this.paths
      }
    } else {
      const { query, paths } = this.expandGqlAndPaths()
      const exactPaths = Object.values(paths)
      const fields = []
      let exactQuery = visit(query, {
        enter(node) {
          if (node.kind === 'Field') {
            if (node.alias) {
              fields.push(node.alias.value)
            } else {
              fields.push(node.name.value)
            }
            if (exactPaths.includes(fields.join('.'))) {
              fields.pop()
              // 跳过遍历当前节点
              return false
            }
          }
        },
        leave(node) {
          if (node.kind === 'Field') {
            const path = fields.join('.')
            fields.pop()
            if (!exactPaths.includes(path) && !node.selectionSet) {
              // 删除空节点
              return null
            }
          }
          if (node.kind === 'SelectionSet') {
            if (node.selections.length === 0) {
              // 删除空节点
              return null
            }
          }
          if (node.kind === 'InlineFragment') {
            if (node.selectionSet === null) {
              // 删除空节点
              return null
            }
          }
        }
      })
      exactQuery = this.removeNeverUseVariables(exactQuery)
      result = {
        query: exactQuery,
        paths
      }
    }
    this.setCache(result)
    return result
  }

  expandGqlAndPaths() {
    const { query, fragmentDict } = this.expandGql()
    const paths = this.expandPaths(this.paths, fragmentDict)
    return {
      query,
      paths
    }
  }

  getCache() {
    const { source = {}, target } = GraphqlManager.cache.get(this.queryName) || {}
    const { query, paths } = source
    if (isEqual(paths, this.paths) && isEqual(printGql(query), printGql(this.query))) {
      return target
    }
  }

  setCache(target) {
    const source = {
      query: this.query,
      paths: this.paths
    }
    GraphqlManager.cache.set(this.queryName, { source, target })
  }

  expandGql() {
    this.checkGql(this.query)
    return this.spreadFragment(this.query)
  }

  checkGql(query) {
    let queryOperateTimes = 0
    for (const definition of query.definitions) {
      if (definition.kind === 'OperationDefinition' && definition.operation === 'query') {
        queryOperateTimes++
        if (queryOperateTimes >= 2) {
          break
        }
      }
    }
    if (queryOperateTimes === 0 || queryOperateTimes >= 2) {
      throw new Error('只能定义一次query查询语句')
    }
  }

  spreadFragment(query) {
    const fragmentDict = {}
    let operateDefinitions = query.definitions.filter(
      ({ kind }) => kind === 'OperationDefinition'
    )[0]
    const fragmentDefinitions = query.definitions.filter(
      ({ kind }) => kind === 'FragmentDefinition'
    )
    const fragmentDefinitionMap = {}
    fragmentDefinitions.forEach((definition) => {
      const fragmentName = definition.name.value
      fragmentDefinitionMap[fragmentName] = definition
    })
    const recursiveSpreadFragment = (definitions, dictPath = '') => {
      const fields = []
      const node = visit(definitions, {
        enter(node) {
          if (node.kind === 'Field') {
            if (node.alias) {
              fields.push(node.alias.value)
            } else {
              fields.push(node.name.value)
            }
          }
          if (node.kind === 'FragmentSpread') {
            const fragmentName = node.name.value
            if (fragmentDefinitionMap[fragmentName]) {
              if (!fragmentDict[fragmentName]) {
                fragmentDict[fragmentName] = dictPath + fields.join('.')
              }
              return recursiveSpreadFragment(
                fragmentDefinitionMap[fragmentName],
                fragmentDict[fragmentName] + '.'
              )
            }
            throw new Error(`fragment ${fragmentName} 未定义`)
          }
        },
        leave(node) {
          if (node.kind === 'Field') {
            fields.pop()
          }
          if (node.kind === 'SelectionSet') {
            return {
              ...node,
              selections: node.selections.flat()
            }
          }
        }
      })
      return node.selectionSet.selections
    }
    const documentNode = cloneDeep(operateDefinitions)
    documentNode.selectionSet.selections = recursiveSpreadFragment(operateDefinitions)
    query.definitions = [documentNode]
    return { query, fragmentDict }
  }

  expandPaths(paths, fragmentDict) {
    const exactValuePaths = {}
    Object.keys(paths).forEach((field) => {
      if (!paths[field]) {
        throw new Error(`${field} path 不存在`)
      }
      const dictPaths = paths[field].split('.')
      const fragmentName = dictPaths.shift()
      if (fragmentDict[fragmentName]) {
        exactValuePaths[field] = fragmentDict[fragmentName] + '.' + dictPaths.join('.')
      } else {
        exactValuePaths[field] = paths[field]
      }
    })
    return exactValuePaths
  }

  removeNeverUseVariables(query) {
    const usedVariables = this.getUsedVariables(query)
    return visit(query, {
      VariableDefinition(node) {
        const variable = node.variable.name.value
        if (!usedVariables.includes(variable)) {
          return null
        }
      }
    })
  }

  getUsedVariables(query) {
    const usedVariables = []
    visit(query, {
      Argument(node) {
        const variable = node.value.name?.value
        if (variable) {
          usedVariables.push(variable)
        }
      }
    })
    return usedVariables
  }
}
