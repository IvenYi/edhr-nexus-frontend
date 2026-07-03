import { ref, watch, computed } from 'vue';
import { getStashFindByClientKey } from '/@/apis/gct-apaas/StashController';
import {
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  getModelComprehensiveEnumInfoByModelCategory,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { cloneDeep } from 'lodash-es';
import { useRouter } from 'vue-router';
import { queryTabsParse, formatQuery, transformSourceData } from '@mobile/views/edhr/_utils_';
import type { ITab } from '@mobile/views/edhr/_utils_';
import { DefaultQueryTabs } from './query-def';
import { UserData } from '@mobile/stores/loginHooks';

const queryCards = ref<Array<ITab & { _query: any; _total?: number }>>([]);
const queryCardKey = ref<string>('');
const taskCards = ref<any[]>([]);
const taskCardIndex = ref<number>(0);
const taskCardDetail = computed(() => {
  return taskCards.value[taskCardIndex.value];
});
const taskStatusEnumMap = ref<
  Record<
    string,
    {
      value: string;
      text: string;
    }
  >
>({});

const taskCardsMeta = reactive({
  pageNo: 1,
  pageSize: 20,
  loading: false,
  finished: false,
  refreshing: false,
});

watch(queryCardKey, async () => {
  taskCardIndex.value = 0;
  taskCards.value = [];
  Object.assign(taskCardsMeta, {
    pageNo: 1,
    pageSize: 20,
    loading: false,
    finished: false,
    refreshing: false,
  });
  await loadTaskCards();
});

loadTaskStatusEnums();

async function loadQueryCards() {
  const clientKey = `${UserData.value?.userId}_searchtab_1510553344`;
  const res = await getStashFindByClientKey({
    clientKey,
  });
  queryCards.value = queryTabsParse(res?.content, cloneDeep(DefaultQueryTabs));
  queryCards.value.forEach((card) => {
    card._query = formatQuery(card);
    card._total = undefined;
    console.log('setUndefined', card.id);
  });
  // 初始化选中 tab
  if (queryCards.value.find((item) => item.id === queryCardKey.value)) {
    onRefresh();
  } else {
    toggleQueryCard(queryCards.value[0].id);
  }
  // 其他 tab 查询数量
  for (const item of queryCards.value) {
    if (queryCardKey.value !== item.id) {
      setTimeout(() => {
        loadQueryTotal(item.id);
      }, 1);
    }
  }
}

async function loadQueryTotal(queryId: string) {
  const queryTab = queryCards.value.find((item) => item.id === queryId);
  const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
    {
      bsKey: 'listByPage',
      modelKey: 'vm_container_task_jhwd',
      modelCategory: 'view',
    },
    {
      pageNo: 1,
      pageSize: taskCardsMeta.pageSize,
      query: {
        ...queryTab._query,
        'f_task_type__jhwd.eq:t_szsyoshi': 'rework',
      },
      sorts: [{ sortField: 'f_create_time__jhwd', sortType: 'desc' }],
    },
  );
  queryTab!._total = res?.totalCount ?? 0;
  console.log('loadQueryTotal', queryId);
}

async function loadTaskCards(pageNo = taskCardsMeta.pageNo) {
  const queryTab = queryCards.value.find((item) => item.id === queryCardKey.value);
  taskCardsMeta.loading = true;

  const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
    {
      bsKey: 'listByPage',
      modelKey: 'vm_container_task_jhwd',
      modelCategory: 'view',
    },
    {
      pageNo,
      pageSize: taskCardsMeta.pageSize,
      query: {
        ...queryTab._query,
        'f_task_type__jhwd.eq:t_szsyoshi': 'rework',
      },
      sorts: [{ sortField: 'f_create_time__jhwd', sortType: 'desc' }],
    },
  );

  setTimeout(() => {
    taskCardsMeta.loading = false;
    taskCardsMeta.refreshing = false;
  }, 50);

  taskCardsMeta.pageNo = res?.pageNo ?? 1;
  taskCards.value.push(...(res?.data ?? []).map((i) => transformSourceData(i, res.dict)));
  taskCardsMeta.finished = taskCards.value.length >= (res?.totalCount ?? 0);

  queryTab._total = res?.totalCount ?? 0;
  console.log('loadTaskCards');
}

const onLoad = async () => {
  console.log('onLoad');
  console.log('onLoad', taskCardsMeta.loading);
  taskCardsMeta.pageNo++;
  await loadTaskCards();
};

const onRefresh = async () => {
  console.log('onRefresh');
  console.log('onRefresh', taskCardsMeta.refreshing);
  taskCardsMeta.pageNo = 1;
  taskCards.value = [];
  await loadTaskCards();
};

async function loadTaskStatusEnums() {
  const res = await getModelComprehensiveEnumInfoByModelCategory(
    {
      modelCategory: 'view',
    },
    {
      fieldKey: 'f_status__jhwd',
      modelKey: 'vm_container_task_jhwd',
    },
  );
  taskStatusEnumMap.value = (res ?? []).reduce((total, item) => {
    total[item.value] = item;
    return total;
  }, {});
}

function toggleQueryCard(key: string) {
  queryCardKey.value = key;
}

function toggleTaskCard(index: number) {
  taskCardIndex.value = index;
}

export function useRework() {
  const router = useRouter();

  function runTask() {
    router.push({
      name: 'edhr-rework-run',
      query: {
        // id: taskCardDetail.value.f_id__jhwd,
        id: taskCardDetail.value.f_name__jhwd,
      },
    });
  }

  function runScan(id) {
    //根据结果查询任务单
    // 根据任务单 id 跳转
    router.push({
      name: 'edhr-rework-run',
      query: {
        id: id,
      },
    });
  }

  return {
    queryCards,
    queryCardKey,
    loadQueryCards,
    toggleQueryCard,
    toggleTaskCard,
    taskCards,
    taskCardIndex,
    taskCardsMeta,
    onLoad,
    onRefresh,
    taskCardDetail,
    runTask,
    runScan,
    taskStatusEnumMap,
  };
}
