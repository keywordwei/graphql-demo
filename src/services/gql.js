import { ApolloClient, InMemoryCache } from '@apollo/client/core'

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
export default client
