<template>
  <basic-page-render>
    <div class="release-filling-wrapper">
      <release-filling-header v-model:value="materialNo" v-model:loading="loading" />
      <release-filling-container :materialNo="materialNo" :loading="loading" />
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import ReleaseFillingHeader from './release-filling-header.vue';
  import ReleaseFillingContainer from './release-filling-container.vue';

  const materialNo = ref();
  const loading = ref(false);
</script>

<style scoped lang="less">
  .release-filling-wrapper {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    overflow: hidden;
  }
</style>
