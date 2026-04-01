<template>
  <div class="about">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>关于页面</span>
        </div>
      </template>
      <div class="card-body">
        <h1>关于我们</h1>
        <p>这是一个使用 Vue 3、Vite、Element Plus、Pinia 和 Vue Router 构建的前端项目</p>
        <el-button type="primary" @click="goToHome">返回首页</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToHome = () => {
  router.push('/')
}
</script>

<style scoped>
.about {
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