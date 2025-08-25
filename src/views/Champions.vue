<template>
  <div class="champions-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="filter-card">
          <template #header>
            <div class="card-header">
              <span>棋子筛选</span>
              <el-button v-if="isAdmin" type="primary" size="small" @click="showAddChampionDialog">
                添加棋子
              </el-button>
            </div>
          </template>
          <el-form :inline="true" :model="filterForm" class="filter-form">
            <el-form-item label="费用">
              <el-select v-model="filterForm.cost" placeholder="选择费用" clearable>
                <el-option v-for="cost in costs" :key="cost" :label="`${cost}金`" :value="cost" />
              </el-select>
            </el-form-item>
            <el-form-item label="羁绊">
              <el-select v-model="filterForm.traitId" placeholder="选择羁绊" clearable>
                <el-option-group
                  v-for="group in traitGroups"
                  :key="group.type"
                  :label="group.label"
                >
                  <el-option
                    v-for="trait in group.traits"
                    :key="trait.id"
                    :label="trait.name"
                    :value="trait.id"
                  />
                </el-option-group>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleFilter">筛选</el-button>
              <el-button @click="resetFilter">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="champion-list-card">
          <template #header>
            <div class="card-header">
              <span>棋子列表</span>
              <el-select v-model="sortOption" placeholder="排序" size="small">
                <el-option label="费用升序" value="costAsc" />
                <el-option label="费用降序" value="costDesc" />
                <el-option label="名称升序" value="nameAsc" />
                <el-option label="名称降序" value="nameDesc" />
              </el-select>
            </div>
          </template>

          <el-empty v-if="champions.length === 0" description="没有找到棋子" />

          <div v-else class="champion-grid">
            <ChampionDisplayCard
              v-for="champion in sortedChampions"
              :key="champion.id"
              :champion="champion"
              :is-admin="isAdmin"
              @edit="editChampion"
              @delete="deleteChampion"
              @click="showChampionDetail(champion)"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 棋子详情对话框 -->
    <el-dialog
      v-model="championDetailVisible"
      :title="selectedChampion ? selectedChampion.name : '棋子详情'"
      width="50%"
      class="champion-detail-dialog"
    >
      <div v-if="selectedChampion">
        <div class="champion-detail-content">
          <div class="left-panel">
            <div class="champion-avatar-container">
              <img :src="getChampionAvatarUrl(selectedChampion)" :alt="selectedChampion.name" class="champion-detail-avatar"/>
              <div v-if="selectedChampion.cost" :class="['champion-cost-badge', `cost-${selectedChampion.cost}`]">{{ selectedChampion.cost }}</div>
            </div>
          </div>
          <div class="right-panel">
            <h2>{{ selectedChampion.name }}</h2>
            <div class="trait-list">
              <div v-for="trait in sortedSelectedChampionTraits" :key="trait.id" class="trait-item">
                <img :src="getTraitIcon(trait.name)" :alt="trait.name" class="trait-icon"/>
                <span class="trait-name">{{ trait.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 添加/编辑棋子对话框 -->
    <el-dialog
      v-model="championFormVisible"
      :title="isEditing ? '编辑棋子' : '添加棋子'"
      width="40%"
    >
      <el-form :model="championForm" label-width="100px">
        <el-form-item label="名称" required>
          <el-input v-model="championForm.name" placeholder="请输入棋子名称" />
        </el-form-item>
        <el-form-item label="费用" required>
          <el-select v-model="championForm.cost" placeholder="选择费用">
            <el-option v-for="cost in costs" :key="cost" :label="`${cost}金`" :value="cost" />
          </el-select>
        </el-form-item>
        <el-form-item label="羁绊" required>
          <el-select
            v-model="championForm.traits"
            multiple
            placeholder="选择羁绊"
            style="width: 100%"
          >
            <el-option-group
              v-for="group in traitGroups"
              :key="group.type"
              :label="group.label"
            >
              <el-option
                v-for="trait in group.traits"
                :key="trait.id"
                :label="trait.name"
                :value="trait.id"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <el-form-item label="图片URL">
          <el-input v-model="championForm.image_url" placeholder="请输入图片URL" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="championFormVisible = false">取消</el-button>
          <el-button type="primary" @click="saveChampion">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import ChampionDisplayCard from '@/components/common/ChampionDisplayCard.vue'
import { getTraitIcon, getChampionAvatarUrl } from '@/trait-icons.js'

export default {
  name: 'ChampionsView',
  components: {
    ChampionDisplayCard
  },
  setup () {
    const store = useStore()

    // 状态
    const champions = computed(() => store.state.champions.champions)
    const traits = computed(() => store.state.traits.traits)
    const loading = computed(() => store.state.loading)
    const isAdmin = ref(true) // 实际应用中应该根据用户权限决定

    // 筛选表单
    const filterForm = reactive({
      cost: null,
      traitId: null
    })

    // 排序选项
    const sortOption = ref('costAsc')

    // 对话框状态
    const championDetailVisible = ref(false)
    const championFormVisible = ref(false)
    const selectedChampion = ref(null)
    const isEditing = ref(false)

    // 表单数据
    const championForm = reactive({
      id: null,
      name: '',
      cost: null,
      traits: [],
      image_url: ''
    })

    // 费用选项
    const costs = [1, 2, 3, 4, 5]

    // 默认图片
    const defaultImage = 'https://via.placeholder.com/100x100?text=TFT'

    // 计算属性
    const traitGroups = computed(() => {
      const groups = {
        origin: {
          type: 'origin',
          label: '种族',
          traits: []
        },
        class: {
          type: 'class',
          label: '职业',
          traits: []
        }
      }

      traits.value.forEach(trait => {
        if (trait.type === 'origin') {
          groups.origin.traits.push(trait)
        } else if (trait.type === 'class') {
          groups.class.traits.push(trait)
        }
      })

      return Object.values(groups)
    })

    const sortedChampions = computed(() => {
      if (!champions.value) return []

      const sorted = [...champions.value]

      switch (sortOption.value) {
        case 'costAsc':
          sorted.sort((a, b) => a.cost - b.cost)
          break
        case 'costDesc':
          sorted.sort((a, b) => b.cost - a.cost)
          break
        case 'nameAsc':
          sorted.sort((a, b) => a.name.localeCompare(b.name))
          break
        case 'nameDesc':
          sorted.sort((a, b) => b.name.localeCompare(a.name))
          break
      }

      return sorted
    })

    const sortedSelectedChampionTraits = computed(() => {
      if (!selectedChampion.value || !selectedChampion.value.traits) return []
      return [...selectedChampion.value.traits].sort((a, b) => {
        if (a.type === 'origin' && b.type !== 'origin') return -1
        if (a.type !== 'origin' && b.type === 'origin') return 1
        return 0
      })
    })

    // 方法
    const handleFilter = async () => {
      try {
        if (filterForm.cost) {
          await store.dispatch('champions/fetchChampionsByCost', filterForm.cost)
        } else if (filterForm.traitId) {
          await store.dispatch('champions/fetchChampionsByTrait', filterForm.traitId)
        } else {
          await store.dispatch('champions/fetchChampions')
        }
      } catch (error) {
        ElMessage.error('加载棋子数据失败')
      }
    }

    const resetFilter = () => {
      filterForm.cost = null
      filterForm.traitId = null
      store.dispatch('champions/fetchChampions')
    }

    const showChampionDetail = (champion) => {
      selectedChampion.value = champion
      championDetailVisible.value = true
    }

    const getTraitTagType = (traitType) => {
      return traitType === 'origin' ? 'success' : 'primary'
    }

    const showAddChampionDialog = () => {
      isEditing.value = false
      championForm.id = null
      championForm.name = ''
      championForm.cost = null
      championForm.traits = []
      championForm.image_url = ''
      championFormVisible.value = true
    }

    const editChampion = (champion) => {
      isEditing.value = true
      championForm.id = champion.id
      championForm.name = champion.name
      championForm.cost = champion.cost
      championForm.traits = champion.traits.map(trait => trait.id)
      championForm.image_url = champion.image_url || ''
      championFormVisible.value = true
    }

    const saveChampion = async () => {
      try {
        if (!championForm.name || !championForm.cost || championForm.traits.length === 0) {
          ElMessage.warning('请填写必填字段')
          return
        }

        if (isEditing.value) {
          await store.dispatch('champions/updateChampion', {
            championId: championForm.id,
            championData: {
              name: championForm.name,
              cost: championForm.cost,
              traits: championForm.traits,
              image_url: championForm.image_url
            }
          })
          ElMessage.success('棋子更新成功')
        } else {
          await store.dispatch('champions/createChampion', {
            name: championForm.name,
            cost: championForm.cost,
            traits: championForm.traits,
            image_url: championForm.image_url
          })
          ElMessage.success('棋子添加成功')
        }

        championFormVisible.value = false
        await store.dispatch('champions/fetchChampions')
      } catch (error) {
        ElMessage.error('保存棋子失败')
      }
    }

    const deleteChampion = (champion) => {
      ElMessageBox.confirm(
        `确定要删除棋子 ${champion.name} 吗？`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          await store.dispatch('champions/deleteChampion', champion.id)
          ElMessage.success('棋子删除成功')
          await store.dispatch('champions/fetchChampions')
        } catch (error) {
          ElMessage.error('删除棋子失败')
        }
      }).catch(() => {
        // 取消删除
      })
    }

    // 生命周期钩子
    onMounted(async () => {
      try {
        await Promise.all([
          store.dispatch('champions/fetchChampions'),
          store.dispatch('traits/fetchTraits')
        ])
      } catch (error) {
        ElMessage.error('加载数据失败')
      }
    })

    return {
      champions,
      traits,
      loading,
      isAdmin,
      filterForm,
      sortOption,
      championDetailVisible,
      championFormVisible,
      selectedChampion,
      isEditing,
      championForm,
      costs,
      defaultImage,
      traitGroups,
      sortedChampions,
      handleFilter,
      resetFilter,
      showChampionDetail,
      getTraitTagType,
      showAddChampionDialog,
      editChampion,
      saveChampion,
      deleteChampion,
      sortedSelectedChampionTraits,
      getTraitIcon,
      getChampionAvatarUrl
    }
  }
}
</script>

<style scoped>
.champions-container {
  max-width: 1400px;
  margin: 0 auto;
}

.filter-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-form {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.champion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  grid-auto-rows: min-content;
  gap: 20px;
}

.champion-item {
  transition: transform 0.3s;
}

.champion-item:hover {
  transform: translateY(-5px);
}

.champion-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.champion-card.cost-1 {
  border: 2px solid #cccccc;
}

.champion-card.cost-2 {
  border: 2px solid #8bc34a;
}

.champion-card.cost-3 {
  border: 2px solid #2196f3;
}

.champion-card.cost-4 {
  border: 2px solid #9c27b0;
}

.champion-card.cost-5 {
  border: 2px solid #ff9800;
}

.champion-image {
  position: relative;
  width: 100%;
  aspect-ratio: 624 / 318; /* 适配图片比例 */
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.champion-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.champion-cost {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.8);
  text-shadow: 1px 1px 2px black;
}

.cost-1 { background-color: #6c757d; } /* 优化颜色 */
.cost-2 { background-color: #1e7a1e; }
.cost-3 { background-color: #007bff; }
.cost-4 { background-color: #800080; }
.cost-5 { background-color: #ffc107; }

.champion-info {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.champion-name {
  margin: 0;
  font-size: 16px;
  white-space: nowrap;
}

.champion-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.trait-tag {
  margin: 0;
}

.champion-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #ebeef5;
}

.champion-detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.champion-detail-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 20px;
  border-radius: 8px;
}

.champion-detail-info {
  flex: 1;
}

.champion-detail-info h2 {
  margin: 0 0 10px 0;
}

.champion-detail-cost {
  font-size: 14px;
  color: #606266;
}

.champion-detail-traits {
  margin-top: 20px;
}

.champion-detail-traits h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.trait-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.champion-detail-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.left-panel {
  flex-shrink: 0;
}

.champion-detail-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 5px;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trait-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.trait-icon {
  width: 24px;
  height: 24px;
}

.trait-name {
  font-size: 16px;
  font-weight: bold;
}

.champion-avatar-container {
  position: relative;
}

.champion-detail-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #444;
}

.champion-cost-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: white;
  border: 3px solid #2c3e50;
}
.champion-cost-badge.cost-1 { background-color: #808080; }
.champion-cost-badge.cost-2 { background-color: #1eaf5f; }
.champion-cost-badge.cost-3 { background-color: #0d84d6; }
.champion-cost-badge.cost-4 { background-color: #c936c9; }
.champion-cost-badge.cost-5 { background-color: #ffb900; }
</style>
