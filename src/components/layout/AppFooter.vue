<template>
  <div class="app-footer">
    <p>云顶之奕组合工具 &copy; {{ currentYear }}</p>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'AppFooter',
  setup () {
    const currentYear = computed(() => new Date().getFullYear())

    return {
      currentYear
    }
  }
}
</script>

<style scoped>
.app-footer {
  font-size: 14px;
  color: #909399;
}
</style>
