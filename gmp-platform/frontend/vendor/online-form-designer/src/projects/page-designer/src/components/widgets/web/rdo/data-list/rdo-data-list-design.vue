<template>
  <div class="box-border context" ref="layout">
    <div class="title-wrap">
      <a-input-search
        :placeholder="searchPlaceholder"
        enter-button
        v-show="showSearch"
        style="margin-bottom: 10px"
      />
      <div class="ks-row-middle">
        <span class="mrauto">{{ title }}</span>
        <span v-if="model && showPagination" class="page-total">2/20</span>
        <span v-else-if="model" class="page-total">2</span>
        <sort class="sort-span" />
      </div>
    </div>
    <div v-if="model" class="list ks-col">
      <a-tree block-node :tree-data="datasource" :virtual="false" defaultExpandAll>
        <template #title="{ name, default_ }">
          <div class="mr10px inline-block"> {{ name }}</div>
          <a-tag :color="getThemeColor" v-if="!!default_">{{
            $t('sys.pageDesigner.default')
          }}</a-tag>
        </template>
      </a-tree>
    </div>
    <div class="list ks-col ks-row-center-middle bg-[#fbfbfc]" v-else>
      <span class="text-[#c3c3c3] text-14px">
        {{ $t('sys.pageDesigner.selectAssociatedModel') }}</span
      >
    </div>
    <div class="text-center" v-show="model && showPagination">
      <!-- <a-pagination simple :total="100" :defaultPageSize="10" /> -->
      <pagerSelect :total="100" :page-size="10" />
    </div>
  </div>
</template>

<script name="gct-rdo-data-list" setup lang="ts">
  import sort from '../../__components__/sort.vue';
  import { DataList } from '/@page-designer/types/web';
  import { nextTick, onMounted, toRefs, ref } from 'vue';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import type { TreeProps } from 'ant-design-vue';
  import pagerSelect from '../../__components__/pager-select.vue';

  const props = defineProps<{ widget: DataList }>();
  const { showSearch, searchPlaceholder, showPagination, title, model } = toRefs(
    props.widget.props,
  );
  const height = ref(0);
  const layout = ref();
  const { getThemeColor } = useRootSetting();
  onMounted(async () => {
    await nextTick();
    let el = layout.value.parentNode;
    while (!el.classList.contains('widget-drag')) {
      el = el.parentNode;
    }
    height.value = document.body.clientHeight - el.getBoundingClientRect().top - 30;
  });
  const datasource: TreeProps['treeData'] = [
    {
      name: '版本1',
      key: '0-0',
      children: [
        {
          name: '版本1.1',
          key: '0-0-0',
          default_: true,
        },
      ],
    },
    {
      name: '版本2',
      key: '1-0',
      children: [
        {
          name: '版本2.1',
          key: '1-0-0',
          default_: true,
        },
      ],
    },
  ];
</script>

<style lang="less" scoped>
  .list {
    border-top: 1px solid #e8e8e8;
    border-bottom: 1px solid #e8e8e8;
  }

  .context {
    display: flex;
    flex-direction: column;
    min-height: 164px;
    // border: 1px solid #dedede;
  }

  .mrauto {
    font-weight: 600;
  }

  .page-total {
    padding: 2px 4px;
    border-radius: 2px;
    background: #f5f5f5;
    font-size: 12px;
  }

  .sort-span {
    margin-left: 7px;
  }

  .title-wrap {
    padding: 10px 15px;
  }

  :deep(.ant-tree-treenode) {
    padding: 9px 15px;
  }

  :deep(.ant-tree-switcher) {
    width: auto;
  }

  :deep(.ant-tree-switcher .ant-tree-switcher-icon) {
    color: #888c9f;
  }
</style>
