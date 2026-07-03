<template>
  <div class="gct-mobile-search-warp">
    <van-form
      class="gct-mobile-search"
      :class="[(!widget.props.model || !widget.children?.length) && 'is-empty']"
      :data-placeholder="
        !widget.props.model && !widget.children?.length
          ? t('sys.pageDesigner.selectAssociatedModel')
          : !widget.children?.length
            ? t('sys.pageDesigner.selectFilterItem')
            : ''
      "
      :style="{
        '--van-cell-vertical-padding': '10px',
        '--van-cell-horizontal-padding': '10px',
      }"
    >
      <draggable
        v-if="!isNewDesigner"
        class="widget-drag"
        :list="fieldWidgets"
        ghost-class="widget-item--ghost"
        :animation="300"
        item-key="id"
      >
        <template #item="{ element, index }">
          <div class="widget-drag__item" :data-cmpType="element.type">
            <widget-wrapper
              :widget="element"
              :parentWidget="widget"
              :parentList="fieldWidgets"
              :index-of-parent-list="index"
            >
              <search-field-design v-model:value="formState[element.id]" :widget="element" />
            </widget-wrapper>
          </div>
        </template>
      </draggable>
      <SearchDesign2 v-if="isNewDesigner" :widget="widget">
        <template #default="args">
          <slot v-bind="args"></slot>
        </template>
        <template #content="{ element }">
          <search-field-design
            v-model:value="formState[element.id]"
            :key="element.id"
            :widget="element"
          />
        </template>
      </SearchDesign2>
    </van-form>
    <div class="filter-manage-area" v-if="customHeader">
      <i class="iconfont icon-shezhi"></i>
      {{ t('sys.pageDesigner.filterItemsManage') }}
    </div>
    <div class="ks-col box-border button-area">
      <van-button class="!mr8px" size="normal" block>{{ t('sys.reset') }}</van-button>
      <van-button type="primary" size="normal" block>{{ t('sys.okText') }}</van-button>
    </div>
  </div>
</template>
<script setup lang="ts" name="gct-search">
  import { computed, reactive, toRefs } from 'vue';
  import { Search } from '/@page-designer/types/mobile';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SearchFieldDesign from './component/design/search-field-design.vue';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  import draggable from 'vuedraggable';
  import { SearchDesign2 } from './search-design2';

  const { t } = useI18n();

  const props = defineProps<{ widget: Search; isNewDesigner: boolean }>();

  const fieldWidgets = computed({
    get() {
      return props.widget.children || [];
    },
    set(list) {
      props.widget.children = list.filter((i) => i.props);
    },
  });
  const { customHeader } = toRefs(props.widget.props);

  const formState = reactive({});
</script>
<style scoped lang="less">
  .gct-mobile-search-warp {
    border: 2px dashed #dbdbdb;
    .gct-mobile-search {
      position: relative;
      min-height: 178px;
      // background-color: #fafafa;

      &.is-empty {
        &::before {
          content: attr(data-placeholder);
          display: flex;
          position: absolute;
          top: 0;
          left: 0;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background-color: #fbfbfc;
          color: #5d6474;
          pointer-events: none;
        }
      }
    }

    .search-item {
      position: relative;
      width: 100%;
      margin: 2px 0;

      &.is-selected {
        outline: 1px solid var(--ant-primary-color);
      }
    }

    .filter-manage-area {
      position: relative;
      padding: 8px 12px 0;
      color: #333;
      line-height: 22px;

      > .iconfont {
        vertical-align: bottom;
      }
    }

    .button-area {
      display: flex;
      position: relative;
      padding: 8px 12px;
    }
  }

  :deep(.widget-drag) {
    border: 2px solid transparent;
  }
</style>
