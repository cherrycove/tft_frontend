<template>
  <div class="composition-detail">
    <div class="composition-detail-header">
      <div class="composition-detail-info">
        <div class="detail-badges">
          <div class="population-badge">{{ composition.population }}人口</div>
          <div class="cost-badge">{{ composition.total_cost }}金币</div>
        </div>
        <div class="detail-version">版本: {{ composition.version }}</div>
      </div>
    </div>

    <el-divider />

    <div class="composition-detail-traits">
      <h3>激活羁绊:</h3>
      <div class="trait-grid">
        <div
          v-for="traitCount in activeTraits"
          :key="traitCount.trait.id"
          class="trait-detail-item"
        >
          <div class="trait-detail-header">
            <span class="trait-name">{{ traitCount.trait.name }}</span>
            <trait-tag
              :trait="traitCount.trait"
              :active-level="traitCount.active_level"
              :count="traitCount.count"
              :show-count="true"
            />
          </div>
          <div class="trait-detail-level">
            等级 {{ traitCount.active_level }}
          </div>
          <div class="trait-detail-effect">
            {{ getTraitEffect(traitCount) }}
          </div>
        </div>
      </div>

      <template v-if="inactiveTraits.length > 0">
        <h4>未激活羁绊:</h4>
        <div class="inactive-traits">
          <trait-tag
            v-for="traitCount in inactiveTraits"
            :key="traitCount.trait.id"
            :trait="traitCount.trait"
            :count="traitCount.count"
            :show-count="true"
          />
        </div>
      </template>
    </div>

    <el-divider />

    <div class="composition-detail-champions">
      <h3>棋子列表:</h3>
      <div class="champion-grid">
        <ChampionDisplayCard
            v-for="champion in composition.champions"
            :key="champion.id"
            :champion="champion"
            :is-admin="false"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import ChampionDisplayCard from './ChampionDisplayCard.vue'
import TraitTag from './TraitTag.vue'

export default {
  name: 'CompositionDetail',
  components: {
    ChampionDisplayCard,
    TraitTag
  },
  props: {
    composition: {
      type: Object,
      required: true
    }
  },
  setup (props) {
    const store = useStore()

    const traitLevels = computed(() => store.state.traits.traitLevels)

    const activeTraits = computed(() => {
      return props.composition.trait_counts.filter(tc => tc.active_level)
    })

    const inactiveTraits = computed(() => {
      return props.composition.trait_counts.filter(tc => !tc.active_level && tc.count > 0)
    })

    const getTraitEffect = (traitCount) => {
      if (!traitCount.active_level || !traitLevels.value[traitCount.trait.id]) {
        return '未知效果'
      }

      const levels = traitLevels.value[traitCount.trait.id]
      const level = levels.find(l => l.level === traitCount.active_level)

      return level ? level.effect_description : '未知效果'
    }

    return {
      activeTraits,
      inactiveTraits,
      getTraitEffect
    }
  }
}
</script>

<style scoped>
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

.composition-detail-traits h4 {
  margin-top: 15px;
  margin-bottom: 10px;
  color: #606266;
}

.trait-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
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

.inactive-traits {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.champion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
</style>
