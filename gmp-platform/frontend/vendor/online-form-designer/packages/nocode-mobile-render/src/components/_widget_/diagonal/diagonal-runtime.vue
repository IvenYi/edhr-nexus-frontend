<template>
  <Diagonal :size="widget.size" :direction="widget.direction" :value="names" />
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import Diagonal from './diagonal.vue';

  const props = defineProps<{
    widget: any;
    modelValueMulti: Array<any> | null;
  }>();

  const getNameByIndex = (index) => {
    const enableField = props.widget.enableFields?.[index];
    if (!enableField) {
      return props.widget.names[index];
    }
    const fieldMeta = props.widget.bindFields?.[index];
    if (fieldMeta) {
      if (props.modelValueMulti?.[index]) {
        return props.modelValueMulti![index];
      }
    }
    return '';
  };

  const names = computed(() => {
    return [0, 1, 2].map((i) => getNameByIndex(i));
  });
</script>

<style></style>
