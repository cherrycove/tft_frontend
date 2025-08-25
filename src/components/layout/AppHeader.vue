<template>
  <div class="app-header">
    <el-menu
      :default-active="activeIndex"
      class="el-menu-demo"
      mode="horizontal"
      router
      @select="handleSelect"
    >
      <el-menu-item index="/">
        <el-icon><HomeFilled /></el-icon>
        首页
      </el-menu-item>
      <el-menu-item index="/champions">
        <el-icon><Avatar /></el-icon>
        棋子库
      </el-menu-item>
      <el-menu-item index="/traits">
        <el-icon><Collection /></el-icon>
        羁绊库
      </el-menu-item>
      <el-menu-item index="/compositions">
        <el-icon><Grid /></el-icon>
        组合查询
      </el-menu-item>
      <el-menu-item index="/admin">
        <el-icon><Setting /></el-icon>
        管理
      </el-menu-item>

      <div class="flex-spacer"></div>

      <div class="version-selector">
        <el-select v-model="currentVersion" placeholder="版本" size="small" @change="changeVersion">
          <el-option
            v-for="item in versions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </div>
    </el-menu>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { HomeFilled, Avatar, Collection, Grid, Setting } from '@element-plus/icons-vue'

export default {
  name: 'AppHeader',
  components: {
    HomeFilled,
    Avatar,
    Collection,
    Grid,
    Setting
  },
  setup () {
    const store = useStore()
    const route = useRoute()

    const activeIndex = computed(() => route.path)
    const currentVersion = computed({
      get: () => store.state.version,
      set: (val) => store.dispatch('setVersion', val)
    })

    // 模拟版本列表，实际应该从API获取
    const versions = ref(['latest', '14.1', '14.0', '13.24'])

    const handleSelect = (key) => {
      console.log(key)
    }

    const changeVersion = (version) => {
      store.dispatch('setVersion', version)
    }

    onMounted(() => {
      // 可以在这里从API获取可用版本
    })

    return {
      activeIndex,
      currentVersion,
      versions,
      handleSelect,
      changeVersion
    }
  }
}
</script>

<style scoped>
.app-header {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-menu-demo {
  display: flex;
}

.flex-spacer {
  flex-grow: 1;
}

.version-selector {
  display: flex;
  align-items: center;
  margin-right: 20px;
}
</style>
