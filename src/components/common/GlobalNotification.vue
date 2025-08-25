<template>
  <div></div>
</template>

<script>
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { provide, reactive } from 'vue'

export default {
  name: 'GlobalNotification',
  setup () {
    // 创建通知服务
    const notificationService = reactive({
      // 显示普通消息
      showMessage (message, type = 'info', duration = 3000) {
        ElMessage({
          message,
          type,
          duration,
          showClose: true
        })
      },

      // 显示成功消息
      success (message, duration = 3000) {
        this.showMessage(message, 'success', duration)
      },

      // 显示警告消息
      warning (message, duration = 3000) {
        this.showMessage(message, 'warning', duration)
      },

      // 显示错误消息
      error (message, duration = 3000) {
        this.showMessage(message, 'error', duration)
      },

      // 显示信息消息
      info (message, duration = 3000) {
        this.showMessage(message, 'info', duration)
      },

      // 显示确认对话框
      confirm (message, title = '确认', options = {}) {
        return ElMessageBox.confirm(
          message,
          title,
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            ...options
          }
        )
      },

      // 显示提示对话框
      alert (message, title = '提示', options = {}) {
        return ElMessageBox.alert(
          message,
          title,
          {
            confirmButtonText: '确定',
            type: 'info',
            ...options
          }
        )
      },

      // 显示通知
      notify (message, title = '通知', options = {}) {
        ElNotification({
          title,
          message,
          type: options.type || 'info',
          duration: options.duration || 4500,
          position: options.position || 'top-right',
          showClose: true,
          ...options
        })
      }
    })

    // 提供通知服务给子组件
    provide('notification', notificationService)

    return {
      notificationService
    }
  }
}
</script>
