import axios from 'axios'
// import { ElMessage } from 'element-plus'

// 添加重试机制的请求方法
const requestWithRetry = async (method, url, data = null, config = {}, retries = 3, delay = 1000) => {
  try {
    let response

    switch (method.toLowerCase()) {
      case 'get':
        response = await axios.get(url, { params: data, ...config })
        break
      case 'post':
        response = await axios.post(url, data, config)
        break
      case 'put':
        response = await axios.put(url, data, config)
        break
      case 'delete':
        response = await axios.delete(url, { data, ...config })
        break
      default:
        throw new Error(`不支持的请求方法: ${method}`)
    }

    return response.data
  } catch (error) {
    if (retries > 0 && (error.code === 'ECONNABORTED' || !error.response)) {
      // 如果是超时或网络错误，进行重试
      console.log(`请求失败，${delay / 1000}秒后重试，剩余重试次数: ${retries - 1}`)
      await new Promise(resolve => setTimeout(resolve, delay))
      return requestWithRetry(method, url, data, config, retries - 1, delay * 2)
    }

    throw error
  }
}

// API服务
const apiService = {
  // 棋子API
  champions: {
    getAll: (params = {}) => requestWithRetry('get', '/champions', params),
    getById: (id) => requestWithRetry('get', `/champions/${id}`),
    getByCost: (cost) => requestWithRetry('get', '/champions', { cost }),
    getByTrait: (traitId) => requestWithRetry('get', '/champions', { trait_id: traitId }),
    create: (data) => requestWithRetry('post', '/champions', data),
    update: (id, data) => requestWithRetry('put', `/champions/${id}`, data),
    delete: (id) => requestWithRetry('delete', `/champions/${id}`)
  },

  // 羁绊API
  traits: {
    getAll: (params = {}) => requestWithRetry('get', '/traits', params),
    getById: (id) => requestWithRetry('get', `/traits/${id}`),
    getByType: (type) => requestWithRetry('get', '/traits', { trait_type: type }),
    getLevels: (id) => requestWithRetry('get', `/traits/${id}/levels`),
    create: (name, type) => requestWithRetry('post', '/traits', null, { params: { name, trait_type: type } }),
    update: (id, name, type) => requestWithRetry('put', `/traits/${id}`, null, { params: { name, trait_type: type } }),
    delete: (id) => requestWithRetry('delete', `/traits/${id}`),
    createLevel: (id, level, requiredCount, effectDescription) =>
      requestWithRetry('post', `/traits/${id}/levels`, null, {
        params: { level, required_count: requiredCount, effect_description: effectDescription }
      }),
    updateLevel: (id, level, requiredCount, effectDescription) =>
      requestWithRetry('put', `/traits/${id}/levels/${level}`, null, {
        params: { required_count: requiredCount, effect_description: effectDescription }
      }),
    deleteLevel: (id, level) => requestWithRetry('delete', `/traits/${id}/levels/${level}`)
  },

  // 组合API
  compositions: {
    getAll: (params = {}) => requestWithRetry('get', '/compositions', params),
    getById: (id) => requestWithRetry('get', `/compositions/${id}`),
    generate: (data) => requestWithRetry('post', '/compositions/generate', data),
    getGenerationStatus: (version, population) =>
      requestWithRetry('get', `/compositions/generation/status/${version}/${population}`),
    deleteByVersion: (version) => requestWithRetry('delete', `/compositions/version/${version}`)
  }
}

export default apiService
