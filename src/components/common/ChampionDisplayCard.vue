<template>
  <div class="champion-card-reborn" @click="$emit('click', champion)">
    <div class="image-wrapper">
      <img :src="champion.image_url" class="bg-image" :alt="champion.name" />
      <div class="overlay">
        <ul class="trait-list">
          <li v-for="trait in sortedTraits" :key="trait.id" class="trait-item">
            <img :src="getTraitIcon(trait.name)" :alt="trait.name" class="trait-icon"/>
            <span class="trait-name">{{ trait.name }}</span>
          </li>
        </ul>
      </div>
      <div v-if="isAdmin" class="admin-actions">
        <el-button circle type="primary" size="small" @click.stop="$emit('edit', champion)"><el-icon><Edit /></el-icon></el-button>
        <el-button circle type="danger" size="small" @click.stop="$emit('delete', champion)"><el-icon><Delete /></el-icon></el-button>
      </div>
    </div>
    <div class="bottom-bar">
      <h3 class="champion-name">{{ champion.name }}</h3>
      <div class="champion-cost">
        <el-icon><Coin /></el-icon>
        <span>{{ champion.cost }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { Coin, Edit, Delete } from '@element-plus/icons-vue'
import { getTraitIcon } from '@/trait-icons.js'
import { computed } from 'vue'

export default {
  name: 'ChampionDisplayCard',
  components: { Coin, Edit, Delete },
  props: {
    champion: { type: Object, required: true },
    isAdmin: { type: Boolean, default: false }
  },
  emits: ['edit', 'delete', 'click'],
  setup (props) {
    const sortedTraits = computed(() => {
      if (!props.champion || !props.champion.traits) return []
      return [...props.champion.traits].sort((a, b) => {
        if (a.type === 'origin' && b.type !== 'origin') return -1
        if (a.type !== 'origin' && b.type === 'origin') return 1
        return 0
      })
    })

    return {
      getTraitIcon,
      sortedTraits
    }
  }
}
</script>

<style scoped>
.champion-card-reborn {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: #2c2c2c;
}
.champion-card-reborn:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.6);
}
.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 624 / 318;
}
.bg-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 10% 50%, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 40%, rgba(0, 0, 0, 0) 70%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.trait-list { list-style: none; padding: 0; margin: 0; width: 60%; }
.trait-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #fff;
  /* 调整文字阴影，使其轮廓更清晰 */
  text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.9);
}
.trait-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  /* 将黑色阴影改为白色辉光 */
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.7));
}
.admin-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 4;
  display: flex;
  gap: 8px;
}
.bottom-bar {
  padding: 12px 15px;
  background: #1a1a1a;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.champion-name { margin: 0; font-size: 16px; font-weight: bold; color: #fff; }
.champion-cost {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: rgba(0,0,0,0.3);
  color: #ffc107;
}
</style>
