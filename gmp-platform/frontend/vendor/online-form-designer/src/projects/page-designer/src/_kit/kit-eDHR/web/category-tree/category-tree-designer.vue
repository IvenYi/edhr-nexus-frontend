<template>
  <div class="h100%">
    <BizTree :tree-data="treeData">
      <template #opeBtns>
        <DesignTableColumnButtons
          :buttons="opeWidget.children || []"
          :visible-buttons="visibleNum"
          :parentWidget="widget"
        />
      </template>
    </BizTree>
  </div>
</template>

<script setup lang="ts" name="gct-category-tree">
  import { computed } from 'vue';
  import BizTree from './components/biz-tree.vue';
  import { ICategoryTree } from './schema';
  import { DesignTableColumnButtons } from './components/design-table-buttons/design-table-column-buttons';

  const props = defineProps<{
    widget: ICategoryTree;
  }>();

  const treeData = [
    {
      title: '分类1',
      key: '0-0',
      children: [
        {
          title: '分类1-1',
          key: '0-0-1',
        },
        {
          title: '分类1-2',
          key: '0-0-2',
        },
      ],
    },
    {
      title: '分类2',
      key: '2-0',
      children: [
        {
          title: '分类2-1',
          key: '2-0-1',
        },
      ],
    },
  ];

  const opeWidget = computed(() => {
    return props.widget?.children[0];
  });

  const visibleNum = computed(() => {
    const num = opeWidget.value?.props?.visibleButtons;
    const btns = opeWidget.value?.children || [];
    return btns.length > 1 ? 0 : num || 1;
  });

  // const headerWidget = computed(() => {
  //   return props.widget?.children[1];
  // });

  // const batchWidget = computed(() => {
  //   return props.widget?.children[2];
  // });
</script>

<style scoped lang="less"></style>
