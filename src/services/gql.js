import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import GraphqlManager from '@/utils/graphql-manager'
import flatten from '@/utils/flatten'
import { print } from 'graphql'

const cache = new InMemoryCache()
const token = 'TOKEN github_token'
// 初始化 graphql web client
const client = new ApolloClient({
  cache: cache,
  uri: '/graphql',
  queryDeduplication: false,
  headers: {
    Authorization: token
  },
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network'
    }
  }
})
const filterPaths = (paths = { columns: {} }, columns = []) => {
  let res = {
    ...paths
  }
  delete res.columns
  if (columns.length === 0 && Object.keys(paths.columns).length !== 0) {
    res = {
      ...res,
      ...paths.columns
    }
  }
  for (const { prop, visible } of columns) {
    if (!paths.columns[prop]) {
      throw new Error(`${prop} path 不存在`)
    } else if (visible) {
      res[prop] = paths.columns[prop]
    }
  }
  return res
}
// 扩展 query 方法，实现运行裁切 gql
const query = async (options) => {
  const paths = filterPaths(options.paths, options.columns)
  const params = {
    query: options.query,
    paths
  }
  const graphqlManager = new GraphqlManager(params)
  const targetSchema = graphqlManager.sliceGqlByPaths()
  options.query = targetSchema.query
  delete options.paths
  const { data } = await client.query(options)
  const res = flatten(data, targetSchema.paths)
  console.log('graphql query is', print(targetSchema.query))
  console.log('graphql paths is', targetSchema.paths)
  console.log('graphql res is', res)
  return res
}
const targetQuery = {
  ...client,
  query
}
export default targetQuery
