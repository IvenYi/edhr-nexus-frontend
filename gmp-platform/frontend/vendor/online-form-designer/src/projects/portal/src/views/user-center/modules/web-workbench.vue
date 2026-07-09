<template>
  <div class="table-wrap empty" v-if="tableData && !tableData.length && !loading && !isSearch">
    <van-empty :image="emptyPng">
      <template #description>
        <div class="main-desc">{{ $t('sys.portal.noDashboardCreated') }}</div>
        <div class="sub-desc">{{ $t('sys.portal.startCreateTip') }}</div>
      </template>
    </van-empty>

    <a-button type="primary" @click="createOrEditDashboard()">
      <i class="gct-iconfont icon-a-btn_add2"></i> {{ t('sys.portal.dashboardNew') }}
    </a-button>
  </div>
  <BasicTable
    v-else
    :dataSource="tableData"
    :columns="filterColumn"
    :pagination="false"
    :striped="false"
    :showIndexColumn="false"
    :bordered="true"
    :ellipsis="true"
    row-key="id"
    row-draggable
    :row-drag-api="
      getCurrentProject === ProjectName.PORTAL ? postDashboardMove : apaasPostDashboardMove
    "
    @change="getTableData"
    @row-drag-end="
      () => {
        if (getCurrentProject === ProjectName.WEB_RENDER) {
          tabStore.updateDashboard();
        }
        createMessage.success(t('sys.operationSuccess'));
        getTableData();
      }
    "
  >
    <template #headerTop>
      <div class="flex mb8px">
        <a-input
          v-model:value="formData.name"
          style="width: 240px"
          :placeholder="t('sys.portal.serachDashboardName')"
          @pressEnter="getTableData()"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
        <a-button style="margin-left: auto" type="primary" @click="createOrEditDashboard()">
          <i class="gct-iconfont icon-a-btn_add2"></i> {{ t('sys.portal.dashboardNew') }}
        </a-button>
      </div>
    </template>
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'name'">
        <a @click="createOrEditDashboard(record)" :title="record.name">
          {{ record.name }}
        </a>
      </template>
      <template v-if="column.key === 'status'">
        <a-badge
          :color="record.status ? '#48C65C' : '#FF9442'"
          :text="
            record.status
              ? t('sys.developer.appCenter.enabled')
              : t('sys.developer.appCenter.notEnabled')
          "
        />
      </template>
      <template v-if="column.key === 'source'">
        {{ record.source ? t('sys.portal.selfBuildDashboard') : t('sys.portal.systemDashboard') }}
      </template>
      <template v-if="column.key === 'action'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.edit'),
              type: 'link',
              onClick: createOrEditDashboard.bind(null, record),
            },
            {
              label: t('sys.enable'),
              ifShow: !record.status,
              popConfirm: {
                title: t('sys.confirmExecution'),
                confirm: handleRowEnable.bind(null, record),
              },
            },
            {
              label: t('sys.disable'),
              color: 'error',
              ifShow: record.status && isDisabled,
              popConfirm: {
                title: t('sys.confirmExecution'),
                confirm: handleRowDisable.bind(null, record),
              },
            },
            {
              label: t('sys.portal.reset'),
              ifShow: !record.source,
              type: 'link',
              popConfirm: {
                title: t('sys.confirmExecution'),
                confirm: handleRowReset.bind(null, record),
              },
            },
            {
              label: t('sys.delete'),
              color: 'text',
              ifShow: record.source && (isDisabled || !record.status),
              popConfirm: {
                title: t('sys.confirmExecution'),
                confirm: handleRowDelete.bind(null, record),
              },
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </BasicTable>
</template>

<script setup lang="ts" name="web-workbench">
  import { ref, onMounted, reactive, computed, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useMessage } from '/@/hooks/web/useMessage';
  import {
    deleteDashboard,
    getDashboardList,
    postDashboard,
    putDashboardById,
    postDashboardMove,
    getDashboardPageList,
  } from '/@/apis/gct-platform/DashboardController';
  import {
    deleteDashboard as apaasDeleteDashboard,
    getDashboardList as apaasGetDashboardList,
    putDashboardById as apaasPutDashboardById,
    postDashboardMove as apaasPostDashboardMove,
  } from '/@/apis/gct-apaas/DashboardController';
  import dashboardDesignerNew from '../component/dashboard/index.vue';
  import { getWorkbenchComponentRelationList } from '/@/apis/gct-platform/WorkbenchComponentRelationController';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { ProjectName } from '/@/enums/appEnum';
  import { INIT_POSITION } from '../component/dashboard/hook';
  import { useMultipleTabStore } from '/@/store/modules/multipleTab';
  import emptyPng from '/@/assets/svg/pic_noybp.svg';
  import { message } from 'ant-design-vue';

  const tabStore = useMultipleTabStore();
  const { t } = useI18n();
  const { getEnv } = useEnv();
  const { getCurrentProject } = usePermissionStoreWithOut();
  const { createMessage } = useMessage();
  const loading = ref(false);
  /** 表格数据 */
  const tableData = ref();

  /** 列字段 */
  const columns = [
    {
      title: t('sys.index'),
      key: 'index',
      dataIndex: 'index',
      width: 72,
      fixed: 'left',
    },
    {
      title: t('sys.portal.dashboardName'),
      key: 'name',
      dataIndex: 'name',
      width: 200,
      fixed: 'left',
    },
    {
      title: t('sys.status'),
      dataIndex: 'status',
      key: 'status',
      width: 150,
    },
    {
      title: t('sys.portal.dashboardOrigin'),
      dataIndex: 'source',
      key: 'source',
      width: 150,
    },
    {
      title: t('sys.creator'),
      dataIndex: 'createUserName',
      width: 150,
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      width: 170,
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.modifier'),
      dataIndex: 'modifyUserName',
      width: 150,
    },
    {
      title: t('sys.modifyTime'),
      dataIndex: 'modifyTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'action',
      width: 230,
      fixed: 'right',
    },
  ];
  const filterColumn = computed(() => {
    if (getCurrentProject === ProjectName.PORTAL) {
      return columns;
    }
    return columns.filter((i) => i.dataIndex !== 'source');
  });

  const formData = reactive({
    name: '',
  });

  const isDisabled = ref(true);

  const isSearch = ref(false);

  watch(
    () => formData.name,
    (val) => {
      if (!val) {
        getTableData();
      }
    },
  );

  const getTableData = () => {
    if (getCurrentProject === ProjectName.PORTAL) {
      getDashboardList(
        {
          ...formData,
        },
        // {
        //   transferToConfig: { headers: { env: getEnv() } },
        // },
      ).then((res) => {
        if (formData.name) {
          isSearch.value = true;
        } else {
          isSearch.value = false;
        }
        tableData.value = (res || []).map((i, idx) => {
          return {
            ...i,
            index: idx + 1,
          };
        });
        isDisabled.value = res?.filter((i) => i.status).length !== 1;
      });
    } else {
      loading.value = true;
      apaasGetDashboardList({
        ...formData,
      })
        .then((res) => {
          if (formData.name) {
            isSearch.value = true;
          } else {
            isSearch.value = false;
          }
          tableData.value = (res || []).map((i, idx) => {
            return {
              ...i,
              index: idx + 1,
            };
          });
        })
        .finally(() => {
          loading.value = false;
        });
    }
  };
  /** 判断系统仪表盘有没有数据，没有则初始化历史数据并兼容从12栅格转化为24栅格 */
  const judgeEmpty = () => {
    getDashboardPageList(
      {
        source: 0,
      },
      // {
      //   transferToConfig: { headers: { env: getEnv() } },
      // },
    ).then((result) => {
      if (result?.data?.length) {
        getTableData();
        return;
      } else {
        const json = INIT_POSITION.map((i) => {
          return {
            ...i,
            positionJson: JSON.stringify(i.positionJson),
          };
        });
        postDashboard(
          {
            source: 0,
            status: 1,
            name: $t('sys.portal.systemDashboard'),
            config: JSON.stringify(json),
          },
          // {
          //   transferToConfig: { headers: { env: getEnv() } },
          // },
        ).then(() => {
          getTableData();
        });
        // getWorkbenchComponentRelationList(
        //   { enabled: false },
        //   {
        //     transferToConfig: { headers: { source: 501 } },
        //   },
        // ).then((res) => {
        //   const json = res?.map((i) => {
        //     const position = i?.positionJson ? JSON.parse(i?.positionJson) : null;
        //     return {
        //       ...i,
        //       positionJson: position
        //         ? JSON.stringify({
        //             x: i?.positionJson?.x * 2,
        //             y: i?.positionJson?.y,
        //             w: i?.positionJson?.w * 2,
        //             h: i?.positionJson?.h,
        //           })
        //         : position,
        //     };
        //   });

        // });
      }
    });
  };
  const createOrEditDashboard = async (record?) => {
    const res = await gct.openUtil.fullScreen(dashboardDesignerNew, {
      id: record?.id || '',
    });
    if (res.ok && res.params?.refresh) {
      if (getCurrentProject === ProjectName.WEB_RENDER) {
        tabStore.updateDashboard();
      }

      getTableData();
    }
  };
  /** 启用 */
  const handleRowEnable = (record) => {
    if (getCurrentProject === ProjectName.PORTAL) {
      putDashboardById(
        {
          id: record.id,
        },
        {
          ...record,
          status: 1,
        },
        // {
        //   transferToConfig: { headers: { env: getEnv() } },
        // },
      ).then(() => {
        message.success(t('sys.tipEnabledSuccess'));
        getTableData();
      });
    } else {
      apaasPutDashboardById(
        {
          id: record.id,
        },
        {
          ...record,
          status: 1,
        },
      ).then(() => {
        message.success(t('sys.tipEnabledSuccess'));
        tabStore.updateDashboard();
        getTableData();
      });
    }
  };
  /** 禁用 */
  const handleRowDisable = (record) => {
    if (getCurrentProject === ProjectName.PORTAL) {
      putDashboardById(
        {
          id: record.id,
        },
        {
          ...record,
          status: 0,
        },
        // {
        //   transferToConfig: { headers: { env: getEnv() } },
        // },
      ).then(() => {
        message.success(t('sys.tipDisabledSuccess'));
        getTableData();
      });
    } else {
      apaasPutDashboardById(
        {
          id: record.id,
        },
        {
          ...record,
          status: 0,
        },
      ).then(() => {
        message.success(t('sys.tipDisabledSuccess'));
        tabStore.updateDashboard();
        getTableData();
      });
    }
  };
  /** 恢复系统默认 */
  const handleRowReset = (record) => {
    if (getCurrentProject === ProjectName.PORTAL) {
      const json = INIT_POSITION.map((i) => {
        return {
          ...i,
          positionJson: JSON.stringify(i.positionJson),
        };
      });
      putDashboardById(
        { id: record.id },
        {
          ...record,
          config: JSON.stringify(json),
        },
        // {
        //   transferToConfig: { headers: { env: getEnv() } },
        // },
      ).then(() => {
        message.success(t('sys.portal.resetSuccess'));
        getTableData();
      });
    }
  };
  const handleRowDelete = (record) => {
    if (getCurrentProject === ProjectName.PORTAL) {
      deleteDashboard(
        { ids: record.id },
        // {
        //   transferToConfig: { headers: { env: getEnv() } },
        // },
      ).then(() => {
        message.success(t('sys.component.userCmp.delUserSuccess'));
        getTableData();
      });
    } else {
      apaasDeleteDashboard(
        { ids: record.id },
        // {
        //   transferToConfig: { headers: { env: getEnv() } },
        // },
      ).then(() => {
        message.success(t('sys.component.userCmp.delUserSuccess'));
        tabStore.updateDashboard();
        getTableData();
      });
    }
  };

  onMounted(() => {
    judgeEmpty();
  });
</script>

<style lang="less" scoped>
  .gct-iconfont {
    margin-right: 4px;
    font-size: 14px;
  }

  .table-wrap {
    width: 100%;
    height: 100%;
    padding: 16px;
    overflow: hidden;
  }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  :deep(.van-empty__description) {
    margin-top: 4px;
    color: #8f8f8f;
  }

  :deep(.van-empty__image) {
    width: 200px;
    height: 128px;
  }

  .main-desc {
    margin-bottom: 8px;
    color: #1a1d23;
    font-size: 18px;
    font-weight: 500;
    text-align: center;
  }

  .sub-desc {
    color: #5a5f6b;
    font-size: 14px;
    text-align: center;
  }

  :deep(.ant-btn-text) {
    color: #1a1d23;

    &:hover {
      opacity: 0.8;
      background: transparent;
    }
  }
</style>
