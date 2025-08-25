import axios from 'axios'

const API_URL = '/api'

export default {
  namespaced: true,
  state: {
    champions: [],
    currentChampion: null
  },
  mutations: {
    SET_CHAMPIONS (state, champions) {
      state.champions = champions
    },
    SET_CURRENT_CHAMPION (state, champion) {
      state.currentChampion = champion
    },
    ADD_CHAMPION (state, champion) {
      state.champions.push(champion)
    },
    UPDATE_CHAMPION (state, updatedChampion) {
      const index = state.champions.findIndex(c => c.id === updatedChampion.id)
      if (index !== -1) {
        state.champions.splice(index, 1, updatedChampion)
      }
    },
    REMOVE_CHAMPION (state, championId) {
      state.champions = state.champions.filter(c => c.id !== championId)
    }
  },
  actions: {
    async fetchChampions ({ commit }) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await axios.get(`${API_URL}/champions`)
        commit('SET_CHAMPIONS', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async fetchChampionsByCost ({ commit }, cost) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await axios.get(`${API_URL}/champions?cost=${cost}`)
        commit('SET_CHAMPIONS', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async fetchChampionsByTrait ({ commit }, traitId) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await axios.get(`${API_URL}/champions?trait_id=${traitId}`)
        commit('SET_CHAMPIONS', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async fetchChampion ({ commit }, championId) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await axios.get(`${API_URL}/champions/${championId}`)
        commit('SET_CURRENT_CHAMPION', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async createChampion ({ commit }, championData) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await axios.post(`${API_URL}/champions`, championData)
        commit('ADD_CHAMPION', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async updateChampion ({ commit }, { championId, championData }) {
      try {
        commit('SET_LOADING', true, { root: true })
        const response = await axios.put(`${API_URL}/champions/${championId}`, championData)
        commit('UPDATE_CHAMPION', response.data)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message, { root: true })
        throw error
      } finally {
        commit('SET_LOADING', false, { root: true })
      }
    },
    async deleteChampion ({ commit }, championId) {
      try {
        commit('SET_LOADING', true, { root: true })
        await axios.delete(`${API_URL}/champions/${championId}`)
        commit('REMOVE_CHAMPION', championId)
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
    getChampionById: state => id => {
      return state.champions.find(champion => champion.id === id)
    },
    getChampionsByCost: state => cost => {
      return state.champions.filter(champion => champion.cost === cost)
    },
    getChampionsByTrait: state => traitId => {
      return state.champions.filter(champion =>
        champion.traits.some(trait => trait.id === traitId)
      )
    }
  }
}
