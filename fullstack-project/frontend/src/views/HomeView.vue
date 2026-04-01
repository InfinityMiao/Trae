<template>
  <div class="home">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>欢迎页面</span>
        </div>
      </template>
      <div class="card-body">
        <h1>Vue 3 + Vite + Element Plus + Pinia + Vue Router</h1>
        <p>这是一个完整的前端项目模板</p>
        <el-button type="primary" @click="goToAbout">前往关于页面</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToAbout = () => {
  router.push('/about')
}
</script>

<style scoped>
.home {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
}

p {
  margin-bottom: 30px;
}
</style>