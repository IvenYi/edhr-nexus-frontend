<template>
  <div class="relative _z-0 h-full flex flex-col">
    <div class="flex-shrink-0 bg-white md:bg-transparent">
      <PageHeader title="审批" />
      <Tabs
        class="md:hidden -mt-2 pl-3"
        :options="tabOptions"
        :active="activeTab"
        @change="handleTabChange"
      />

      <Tabs
        isAlignLeft
        class="hidden md:block -mt-2 pl-3"
        :options="tabOptions"
        :active="activeTab"
        @change="handleTabChange"
      />
    </div>

    <!-- list -->
    <div class="flex-grow relative _z-0 overflow-y-auto">
      <DelegateList v-if="activeTab === TODO_TYPE.DELEGATE" />
      <ProcessList v-else :query="listQuery" :key="activeTab" :type="activeTab" />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { TODO_TYPE } from '@gct/runtime';
  import PageHeader from '@mobile/components/common/page-header.vue';
  import Tabs from '@mobile/components/common/tabs.vue';
  import ProcessList from './components/process-list/index.vue';
  import DelegateList from './components/delegate-list/index.vue';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { getPmTaskTodoPageList } from '@mobile/apis/gct-platform/PmTaskTodoController';
  import { getPmProcessInstancePageList } from '@mobile/apis/gct-platform/PmProcessInstanceController';
  import { getPmTaskDonePageList } from '@mobile/apis/gct-platform/PmTaskDoneController';
  import { useAppStore } from '@mobile/stores/useAppStore';

  const DEFAULT_CONTENT_LIST = [
    TODO_TYPE.TODO,
    TODO_TYPE.APPLICATION,
    TODO_TYPE.DONE,
    TODO_TYPE.DELEGATE,
  ];

  const REQUEST_MAP: Record<string, (p: any) => Promise<any>> = {
    [TODO_TYPE.TODO]: getPmTaskTodoPageList,
    [TODO_TYPE.APPLICATION]: getPmProcessInstancePageList,
    [TODO_TYPE.DONE]: getPmTaskDonePageList,
  };

  const props = defineProps<{
    model?: {
      data?: {
        displayContent: TODO_TYPE[];
      };
    };
  }>();

  const router = useRouter();
  const route = useRoute();
  const { mitt } = useMitt();
  const appStore = useAppStore();

  const defaultTab =
    props.model?.data?.displayContent[0] || (route.query.key as TODO_TYPE) || TODO_TYPE.TODO;

  const activeTab = ref<TODO_TYPE>(defaultTab);
  const todoCount = ref(0);

  const todoCountLabel = computed(() => (todoCount.value > 99 ? '99+' : todoCount.value));

  const tabOptions = computed(() => {
    const visibleTypes = props.model?.data?.displayContent || DEFAULT_CONTENT_LIST;
    return visibleTypes
      .map((t) => {
        const suffix = t === TODO_TYPE.TODO ? ` (${todoCountLabel.value})` : '';
        const label = `${$t(`sys.menu.todo2.${t}`)}${suffix}`;
        return { label, value: t };
      })
      .filter(({ value }) => {
        if (appStore.getInApp && value === TODO_TYPE.DELEGATE) {
          return false;
        } else {
          return true;
        }
      });
  });

  const listQuery = async (params: any) => {
    const type = activeTab.value;
    const res = await REQUEST_MAP[type](params);

    if (type === TODO_TYPE.APPLICATION) {
      res.data = res.data.map((i: any) => ({ ...i, processInstanceId: i.id }));
    }
    return res;
  };

  const handleTabChange = async (val: TODO_TYPE) => {
    await router.replace({
      name: route.name || '',
      params: route.params,
      query: { key: val },
    });
    activeTab.value = val;
  };

  onMounted(() => {
    mitt.on('process-center-todo', (count: number) => {
      todoCount.value = count;
    });
  });

  onBeforeUnmount(() => {
    mitt.off('process-center-todo');
  });
</script>
