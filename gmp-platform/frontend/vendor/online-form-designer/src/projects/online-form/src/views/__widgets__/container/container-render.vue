<template>
  <container-item
    v-for="widget of widgets"
    :key="widget.id"
    :widget="widget"
    :pageNumber="pageNumber"
    :pageTotal="pageTotal"
    :pageFormState="pageFormState"
  />
</template>

<script setup lang="ts">
  import ContainerItem from './container-item.vue';
  import { PaperWidget } from '/@online-form/views/types/paper-widget';

  defineProps<{
    widgets: PaperWidget.BasicSchema[];
    pageNumber: number;
    pageTotal: number;
    pageFormState: any;
  }>();
</script>

<style scoped></style>
