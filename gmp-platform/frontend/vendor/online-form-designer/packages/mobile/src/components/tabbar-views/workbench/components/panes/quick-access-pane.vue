<template>
  <PaneContainer :title="$t('sys.portal.quickAccess')" :isLoading="isLoading" :isEmpty="!appMenuList.length">
    <template #action>
      <div class="flex items-center relative z-0 text-[#5A5F6B]" @click="handleConfigClick">
        <span class="icon gct-iconfont icon-peizhi"></span>
        <span class="ml-1 text-sm">{{ $t('sys.config') }}</span>
        <!-- 热区扩大 -->
        <mask class="absolute z-10 inset-[-0.25rem_-0.5rem] _bg-red-100" />
      </div>
    </template>

    <template #tabs>
      <Tabs isAlignLeft :options="tabOptions" :active="activeTab" @change="handleTabChange" />
    </template>

    <EntryItem v-for="menu in menuList" :key="menu.id" :entry="menu" targetType="menu" />
  </PaneContainer>
</template>

<script setup lang="ts">
  import { type IAppMenu } from '@mobile/type';
  import PaneContainer from '../pane-container.vue';
  import EntryItem from '@mobile/components/common/entry-item.vue';
  import Tabs from '@mobile/components/common/tabs.vue';
  import { getShortcutMenuList } from '@mobile/apis/gct-platform/ShortcutMenuController';
  import { getAppMenuList } from './util';

  const router = useRouter();

  const isLoading = ref(false);
  const appMenuList = ref<IAppMenu[]>([]);
  const activeTab = ref('');

  // tab 列表，即应用列表
  const tabOptions = computed(() => {
    return appMenuList.value
      .filter((o) => o.type === 'APP')
      .map(({ appId, name }) => ({ label: name, value: appId }));
  });

  // 应用菜单列表
  const menuList = computed(() => {
    return appMenuList.value.filter((o) => {
      return o.appId === activeTab.value && o.type === 'MENU';
    });
  });

  const handleQueryList = async () => {
    try {
      isLoading.value = true;
      const res = await getShortcutMenuList();
      appMenuList.value = getAppMenuList(res || []);
      isLoading.value = false;
    } catch (err) {
      isLoading.value = false;
    }
  };

  const handleConfigClick = () => {
    router.push({ name: 'quickMenu' });
  };

  const handleTabChange = (val: string) => {
    activeTab.value = val;
  };

  onMounted(handleQueryList);
</script>
