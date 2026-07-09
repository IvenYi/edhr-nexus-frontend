<template>
  <div class="w100% h100% design-todo text-[#666666] ks-column">
    <div class="design-todo-tabs ks-row px10px bg-[#FFFFFF]">
      <div
        v-if="displayContent.length === 1"
        class="ks-col ks-row-center-middle text-[#212528] text-16px font-500 text-center py6px ell"
      >
        <div class="ell">{{ $t(`sys.menu.todo.${displayContent[0]}`) }}</div>
        <span v-if="displayContent[0] === TODO_TYPE.TODO && todoTotal > 0">
          ({{ todoTotal > 99 ? '99+' : todoTotal }})
        </span>
      </div>
      <div
        v-else
        v-for="item in displayContent"
        :key="item"
        class="py8px nowrap px4px ks-row-center text-14px ks-col flex-shrink-0 ell"
        :class="[activeTab === item && 'active']"
        @click="goTabs(item)"
      >
        <div>{{ $t(`sys.menu.todo.${item}`) }}</div>
        <span v-if="item === TODO_TYPE.TODO && todoTotal > 0">
          ({{ todoTotal > 99 ? '99+' : todoTotal }})
        </span>
      </div>
    </div>
    <template v-if="activeTab !== TODO_TYPE.DELEGATE">
      <taskList :api="listApi" :key="activeTab" :type="activeTab || TODO_TYPE.TODO" />
    </template>
    <template v-else>
      <delegate />
    </template>
  </div>
</template>
<script setup lang="ts">
  import { TODO_TYPE } from '@gct/runtime';
  import taskList from './components/task-list.vue';
  import delegate from './components/delegate.vue';
  import { getPmTaskTodoPageList } from '@mobile/apis/gct-platform/PmTaskTodoController';
  import { getPmProcessInstancePageList } from '@mobile/apis/gct-platform/PmProcessInstanceController';
  import { getPmTaskDonePageList } from '@mobile/apis/gct-platform/PmTaskDoneController';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  const router = useRouter();
  const route = useRoute();
  const { mitt } = useMitt();
  const props = defineProps<{
    model: object;
  }>();

  const defaultContent = [
    TODO_TYPE.TODO,
    TODO_TYPE.APPLICATION,
    TODO_TYPE.DONE,
    TODO_TYPE.DELEGATE,
  ];

  const todoTotal = ref(0);
  const displayContent = computed((): string[] => {
    return props.model?.data?.displayContent || defaultContent;
  });
  const activeTab = ref(props.model?.data?.displayContent[0] || route.query.key || TODO_TYPE.TODO);

  const listApi = async (...arg) => {
    if (activeTab.value === TODO_TYPE.TODO) {
      return getPmTaskTodoPageList(...arg);
    } else if (activeTab.value === TODO_TYPE.APPLICATION) {
      const res = await getPmProcessInstancePageList(...arg);
      res.data = res.data.map((i) => ({ ...i, processInstanceId: i.id }));
      return res;
    } else return getPmTaskDonePageList(...arg);
  };

  async function goTabs(item) {
    await router.replace({
      name: route.name,
      params: route.params,
      query: { key: item },
    });
    activeTab.value = item;
  }
  onMounted(() => {
    mitt.on('process-center-todo', (changeNum) => {
      todoTotal.value = changeNum;
    });
  });
  onBeforeUnmount(() => {
    mitt.off('process-center-todo');
  });
</script>
<style lang="less" scoped>
  .active {
    position: relative;
    color: var(--van-primary-color);
    font-weight: 500;

    &::after {
      content: ' ';
      display: block;
      position: absolute;
      bottom: -1px;
      left: 50%;
      width: 16px;
      height: 2px;
      transform: translateX(-50%);
      background-color: var(--van-primary-color);
    }
  }

  .border-b {
    border-bottom: 1px dashed #f0f0f0;
  }

  .border-b-solid {
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.van-button.van-button--normal) {
    height: 36px;
    padding: 0 14px;

    & + .van-button {
      margin-left: 16px;
    }
  }

  .design-todo-tabs {
    justify-content: space-between;
  }
</style>
