<template>
  <div class="bg-[#FCFCFD] text-center py-10px text-[#c3c3c3] search" v-if="!model">{{
    $t('sys.pageDesigner.selectAssociatedModel')
  }}</div>
  <div
    class="bg-[#FCFCFD] text-center py-10px text-[#c3c3c3] search"
    v-else-if="model && !searchField.length"
    >{{ $t('sys.pageDesigner.selectQuickSearchFields') }}</div
  >
  <van-search
    v-else
    class="app-quick-search"
    v-model="value"
    label=""
    :placeholder="props.widget.props.placeholder"
  >
    <template #left-icon>
      <!-- <van-icon name="scan" /> -->
    </template>
    <template #right-icon>
      <div class="flex flex-items-center">
        <van-icon name="search" />
        <i v-if="props.widget.props.scan" class="px2 color-[#dddddd]" style="font-style: normal"
          >|</i
        >
        <van-icon name="scan" v-if="props.widget.props.scan" color="var(--van-primary-color)" />
      </div>
    </template>
  </van-search>
</template>

<script setup lang="ts" name="gct-quick-search">
  import { computed } from 'vue';
  import { useWidget, widgetProps } from '/@page-designer/hooks/useWidget';

  const props = defineProps(widgetProps);
  const { value } = useWidget(props);
  const model = computed(() => props.widget!.props.model);
  const searchField = computed(() => props.widget!.props.searchField);
</script>
<style scoped lang="less">
  .search {
    border: 2px dashed #dbdbdb;
  }
</style>
