<template>
  <div class="global-events-container">
    <a-form ref="formRef" :model="formState" autocomplete="off">
      <a-row :gutter="24">
        <a-col :span="16">
          <a-form-item name="keywords" :label="`${t('sys.appDesigner.events')}KEY`">
            <a-input
              v-model:value="formState.keywords"
              :placeholder="t('sys.pleaseInputSth', { sth: `${t('sys.appDesigner.events')}KEY` })"
              :style="{ width: '360px' }"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8" style="text-align: right">
          <a-button @click="() => formRef?.resetFields()">
            <template #icon>
              <undo-outlined />
            </template>
            {{ t('sys.reset') }}
          </a-button>
          <a-button style="margin: 0 8px" type="primary" @click="handleSearch">
            <template #icon>
              <search-outlined />
            </template>
            {{ t('sys.queryText') }}
          </a-button>
        </a-col>
      </a-row>
    </a-form>
    <div class="table-wrap">
      <BasicTable
        :dataSource="tableData"
        :columns="globalEventColumns"
        :showIndexColumn="false"
        :pagination="pagination"
        :striped="false"
        :bordered="true"
        @change="handleTableChange"
      >
        <template #headerTop>
          <a-button class="mr-16px" type="primary" @click="handleCreate">
            <template #icon>
              <plus-outlined />
            </template>
            {{ t('sys.new') }}
          </a-button>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            {{ Ch_Events[record.type] }}
          </template>
          <template v-if="column.key === 'jsKey'">
            {{ getCh_TriggerType(record.jsKey).ch }}
          </template>
          <template v-if="column.key === 'action'">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.design'),
                  onClick: handleDesign.bind(null, record),
                },
                {
                  label: t('sys.edit'),
                  onClick: handleRowEdit.bind(null, record),
                },
                {
                  label: t('sys.delete'),
                  color: 'error',
                  popConfirm: {
                    title: t('sys.sureToDeleteSth', { sth: t('sys.appDesigner.events') }),
                    confirm: handleRowDelete.bind(null, record),
                  },
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </BasicTable>
      <global-events-modal @register="register" @refresh="onRefresh" />
    </div>
  </div>
</template>

<script setup lang="ts" name="global-events-container">
  import { ref, reactive, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import { SearchOutlined, UndoOutlined, PlusOutlined } from '@ant-design/icons-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import { globalEventColumns } from '../constants/columns';
  import { openWindow } from '/@/utils';
  import { Ch_Events, EventsTypeEnum, getCh_TriggerType } from '../constants/index';
  import GlobalEventsModal from './global-events-modal.vue';

  import { getEventPageList, deleteEvent } from '/@/apis/gct-apaas/EventController';
  import { getScriptInfoByKey } from '/@/apis/gct-apaas/ScriptController';
  import { getServiceOrchestrationInfoByKey } from '/@/apis/gct-apaas/ServiceOrchestrationController';

  import type { FormInstance } from 'ant-design-vue';
  import type { EventResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();

  const [register, { openModal }] = useModal();

  //搜索过滤部分
  const formRef = ref<FormInstance>();

  const formState = reactive({
    keywords: '',
  });

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const tableData = ref<Array<EventResponse>>([]);

  const getTableData = async (keyword?, current?) => {
    const result = await getEventPageList({
      pageNo: current ?? pagination.current,
      pageSize: pagination.pageSize,
      searchKey: keyword,
    });
    if (result && result.data) {
      pagination.total = result.totalCount;
      tableData.value = result.data ?? [];
    }
  };

  onMounted(getTableData);

  const handleSearch = () => {
    formRef.value?.validate().then(async () => {
      // 发送网络请求获取数据
      await getTableData(formState.keywords, 1);
    });
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData();
  };

  const handleCreate = () => {
    openModal(true, {
      isEdit: false,
    });
  };

  const handleRowEdit = async (record) => {
    // 请求接口获取当前多语言的数据
    openModal(true, {
      isEdit: true,
      info: record,
    });
  };

  const handleRowDelete = async (record) => {
    await deleteEvent({ ids: record.id });
    message.success(t('sys.delSuccess'));
    getTableData();
  };

  const handleDesign = async (record) => {
    const { jsKey } = record;
    const { key } = getCh_TriggerType(jsKey);
    if (key === EventsTypeEnum.SCRIPT_SERVICE) {
      const res = await getScriptInfoByKey({ key: jsKey });
      openWindow(location.href.split('#')[0] + '#/script-editor/' + res!.id, {
        target: '_blank',
      });
    } else if (key === EventsTypeEnum.SO_SERVICE) {
      const res = await getServiceOrchestrationInfoByKey({ key: jsKey });
      openWindow(location.href.split('#')[0] + '#/service-orchestration/' + res!.id, {
        target: '_blank',
      });
    }
  };

  const onRefresh = () => {
    getTableData();
  };
</script>

<style lang="less" scoped>
  .global-events-container {
    padding: 16px;
  }
</style>
