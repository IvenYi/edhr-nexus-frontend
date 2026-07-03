<template>
  <div class="leading-none h100% overflow-y-auto">
    <div>
      <component
        :is="workbenchComponentMap[item]"
        v-for="(item, index) in displayComponents"
        :key="index"
        class="component-item mb10px"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { defineAsyncComponent } from 'vue';
  import { WorkbenchType } from '@gct/runtime';

  const props = defineProps<{
    model: object;
  }>();

  const defaultContent = [
    {
      value: WorkbenchType.TEST,
      checked: true,
    },
    {
      value: WorkbenchType.QUICK,
      checked: true,
    },
    {
      value: WorkbenchType.MY,
      checked: true,
    },
  ];

  const displayComponents = computed(() => {
    const displayContent = props.model?.data?.displayContent || defaultContent;
    return displayContent?.filter((e) => e.checked).map((e) => e.value) || [];
  });

  const workbenchComponentMap: Record<string, Component> = {
    [WorkbenchType.TEST]: defineAsyncComponent(() => import('./components/myTextApp.vue')),
    [WorkbenchType.MY]: defineAsyncComponent(() => import('./components/myApp.vue')),
    [WorkbenchType.QUICK]: defineAsyncComponent(() => import('./components/quickApp.vue')),
  };
</script>
<style scoped lang="less">
  :deep(.component-item) {
    padding: 14px 0;
    border-radius: 8px;
    background-color: #fff;
    // box-shadow: 0 -2px 10px 0 rgb(0 0 0 / 6%);

    .component-title {
      display: flex;
      position: relative;
      align-items: center;
      margin-bottom: 14px;
      padding-right: 14px;
      padding-left: 14px;
      line-height: 22px;

      .title {
        color: #212528;
        font-size: 16px;
        font-weight: 600;
      }

      &::before {
        content: ' ';
        display: inline-block;
        width: 3px;
        height: 14px;
        margin-right: 11px;
        background-color: var(--van-primary-color);
      }
    }
  }
</style>
