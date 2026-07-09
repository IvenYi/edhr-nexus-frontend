<template>
  <div
    :class="{
      'box-border': true,
      context: true,
      'is-empty': !model,
    }"
  >
    <div class="search-container" v-show="showSearch">
      <van-search
        class="app-quick-search"
        v-model="value"
        label=""
        :placeholder="searchPlaceholder"
      >
        <template #left-icon>
          <van-icon name="scan" v-if="props.widget.props.scan" />
        </template>
        <template #right-icon>
          <van-icon name="search" />
        </template>
      </van-search>
    </div>
    <div v-if="model" class="list ks-col">
      <div class="list-cell">
        <span> 示例文本 </span>
        <RightOutlined />
      </div>
      <div class="list-cell">
        <span> 示例文本 </span>
        <RightOutlined />
      </div>
    </div>
    <div class="list ks-col ks-row-center-middle bg-[#E6E9EF]" v-else>
      <span class="text-[#C3C3C3] text-14px">
        {{ $t('sys.pageDesigner.selectAssociatedModel') }}</span
      >
    </div>
  </div>
</template>

<script name="gct-data-list" setup lang="ts">
  import { DataList } from '/@page-designer/types/mobile';
  import { onMounted, toRefs, computed } from 'vue';
  import { useWidget } from '/@page-designer/hooks/useWidget';

  const props = defineProps<{ widget: DataList }>();
  const { value } = useWidget(props);
  const { showSearch, searchPlaceholder } = toRefs(props.widget.props);
  const model = computed(() => {
    return props?.widget?.props?.model;
  });

  onMounted(async () => {});
</script>

<style lang="less" scoped>
  .context {
    display: flex;
    flex-direction: column;
    &.is-empty {
      height: 200px;
    }
  }

  .list-cell {
    padding: 9px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  :deep(.app-quick-search.van-search) {
    background: inherit;

    .van-search__content .van-search__field {
      padding: 0 8px 0 0 !important;

      .van-field__left-icon {
        border-right: 1px solid #f0f0f0;
        color: var(--van-primary-color);

        .van-icon {
          margin-right: 4px;
        }
      }
    }
  }
</style>
