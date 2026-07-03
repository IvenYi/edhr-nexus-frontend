<template>
  <div class="h100% ks-column">
    <search-form :formData="formState" :initData="initSearchList" @on-query="handleSearch(1)" />
    <div class="text-right mb20px" v-if="type === 1 && userGrantedUsePerms.Insert">
      <a-button type="primary" @click="onAdd">
        <template #icon>
          <PlusOutlined />
        </template>
        {{ $t('sys.add') }}
      </a-button>
    </div>
    <div class="ks-col overflow-hidden">
      <UserGrantedTable
        :data="tableData"
        :columns="columns"
        v-model:pagination="pagination"
        @load="handleSearch()"
        @do-action="doAction"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { cloneDeep } from 'lodash-es';
  import SearchForm from '../../../components/search-form/index.vue';
  import UserGrantedTable from './user-granted-table.vue';
  import { computed, onMounted, reactive, ref } from 'vue';
  import { UseUserGranted } from '../logic/use-user-granted';
  import { UserGrantedAction } from '../logic/constants';
  import { getAppGrantedUserPageList } from '/@/apis/gct-apaas/AppGrantedUserController';

  const { userGrantedUsePerms, add, handover, load, getTotal } = UseUserGranted();

  const props = defineProps<{
    total?: number;
    type: number;
    columns: any[];
  }>();

  const initData = {
    username: '',
    fullname: '',
  };
  const tableData = ref<any[]>([]);
  const formState = reactive<IData>(cloneDeep(initData));
  const initSearchList = [
    {
      type: 'input',
      label: $t('sys.fullname'),
      id: 'fullname',
      model: 'fullname',
      maxLength: 32,
    },
    {
      type: 'input',
      label: $t('sys.userName'),
      id: 'username',
      model: 'username',
      maxLength: 32,
    },
  ];

  const pagination = ref<any>({
    current: 1,
    total: 0,
    pageSize: 20,
  });

  const handleSearch = async (pageNo?) => {
    const res = await getAppGrantedUserPageList({
      ...formState,
      pageNo: pageNo || pagination.value.current,
      pageSize: pagination.value.pageSize,
      searchTag: props.type === 2 ? 2 : 1,
    });
    pagination.value.total = res?.totalCount || 0;
    tableData.value = res?.data || [];
    load();
  };

  const onAdd = async () => {
    await add();
    handleSearch();
  };

  const doAction = async (action, record) => {
    await handover(record);
    handleSearch();
    getTotal(props.type === 2 ? 'share' : 'authore');
  };

  onMounted(() => {
    handleSearch(1);
  });
</script>
<style lang="less" scoped></style>
