<template>
  <router-view />
  <!-- 用户隐私政策弹窗 -->
  <PrivacyPolicyModal />
</template>

<script setup lang="ts">
import PrivacyPolicyModal from './components/PrivacyPolicyModal.vue';
// App.vue 根组件
</script>

<style scoped>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  background-color: #f5f5f5;
}
</style>