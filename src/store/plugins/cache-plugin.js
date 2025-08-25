// 缓存插件，用于在本地存储中缓存Vuex状态

// 默认缓存配置
const defaultOptions = {
  key: 'tft-team-builder-cache', // 存储键名
  paths: ['champions.champions', 'traits.traits', 'traits.traitLevels'], // 要缓存的路径
  ttl: 3600000, // 缓存有效期，默认1小时
  storage: window.localStorage // 存储对象
}

/**
 * 从对象中获取嵌套属性值
 * @param {Object} obj - 源对象
 * @param {String} path - 属性路径，如 'a.b.c'
 * @returns {*} 属性值
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj)
}

/**
 * 设置对象的嵌套属性值
 * @param {Object} obj - 目标对象
 * @param {String} path - 属性路径，如 'a.b.c'
 * @param {*} value - 要设置的值
 */
const setNestedValue = (obj, path, value) => {
  const parts = path.split('.')
  const lastKey = parts.pop()
  const target = parts.reduce((o, p) => {
    if (!o[p]) o[p] = {}
    return o[p]
  }, obj)
  target[lastKey] = value
}

/**
 * 创建Vuex缓存插件
 * @param {Object} options - 插件配置
 * @returns {Function} Vuex插件
 */
export default function createCachePlugin (options = {}) {
  const { key, paths, ttl, storage } = { ...defaultOptions, ...options }

  return store => {
    // 从缓存恢复状态
    try {
      const cached = storage.getItem(key)
      if (cached) {
        const { timestamp, state } = JSON.parse(cached)

        // 检查缓存是否过期
        if (timestamp && Date.now() - timestamp < ttl) {
          // 恢复缓存的状态
          paths.forEach(path => {
            const value = getNestedValue(state, path)
            if (value !== undefined) {
              // 使用路径的最后一部分作为mutation名称
              const mutationName = path.split('.').pop().toUpperCase()
              const moduleName = path.split('.')[0]

              // 构造完整的mutation名称
              const fullMutationName = `${moduleName}/SET_${mutationName}`

              // 提交mutation
              if (store._mutations[fullMutationName]) {
                store.commit(fullMutationName, value)
              }
            }
          })

          console.log('已从缓存恢复状态')
        } else {
          // 缓存已过期，清除
          storage.removeItem(key)
          console.log('缓存已过期')
        }
      }
    } catch (error) {
      console.error('从缓存恢复状态失败:', error)
      // 清除可能损坏的缓存
      storage.removeItem(key)
    }

    // 订阅状态变化，更新缓存
    store.subscribe((mutation, state) => {
      try {
        // 检查是否需要更新缓存
        const shouldUpdate = paths.some(path => {
          const moduleName = path.split('.')[0]
          const stateKey = path.split('.').pop()
          const mutationName = `${moduleName}/SET_${stateKey.toUpperCase()}`

          return mutation.type === mutationName
        })

        if (shouldUpdate) {
          // 构建要缓存的状态
          const cachedState = {}
          paths.forEach(path => {
            const value = getNestedValue(state, path)
            if (value !== undefined) {
              setNestedValue(cachedState, path, value)
            }
          })

          // 保存到缓存
          storage.setItem(key, JSON.stringify({
            timestamp: Date.now(),
            state: cachedState
          }))

          console.log('状态已缓存')
        }
      } catch (error) {
        console.error('缓存状态失败:', error)
      }
    })
  }
}
