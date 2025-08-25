import axios from 'axios'

const API_URL = '/api'

export default {
  namespaced: true,
  state: {
    compositions: [],
    totalCompositions: 0,
    currentComposition: null,
    generationStatus: {}
  },
  mutations: {
    SET_COMPOSITIONS (state, { compositions, total }) {
      state.compositions = compositions || []
      state.totalCompositions = total
    },
    SET_CURRENT_COMPOSITION (state, composition) {
      state.currentComposition = composition
    },
    SET_GENERATION_STATUS (state, { version, population, status, count, progress }) {
      const key = `${version}:${population}`
      state.generationStatus[key] = {
        ...state.generationStatus[key],
        status,
        count,
        progress: progress !== undefined ? progress : state.generationStatus[key]?.progress || 0
      }
    }
  },
  actions: {
    async fetchCompositions ({ commit, rootState }, payload = {}) {
      try {
        commit('SET_LOADING', true, { root: true })

        const params = {
          // page and page_size removed as backend does not support pagination
          version: rootState.champions.currentVersion
        }
        if (payload.population && payload.population.length > 0) {
          params.populations = payload.population.join(',')
        }
        if (payload.minCost !== null && payload.minCost !== undefined) {
          params.min_cost = payload.minCost
        }
        if (payload.maxCost !== null && payload.maxCost !== undefined) {
          params.max_cost = payload.maxCost
        }
        if (payload.trait) {
          params.trait_id = payload.trait
        }
        if (payload.minHighestTraitLevel !== null && payload.minHighestTraitLevel !== undefined) {
          params.min_highest_trait_level = payload.minHighestTraitLevel
        }

        const response = await axios.get(`${API_URL}/compositions`, { params }) // Removed trailing slash

        // API returns a full array, total count is the length of the array
        commit('SET_COMPOSITIONS', {
          compositions: response.data,
          total: response.data.length
        })
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async fetchComposition ({ commit }, compositionId) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await axios.get(`${API_URL}/compositions/${compositionId}`)
        commit('SET_CURRENT_COMPOSITION', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async generateCompositions ({ commit, rootState }, { populations, version, traitTag }) {
      try {
        commit('SET_LOADING', true, { root: true })
        const payload = {
          populations,
          version: version || rootState.version,
          trait_tag: traitTag || undefined
        }
        const response = await axios.post(`${API_URL}/compositions/generate`, payload)

        // 初始化生成状态
        populations.forEach(population => {
          commit('SET_GENERATION_STATUS', {
            version: rootState.version,
            population,
            status: 'pending',
            count: 0,
            progress: 0
          })
        })

        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async checkGenerationStatus ({ commit }, { version, population }) {
      try {
        const response = await axios.get(`${API_URL}/compositions/generation/status/${version}/${population}`)
        commit('SET_GENERATION_STATUS', {
          version,
          population,
          status: response.data.status,
          count: response.data.count,
          progress: response.data.progress
        })
        return response.data
      } catch (error) {
        console.error('Failed to check generation status:', error)
        return { status: 'error', count: 0 }
      }
    },
    async deleteCompositionsByVersion ({ commit, rootState }) {
      try {
        commit('SET_LOADING', true, { root: true })
        await axios.delete(`${API_URL}/compositions/version/${rootState.version}`)
        commit('SET_COMPOSITIONS', { compositions: [], total: 0 })
        return true
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    }
  },
  getters: {
    getCompositionById: state => id => {
      return state.compositions.find(composition => composition.id === id)
    },
    getCompositionsByPopulation: state => population => {
      return state.compositions.filter(composition => composition.population === population)
    },
    getGenerationStatus: state => (version, population) => {
      return state.generationStatus[`${version}:${population}`] || { status: 'unknown', count: 0 }
    }
  }
}
