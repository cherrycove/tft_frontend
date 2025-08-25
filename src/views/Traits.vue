<template>
  <div class="traits-view">
    <el-row :gutter="20">
      <!-- Trait List -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>羁绊库</span>
            </div>
          </template>
          <el-form :model="filterForm" inline>
            <el-form-item>
              <el-input v-model="filterForm.name" placeholder="搜索羁绊名称" @input="handleFilter" clearable/>
            </el-form-item>
            <el-form-item>
              <el-select v-model="filterForm.type" placeholder="筛选类型" @change="handleFilter" clearable>
                <el-option label="种族" value="origin"></el-option>
                <el-option label="职业" value="class"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button @click="resetFilter">重置</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="showAddTraitDialog">添加羁绊</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="traits" @row-click="showTraitDetail" style="width: 100%; cursor: pointer;">
            <el-table-column prop="name" label="名称">
              <template #default="scope">
                <div class="trait-name-cell">
                  <img :src="getTraitIcon(scope.row.name)" class="trait-icon"/>
                  <span>{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="类型">
              <template #default="scope">
                <el-tag :type="scope.row.type === 'origin' ? 'success' : 'primary'">
                  {{ scope.row.type === 'origin' ? '种族' : '职业' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="等级" min-width="180">
              <template #default="scope">
                <div class="level-tags">
                  <div v-for="level in scope.row.levels" :key="level.id" class="level-tag" :class="getTagClass(level.tag)">
                    {{ level.required_count }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button size="small" @click.stop="editTrait(scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click.stop="deleteTrait(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- Trait Details -->
      <el-col :span="12">
        <el-card v-if="selectedTrait">
          <template #header>
            <div class="card-header">
              <div class="trait-name-cell">
                <img :src="getTraitIcon(selectedTrait.name)" class="trait-icon"/>
                <span>{{ selectedTrait.name }}</span>
              </div>
            </div>
          </template>
          <div>
            <h3>羁绊等级</h3>
            <el-table :data="selectedTrait.levels" style="width: 100%">
              <el-table-column prop="level" label="等级" width="80"></el-table-column>
              <el-table-column prop="required_count" label="所需数量" width="100"></el-table-column>
              <el-table-column prop="effect_description" label="效果"></el-table-column>
              <el-table-column label="Tag" width="120">
                <template #default="scope">
                  <el-tag v-if="scope.row.tag" :type="getTagType(scope.row.tag)" :class="getTagClass(scope.row.tag)">{{ scope.row.tag }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div style="margin-top: 20px;">
            <h3>拥有该羁绊的棋子</h3>
            <div v-if="sortedTraitChampions.length" class="champion-grid-small">
              <div v-for="champion in sortedTraitChampions" :key="champion.id" class="champion-item-small">
                <div class="champion-avatar-container">
                  <img :src="getChampionAvatarUrl(champion)" :alt="champion.name" class="champion-avatar-small"/>
                  <div v-if="champion.cost" :class="['champion-cost-badge', `cost-${champion.cost}`]">{{ champion.cost }}</div>
                </div>
                <span>{{ champion.name }}</span>
              </div>
            </div>
            <el-empty v-else description="暂无棋子"></el-empty>
          </div>
        </el-card>
        <el-card v-else>
          <el-empty description="请从左侧选择一个羁绊查看详情"></el-empty>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加/编辑羁绊对话框 -->
    <el-dialog
      v-model="traitFormVisible"
      :title="isEditing ? '编辑羁绊' : '添加羁绊'"
      width="40%"
    >
      <el-form :model="traitForm" label-width="100px">
        <el-form-item label="名称" required>
          <el-input v-model="traitForm.name" placeholder="请输入羁绊名称" />
        </el-form-item>
        <el-form-item label="类型" required>
          <el-select v-model="traitForm.type" placeholder="选择类型">
            <el-option label="种族" value="origin" />
            <el-option label="职业" value="class" />
          </el-select>
        </el-form-item>
      </el-form>

      <div class="trait-levels-form">
        <div class="trait-levels-header">
          <h3>羁绊等级</h3>
          <el-button type="primary" size="small" @click="addTraitLevel">添加等级</el-button>
        </div>

        <el-divider />

        <div v-for="(level, index) in traitLevelsForm" :key="index" class="trait-level-form-item">
          <el-row :gutter="10">
            <el-col :span="4">
              <el-form-item label="等级">
                <el-input-number v-model="level.level" :min="1" :max="10" size="small" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="所需数量">
                <el-input-number v-model="level.required_count" :min="1" :max="20" size="small" />
              </el-form-item>
            </el-col>
            <el-col :span="5">
              <el-form-item label="标签">
                <el-select v-model="level.tag" placeholder="标签" size="small" clearable>
                  <el-option label="黄铜" value="黄铜" />
                  <el-option label="白银" value="白银" />
                  <el-option label="黄金" value="黄金" />
                  <el-option label="棱彩" value="棱彩" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="效果描述">
                <el-input v-model="level.effect_description" placeholder="请输入效果描述" />
              </el-form-item>
            </el-col>
            <el-col :span="2" class="level-actions">
              <el-button type="danger" circle size="small" @click="removeTraitLevel(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </el-col>
          </el-row>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="traitFormVisible = false">取消</el-button>
          <el-button type="primary" @click="saveTrait">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive, watch, toRaw } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete } from '@element-plus/icons-vue'
import { getTraitIcon, getChampionAvatarUrl } from '@/trait-icons.js'

export default {
  name: 'TraitsView',
  components: {
    Delete
  },
  setup () {
    const store = useStore()

    // 状态
    const loading = computed(() => store.state.loading)
    const isAdmin = ref(true) // 实际应用中应该根据用户权限决定
    const traitLevels = computed(() => store.state.traits.traitLevels)
    const activeTab = ref('origin')

    // 筛选表单
    const filterForm = reactive({
      name: '',
      type: ''
    })

    const traits = computed(() => {
      let result = store.state.traits.traits
      if (filterForm.name) {
        result = result.filter(trait => trait.name.toLowerCase().includes(filterForm.name.toLowerCase()))
      }
      if (filterForm.type) {
        result = result.filter(trait => trait.type === filterForm.type)
      }
      // 排序：种族(origin) 在前，特质(class) 在后
      return result.sort((a, b) => {
        if (a.type === 'origin' && b.type !== 'origin') return -1
        if (a.type !== 'origin' && b.type === 'origin') return 1
        return 0
      })
    })

    // 对话框状态
    const traitFormVisible = ref(false)
    const selectedTrait = ref(null)
    const isEditing = ref(false)
    const traitChampions = ref([])

    // 新增：按费用排序的计算属性
    const sortedTraitChampions = computed(() => {
      return [...traitChampions.value].sort((a, b) => a.cost - b.cost)
    })

    // 表单数据 - 重构
    const traitForm = reactive({
      id: null,
      name: '',
      type: 'origin'
    })
    const traitLevelsForm = ref([])

    // 计算属性
    const originTraits = computed(() => {
      return traits.value.filter(trait => trait.type === 'origin')
    })

    const classTraits = computed(() => {
      return traits.value.filter(trait => trait.type === 'class')
    })

    // 监听选中的羁绊变化
    watch(selectedTrait, async (newVal) => {
      if (newVal) {
        // 加载拥有该羁绊的棋子
        await loadTraitChampions(newVal.id)
      }
    })

    // 方法
    const handleFilter = async () => {
      try {
        await store.dispatch('traits/fetchTraits')
      } catch (error) {
        ElMessage.error('加载羁绊数据失败')
      }
    }

    const resetFilter = () => {
      filterForm.type = null
      store.dispatch('traits/fetchTraits')
    }

    const loadTraitChampions = async (traitId) => {
      try {
        const champions = await store.dispatch('champions/fetchChampionsByTrait', traitId)
        traitChampions.value = champions
      } catch (error) {
        ElMessage.error('加载棋子数据失败')
        traitChampions.value = []
      }
    }

    const showTraitDetail = (trait) => {
      selectedTrait.value = trait
    }

    const showAddTraitDialog = () => {
      isEditing.value = false
      traitForm.id = null
      traitForm.name = ''
      traitForm.type = 'origin'
      traitLevelsForm.value = []
      traitFormVisible.value = true
    }

    const editTrait = async (trait) => {
      isEditing.value = true
      traitForm.id = trait.id
      traitForm.name = trait.name
      traitForm.type = trait.type

      // 直接从 trait 对象获取 levels，并深拷贝到独立的 ref 中
      const sourceLevels = trait.levels || []
      traitLevelsForm.value = JSON.parse(JSON.stringify(toRaw(sourceLevels)))

      traitFormVisible.value = true
    }

    const addTraitLevel = () => {
      traitLevelsForm.value.push({
        level: traitLevelsForm.value.length + 1,
        required_count: 2,
        effect_description: '',
        tag: ''
      })
    }

    const removeTraitLevel = (index) => {
      traitLevelsForm.value.splice(index, 1)
    }

    const saveTrait = async () => {
      try {
        if (!traitForm.name || !traitForm.type) {
          ElMessage.warning('请填写必填字段')
          return
        }

        if (isEditing.value) {
          // 更新羁绊
          await store.dispatch('traits/updateTrait', {
            traitId: traitForm.id,
            name: traitForm.name,
            traitType: traitForm.type
          })

          // 更新羁绊等级
          for (const level of traitLevelsForm.value) {
            await store.dispatch('traits/updateTraitLevel', {
              traitId: traitForm.id,
              level: level.level,
              requiredCount: level.required_count,
              effectDescription: level.effect_description,
              tag: level.tag
            })
          }

          ElMessage.success('羁绊更新成功')
        } else {
          // 创建羁绊
          const newTrait = await store.dispatch('traits/createTrait', {
            name: traitForm.name,
            traitType: traitForm.type
          })

          // 创建羁绊等级
          for (const level of traitLevelsForm.value) {
            await store.dispatch('traits/createTraitLevel', {
              traitId: newTrait.id,
              level: level.level,
              requiredCount: level.required_count,
              effectDescription: level.effect_description,
              tag: level.tag
            })
          }

          ElMessage.success('羁绊添加成功')
        }

        traitFormVisible.value = false
        await store.dispatch('traits/fetchTraits')

        // 重新加载羁绊等级
        if (isEditing.value) {
          // The original code had loadTraitLevels(traitForm.id) here, but it's removed.
          // If we need to reload levels after saving, we'd need to re-fetch them or manage state differently.
          // For now, assuming levels are always available or will be fetched on demand.
        }
      } catch (error) {
        ElMessage.error('保存羁绊失败')
      }
    }

    const deleteTrait = (trait) => {
      ElMessageBox.confirm(
        `确定要删除羁绊 ${trait.name} 吗？`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(async () => {
        try {
          await store.dispatch('traits/deleteTrait', trait.id)
          ElMessage.success('羁绊删除成功')
          await store.dispatch('traits/fetchTraits')
        } catch (error) {
          ElMessage.error('删除羁绊失败')
        }
      }).catch(() => {
        // 取消删除
      })
    }

    const getTagType = (tag) => {
      switch (tag) {
        case '黄铜':
          return 'success'
        case '白银':
          return 'info'
        case '黄金':
          return 'warning'
        case '棱彩':
          return 'danger'
        default:
          return ''
      }
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

    // 生命周期钩子
    onMounted(async () => {
      try {
        await Promise.all([
          store.dispatch('traits/fetchTraits'),
          store.dispatch('champions/fetchChampions')
        ])
      } catch (error) {
        ElMessage.error('加载数据失败')
      }
    })

    return {
      traits,
      loading,
      isAdmin,
      traitLevels,
      activeTab,
      filterForm,
      traitFormVisible,
      selectedTrait,
      isEditing,
      traitChampions,
      sortedTraitChampions, // 导出新的计算属性
      traitForm,
      traitLevelsForm,
      originTraits,
      classTraits,
      handleFilter,
      resetFilter,
      showTraitDetail,
      showAddTraitDialog,
      editTrait,
      addTraitLevel,
      removeTraitLevel,
      saveTrait,
      deleteTrait,
      getTagType,
      getTagClass,
      getTraitIcon,
      getChampionAvatarUrl
    }
  }
}
</script>

<style scoped>
.traits-view {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.level-tags {
  display: flex;
  gap: 5px;
}
.level-tag {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
}
.champion-grid-small {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 15px;
}
.champion-item-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.champion-avatar-small {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 5px;
}

.champion-avatar-container {
  position: relative;
  margin-bottom: 5px;
}

.champion-cost-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
  color: white;
  border: 2px solid #2c3e50;
}
.champion-cost-badge.cost-1 { background-color: #808080; }
.champion-cost-badge.cost-2 { background-color: #1eaf5f; }
.champion-cost-badge.cost-3 { background-color: #0d84d6; }
.champion-cost-badge.cost-4 { background-color: #c936c9; }
.champion-cost-badge.cost-5 { background-color: #ffb900; }

/* Reverted to simpler style */
.trait-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.trait-icon {
  width: 24px;
  height: 24px;
}

/* ... existing styles for tags ... */
.tag-bronze {
  background-color: #cd7f32; /* 青铜 */
  color: white;
}
.tag-silver {
  background-color: #C0C0C0;
  color: #303133;
}
.tag-gold {
  background-color: #FFD700;
  color: #303133;
}
.tag-prismatic {
  background-image: linear-gradient(45deg, #ff00ff, #00ffff);
}

.level-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.level-tag {
  margin-left: 10px;
}

.level-number {
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #409EFF;
  color: white;
  text-align: center;
  line-height: 24px;
  margin-right: 10px;
  font-weight: bold;
}

.level-count {
  font-weight: bold;
  color: #606266;
}

.level-effect {
  color: #606266;
}

.trait-actions {
  display: flex;
  justify-content: space-around;
  padding: 10px;
  background-color: #f5f5f5;
}

.trait-detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.trait-detail-header h2 {
  margin: 0 10px 0 0;
}

.trait-detail-levels,
.trait-detail-champions {
  margin-top: 20px;
}

.trait-detail-levels h3,
.trait-detail-champions h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.champion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
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

.trait-levels-form {
  margin-top: 20px;
}

.trait-levels-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trait-levels-header h3 {
  margin: 0;
}

.trait-level-form-item {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.level-actions {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
