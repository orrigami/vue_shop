<template>
  <div>
    <el-button type="danger" @click="logout">退出登录</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    // 退出登录
    logout() {
      // 清楚token
      window.sessionStorage.clear()
      // 重定向到登录页
      this.$router.push('/login')
    },
  },
}
</script>

<style lang="less" scoped>
</style>