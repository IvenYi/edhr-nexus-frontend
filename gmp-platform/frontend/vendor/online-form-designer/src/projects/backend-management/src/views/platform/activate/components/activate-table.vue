<template>
  <div>
    <div class="platform-activate-main pt-20px">
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
        <template #headerTop>
          <a-button
            v-if="userActions.Add"
            type="primary"
            class="btn mb-16px"
            @click="addLicense"
            style="float: right"
          >
            <template #icon>
              <plus-outlined />
            </template>
            {{ t('sys.add') }}
          </a-button>
        </template>
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'state'">
            <a-tag color="processing" v-if="record.state === '0'">{{
              StatusOptions[record.state]
            }}</a-tag>
            <a-tag color="success" v-else-if="record.state === '1'">{{
              StatusOptions[record.state]
            }}</a-tag>
            <a-tag color="default" v-else-if="record.state === '2'">{{
              StatusOptions[record.state]
            }}</a-tag>
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
                  label: t('sys.license.detail'),
                  onClick: () => handleAction(record),
                  ifShow: props.type === 'platform',
                },
                {
                  label: t('sys.license.licenseUnbind'),
                  onClick: () => openConfirm(record),
                  ifShow:
                    userStore?.getUserInfo?.globalSuperAdmin &&
                    record.state == 1 &&
                    (((tableData.filter((record) => record.state == 1).length > 1
                      ? record.category == 'additional'
                      : record.category == 'system') &&
                      props.type === 'platform') ||
                      props.type !== 'platform'),
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </BasicTable>
    </div>

    <add-modal @register="registerAdd" @reload="getTableData(1)" />
    <detail-modal @register="registerDetail" />
  </div>
</template>
<script setup lang="ts">
  import { ref, reactive, onMounted, computed, createVNode, watch } from 'vue';
  import { StatusOptions } from '../constant/index';
  import {
    getLicensePageList,
    getLicenseInfo,
    getLicenseGetExpireMsg,
    getLicenseUnbind,
  } from '/@/apis/gct-platform/LicenseController';
  import { useUserStore } from '/@/store/modules/user';
  import { useI18n } from '/@/hooks/web/useI18n';
  import AddModal from '../modal/add.vue';
  import DetailModal from '../modal/detail.vue';
  import { message, Modal } from 'ant-design-vue';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { LicenseExpireMsg, ResponseEntitystring } from '/@/apis/gct-platform/model';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useModal } from '/@/components/Modal';
  import { BasicAction } from '/@/enums/authActionEnum';
  import { usePermission } from '/@/hooks/web/usePermission';

  const props = defineProps<{ type: string }>();

  const emit = defineEmits(['reloadMsg']);

  const { t } = useI18n();

  const { hasPermission } = usePermission();

  const [registerAdd, { openModal: openAddModal }] = useModal();

  const [registerDetail, { openModal: openDetailModal }] = useModal();

  const userStore = useUserStore();

  const tableData = ref<Array<any>>([]);

  // 表格列信息
  const columns = userStore?.getUserInfo?.globalSuperAdmin
    ? [
        {
          title: t('sys.license.product'),
          dataIndex: 'productName',
          key: 'productName',
        },
        {
          title: t('sys.license.category'),
          dataIndex: 'category',
          key: 'category',
        },
        {
          title: t('sys.status'),
          dataIndex: 'state',
          key: 'state',
        },
        {
          title: t('sys.license.expirationDate'),
          dataIndex: 'expirationDate',
          key: 'expirationDate',
        },
        {
          title: t('sys.operation'),
          width: 200,
          dataIndex: 'actions',
          key: 'actions',
        },
      ]
    : [
        {
          title: t('sys.license.product'),
          dataIndex: 'productName',
          key: 'productName',
        },
        {
          title: t('sys.license.category'),
          dataIndex: 'category',
          key: 'category',
        },
        {
          title: t('sys.status'),
          dataIndex: 'state',
          key: 'state',
        },
        {
          title: t('sys.license.expirationDate'),
          dataIndex: 'expirationDate',
          key: 'expirationDate',
        },
      ];

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    pageSizeOptions: ['10', '20', '30'],
  });

  const userActions = computed(() => {
    return {
      Add: hasPermission(BasicAction.Add),
    };
  });
  const getTableData = async (current?) => {
    const res = await getLicensePageList({
      productType: props.type,
      appId: props.type,
      pageNo: current ?? pagination.current,
      pageSize: pagination.pageSize,
    });
    pagination.total = res?.totalCount || 0;
    tableData.value = res?.data || [];
    emit('reloadMsg');
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData();
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
  };

  const addLicense = () => {
    openAddModal(true, {
      appId: props.type === 'platform' ? '' : props.type,
      appKey: props.type === 'platform' ? '' : props.type,
    });
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

  const handleUnbind = (id) => {
    getLicenseUnbind({
      licenseId: id,
    }).then(() => {
      message.success(t('sys.license.unbindSuccess'));
      getTableData();
    });
  };

  watch(
    () => props.type,
    () => {
      getTableData();
    },
  );
  onMounted(async () => {
    getTableData();
  });
</script>
