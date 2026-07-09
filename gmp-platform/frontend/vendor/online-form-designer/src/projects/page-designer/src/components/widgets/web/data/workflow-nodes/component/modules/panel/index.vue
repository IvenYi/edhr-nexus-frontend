<template>
  <component :is="defComponent" :designMode="designMode"></component>
</template>

<script setup lang="ts">
  import { computed, defineAsyncComponent } from 'vue';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const SpecPanel = defineAsyncComponent(() => import('./spec-panel.vue'));
  const OperationPanel = defineAsyncComponent(() => import('./operation-panel.vue'));

  const componentMap = {
    SpecPanel,
    OperationPanel,
  };

  defineProps<{
    designMode?: boolean;
  }>();

  const defComponent = computed(() => {
    const { appInfo } = useAppInfoStore();
    const suiteKey = appInfo.suiteKey;
    if (suiteKey === 'eDHR') {
      return componentMap.OperationPanel;
    }

    return componentMap.SpecPanel;
  });
</script>
