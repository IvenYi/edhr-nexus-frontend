<template>
  <div class="tree-wrapper">
    <div class="p10px h100px ks-row-center-middle bg-[#fbfbfc]" v-if="!model">
      <span class="text-[#5d6474] text-14px"> {{ $t('sys.pageDesigner.selectModelFields') }}</span>
    </div>
    <div v-else>
      <a-tree
        v-model:selectedKeys="selectedKeys"
        v-model:expandedKeys="expandedKeys"
        :tree-data="treeData"
        :show-icon="showIcon"
        :show-line="showLine"
      >
        <template v-if="showIcon" #icon>
          <file-outlined />
        </template>
      </a-tree>
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-tree-designer">
  import { ref, toRefs } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import type { TreeProps } from 'ant-design-vue';

  const props = defineProps(widgetProps);
  const { model, showIcon, showLine } = toRefs(props.widget.props);

  const selectedKeys = ref<string[]>([]);
  const expandedKeys = ref<string[]>(['0-0-0-0', '0-1-0']);

  const treeData: TreeProps['treeData'] = [
    {
      title: '示例文本(1)',
      key: '0-0',
      children: [
        {
          title: '示例文本(1.1)',
          key: '0-0-0',
          children: [
            {
              title: '示例文本(1.1.1)',
              key: '0-0-0-0',
            },
          ],
        },
      ],
    },
    {
      title: '示例文本(2)',
      key: '0-1',
      children: [
        {
          title: '示例文本(2.1)',
          key: '0-1-0',
        },
      ],
    },
  ];
</script>

<style lang="less" scoped></style>
