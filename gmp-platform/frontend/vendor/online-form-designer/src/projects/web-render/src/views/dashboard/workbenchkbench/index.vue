<template>
  <div>
    <a-input v-model:value="value" placeholder="Basic usage" />
  </div>
</template>

<script setup lang="ts" name="Workbenchkbench">
  import { ref, reactive, toRefs, onBeforeMount, onMounted, watchEffect, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  const value = ref('');
  const route = useRoute();
  const router = useRouter();
  onBeforeMount(() => {});
  onMounted(() => {});
  watchEffect(() => {});
</script>
<style scoped lang="less"></style>
