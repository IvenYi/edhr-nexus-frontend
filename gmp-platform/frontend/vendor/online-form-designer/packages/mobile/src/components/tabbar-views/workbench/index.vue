<template>
  <div class="bg-gradient relative z-0 h-full overflow-y-auto">
    <PageHeader :title="$t('sys.workbench')" />

    <div class="px-3 md:px-6 md:mt-4">
      <component v-for="type in visiblePaneTypes" :key="type" :is="paneMap[type]" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { defineAsyncComponent } from 'vue';
  import { WorkbenchType } from '@gct/runtime';
  import PageHeader from '@mobile/components/common/page-header.vue';

  const DEFAULT_CONTENT_LIST = [WorkbenchType.TEST, WorkbenchType.QUICK, WorkbenchType.MY];

  const props = defineProps<{
    model?: {
      data?: {
        displayContent?: {
          value: WorkbenchType;
          checked: boolean;
        }[];
      };
    };
  }>();

  const visiblePaneTypes = computed(() => {
    const content = props.model?.data?.displayContent;
    return content ? content.filter((e) => e.checked).map((e) => e.value) : DEFAULT_CONTENT_LIST;
  });

  const paneMap: Record<string, Component> = {
    [WorkbenchType.TEST]: defineAsyncComponent(
      () => import('./components/panes/my-test-app-pane.vue'),
    ),
    [WorkbenchType.QUICK]: defineAsyncComponent(
      () => import('./components/panes/quick-access-pane.vue'),
    ),
    [WorkbenchType.MY]: defineAsyncComponent(() => import('./components/panes/my-app-pane.vue')),
  };
</script>

<style scoped lang="less">
  .bg-gradient::before {
    content: '';
    display: block;
    position: absolute;
    z-index: -10;
    width: 100%;
    height: 16rem;
    opacity: 0.2;
    background: linear-gradient(to bottom, var(--van-primary-color), transparent);
  }
</style>
