<template>
  <div class="search-tab-render bg-white" :style="widgetStyle">
    <EditableTabs v-model:active-key="activeKey" :tabs="showTabs" @add="handleTabsEdit">
      <template v-if="widget.props.showButtonContainer" #rightExtra>
        <div class="tabs-right-extra">
          <WidgetComponent v-if="activeKey" :widgetlist="[widget.children[2]]" />
        </div>
      </template>
    </EditableTabs>
    <WidgetComponent v-if="activeKey" :widgetlist="[widget.children[0], widget.children[1]]" />
  </div>
</template>

<script setup lang="ts" name="gct-eDHR-search-tab-render">
  import { ref, reactive, computed, watch, onBeforeMount } from 'vue';
  import WidgetComponent from '/@web-render/render/widget/index.vue';
  import { ISearchTab } from './schema';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useSearchTab } from './logic';
  import { EditableTabs } from '/@/components/EditableTabs';

  const Event = getPageEvent();

  const props = defineProps<{
    widget: ISearchTab;
  }>();

  const {
    extraQuery,
    init,
    activeKey,
    showTabs,
    calcFinalQuery,
    handleTabsEdit,
    refreshCurrentAndCount,
  } = useSearchTab(props.widget);

  const widgetStyle = computed(() => {
    return {
      paddingTop: (props.widget.style.paddingTop || 0) + 'px',
      paddingBottom: (props.widget.style.paddingBottom || 0) + 'px',
      paddingLeft: (props.widget.style.paddingLeft || 0) + 'px',
      paddingRight: (props.widget.style.paddingRight || 0) + 'px',
    };
  });

  onBeforeMount(() => {
    init();
  });

  defineExpose({
    // 支持页面传入query
    setExtraQuery: (query) => {
      extraQuery.value = query;
    },
    handleSearchQuery: (query) => {
      calcFinalQuery(query);
    },
    refreshCurrentAndCount: refreshCurrentAndCount,
  });
</script>

<style lang="less" scoped>
  .search-tab-render {
    .tabs-right-extra {
      display: flex;
      align-items: center;

      &::before {
        content: '';
        display: inline-block;
        width: 1px;
        height: 20px;
        margin-right: 20px;
        background-color: #e8ebf0;
      }

      span {
        display: flex;
        align-items: center;
        cursor: pointer;
      }
    }

    .editable-tabs {
      --editable-tabs-tab-name-width: 130px;
    }
  }
</style>
