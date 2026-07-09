<template>
  <div
    class="h32px gct-border-dashed"
    :class="{ 'is-empty': !widget.props.model || !quickSearchFields?.length }"
    :data-placeholder="
      !widget.props.model && !quickSearchFields?.length
        ? t('sys.pageDesigner.selectAssociatedModel')
        : !quickSearchFields?.length
          ? t('sys.pageDesigner.selectQuickSearchFields')
          : ''
    "
  >
    <a-select
      v-if="widget.props.model && quickSearchFields?.length"
      v-model:value="value"
      :options="options1"
      :placeholder="placeholder"
      style="width: 100%"
      :showArrow="true"
      :style="{ 'pointer-events': 'none' }"
    >
      <template #suffixIcon>
        <!-- <search-outlined /> -->
        <i class="iconfont icon-sousuo1"></i>
      </template>
    </a-select>
  </div>
</template>
<script setup lang="ts" name="select-search-design">
  import { ref, toRefs } from 'vue';
  import { SelectSearch } from '/@page-designer/types/web';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const props = defineProps<{ widget: SelectSearch }>();
  const value = ref(undefined);
  const options1 = ref([]);
  const { placeholder, quickSearchFields } = toRefs(props.widget.props);
</script>
<style lang="less" scoped>
  .is-empty {
    &::before {
      content: attr(data-placeholder);
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      pointer-events: none;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #c3c3c3;
      font-size: 14px;
      // background-color: #fbfbfc;
    }
  }
</style>
