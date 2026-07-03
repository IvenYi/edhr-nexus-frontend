<template>
  <basic-table
    :striped="false"
    :bordered="true"
    :showIndexColumn="false"
    :ellipsis="true"
    :pagination="false"
    :columns="triggerColumns"
    :dataSource="tableData"
  >
    <template #headerTop>
      <a-row justify="space-between" type="flex">
        <a-col style="display: flex">
          <a-input
            v-model:value="searchKey"
            :placeholder="t('sys.appDesigner.searchByTriggerKey')"
            @pressEnter="getTableData"
          >
            <template #prefix>
              <!-- <search-outlined /> -->
              <i class="iconfont icon-sousuo1"></i>
            </template>
          </a-input>
          <a-button type="primary" @click="handleAdd" style="margin-left: 20px">
            <template #icon><plus-outlined /></template>
            {{ t('sys.new') }}
          </a-button>
        </a-col>
      </a-row>
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'executeType'">
        {{ Ch_TriggerType[record.executeType] }}
      </template>
      <template v-if="column.key === 'bizServiceKeys'">
        <a-select
          class="biz-service-select"
          :value="record.bizServiceKeys.split(',')"
          mode="multiple"
          :bordered="false"
          :allowClear="false"
          :disabled="true"
          :showSearch="false"
          :maxTagCount="5"
          :maxTagTextLength="6"
          :options="bizServiceOptions"
        />
      </template>
      <template v-if="column.key === 'action'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.edit'),
              onClick: handleRowEdit.bind(null, record),
            },
            {
              label: t('sys.delete'),
              color: 'error',
              popConfirm: {
                title: t('sys.sureToDeleteSth', { sth: t('sys.appDesigner.trigger') }),
                confirm: handleRowDelete.bind(null, record.id),
              },
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </basic-table>
  <trigger-modal @register="register" :modelKey="model.key" @refresh="onRefresh" />
</template>

<script setup lang="ts" name="trigger-table">
  import { ref, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { randomUUID } from '/@/hooks/web/useUUid';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import TriggerModal from './trigger-modal.vue';
  import { triggerColumns } from '../../constant/columns';
  import { Ch_TriggerType } from './constant/index';

  import { getTriggerList, deleteTrigger } from '/@/apis/gct-apaas/TriggerController';
  import { getBizServiceCrudList } from '/@/apis/gct-apaas/BizServiceController';

  import type { SelectProps } from 'ant-design-vue';
  import type { TriggerResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();

  const props = defineProps<{
    model;
  }>();

  const [register, { openModal }] = useModal();

  const bizServiceOptions = ref<SelectProps['options']>();

  const tableData = ref<TriggerResponse[]>([]);

  const searchKey = ref<string>('');

  // 获取关联业务服务列表
  const getLinkBusinessData = async () => {
    const data =
      (await getBizServiceCrudList({ modelKey: props.model.key, type: 'SYS_BUILTIN' })) || [];
    bizServiceOptions.value = data.map((item) => {
      return {
        label: item.name,
        value: item.key,
      };
    });
  };

  const getTableData = async () => {
    tableData.value =
      (await getTriggerList({
        keyword: searchKey.value ? searchKey.value : undefined,
        modelKey: props.model.key,
      })) || [];
  };

  watch(
    () => props.model.key,
    () => {
      getTableData();
      getLinkBusinessData();
    },
    {
      immediate: true,
    },
  );

  const handleAdd = () => {
    openModal(true, {
      uuid: randomUUID([], { chars: 'capital&number' }),
    });
  };

  const handleRowEdit = (record) => {
    openModal(true, {
      isEdit: true,
      info: record,
    });
  };

  const handleRowDelete = async (id: string) => {
    await deleteTrigger({ ids: id });
    message.success(t('sys.delSuccess'));
    onRefresh();
  };

  const onRefresh = () => {
    getTableData();
  };
</script>

<style lang="less">
  .biz-service-select.ant-select.ant-select-disabled {
    .ant-select-selector {
      cursor: auto;
    }
    .ant-select-selection-item {
      background-color: #fff;
      color: #333;
      cursor: auto;
    }
    .ant-select-selection-search-input {
      cursor: auto !important;
    }
  }
</style>
