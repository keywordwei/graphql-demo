<template>
  <div>
    <div class="banner">
      <span class="title">GraphQL</span>
    </div>
    <RepositoryTable />
  </div>
</template>
<script setup>
import RepositoryTable from '@/components/RepositoryTable.vue'
</script>
<style scoped>
.banner {
  text-align: center;
  line-height: 200px;
  font-size: 60px;
  height: 200px;
  background: url('@/assets/banner.png');
  background-size: cover;
  .title {
    background: linear-gradient(to right, #8ec5fc, #9795f0);
    background-clip: text;
    color: transparent;
  }
}
</style>
