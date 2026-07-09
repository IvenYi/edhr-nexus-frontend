<template>
  <basic-page-render>
    <div class="flex justify-between p16px">
      <a-input
        v-model:value="formData.name"
        style="width: 240px"
        :placeholder="t('sys.searchText') + t('sys.reportName')"
        @pressEnter="getTableData()"
      >
        <template #suffix>
          <SearchOutlined @click="getTableData()" />
        </template>
      </a-input>
      <switch-tab class="ml-8px" v-model:showType="clientType" type="view" />
    </div>

    <!-- 表格 -->
    <view-table
      v-if="clientType === 'List'"
      :tableData="tableData"
      :pagination="pagination"
      @reload="handleTableChange"
    />
    <!-- 卡片 -->
    <div v-else class="px16px" style="height:calc(100% - 50px)">
      <view-card
        :tableData="tableData"
        :pagination="pagination"
        @reload="handleTableChange"
        :isEdit="false"
      />
    </div>
  </basic-page-render>
</template>

<script setup lang="ts" name="process-instance">
  import { ref, reactive, onMounted, computed, unref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import SwitchTab from './component/switch-tab.vue';
  import ViewTable from './component/view-table.vue';
  import ViewCard from './component/view-card.vue';
  import { postReportViewPageList } from '/@/apis/gct-apaas/ReportController';
  import { useStorage } from '@vueuse/core';
  import { useUserStore } from '/@/store/modules/user';

  const { t } = useI18n();

  const userStore = useUserStore();

  const state = useStorage<{ [key: string]: any }>(
    `${userStore?.getUserInfo?.userId}_report-view_switch-tab`,
    () => {
      return {
        type: '',
      };
    },
  );
  const clientType = ref<'Card' | 'List'>(state.value.type || 'List');
  const tableData = ref([]);
  const formData = ref({
    name: '',
  });
  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    pageSizeOptions: ['10', '20', '50', '100'],
    total: 1,
  });
  const getTableData = () => {
    postReportViewPageList({
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      ...formData.value,
    }).then((res) => {
      tableData.value = res?.data || [];
      pagination.total = res?.totalCount || 0;
    });
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current || pagination.current;
    pagination.total = total || pagination.total;
    pagination.pageSize = pageSize || pagination.pageSize;
    getTableData();
  };

  onMounted(() => {
    getTableData();
  });
</script>

<style lang="scss" scoped>
  .report-view-container {
    padding: 16px;
  }
</style>
