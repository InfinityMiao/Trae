<script setup>
</script>

<template>
  <div id="app">
    <el-container>
      <el-header height="60px">
        <div class="header-content">
          <h1>前端项目</h1>
          <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/about">关于</el-menu-item>
          </el-menu>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeIndex: '/'
    }
  },
  methods: {
    handleSelect(key) {
      this.activeIndex = key
      this.$router.push(key)
    }
  },
  watch: {
    $route(to) {
      this.activeIndex = to.path
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
}

#app {
  height: 100vh;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.header-content h1 {
  font-size: 20px;
  color: #333;
}

.el-menu {
  border-bottom: none;
}

.el-main {
  padding: 20px;
}
</style>
