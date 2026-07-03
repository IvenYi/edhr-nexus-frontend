<template>
  <div>
    <div class="row">
      <div>{{ $t('sys.width') }}</div>
      <a-input-number
        :disabled="disabled"
        v-model:value="_width"
        addon-after="px"
        size="small"
        :min="1"
        :max="999"
        :step="1"
        :precision="0"
      />
    </div>
    <div class="row mt-6px">
      <div>{{ $t('sys.height') }}</div>
      <a-input-number
        :disabled="disabled"
        v-model:value="_height"
        addon-after="px"
        size="small"
        :min="1"
        :max="999"
        :step="1"
        :precision="0"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    width?: number;
    height?: number;
    disabled?: boolean;
  }>();

  const emit = defineEmits(['update:width', 'update:height']);

  const _width = computed({
    get() {
      return props.width;
    },
    set(v) {
      emit('update:width', v);
    },
  });

  const _height = computed({
    get() {
      return props.height;
    },
    set(v) {
      emit('update:height', v);
    },
  });
</script>

<style lang="less" scoped>
  .row {
    display: flex;
    align-items: center;
    & > div {
      width: 48px;
      font-size: 12px;
      color: #212528;
    }
  }
</style>
