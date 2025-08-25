import { createStore } from 'vuex'
import championsModule from './modules/champions'
import traitsModule from './modules/traits'
import compositionsModule from './modules/compositions'
import createCachePlugin from './plugins/cache-plugin'

// 创建缓存插件
const cachePlugin = createCachePlugin({
  key: 'tft-team-builder-cache',
  paths: ['champions.champions', 'traits.traits', 'traits.traitLevels'],
  ttl: 3600000 // 1小时
})

export default createStore({
  state: {
    loading: false,
    error: null,
    version: 'latest'
  },
  mutations: {
    SET_LOADING (state, loading) {
      state.loading = loading
    },
    SET_ERROR (state, error) {
      state.error = error
    },
    SET_VERSION (state, version) {
      state.version = version
    }
  },
  actions: {
    setLoading ({ commit }, loading) {
      commit('SET_LOADING', loading)
    },
    setError ({ commit }, error) {
      commit('SET_ERROR', error)
    },
    setVersion ({ commit }, version) {
      commit('SET_VERSION', version)
      // 保存版本到本地存储
      localStorage.setItem('tft-team-builder-version', version)
    },
    // 初始化应用
    initApp ({ commit, dispatch }) {
      // 从本地存储恢复版本
      const savedVersion = localStorage.getItem('tft-team-builder-version')
      if (savedVersion) {
        commit('SET_VERSION', savedVersion)
      }

      // 预加载数据
      return Promise.all([
        dispatch('champions/fetchChampions'),
        dispatch('traits/fetchTraits')
      ]).catch(error => {
        console.error('初始化应用失败:', error)
      })
    }
  },
  modules: {
    champions: championsModule,
    traits: traitsModule,
    compositions: compositionsModule
  },
  plugins: [cachePlugin]
})
