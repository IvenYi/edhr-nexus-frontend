<template>
  <div
    class="so-node__start relative"
    :class="{
      'so-node__start--empty': nodeInGraph && !nodeData.parameter,
    }"
  >
  </div>
</template>

<script lang="ts" setup>
  import { useNode } from '../../hooks/useNode';

  const { nodeInGraph, nodeData } = useNode();
</script>

<style lang="less"></style>
