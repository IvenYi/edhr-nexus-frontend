<template>
  <a-tree
    class="gct-rule-ant-tree"
    :default-expand-all="defaultExpandAll"
    block-node
    :fieldNames="{ children: 'children', title: 'name', key: '_id_' }"
    :tree-data="treeData"
  >
    <template #title="{ key, data }">
      <div
        :key="key"
        class="h34px ks-row-middle text-12px"
        :title="data.name"
        @mouseenter="handleHover(data)"
        @click="handleClick(data)"
      >
        <i
          class="mr-8px primary-gct iconfont"
          :class="FieldIconMap[data.valueType ?? data.type]"
          v-if="data.valueType ?? data.type"
        ></i>
        <span class="text-[#212528] ell"> {{ data.alias || data.name }}</span>
      </div>
    </template>
  </a-tree>
</template>

<script lang="ts" setup>
  import { FieldIconMap } from '/@/enums/appEnum';

  defineProps({
    defaultExpandAll: {
      type: Boolean,
      default: true,
    },
    treeData: {
      type: Array<any>,
      default: () => [],
    },
  });

  const emit = defineEmits(['hover', 'trigger']);

  const handleHover = (data) => {
    if (!data.desc && !data?._leaf_level_) return;
    emit('hover', data);
  };

  const handleClick = (data) => {
    emit('trigger', data);
  };
</script>

<style lang="less">
  .gct-rule-ant-tree {
    padding: 0 16px;

    .ant-tree-treenode {
      width: 212px;
      margin-bottom: 4px;
      padding: 0;
      border-radius: 4px;

      &:hover {
        background: #f5f5f5;
      }

      &-selected {
        background-color: rgba(from var(--ant-primary-color) r g b / 8%) !important;
        color: var(--ant-primary-color) !important;

        .ant-tree-node-selected {
          background-color: transparent;
        }
      }

      .ant-tree-switcher {
        display: flex;
        align-items: center;
        width: 8px;

        .ant-tree-switcher-icon {
          margin-left: -4px;
        }
      }
    }

    .ant-tree-node-content-wrapper {
      width: 212px;
      padding: 0;
      overflow: hidden;

      &:hover {
        background-color: transparent;
      }
    }
  }
</style>
