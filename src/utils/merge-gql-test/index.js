import mergeGql from '../merge-gql'
import sourceGql from './source/query/user.gql'
import targetGql from './target/query/user.gql'
import { print } from 'graphql'

export default () => {
  console.log('graphql source gql is', print(sourceGql))
  console.log('graphql target gql is', print(targetGql))
  console.log('graphql merge result is', print(mergeGql(targetGql, sourceGql)))
}
