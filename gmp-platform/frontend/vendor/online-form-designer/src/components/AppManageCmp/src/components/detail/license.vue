<template>
  <div class="flex justify-between items-center">
    <div class="flex flex-none items-center pl-16px pr-16px pb-16px pt-16px">
      <div
        :class="{
          'change-env-item': true,
          'change-env-item-active': appEnv === EnvEnum.Prod,
        }"
        @click="changeAppEnv(EnvEnum.Prod)"
      >
        {{ t('sys.appDesigner.productionEnv') }}
      </div>
      <a-divider type="vertical" />
      <div
        :class="{
          'change-env-item': true,
          'change-env-item-active': appEnv === EnvEnum.Test,
        }"
        @click="changeAppEnv(EnvEnum.Test)"
      >
        {{ t('sys.appDesigner.testEnv') }}
      </div>
    </div>
    <a-button v-if="!isShared" type="primary" class="btn" @click="addLicense">
      <template #icon>
        <plus-outlined />
      </template>
      {{ t('sys.add') }}
    </a-button>
    <div v-else class="shared btn">
      <img :src="Shared" :alt="t('sys.license.sharedLisence')" class="mr4px" />
      {{ t('sys.license.sharedLisence') }}
    </div>
  </div>
  <a-alert
    v-if="expireMsg"
    :message="`${t('sys.license.currentApp')}${
      appEnv == 'test' ? t('sys.appDesigner.testEnv') : t('sys.appDesigner.productionEnv')
    }${expireMsg.category == 'system' ? t('sys.license.system') : t('sys.license.additional')}${t(
      'sys.license.kitInfoMessage',
      {
        day: expireMsg.expireDays,
        env: appEnv == 'test' ? t('sys.appDesigner.testEnv') : t('sys.appDesigner.productionEnv'),
      },
    )}`"
    banner
    type="info"
  />

  <BasicTable
    :striped="false"
    :bordered="true"
    :showIndexColumn="false"
    :ellipsis="true"
    :columns="columns"
    :dataSource="tableData"
    :pagination="pagination"
    @change="handleTableChange"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'state'">
        <a-tag color="processing" v-if="record.state === '0'">
          {{ StatusOptions[record.state] }}
        </a-tag>
        <a-tag color="success" v-else-if="record.state === '1'">
          {{ StatusOptions[record.state] }}
        </a-tag>
        <a-tag color="default" v-else-if="record.state === '2'">
          {{ StatusOptions[record.state] }}
        </a-tag>
      </template>
      <template v-else-if="column.key === 'category'">
        {{ t(`sys.license.${record.category}`) }}
      </template>
      <template v-else-if="column.key === 'expirationDate'">
        {{ record.expirationDate ?? t('sys.license.forever') }}
      </template>

      <template v-else-if="column.key === 'actions'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.detail'),
              onClick: () => handleAction(record),
            },
            {
              label: t('sys.license.licenseUnbind'),
              onClick: () => openConfirm(record),
              ifShow:
                userStore?.getUserInfo?.globalSuperAdmin &&
                record.state == 1 &&
                (tableData.filter((record) => record.state == 1).length > 1
                  ? record.category == 'additional'
                  : record.category == 'system'),
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </BasicTable>
  <add-modal @register="registerAdd" @reload="getTableData(1)" />
  <detail-modal @register="registerDetail" />
</template>
<script setup lang="ts" name="deployment-log">
  import { inject, ref, reactive, onMounted, createVNode } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useUserStore } from '/@/store/modules/user';
  import { useModal } from '/@/components/Modal';
  import { columns, StatusOptions } from '../../constant/license';
  import {
    getLicensePageList,
    getLicenseInfo,
    getLicenseGetExpireMsg,
    getLicenseUnbind,
    getLicenseShareTag,
  } from '/@/apis/gct-platform/LicenseController';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import type { AppResponse, LicenseExpireMsg } from '/@/apis/gct-platform/model';
  import AddModal from '../modal/add-license.vue';
  import DetailModal from '../modal/detail-license.vue';
  import { message, Modal } from 'ant-design-vue';
  import { EnvEnum } from '../../constant/interface';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import Shared from '/@/assets/svg/icon_shared.svg';

  const { t } = useI18n();
  const [registerAdd, { openModal: openAddModal }] = useModal();
  const [registerDetail, { openModal: openDetailModal }] = useModal();
  // const [registerConfirm, { openModal: openConfirmModal }] = useModal();
  const userStore = useUserStore();
  const tableData = ref<Array<any>>([]);
  const expireMsg = ref<LicenseExpireMsg>();

  interface Props {
    /** 应用详情信息 */
    detail?: AppResponse;
    /** 发布版本 */
    version?: string;
  }

  const props = defineProps<Props>();

  const updateAppInfo = inject('reload') as Function;

  const appEnv = ref(EnvEnum.Prod);

  const isShared = ref(false);

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  /** 判断是否是被共享应用 */
  const judgeShared = () => {
    getLicenseShareTag({ appId: props?.detail?.id }).then((res) => {
      isShared.value = res || false;
    });
  };

  const getTableData = async (current?) => {
    const res = await getLicensePageList({
      appId: props?.detail?.id,
      productType: 'app',
      pageNo: current ?? pagination.current,
      pageSize: pagination.pageSize,
      env: appEnv.value,
    });
    pagination.total = res?.totalCount || 0;
    tableData.value = res?.data || [];
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData();
  };

  const addLicense = () => {
    openAddModal(true, {
      appId: props?.detail?.id,
      suiteKey: props?.detail?.suiteKey,
      env: appEnv.value,
    });
  };

  const openConfirm = (record) => {
    Modal.confirm({
      title: t('sys.license.confirmUnbind'),
      content: t('sys.license.unbindMessage'),
      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        handleUnbind(record.id);
      },
      onCancel() {},
    });
    // openConfirmModal(true, { id: record.id });
  };

  const handleAction = async (record) => {
    const info = await getLicenseInfo({ licenseId: record.id });
    if (info) {
      const detailTableData = info.map((item) => {
        return {
          productName: record.productName,
          ...item,
        };
      });
      openDetailModal(true, detailTableData);
    }
  };
  const getExpireMsg = async () => {
    const res = await getLicenseGetExpireMsg({ appId: props?.detail?.id, env: appEnv.value });
    expireMsg.value = res?.length ? res[0] : undefined;
  };

  const handleUnbind = (id) => {
    getLicenseUnbind(
      {
        licenseId: id,
        env: appEnv.value,
        appId: props?.detail?.id,
      },
      {},
    ).then((res) => {
      if (res === false) {
        updateAppInfo();
      }

      message.success(t('sys.license.unbindSuccess'));
      getTableData();
      getExpireMsg();
    });
  };

  const changeAppEnv = (env) => {
    appEnv.value = env;
    getTableData();
    getExpireMsg();
  };

  onMounted(async () => {
    judgeShared();
    getTableData();
    getExpireMsg();
  });
</script>

<style lang="less" scoped>
  :deep(.ant-table + .ant-table-pagination.ant-pagination) {
    margin-bottom: 0;
  }

  .change-env-item {
    font-weight: 400;
    font-size: 14px;
    color: #797a7d;
    padding: 0 12px;
    cursor: pointer;

    &-active {
      color: var(--ant-primary-color);
    }
  }
  .btn {
    margin-right: 16px;
  }
  .shared {
    cursor: default;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 96px;
    height: 30px;
    color: #2c3344;
    background-image: url('/@/assets/images/bg_shared.png');
  }
</style>
