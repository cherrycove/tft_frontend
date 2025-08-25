import axios from 'axios'

const API_URL = '/api' // 强制使用相对路径，排除所有环境变量干扰

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  config => {
    // 可以在这里添加认证信息等
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // 处理错误响应
    if (error.response) {
      // 服务器响应了，但状态码不是2xx
      console.error('API Error:', error.response.data)
    } else if (error.request) {
      // 请求已发送，但没有收到响应
      console.error('No response received:', error.request)
    } else {
      // 请求配置出错
      console.error('Request error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default apiClient
