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
        <span v-if="model && showPagination && !isTree" class="page-total">2/20</span>
        <span v-else-if="model && !isTree" class="page-total">2</span>
        <sort class="sort-span" />
      </div>
    </div>
    <div v-if="model" class="list ks-col">
      <a-tree v-if="isTree" block-node :tree-data="datasource" :virtual="false" defaultExpandAll>
        <template #title="{ name }">
          <div class="mr10px inline-block"> {{ name }}</div>
        </template>
      </a-tree>
      <template v-else>
        <div class="list-cell">示例文本</div>
        <div class="list-cell">示例文本</div>
      </template>
    </div>
    <div class="list ks-col ks-row-center-middle bg-[#fbfbfc]" v-else>
      <span class="text-[#c3c3c3] text-14px">
        {{ $t('sys.pageDesigner.selectAssociatedModel') }}</span
      >
    </div>

    <div class="text-center" v-show="model && showPagination && !isTree">
      <pagerSelect :total="100" :page-size="10" />
    </div>
  </div>
</template>

<script name="gct-data-list" setup lang="ts">
  import sort from '../../__components__/sort.vue';
  import { DataList } from '/@page-designer/types/web';
  import { nextTick, onMounted, toRefs, ref, computed } from 'vue';
  import pagerSelect from '../../__components__/pager-select.vue';
  import type { TreeProps } from 'ant-design-vue';
  import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';

  const props = defineProps<{ widget: DataList }>();
  const { showSearch, searchPlaceholder, title, showPagination, modelType, modeldata } = toRefs(
    props.widget.props,
  );

  //兼容老数据
  const isTree = computed(() => {
    return (
      modelType?.value === EntityModelTypeEnum.TREE ||
      modeldata?.value?.modelType === EntityModelTypeEnum.TREE
    );
  });

  const height = ref(0);
  const layout = ref();
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
      name: '示例文本 (1)',
      key: '0-0',
      children: [
        {
          name: '示例文本 (1.1)',
          key: '0-0-0',
        },
      ],
    },
    {
      name: '示例文本(2)',
      key: '1-0',
      children: [
        {
          name: '示例文本(2.1)',
          key: '1-0-0',
        },
      ],
    },
  ];
  const model = computed(() => {
    return props?.widget?.props?.model;
  });
</script>

<style lang="less" scoped>
  .list {
    border-top: 1px solid #dedede;
    border-bottom: 1px solid #dedede;
  }

  .context {
    display: flex;
    flex-direction: column;
    height: 300px;
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

  .list-cell {
    padding: 9px 15px;
  }
</style>
