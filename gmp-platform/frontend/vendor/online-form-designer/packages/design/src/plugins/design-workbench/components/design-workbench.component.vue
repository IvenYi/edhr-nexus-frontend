<template>
  <div class="-mx-3 bg-[#f5f6f7]" :style="{ height: height || '722px' }">
    <div class="bg-gradient relative z-0 h-full overflow-y-auto">
      <PageHeader renderAsPDA :title="$t('sys.workbench')" />

      <div class="px-3">
        <PaneContainer
          v-if="visiblePaneTypes.includes(WorkbenchType.TEST)"
          renderAsPDA
          :title="$t('sys.portal.myTestApp')"
          :isEmpty="!appList.length"
        >
          <EntryItem v-for="app in appList" :key="app.id" :entry="app" targetType="app" />
        </PaneContainer>

        <PaneContainer
          v-if="visiblePaneTypes.includes(WorkbenchType.QUICK)"
          renderAsPDA
          :title="$t('sys.portal.quickAccess')"
          :isEmpty="!appMenuList.length"
        >
          <template #action>
            <div class="flex items-center relative z-0 text-[#5A5F6B]">
              <span class="icon gct-iconfont icon-peizhi"></span>
              <span class="ml-1 text-sm">{{ $t('sys.config') }}</span>
              <!-- 热区扩大 -->
              <mask class="absolute z-10 inset-[-0.25rem_-0.5rem] _bg-red-100" />
            </div>
          </template>

          <template #tabs>
            <Tabs isAlignLeft :options="tabOptions" :active="'my-app'" />
          </template>

          <EntryItem v-for="menu in appMenuList" :key="menu.id" :entry="menu" targetType="menu" />
        </PaneContainer>

        <PaneContainer
          v-if="visiblePaneTypes.includes(WorkbenchType.MY)"
          renderAsPDA
          :title="$t('sys.portal.myApp')"
          :isEmpty="!appList.length"
        >
          <EntryItem v-for="app in appList" :key="app.id" :entry="app" targetType="app" />
        </PaneContainer>
      </div>
    </div>
  </div>
</template>
<script name="DesignWorkbenchComponent" setup lang="ts">
  import { WorkbenchType } from '@gct/runtime';
  import { ref, toRefs, computed } from 'vue';
  import { nodeContainerProps } from '../../../props';
  import PageHeader from '@mobile/components/common/page-header.vue';
  import EntryItem from '@mobile/components/common/entry-item.vue';
  import Tabs from '@mobile/components/common/tabs.vue';
  import PaneContainer from '@mobile/components/tabbar-views/workbench/components/pane-container.vue';

  const DEFAULT_CONTENT_LIST = [WorkbenchType.TEST, WorkbenchType.QUICK, WorkbenchType.MY];

  const props = defineProps(nodeContainerProps);
  const { displayContent } = toRefs(props.data.data);

  const appList = ref<any[]>([]);
  const appMenuList = ref<any[]>([]);
  const tabOptions = ref([{ label: $t('sys.portal.myApp'), value: 'my-app' }]);

  for (let i = 1; i < 4; i++) {
    appList.value.push({
      id: i,
      name: `应用${i}`,
      color: 'white',
      bgColor: '#0daa9c',
    });
    appMenuList.value.push({
      id: i,
      name: `菜单名称${i}`,
      color: 'white',
      bgColor: '#0daa9c',
    });
  }

  const visiblePaneTypes = computed(() => {
    const content = displayContent.value;
    return content ? content.filter((e) => e.checked).map((e) => e.value) : DEFAULT_CONTENT_LIST;
  });
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
