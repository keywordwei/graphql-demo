<template>
  <div>
    <div class="tool-bar">
      <el-popover :show-arrow="false" @hide="hideColumns">
        <template #reference>
          <el-icon color="#1677FF"><Setting /></el-icon>
        </template>
        <template #default>
          <el-checkbox-group v-model="selectedColumns" class="check-box">
            <el-checkbox
              v-for="item in columns"
              :key="item.prop"
              :label="item.label"
              :value="item.prop"
            />
          </el-checkbox-group>
        </template>
      </el-popover>
    </div>
    <el-table ref="table" :data="repositories" style="width: 100%">
      <ColumnFilter ref="columnFilter">
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
              <el-tag
                round
                v-for="lang in row.languages.nodes"
                :color="lang.color"
                :key="lang.name"
                >{{ lang.name }}</el-tag
              >
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="isFork" label="isFork"> </el-table-column>
        <el-table-column prop="defaultBranchRef.name" label="默认分支"> </el-table-column>
      </ColumnFilter>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ColumnFilter from './ColumnFilter.vue'
import gqlClient from '@/services/gql'
import userSchema from './user.gql'
const repositories = ref([])
const table = ref(null)
const columnFilter = ref(null)
const selectedColumns = ref([])
const columns = ref([])

const getUserInfo = async () => {
  // 请求参数
  const variables = {
    login: 'github username',
    last: 7
  }
  // 发送请求
  const { data } = await gqlClient.query({ query: userSchema, variables })
  return data.user
}

getUserInfo().then((data) => {
  repositories.value = data.repositories.nodes
})

const hideColumns = () => {
  columns.value.forEach((item) => {
    const { prop } = item
    if (selectedColumns.value.includes(prop)) {
      item.visible = true
    } else {
      item.visible = false
    }
  })
}

onMounted(() => {
  columns.value = columnFilter.value.getColumnsOption()
  selectedColumns.value = columns.value.map(({ prop }) => prop)
})
</script>
<style scoped>
.tool-bar {
  padding: 16px;
  text-align: right;
}

.check-box {
  padding-left: 8px;
}
</style>
