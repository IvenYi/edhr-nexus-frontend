<template>
  <div v-show="nodeInGraph" class="lo-node__tools">
    <i class="iconfont icon-shanchu" @click.stop="handleClickDelete"></i>
  </div>
</template>

<script setup lang="ts">
  import { useNode } from '../../../hooks/useNode';
  import { useLo } from '../../../hooks/useLo';

  const { nodeId, nodeInGraph } = useNode();
  const { removeNode } = useLo();
  const handleClickDelete = () => {
    removeNode(nodeId.value);
  };
</script>

<style lang="less" scoped>
  .lo-node__tools {
    position: absolute;
    left: 100%;
    top: 0;
    line-height: 1;
    color: #999;
    padding: 0 6px;

    .iconfont {
      cursor: pointer;
    }
  }
</style>
