import { ref, reactive } from 'vue';

interface IPayload {
  loader: Function;
  pageSize?: number;
}

export function useList<T>(payload: IPayload) {
  const pagination = reactive({
    pageNo: 1,
    pageSize: payload.pageSize ?? 50,
  });
  const finishedText = ref('');
  const loading = ref<boolean>(false);
  const finished = ref(false);
  const refreshing = ref<boolean>(false);
  const list = ref<T[]>([]);

  const onLoad = async () => {
    console.log('onLoad');
    console.log('onLoad', loading.value);
    pagination.pageNo++;
    await loadList();
  };
  const onRefresh = async (queryDate?: object) => {
    console.log('onRefresh');
    console.log('onRefresh', refreshing.value);
    pagination.pageNo = 1;
    list.value = [];
    await loadList(1, queryDate);
  };

  async function loadList(pageNo = pagination.pageNo, arg = {}) {
    loading.value = true;
    finished.value = false;
    const res = await payload.loader({
      pageNo,
      pageSize: pagination.pageSize,
      ...arg,
    });
    console.log('loadList', res);
    setTimeout(() => {
      loading.value = false;
      refreshing.value = false;
    }, 50);

    pagination.pageNo = res?.pageNo ?? 1;
    list.value.push(...(res?.data ?? []));
    if (list.value.length >= (res?.totalCount ?? 0)) {
      finished.value = true;
      finishedText.value = list.value.length ? '没有更多了' : '';
    }
  }

  return {
    finishedText,
    loading,
    finished,
    refreshing,
    list,
    onLoad,
    onRefresh,
    loadList,
  };
}
