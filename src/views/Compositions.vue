<template>
  <div class="compositions-container">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="filter-card">
          <template #header>
            <div class="card-header">
              <span>组合筛选</span>
            </div>
          </template>
          <el-form :inline="true" :model="filterForm" class="filter-form">
            <el-form-item label="人口">
              <el-select v-model="filterForm.population" placeholder="选择人口" clearable>
                <el-option
                  v-for="pop in populationOptions"
                  :key="pop"
                  :label="`${pop}人口`"
                  :value="pop"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="费用范围">
              <el-input-number v-model="filterForm.minCost" :min="0" :max="100" placeholder="最小" />
              <span class="separator">-</span>
              <el-input-number v-model="filterForm.maxCost" :min="0" :max="100" placeholder="最大" />
            </el-form-item>
            <el-form-item label="羁绊">
              <el-select
                v-model="filterForm.traits"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="选择羁绊"
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
            <el-form-item label="最高羁绊等级">
              <el-select v-model="filterForm.minHighestTraitLevel" placeholder="选择最低等级" clearable>
                <el-option
                  v-for="option in highestTraitLevelOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
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
        <el-card class="composition-list-card">
          <template #header>
            <div class="card-header">
              <span>组合列表 ({{ filteredCompositions.length }})</span>
              <div class="header-actions">
                <el-select v-model="sortOption" placeholder="排序" size="small">
                  <el-option label="费用升序" value="costAsc" />
                  <el-option label="费用降序" value="costDesc" />
                  <el-option label="人口升序" value="popAsc" />
                  <el-option label="人口降序" value="popDesc" />
                  <el-option label="羁绊数升序" value="traitAsc" />
                  <el-option label="羁绊数降序" value="traitDesc" />
                </el-select>
              </div>
            </div>
          </template>

          <el-empty v-if="!loading && filteredCompositions.length === 0" description="没有找到组合" />

          <div v-if="filteredCompositions.length > 0">
            <div class="composition-list">
              <div v-for="composition in paginatedCompositions" :key="composition.id" class="composition-item">
                <el-card :body-style="{ padding: '0px' }" class="composition-card">
                  <div class="composition-header">
                    <div class="composition-info">
                      <div class="population-badge">{{ composition.population }}人口</div>
                      <div class="cost-badge">{{ composition.total_cost }}金币</div>
                    </div>
                    <el-button type="primary" size="small" @click="showCompositionDetail(composition)">
                      查看详情
                    </el-button>
                  </div>

                  <div class="composition-traits">
                    <div v-for="traitCount in filterSpecialTraits(composition.trait_counts)" :key="traitCount.trait.id" class="trait-count">
                      <el-tag
                        :class="getTagClass(traitCount.active_tag)"
                        effect="dark"
                        size="small"
                      >
                        {{ traitCount.trait.name }} {{ traitCount.count }}
                      </el-tag>
                    </div>
                  </div>

                  <div class="composition-champions">
                    <div v-for="champion in composition.champions" :key="champion.id" class="champion-item-small">
                      <div :class="['champion-cost-indicator', `cost-${champion.cost}`]">{{ champion.cost }}</div>
                      <span class="champion-name">{{ champion.name }}</span>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>

            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="filteredCompositions.length"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 组合详情对话框 -->
    <el-dialog v-model="compositionDetailVisible" title="组合详情" width="60%">
      <div v-if="selectedComposition" class="composition-detail">
        <div class="composition-detail-header">
          <div class="composition-detail-info">
            <div class="detail-badges">
              <div class="population-badge">{{ selectedComposition.population }}人口</div>
              <div class="cost-badge">{{ selectedComposition.total_cost }}金币</div>
            </div>
            <div class="detail-version">版本: {{ selectedComposition.version }}</div>
          </div>
        </div>

        <el-divider />

        <div class="composition-detail-traits">
          <h3>激活羁绊:</h3>
          <div class="trait-grid">
            <div
              v-for="traitCount in filterSpecialTraits(selectedComposition.trait_counts)"
              :key="traitCount.trait.id"
              class="trait-detail-item"
            >
              <div class="trait-detail-header">
                <span class="trait-name">{{ traitCount.trait.name }}</span>
                <el-tag
                  :class="getTagClass(traitCount.active_tag)"
                  effect="dark"
                  size="small"
                >
                  {{ traitCount.count }}/{{ getRequiredCount(traitCount) }}
                </el-tag>
              </div>
              <div class="trait-detail-level">
                等级 {{ traitCount.active_level }}
              </div>
              <div class="trait-detail-effect">
                {{ getTraitEffect(traitCount) }}
              </div>
            </div>
          </div>
        </div>

        <el-divider />

        <div class="composition-detail-champions">
          <h3>棋子列表:</h3>
          <el-table :data="selectedComposition.champions" style="width: 100%">
            <el-table-column label="费用" width="80">
              <template #default="scope">
                <div :class="['champion-cost-indicator', `cost-${scope.row.cost}`]">
                  {{ scope.row.cost }}
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="名称" width="120" />
            <el-table-column label="羁绊">
              <template #default="scope">
                <div class="champion-traits">
                  <el-tag
                    v-for="trait in scope.row.traits"
                    :key="trait.id"
                    :type="trait.type === 'origin' ? 'success' : 'primary'"
                    size="small"
                    class="trait-tag"
                  >
                    {{ trait.name }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import CompositionDetail from '@/components/common/CompositionDetail.vue'

export default {
  name: 'CompositionsView',
  setup () {
    const store = useStore()

    // 状态
    const compositions = computed(() => store.state.compositions.compositions)
    const traits = computed(() => store.state.traits.traits)
    const traitLevels = computed(() => store.state.traits.traitLevels)
    const loading = computed(() => store.state.compositions.loading)

    // 分页
    const currentPage = ref(1)
    const pageSize = ref(20)

    // 排序
    const sortOption = ref('costAsc')

    // 筛选表单
    const filterForm = reactive({
      population: null,
      minCost: null,
      maxCost: null,
      traits: [],
      minHighestTraitLevel: null
    })

    // 对话框状态
    const compositionDetailVisible = ref(false)
    const selectedComposition = ref(null)

    // 人口选项
    const populationOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

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

    const highestTraitLevelOptions = [
      { label: '黄铜级以上', value: 1 },
      { label: '白银级以上', value: 2 },
      { label: '黄金级以上', value: 3 },
      { label: '棱彩级以上', value: 4 }
    ]

    const filteredCompositions = computed(() => {
      if (!compositions.value) return []

      return compositions.value.filter(comp => {
        const { population, minCost, maxCost, traits: selectedTraits, minHighestTraitLevel } = filterForm

        if (population && comp.population !== population) {
          return false
        }
        if (minCost !== null && comp.total_cost < minCost) {
          return false
        }
        if (maxCost !== null && comp.total_cost > maxCost) {
          return false
        }
        if (selectedTraits && selectedTraits.length > 0) {
          const compTraitIds = new Set((comp.trait_counts || []).map(tc => tc.trait.id))
          if (!selectedTraits.every(traitId => compTraitIds.has(traitId))) {
            return false
          }
        }
        if (minHighestTraitLevel !== null) {
          const highestLevel = Math.max(0, ...(comp.trait_counts || []).map(tc => tc.active_level || 0))
          if (highestLevel < minHighestTraitLevel) {
            return false
          }
        }
        return true
      })
    })

    const sortedCompositions = computed(() => {
      if (!filteredCompositions.value) return []

      const sorted = [...filteredCompositions.value]

      switch (sortOption.value) {
        case 'costAsc':
          sorted.sort((a, b) => a.total_cost - b.total_cost)
          break
        case 'costDesc':
          sorted.sort((a, b) => b.total_cost - a.total_cost)
          break
        case 'popAsc':
          sorted.sort((a, b) => a.population - b.population)
          break
        case 'popDesc':
          sorted.sort((a, b) => b.population - a.population)
          break
        case 'traitAsc':
          sorted.sort((a, b) => {
            const aActiveTraits = (a.trait_counts || []).filter(tc => tc.active_level).length
            const bActiveTraits = (b.trait_counts || []).filter(tc => tc.active_level).length
            return aActiveTraits - bActiveTraits
          })
          break
        case 'traitDesc':
          sorted.sort((a, b) => {
            const aActiveTraits = (a.trait_counts || []).filter(tc => tc.active_level).length
            const bActiveTraits = (b.trait_counts || []).filter(tc => tc.active_level).length
            return bActiveTraits - aActiveTraits
          })
          break
      }

      return sorted
    })

    const paginatedCompositions = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return sortedCompositions.value.slice(start, end)
    })

    // 方法
    const handleFilter = () => {
      currentPage.value = 1
    }

    const resetFilter = () => {
      filterForm.population = null
      filterForm.minCost = null
      filterForm.maxCost = null
      filterForm.traits = []
      filterForm.minHighestTraitLevel = null
      currentPage.value = 1
    }

    const handleSizeChange = (val) => {
      pageSize.value = val
    }

    const handleCurrentChange = (val) => {
      currentPage.value = val
    }

    const showCompositionDetail = (composition) => {
      selectedComposition.value = composition
      compositionDetailVisible.value = true
    }

    const getTagClass = (tag) => {
      switch (tag) {
        case '黄铜':
          return 'tag-bronze'
        case '白银':
          return 'tag-silver'
        case '黄金':
          return 'tag-gold'
        case '棱彩':
          return 'tag-prismatic'
        default:
          return 'tag-default'
      }
    }

    const getRequiredCount = (traitCount) => {
      if (!traitCount.active_level || !traitLevels.value[traitCount.trait.id]) return '?'

      const levels = traitLevels.value[traitCount.trait.id]
      const level = levels.find(l => l.level === traitCount.active_level)

      return level ? level.required_count : '?'
    }

    const getTraitEffect = (traitCount) => {
      if (!traitCount.active_level || !traitLevels.value[traitCount.trait.id]) return '未知效果'

      const levels = traitLevels.value[traitCount.trait.id]
      const level = levels.find(l => l.level === traitCount.active_level)

      return level ? level.effect_description : '未知效果'
    }

    const filterSpecialTraits = (traitCounts) => {
      if (!traitCounts) return []
      return traitCounts.filter(tc => {
        if (tc.trait.name === '大宗师') {
          // "大宗师" only activates at 1 or 4 units, not 2 or 3.
          return tc.count === 1 || tc.count >= 4
        }
        return true
      })
    }

    // 监听排序选项变化
    watch(sortOption, () => {
      // 重置分页
      currentPage.value = 1
    })

    // 生命周期钩子
    onMounted(() => {
      store.dispatch('compositions/fetchCompositions')
      store.dispatch('traits/fetchTraits')
    })

    return {
      compositions,
      traits,
      traitLevels,
      loading,
      currentPage,
      pageSize,
      sortOption,
      filterForm,
      compositionDetailVisible,
      selectedComposition,
      populationOptions,
      traitGroups,
      filteredCompositions,
      sortedCompositions,
      paginatedCompositions,
      handleFilter,
      resetFilter,
      handleSizeChange,
      handleCurrentChange,
      showCompositionDetail,
      getTagClass,
      getRequiredCount,
      getTraitEffect,
      highestTraitLevelOptions,
      filterSpecialTraits,
      CompositionDetail
    }
  }
}
</script>

<style scoped>
.compositions-container {
  max-width: 1200px;
  margin: 0 auto;
}

.filter-card,
.composition-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
}

.separator {
  margin: 0 5px;
}

.composition-list {
  margin: 20px 0;
}

.composition-item {
  margin-bottom: 20px;
}

.composition-card {
  overflow: hidden;
}

.composition-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
}

.composition-info {
  display: flex;
  gap: 10px;
}

.population-badge,
.cost-badge {
  padding: 5px 10px;
  border-radius: 4px;
  font-weight: bold;
}

.population-badge {
  background-color: #409EFF;
  color: white;
}

.cost-badge {
  background-color: #E6A23C;
  color: white;
}

.composition-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  padding: 15px;
  background-color: #f9f9f9;
}

.trait-count {
  margin-right: 5px;
  margin-bottom: 5px;
}

.composition-champions {
  padding: 15px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

.champion-item-small {
  display: flex;
  align-items: center;
  padding: 5px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.champion-cost-indicator {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  text-align: center;
  line-height: 24px;
  margin-right: 10px;
  font-weight: bold;
  color: white;
}

.champion-cost-indicator.cost-1 {
  background-color: #cccccc;
}

.champion-cost-indicator.cost-2 {
  background-color: #8bc34a;
}

.champion-cost-indicator.cost-3 {
  background-color: #2196f3;
}

.champion-cost-indicator.cost-4 {
  background-color: #9c27b0;
}

.champion-cost-indicator.cost-5 {
  background-color: #ff9800;
}

.composition-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.composition-detail-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-badges {
  display: flex;
  gap: 10px;
}

.detail-version {
  color: #909399;
  font-size: 14px;
}

.composition-detail-traits,
.composition-detail-champions {
  margin-top: 20px;
}

.composition-detail-traits h3,
.composition-detail-champions h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.trait-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.trait-detail-item {
  padding: 15px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.trait-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.trait-name {
  font-weight: bold;
  font-size: 16px;
}

.trait-detail-level {
  margin-bottom: 5px;
  color: #606266;
}

.trait-detail-effect {
  color: #303133;
}

.champion-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.trait-tag {
  margin-right: 5px;
}

.trait-count .el-tag,
.trait-detail-header .el-tag {
  border: none;
}

.tag-default {
  background-color: #909399 !important;
  color: white !important;
}
.tag-bronze {
  background-color: #CD7F32 !important;
  color: white !important;
}
.tag-silver {
  background-color: #C0C0C0 !important;
  color: #303133 !important;
}
.tag-gold {
  background-color: #ffd700;
  color: black;
}
.tag-prismatic {
  background: linear-gradient(45deg, #ff00ff, #00ffff) !important;
  color: white !important;
  text-shadow: 1px 1px 2px black;
}
.pagination-container {
  margin-top: 20px;
}
</style>
