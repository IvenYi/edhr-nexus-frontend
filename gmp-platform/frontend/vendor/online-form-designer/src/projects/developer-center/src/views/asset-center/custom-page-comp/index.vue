<template>
  <basic-page>
    <div class="flex h100% w100%">
      <customSlider @changeSelect="changeSelect" />
      <custom-table :catagroy="selectKeys" />
    </div>
  </basic-page>
</template>

<script setup lang="ts">
  import customSlider from './components/slider.vue';
  import CustomTable from './components/custom-table.vue';
  import { ref } from 'vue';

  const selectKeys = ref();

  const changeSelect = (id) => {
    selectKeys.value = id;
  };
</script>

<style></style>
