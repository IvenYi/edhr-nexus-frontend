<template>
  <BasicDialog :show="show" v-bind="dialogProps" title="选择SN/批次号" class="select-lotsn-dialog">
    <template #header-bottom>
      <van-search
        class="search-bar"
        shape="round"
        v-model:modelValue="_searchVal"
        placeholder="请输入SN或批次号查询"
        @search="handleSearch"
      />
    </template>
    <div class="flex flex-col w-540px h-500px select-lotsn-modal">
      <van-list v-model:loading="loading" :finished="finished" finished-text="" @load="loadMore">
        <div></div>
      </van-list>
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-180px important-mr-16px" type="default" @click="onCancel">
          取消
        </van-button>
        <van-button class="flex-1" type="primary" @click="onOk">确认切换</van-button>
      </div>
    </template>
  </BasicDialog>
</template>

<script setup lang="ts" name="user-select-popup">
  import { ref } from 'vue';
  import BasicDialog from '@mobile/views/edhr/_comps_/basic-dialog/index.vue';

  const show = ref(true);

  const props = withDefaults(
    defineProps<{
      dialogProps?: any; // 组件属性
      beforeClose: (data?: any) => boolean | undefined;
    }>(),
    {},
  );

  /** 查询接口 */
  const searchKey = ref<string>('');
  const loading = ref(false);
  const finished = ref(true);
  const dataList = ref<any[]>([]);
  const pageNo = ref(1);

  const api = {
    searchApi: async (params: { query: string; pageNo: number; pageSize: number }) => {
      console.log('params', params);
      return {
        totalPage: 3,
        pageNo: params.pageNo,
        data: [
          {
            id: '1',
            name: 'SN1',
            type: 'SN',
          },
          {
            id: '2',
            name: 'SN2',
            type: 'SN',
          },
          {
            id: '3',
            name: 'Lot',
            type: 'LOT',
          },
          {
            id: '3',
            name: 'SN3',
            type: 'SN',
          },
          {
            id: '4',
            name: 'SN4',
            type: 'SN',
          },
        ],
      };
    },
    fetchTopList: async () => {
      return [
        {
          id: '1',
          name: 'SN1',
          type: 'SN',
        },
        {
          id: '2',
          name: 'SN2',
          type: 'SN',
        },
        {
          id: '3',
          name: 'Lot',
          type: 'LOT',
        },
        {
          id: '3',
          name: 'SN3',
          type: 'SN',
        },
        {
          id: '4',
          name: 'SN4',
          type: 'SN',
        },
      ];
    },
  };
  async function getData(append = false) {
    if (append) {
      pageNo.value++;
    } else {
      pageNo.value = 1;
      finished.value = false;
      dataList.value = [];
    }
    loading.value = true;

    if (!searchKey.value) {
      dataList.value = await api.fetchTopList();
      finished.value = true;
    } else {
      const res = await api.searchApi({
        pageNo: pageNo.value,
        pageSize: 20,
        query: searchKey.value,
      });
      finished.value = res?.pageNo >= res?.totalPage;
      loading.value = false;
      dataList.value.push(...res.data);
    }

    loading.value = false;
  }

  function loadMore() {
    pageNo.value++;
    getData();
  }

  /** 搜索相关逻辑 */
  const _searchVal = ref<string>('');

  const handleSearch = () => {
    searchKey.value = _searchVal.value?.trim();
  };

  onMounted(() => {
    getData();
  });

  /** 执行关闭操作 */
  const doClose = (data?: any) => {
    const isClosed = props.beforeClose(data);
    if (isClosed !== false) {
      show.value = false;
    }
  };

  const onCancel = () => {
    doClose();
  };

  const onOk = async () => {
    const data = {};
    doClose(data);
  };
</script>

<style lang="less" scoped>
  .select-lotsn-modal {
  }

  .select-lotsn-dialog {
    background: red;
  }

  .search-bar.van-search {
    --van-search-input-height: 36px;

    padding: 0 16px 16px;
    background: #fff;
  }
</style>
<style lang="less">
  .select-lotsn-dialog {
    .dialog__header-title {
      &::before {
        content: '';
      }
    }
  }
</style>
