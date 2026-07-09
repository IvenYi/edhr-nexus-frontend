<template>
  <div
    class="so-node__end"
    :class="{
      'so-node__start--empty': nodeInGraph && !nodeData.return,
    }"
  ></div>
</template>

<script lang="ts" setup>
  import { useNode } from '../../hooks/useNode';

  const { nodeInGraph, nodeData } = useNode();
</script>

<style lang="less"></style>
