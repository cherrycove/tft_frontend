import axios from 'axios'

const API_URL = '/api'

export default {
  namespaced: true,
  state: {
    traits: [],
    currentTrait: null,
    traitLevels: {}
  },
  mutations: {
    SET_TRAITS (state, traits) {
      state.traits = traits
    },
    SET_CURRENT_TRAIT (state, trait) {
      state.currentTrait = trait
    },
    SET_TRAIT_LEVELS (state, { traitId, levels }) {
      state.traitLevels = { ...state.traitLevels, [traitId]: levels }
    },
    ADD_TRAIT (state, trait) {
      state.traits.push(trait)
    },
    UPDATE_TRAIT (state, updatedTrait) {
      const index = state.traits.findIndex(t => t.id === updatedTrait.id)
      if (index !== -1) {
        state.traits.splice(index, 1, updatedTrait)
      }
    },
    REMOVE_TRAIT (state, traitId) {
      state.traits = state.traits.filter(t => t.id !== traitId)
    },
    ADD_TRAIT_LEVEL (state, { traitId, level }) {
      if (!state.traitLevels[traitId]) {
        state.traitLevels[traitId] = []
      }
      state.traitLevels[traitId].push(level)
    },
    UPDATE_TRAIT_LEVEL (state, { traitId, updatedLevel }) {
      if (state.traitLevels[traitId]) {
        const index = state.traitLevels[traitId].findIndex(l => l.level === updatedLevel.level)
        if (index !== -1) {
          state.traitLevels[traitId].splice(index, 1, updatedLevel)
        }
      }
    },
    REMOVE_TRAIT_LEVEL (state, { traitId, level }) {
      if (state.traitLevels[traitId]) {
        state.traitLevels[traitId] = state.traitLevels[traitId].filter(l => l.level !== level)
      }
    }
  },
  actions: {
    async fetchTraits ({ commit }) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await axios.get(`${API_URL}/traits`)
        const traits = response.data
        commit('SET_TRAITS', traits)

        // 优化：一次性设置所有羁绊的等级
        traits.forEach(trait => {
          if (trait.levels) {
            commit('SET_TRAIT_LEVELS', { traitId: trait.id, levels: trait.levels })
          }
        })

        return traits
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async fetchTraitsByType ({ commit }, traitType) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await axios.get(`${API_URL}/traits?trait_type=${traitType}`)
        commit('SET_TRAITS', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async fetchTrait ({ commit }, traitId) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await axios.get(`${API_URL}/traits/${traitId}`)
        commit('SET_CURRENT_TRAIT', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async createTrait ({ commit }, { name, traitType }) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await axios.post(`${API_URL}/traits?name=${name}&trait_type=${traitType}`)
        commit('ADD_TRAIT', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async updateTrait ({ commit }, { traitId, name, traitType }) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await axios.put(`${API_URL}/traits/${traitId}?name=${name}&trait_type=${traitType}`)
        commit('UPDATE_TRAIT', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async deleteTrait ({ commit }, traitId) {
      try {
        commit('SET_LOADING', true, { root: true })
        await axios.delete(`${API_URL}/traits/${traitId}`)
        commit('REMOVE_TRAIT', traitId)
        return true
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async createTraitLevel ({ commit }, { traitId, level, requiredCount, effectDescription, tag }) {
      try {
        commit('SET_LOADING', true, { root: true })

        const payload = {
          level,
          required_count: requiredCount,
          effect_description: effectDescription,
          tag: tag || null // 如果 tag 为空字符串，发送 null
        }

        const response = await axios.post(
          `${API_URL}/traits/${traitId}/levels`,
          payload
        )
        commit('ADD_TRAIT_LEVEL', { traitId, level: response.data })
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async updateTraitLevel ({ commit }, { traitId, level, requiredCount, effectDescription, tag }) {
      try {
        commit('SET_LOADING', true, { root: true })

        const payload = {}
        if (requiredCount !== undefined) payload.required_count = requiredCount
        if (effectDescription !== undefined) payload.effect_description = effectDescription
        if (tag !== undefined) payload.tag = tag

        const response = await axios.put(
          `${API_URL}/traits/${traitId}/levels/${level}`,
          payload
        )
        commit('UPDATE_TRAIT_LEVEL', { traitId, updatedLevel: response.data })
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async deleteTraitLevel ({ commit }, { traitId, level }) {
      try {
        commit('SET_LOADING', true, { root: true })
        await axios.delete(`${API_URL}/traits/${traitId}/levels/${level}`)
        commit('REMOVE_TRAIT_LEVEL', { traitId, level })
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
    getTraitById: state => id => {
      return state.traits.find(trait => trait.id === id)
    },
    getTraitsByType: state => type => {
      return state.traits.filter(trait => trait.type === type)
    },
    getTraitLevels: state => traitId => {
      return state.traitLevels[traitId] || []
    }
  }
}
