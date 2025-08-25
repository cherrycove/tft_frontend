<template>
  <el-tag
    :type="getTraitTagType(trait.type, activeLevel)"
    :effect="activeLevel ? 'dark' : 'plain'"
    size="small"
    @click="$emit('click', trait)"
  >
    <slot>
      {{ trait.name }}
      <span v-if="showCount && count !== undefined" class="trait-count">{{ count }}</span>
      <span v-if="showLevel && activeLevel !== undefined" class="trait-level">({{ activeLevel }})</span>
    </slot>
  </el-tag>
</template>

<script>
export default {
  name: 'TraitTag',
  props: {
    trait: {
      type: Object,
      required: true
    },
    activeLevel: {
      type: Number,
      default: undefined
    },
    count: {
      type: Number,
      default: undefined
    },
    showCount: {
      type: Boolean,
      default: false
    },
    showLevel: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  setup () {
    const getTraitTagType = (traitType, activeLevel) => {
      if (!activeLevel) return ''
      return traitType === 'origin' ? 'success' : 'primary'
    }

    return {
      getTraitTagType
    }
  }
}
</script>

<style scoped>
.el-tag {
  cursor: pointer;
  margin-right: 5px;
  margin-bottom: 5px;
}

.trait-count {
  margin-left: 3px;
  font-weight: bold;
}

.trait-level {
  margin-left: 3px;
  font-size: 12px;
}
</style>
