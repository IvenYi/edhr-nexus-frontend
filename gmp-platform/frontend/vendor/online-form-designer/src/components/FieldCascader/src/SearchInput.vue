<template>
  <div @mousedown.stop class="gct-field-cascader-search">
    <a-input v-model:value="value" :placeholder="$t('sys.pageDesigner.searchField')" @change="changeValue">
      <template #prefix>
        <span class="iconfont icon-pad_search text-[#8B8B8B]"></span>
      </template>
    </a-input>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed, watch } from 'vue';

  const emit = defineEmits(['change']);
  const props = defineProps<{
    visibleValue: {
      value: boolean;
      [key: string]: any;
    };
  }>();

  const value = ref();

  function changeValue() {
    emit('change', value.value);
  }

  watch(
    () => props.visibleValue.value,
    (val) => {
      if (!val) {
        value.value = undefined;
        emit('change', value.value);
      }
    },
  );
</script>
<style scoped lang="less">
  :deep(.ant-input-affix-wrapper) {
    padding: 0 11px;
    border: none;
  }

  .gct-field-cascader-search {
    box-sizing: border-box;
    padding: 8px 0;
    border-bottom: 1px solid #f2f5f8;
  }
</style>
