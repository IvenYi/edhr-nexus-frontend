<template>
  <div v-show="nodeInGraph" class="so-node__tools">
    <i class="iconfont icon-shanchu" @click.stop="handleClickDelete"></i>
  </div>
</template>

<script setup lang="ts">
  import { useNode } from '../../hooks/useNode';
  import { useSOInstance } from '../../hooks/useSOInstance';

  const { nodeId, nodeInGraph } = useNode();
  const { removeNode } = useSOInstance();
  const handleClickDelete = () => {
    removeNode(nodeId.value);
  };
</script>

<style lang="less" scoped>
  .so-node__tools {
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
