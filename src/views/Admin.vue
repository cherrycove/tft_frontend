<template>
  <div class="admin-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="admin-card">
          <template #header>
            <div class="card-header">
              <span>组合生成</span>
            </div>
          </template>

          <el-form :model="generationForm" label-width="120px">
            <el-form-item label="游戏版本">
              <el-input v-model="generationForm.version" placeholder="请输入版本号，例如：14.1" />
            </el-form-item>

            <el-form-item label="人口范围">
              <el-checkbox-group v-model="generationForm.populations">
                <el-checkbox
                  v-for="pop in populationOptions"
                  :key="pop"
                  :label="pop"
                >
                  {{ pop }}人口
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="最大羁绊等级">
              <el-select v-model="generationForm.trait_tag" placeholder="选择羁绊等级标签" clearable>
                <el-option label="全部 (默认)" value="" />
                <el-option label="黄铜" value="黄铜" />
                <el-option label="白银" value="白银" />
                <el-option label="黄金" value="黄金" />
                <el-option label="棱彩" value="棱彩" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="generating" @click="generateCompositions">
                开始生成
              </el-button>
              <el-button type="danger" @click="deleteCompositions">
                删除当前版本组合
              </el-button>
            </el-form-item>
          </el-form>

          <el-divider />

          <div class="generation-status">
            <h3>生成状态</h3>

            <el-table :data="statusList" style="width: 100%">
              <el-table-column prop="population" label="人口" width="100" />
              <el-table-column prop="version" label="版本" width="120" />
              <el-table-column prop="count" label="组合数量" width="120" />
              <el-table-column label="状态" width="120">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">
                    {{ getStatusText(scope.row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="进度">
                <template #default="scope">
                  <el-progress
                    :percentage="scope.row.progress"
                    :status="getProgressStatus(scope.row.status)"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default="scope">
                  <el-button
                    size="small"
                    :disabled="scope.row.status !== 'completed'"
                    @click="viewCompositions(scope.row)"
                  >
                    查看组合
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="admin-card">
          <template #header>
            <div class="card-header">
              <span>数据管理</span>
            </div>
          </template>

          <div class="data-management">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card class="data-card">
                  <template #header>
                    <div class="card-header">
                      <span>棋子管理</span>
                    </div>
                  </template>
                  <div class="data-stats">
                    <div class="stat-item">
                      <span class="stat-label">总数量:</span>
                      <span class="stat-value">{{ championCount }}</span>
                    </div>
                  </div>
                  <div class="data-actions">
                    <el-button type="primary" @click="navigateTo('/champions')">管理棋子</el-button>
                  </div>
                </el-card>
              </el-col>

              <el-col :span="8">
                <el-card class="data-card">
                  <template #header>
                    <div class="card-header">
                      <span>羁绊管理</span>
                    </div>
                  </template>
                  <div class="data-stats">
                    <div class="stat-item">
                      <span class="stat-label">总数量:</span>
                      <span class="stat-value">{{ traitCount }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">种族:</span>
                      <span class="stat-value">{{ originTraitCount }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">职业:</span>
                      <span class="stat-value">{{ classTraitCount }}</span>
                    </div>
                  </div>
                  <div class="data-actions">
                    <el-button type="primary" @click="navigateTo('/traits')">管理羁绊</el-button>
                  </div>
                </el-card>
              </el-col>

              <el-col :span="8">
                <el-card class="data-card">
                  <template #header>
                    <div class="card-header">
                      <span>组合管理</span>
                    </div>
                  </template>
                  <div class="data-stats">
                    <div class="stat-item">
                      <span class="stat-label">当前版本:</span>
                      <span class="stat-value">{{ currentVersion }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">组合数量:</span>
                      <span class="stat-value">{{ compositionCount }}</span>
                    </div>
                  </div>
                  <div class="data-actions">
                    <el-button type="primary" @click="navigateTo('/compositions')">查看组合</el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AdminView',
  setup () {
    const store = useStore()
    const router = useRouter()

    // 状态
    const champions = computed(() => store.state.champions.champions)
    const traits = computed(() => store.state.traits.traits)
    const compositions = computed(() => store.state.compositions.compositions)
    const currentVersion = computed(() => store.state.version)
    const generating = ref(false)

    // 表单
    const generationForm = reactive({
      version: currentVersion.value,
      populations: [4, 5, 6, 7, 8],
      trait_tag: ''
    })

    // 生成状态
    const statusList = ref([])
    const statusCheckInterval = ref(null)

    // 人口选项
    const populationOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

    // 计算属性
    const championCount = computed(() => champions.value.length)

    const traitCount = computed(() => traits.value.length)

    const originTraitCount = computed(() =>
      traits.value.filter(t => t.type === 'origin').length
    )

    const classTraitCount = computed(() =>
      traits.value.filter(t => t.type === 'class').length
    )

    const compositionCount = computed(() => compositions.value.length)

    // 方法
    const generateCompositions = async () => {
      if (!generationForm.version) {
        ElMessage.warning('请输入版本号')
        return
      }

      if (generationForm.populations.length === 0) {
        ElMessage.warning('请选择至少一个人口')
        return
      }

      try {
        generating.value = true

        // 更新当前版本
        await store.dispatch('setVersion', generationForm.version)

        // 启动生成任务
        await store.dispatch('compositions/generateCompositions', generationForm)

        ElMessage.success('组合生成任务已启动')

        // 初始化状态列表
        statusList.value = generationForm.populations.map(population => ({
          population,
          version: generationForm.version,
          status: 'pending',
          count: 0,
          progress: 0
        }))

        // 开始定期检查状态
        startStatusCheck()
      } catch (error) {
        ElMessage.error('启动生成任务失败')
      } finally {
        generating.value = false
      }
    }

    const deleteCompositions = async () => {
      ElMessageBox.confirm(
        `确定要删除版本 ${currentVersion.value} 的所有组合吗？`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          await store.dispatch('compositions/deleteCompositionsByVersion')
          ElMessage.success('组合删除成功')
          // 重新加载组合
          await store.dispatch('compositions/fetchCompositions', {})
        } catch (error) {
          ElMessage.error('删除组合失败')
        }
      }).catch(() => {
        // 取消删除
      })
    }

    const startStatusCheck = () => {
      // 清除现有的检查间隔
      if (statusCheckInterval.value) {
        clearInterval(statusCheckInterval.value)
      }

      // 设置新的检查间隔
      statusCheckInterval.value = setInterval(async () => {
        let allCompleted = true

        for (const status of statusList.value) {
          if (status.status !== 'completed' && status.status !== 'failed') {
            allCompleted = false

            try {
              const result = await store.dispatch('compositions/checkGenerationStatus', {
                version: status.version,
                population: status.population
              })

              // 更新状态
              status.status = result.status
              status.count = result.count
              status.progress = result.progress
            } catch (error) {
              console.error('检查状态失败:', error)
            }
          }
        }

        // 如果所有任务都完成了，停止检查
        if (allCompleted) {
          clearInterval(statusCheckInterval.value)
          statusCheckInterval.value = null
        }
      }, 5000) // 每5秒检查一次
    }

    const getStatusType = (status) => {
      switch (status) {
        case 'completed':
          return 'success'
        case 'in_progress':
          return 'primary'
        case 'pending':
          return 'info'
        case 'failed':
          return 'danger'
        default:
          return 'info'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'completed':
          return '已完成'
        case 'in_progress':
          return '生成中'
        case 'pending':
          return '等待中'
        case 'failed':
          return '失败'
        default:
          return '未知'
      }
    }

    const getProgressPercentage = (status, progress) => {
      if (status === 'completed') return 100
      if (status === 'failed') return 100
      return progress || 0
    }

    const getProgressStatus = (status) => {
      switch (status) {
        case 'completed':
          return 'success'
        case 'in_progress':
          return ''
        case 'pending':
          return ''
        case 'failed':
          return 'exception'
        default:
          return ''
      }
    }

    const viewCompositions = (row) => {
      // 设置版本
      store.dispatch('setVersion', row.version)
      // 导航到组合页面并设置人口筛选
      router.push({
        path: '/compositions',
        query: { population: row.population }
      })
    }

    const navigateTo = (path) => {
      router.push(path)
    }

    // 生命周期钩子
    onMounted(async () => {
      try {
        await Promise.all([
          store.dispatch('champions/fetchChampions'),
          store.dispatch('traits/fetchTraits'),
          store.dispatch('compositions/fetchCompositions', {})
        ])
      } catch (error) {
        ElMessage.error('加载数据失败')
      }
    })

    // 组件销毁时清除定时器
    onUnmounted(() => {
      if (statusCheckInterval.value) {
        clearInterval(statusCheckInterval.value)
      }
    })

    return {
      champions,
      traits,
      compositions,
      currentVersion,
      generating,
      generationForm,
      statusList,
      populationOptions,
      championCount,
      traitCount,
      originTraitCount,
      classTraitCount,
      compositionCount,
      generateCompositions,
      deleteCompositions,
      getStatusType,
      getStatusText,
      getProgressPercentage,
      getProgressStatus,
      viewCompositions,
      navigateTo
    }
  }
}
</script>

<style scoped>
.admin-container {
  max-width: 1200px;
  margin: 0 auto;
}

.admin-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.generation-status {
  margin-top: 20px;
}

.generation-status h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.data-management {
  margin-top: 10px;
}

.data-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.data-stats {
  flex-grow: 1;
  margin-bottom: 20px;
}

.stat-item {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}

.stat-label {
  color: #606266;
}

.stat-value {
  font-weight: bold;
  color: #303133;
}

.data-actions {
  text-align: center;
}
</style>
