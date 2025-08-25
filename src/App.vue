<template>
  <div class="app-container">
    <el-config-provider :locale="zhCn">
      <global-notification />
      <global-loading :loading="loading" />

      <el-container>
        <el-header>
          <app-header />
        </el-header>
        <el-main>
          <router-view />
        </el-main>
        <el-footer>
          <app-footer />
        </el-footer>
      </el-container>
    </el-config-provider>
  </div>
</template>

<script>
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
import GlobalNotification from './components/common/GlobalNotification.vue'
import GlobalLoading from './components/common/GlobalLoading.vue'

export default {
  name: 'App',
  components: {
    ElConfigProvider,
    AppHeader,
    AppFooter,
    GlobalNotification,
    GlobalLoading
  },
  setup () {
    const store = useStore()

    // 全局加载状态
    const loading = computed(() => store.state.loading)

    // 初始化应用
    onMounted(() => {
      store.dispatch('initApp')
    })

    return {
      zhCn,
      loading
    }
  }
}
</script>

<style>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.el-container {
  height: 100%;
}

.el-header {
  padding: 0;
  height: auto !important;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}

.el-footer {
  padding: 20px;
  text-align: center;
}

body {
  margin: 0;
  padding: 0;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}
</style>
