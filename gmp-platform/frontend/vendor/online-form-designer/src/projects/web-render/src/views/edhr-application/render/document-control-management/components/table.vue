<template>
  <SearchForm v-model:value="form" @on-search="() => getTableData(1)" />
  <base-vxe-table
    class="h-100%"
    :tableColumns="columns"
    :data-source="tableData"
    :loading="loading"
    showPagination
    :action="{
      width:
        type === controlMangementEnum.initiation || type === controlMangementEnum.history
          ? 100
          : 134,
    }"
    v-model:pagination="pagination"
    @request-table-data="handleTableChange"
  >
    <template #operate="{ row }">
      <table-action-auto
        :actions="[
          {
            ifShow:
              type === controlMangementEnum.initiation || type === controlMangementEnum.history,
            label: t('sys.detail'),
            onClick: () => onDetail(row, type === controlMangementEnum.history),
          },
          {
            ifShow: controlMangementEnum.controls === type,
            label: t('sys.edhr.handle'),
            onClick: () => onDetail(row),
          },
          {
            ifShow: controlMangementEnum.controls === type,
            label: t('sys.appDesigner.approval.button.Reassign'),
            onClick: () => onReassign(row),
          },
        ]"
        :stopButtonPropagation="true"
      />
    </template>
  </base-vxe-table>
</template>
<script setup lang="ts">
  import { message, TablePaginationConfig } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { onMounted, reactive, ref, unref } from 'vue';
  import { TableActionAuto } from '/@/components/Table';
  import { controlMangementEnum } from '../enums';
  import SearchForm from '../../process-intervention/control-tab/search-form.vue';
  import DetailModal from './detail-modal/index.vue';
  import ReassignModal from './reassign-modal.vue';
  import { postDocControlProcessReassign } from '/@/apis/gct-apaas/DocControlProcessController';

  import BaseVxeTable from '../../../components/base-vxe-table/index.vue';

  const { t } = useI18n();

  const props = defineProps<{
    type: controlMangementEnum;
    api: Function;
    columns: object[];
  }>();

  const emit = defineEmits(['refresh']);

  const form = ref<any>({});

  const loading = ref(false);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const tableData = ref<any[]>([]);

  onMounted(() => getTableData(1));

  const getTableData = async (initCurrent = 0) => {
    if (controlMangementEnum.controls === props.type) emit('refresh');
    if (!props.api) return;
    if (initCurrent) {
      Object.assign(pagination, { current: 1 });
    }
    loading.value = true;
    const res: any = await props
      .api({
        ...unref(form),
        pageNo: pagination.current,
        pageSize: pagination.pageSize,
      })
      .finally(() => {
        loading.value = false;
      });
    pagination.current = res?.pageNo ?? 1;
    pagination.total = res?.totalCount ?? 0;
    tableData.value = res?.data ?? [];
  };
  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const onDetail = async (data, readonly = false) => {
    const res = await gct.openUtil.drawer(
      DetailModal,
      {
        data,
        readonly: readonly,
        isInit: props.type === controlMangementEnum.initiation,
        showMockBtn: props.type === controlMangementEnum.controls,
      },
      {
        width: 1200,
        title: t('sys.detail'),
      },
    );
    if (res.ok) {
      getTableData();
    }
  };

  const onReassign = async (data) => {
    const res = await gct.openUtil.modal(
      ReassignModal,
      {
        data,
      },
      {
        width: 640,
        title: t('sys.appDesigner.approval.button.Reassign'),
        showFooter: true,
      },
    );
    if (res.ok) {
      await postDocControlProcessReassign({
        ...res.params,
        buttonConfig: JSON.stringify({ title: '转办' }),
      });
      message.success(t('sys.doSuccess'));
      getTableData(1);
    }
  };
</script>
<style lang="less" scoped></style>
