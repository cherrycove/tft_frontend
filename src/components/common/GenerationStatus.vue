<template>
  <div class="generation-status">
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
            :percentage="getProgressPercentage(scope.row.status)"
            :status="getProgressStatus(scope.row.status)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" v-if="showActions">
        <template #default="scope">
          <slot name="actions" :row="scope.row">
            <el-button
              size="small"
              :disabled="scope.row.status !== 'completed'"
              @click="$emit('view', scope.row)"
            >
              查看组合
            </el-button>
          </slot>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'GenerationStatus',
  props: {
    statusList: {
      type: Array,
      required: true
    },
    showActions: {
      type: Boolean,
      default: true
    }
  },
  emits: ['view'],
  setup () {
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

    const getProgressPercentage = (status) => {
      switch (status) {
        case 'completed':
          return 100
        case 'in_progress':
          return 50
        case 'pending':
          return 0
        case 'failed':
          return 100
        default:
          return 0
      }
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

    return {
      getStatusType,
      getStatusText,
      getProgressPercentage,
      getProgressStatus
    }
  }
}
</script>

<style scoped>
.generation-status {
  width: 100%;
}
</style>
