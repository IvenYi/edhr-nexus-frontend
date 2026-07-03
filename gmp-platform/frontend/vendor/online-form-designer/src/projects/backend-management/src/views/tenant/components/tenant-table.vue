<template>
  <div class="tenant-table">
    <tenant-table-header ref="queryRef" class="header" @search="handleSearch" />
    <BasicTable
      :striped="false"
      :bordered="true"
      :showIndexColumn="false"
      :ellipsis="true"
      :columns="columns"
      :dataSource="tableData"
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'enabled'">
          <span :class="['column-state', { 'enable-state': record.enabled === StatusEnum.NORMAL }]">
            <i></i>
            {{
              record.enabled === StatusEnum.NORMAL
                ? t('sys.component.userCmp.enable')
                : t('sys.component.userCmp.unEnable')
            }}
          </span>
        </template>
        <template v-else-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.detail'),
                onClick: () => handleTenantAction(record, 'detail'),
              },
              {
                label: t('sys.edit'),
                onClick: () => handleTenantAction(record, 'edit'),
                ifShow: userActions.Update,
              },
              {
                label: getEnabledInfo(record).label,
                popConfirm: {
                  title: getEnabledInfo(record).title,
                  arrowPointAtCenter: true,
                  placement: 'topRight',
                  overlayStyle: {
                    maxWidth: '240px',
                  },
                  confirm: handleTenantEnabledChange.bind(null, record),
                },
                ifShow: userActions.Update,
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
    </BasicTable>
    <tenant-modal @register="userRegister" @ok="handleModalOk" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, toRaw, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import dayjs from 'dayjs';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import TenantTableHeader from './tenant-table-header.vue';
  import TenantModal from './tenant-modal.vue';
  import { columns, StatusEnum } from '../constant/index';
  import {
    getTenantList,
    putTenantById,
    putTenantEnableById,
    putTenantDisableById,
    getTenantInfoById,
  } from '/@/apis/gct-platform/TenantController';
  import { BasicAction } from '/@/enums/authActionEnum';
  import { usePermission } from '/@/hooks/web/usePermission';

  import type { TenantResponse } from '/@/apis/gct-platform/model/index';

  const { t } = useI18n();

  const [userRegister, { openModal }] = useModal();
  const { hasPermission } = usePermission();

  const queryRef = ref();

  const tableData = ref<Array<TenantResponse>>([]);

  const userActions = computed(() => {
    return {
      Update: hasPermission(BasicAction.Update),
    };
  });

  onMounted(getTenantListData);

  const getRequestParams = () => {
    const params = toRaw(queryRef.value?.condition) || {};
    return {
      name: params.name,
      enabled: params.enabled === StatusEnum.ALL ? undefined : params.enabled,
      startTime:
        Array.isArray(params.createTime) && params.createTime.length !== 0
          ? dayjs(params.createTime[0]).format('YYYY-MM-DD HH:mm:ss')
          : '',
      endTime:
        Array.isArray(params.createTime) && params.createTime.length !== 0
          ? dayjs(params.createTime[1]).format('YYYY-MM-DD HH:mm:ss')
          : '',
    };
  };

  async function getTenantListData() {
    const list = await getTenantList({
      ...getRequestParams(),
    });
    tableData.value = list ?? [];
  }

  const handleSearch = async () => {
    await getTenantListData();
  };

  const getEnabledInfo = (record) => {
    if (record.enabled === StatusEnum.NORMAL) {
      return {
        label: t('sys.component.userCmp.unEnable'),
        title: t('sys.disabledSure'),
        msg: t('sys.tipDisabledSuccess'),
      };
    }
    return {
      label: t('sys.component.userCmp.enable'),
      title: t('sys.enabledSure'),
      msg: t('sys.tipEnabledSuccess'),
    };
  };

  /** 修改 or 详情 */
  const handleTenantAction = async (record, type) => {
    const info = await getTenantInfoById({ id: record.id });
    if (info) {
      openModal(true, {
        type: type,
        info,
      });
    }
  };

  const handleModalOk = async (res) => {
    if (res.type === 'edit') {
      await putTenantById({ id: res.info.id }, res.info);
      message.success(t('sys.modifyTenantSuccess'));
      getTenantListData();
    }
  };

  const handleTenantEnabledChange = async (record) => {
    const info = await getTenantInfoById({ id: record.id });
    if (info) {
      if (info.enabled === StatusEnum.NORMAL) {
        // 锁定租户
        await putTenantDisableById({ id: info.id ?? '' });
      } else if (info.enabled === StatusEnum.DISABLED) {
        //解锁租户
        await putTenantEnableById({ id: info.id ?? '' });
      }
      message.success(getEnabledInfo(record).msg);
      getTenantListData();
    }
  };
</script>

<style lang="less" scoped>
  @primary-theme-color1: rgba(13, 170, 156, 1);
  @primary-theme-color2: rgba(255, 77, 79, 1);

  .tenant-table {
    padding: 16px;
    .header {
      margin-bottom: 8px;
    }
    .table {
      height: 100%;
      width: 100%;
      padding: 0 16px;
      .controls {
        :not(.delete) {
          color: @primary-theme-color1;
        }
        .delete {
          color: @primary-theme-color2;
        }
      }

      .create-btn {
        background-color: @primary-theme-color1;
        color: #fff;
        border-radius: 4px;
        box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.04);
      }
      .delete-btn {
        border-color: @primary-theme-color2;
        color: @primary-theme-color2;
        border-radius: 4px;
        box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.04);
      }
    }

    .column-state {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      > i {
        background-color: #00000040;
        width: 6px;
        height: 6px;
        border-radius: 3px;
        margin-right: 8px;
      }
      &.enable-state {
        > i {
          background-color: #00b578;
        }
      }
    }
  }
</style>
