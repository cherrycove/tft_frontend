<template>
  <div v-if="loading" class="global-loading">
    <div class="loading-container">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span class="loading-text">加载中...</span>
    </div>
  </div>
</template>

<script>
import { Loading } from '@element-plus/icons-vue'

export default {
  name: 'GlobalLoading',
  components: {
    Loading
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.loading-icon {
  font-size: 32px;
  color: #fff;
  animation: rotate 1.5s linear infinite;
}

.loading-text {
  margin-top: 10px;
  color: #fff;
  font-size: 16px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
