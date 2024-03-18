<template>
  <el-table :data="repositories" style="width: 100%">
    <el-table-column prop="name" label="仓库名">
      <template #default="{ row }">
        <el-link type="primary" :href="row.url"> {{ row.name }}</el-link>
      </template>
    </el-table-column>
    <el-table-column prop="description" label="描述" />
    <el-table-column prop="createdAt" label="创建时间">
      <template #default="{ row }">
        {{ new Date(row.createdAt).toLocaleString() }}
      </template>
    </el-table-column>
    <el-table-column prop="languages" label="languages">
      <template #default="{ row }">
        <div>
          <el-tag round v-for="lang in row.languages.nodes" :color="lang.color" :key="lang.name">{{
            lang.name
          }}</el-tag>
        </div>
      </template>
    </el-table-column>
    <el-table-column prop="isFork" label="isFork"> </el-table-column>
    <el-table-column prop="defaultBranchRef.name" label="默认分支"> </el-table-column>
  </el-table>
</template>

<script setup>
import { ref } from 'vue'
import gqlClient from '@/services/gql'
import userSchema from './user.gql'

const repositories = ref([])
const getUserInfo = async () => {
  // 请求参数
  const variables = {
    login: 'github_username',
    last: 7
  }
  // 发送请求
  const { data } = await gqlClient.query({ query: userSchema, variables })
  return data.user
}
getUserInfo().then((data) => {
  repositories.value = data.repositories.nodes
})
</script>
