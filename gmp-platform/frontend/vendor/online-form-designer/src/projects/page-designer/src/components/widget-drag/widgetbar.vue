<template>
  <div ref="RefSus" class="w20px h20px suspensionbox"> </div>
  <suspensionCom v-if="RefSus" v-bind="$attrs" :rootRef="RefSus" />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import suspensionCom from './suspension.vue';
  const RefSus = ref(null);
</script>
<style scoped lang="less">
  .suspensionbox {
    position: absolute;
    top: 0;
    right: 0;
  }
</style>
