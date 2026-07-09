<template>
  <div class="table-wrap">
    <basic-table
      :striped="false"
      :bordered="true"
      :showIndexColumn="false"
      :ellipsis="true"
      :pagination="false"
      :columns="serviceVerificationColumns"
      :dataSource="tableData"
    >
      <template #headerTop>
        <a-row justify="space-between" type="flex">
          <a-col style="display: flex">
            <a-input
              v-model:value="searchKey"
              :placeholder="t('sys.appDesigner.searchByServiceVerification')"
              @pressEnter="getTableData"
            >
              <template #prefix>
                <!-- <search-outlined /> -->
                <i class="iconfont icon-sousuo1"></i>
              </template>
            </a-input>
            <a-button @click="handleNew" class="ml-20px" type="primary">
              <plus-outlined />
              {{ t('sys.new') }}
            </a-button>
          </a-col>
        </a-row>
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'sysBuiltin'">
          <div>{{ Ch_SysBuiltinType[record.sysBuiltin] }}</div>
        </template>
        <template v-else-if="column.key === 'status'">
          <span
            :class="[
              'column-enabled',
              { 'enable-enabled': record.status === ServiceVerificationStatusEnum.ENABLE },
            ]"
          >
            <i></i>
            {{
              record.status === ServiceVerificationStatusEnum.ENABLE
                ? t('sys.component.userCmp.enable')
                : t('sys.component.userCmp.unEnable')
            }}
          </span>
        </template>
        <template v-if="column.key === 'action'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.edit'),
                onClick: handleRowEdit.bind(null, record),
              },
              {
                label: t('sys.component.userCmp.enable'),
                popConfirm: {
                  title: t('sys.sureToEnable'),
                  confirm: handleRowStatus.bind(null, record),
                },
                ifShow: record.status === ServiceVerificationStatusEnum.UN_ENABLE,
              },
              {
                label: t('sys.component.userCmp.unEnable'),
                color: 'error',
                popConfirm: {
                  title: t('sys.sureToDisable'),
                  confirm: handleRowStatus.bind(null, record),
                },
                ifShow: record.status === ServiceVerificationStatusEnum.ENABLE,
              },
              {
                label: t('sys.delete'),
                color: 'error',
                popConfirm: {
                  title: t('sys.sureToDelete'),
                  confirm: handleRowDelete.bind(null, record.id),
                },
                ifShow: record.sysBuiltin === 0,
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
    </basic-table>
    <service-verification-modal @register="register" :modelKey="model.key" @refresh="onRefresh" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { randomUUID } from '/@/hooks/web/useUUid';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import ServiceVerificationModal from './modal/service-verification-modal.vue';

  import { serviceVerificationColumns } from './constant/columns';
  import { ServiceVerificationStatusEnum, Ch_SysBuiltinType } from './constant/index';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    getServiceValidationList,
    deleteServiceValidation,
    putServiceValidationLockOrUnlockByIdByEnabled,
  } from '/@/apis/gct-apaas/ServiceValidationController';

  import type { ServiceValidationResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();

  const [register, { openModal }] = useModal();

  const props = defineProps<{
    model;
  }>();

  const tableData = ref<ServiceValidationResponse[]>([]);

  const searchKey = ref<string>('');

  const getTableData = async () => {
    tableData.value =
      (await getServiceValidationList({
        searchKey: searchKey.value ? searchKey.value : undefined,
        modelKey: props.model.key,
      })) || [];
  };

  watch(
    () => props.model.key,
    () => {
      getTableData();
    },
    {
      immediate: true,
    },
  );

  const handleNew = (e) => {
    openModal(true, {
      uuid: randomUUID([]),
    });
  };

  const onRefresh = () => {
    getTableData();
  };

  const handleRowEdit = (record) => {
    openModal(true, {
      isEdit: true,
      info: record,
    });
  };

  const handleRowDelete = async (id: string) => {
    await deleteServiceValidation({ ids: id });
    message.success(t('sys.delSuccess'));
    onRefresh();
  };

  const handleRowStatus = async (record) => {
    if (record?.id) {
      const res = await putServiceValidationLockOrUnlockByIdByEnabled({
        id: record.id,
        enabled: Number(!record.status),
      });

      message.success(!record.status ? t('sys.tipEnabledSuccess') : t('sys.tipDisabledSuccess'));
      onRefresh();
    }
  };
</script>

<style lang="less" scoped>
  .table-wrap {
    .column-enabled {
      display: flex;
      align-items: center;
      justify-content: center;
      > i {
        background-color: #00000040;
        width: 6px;
        height: 6px;
        border-radius: 3px;
        margin-right: 8px;
      }
      &.enable-enabled {
        > i {
          background-color: #00b578;
        }
      }
    }
  }
</style>
