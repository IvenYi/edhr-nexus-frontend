<template>
  <a-drawer
    placement="right"
    :closable="false"
    v-model:visible="open"
    :style="{ position: 'absolute' }"
    :bodyStyle="{ padding: 0 }"
    :get-container="false"
    :mask="false"
    width="100%"
  >
  <div @click="onClose">123</div>
  
  </a-drawer>
</template>
<script setup lang="ts">
  import { ref, createVNode, computed, watch } from 'vue';

  const props = defineProps<{
    id: string;
  }>();


    watch(
      () => props.id,
      () => {
      },
      {
        immediate: true,
      },
    );

  const open = ref(false);
  const onClose = () => {
    open.value = false;
  };

  defineExpose({
    open,
  });
</script>
