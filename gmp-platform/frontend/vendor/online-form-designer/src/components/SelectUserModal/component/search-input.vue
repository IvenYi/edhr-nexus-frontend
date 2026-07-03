<template>
  <div class="waiting-area-search px-16px py-12px">
    <a-input
      :placeholder="$t('sys.pageDesigner.pleaseEnterSearchContent')"
      allowClear
      v-model:value="inputValue"
    >
      <template #suffix>
        <i class="iconfont icon-sousuoMedpro leading-none"></i>
      </template>
    </a-input>
  </div>
</template>

<script setup lang="ts" name="search-input">
  import { ref, computed } from 'vue';

  const props = defineProps<{
    searchValue: any;
  }>();

  const emit = defineEmits(['update:searchValue']);

  const inputValue = computed<string>({
    get() {
      return props.searchValue;
    },
    set(value: string) {
      emit('update:searchValue', value);
    },
  });
</script>

<style scoped></style>
