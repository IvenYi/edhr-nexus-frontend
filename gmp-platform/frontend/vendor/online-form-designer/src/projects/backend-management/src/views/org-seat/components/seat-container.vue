<template>
  <div>
    <a-alert
      :message="`${t(
        props.type === 'platform'
          ? 'sys.org.authorizePlatSeatTotal'
          : 'sys.org.authorizeSuitSeatTotal',
      )}：${
        props.type === 'platform'
          ? seatInfo.platform_total === -1
            ? t('sys.org.nolimit')
            : seatInfo.platform_total
          : seatInfo.suite_total === -1
            ? t('sys.org.nolimit')
            : seatInfo.suite_total
      }，${t(
        props.type === 'platform'
          ? 'sys.org.authorizePlatSeatRemain'
          : 'sys.org.authorizeSuitSeatRemain',
      )}：${
        props.type === 'platform'
          ? seatInfo.platform_remain === -1
            ? t('sys.org.nolimit')
            : seatInfo.platform_remain
          : seatInfo.suite_remain === -1
            ? t('sys.org.nolimit')
            : seatInfo.suite_remain
      }。${
        props.tenantId
          ? t('sys.org.tenantDisplayAuthorizeUserTip', {
              sth: props.type === 'platform' ? t('sys.org.plat') : t('sys.org.kit'),
            })
          : ''
      }`"
      type="info"
      show-icon
      banner
    >
      <template #icon><InfoCircleOutlined /></template>
    </a-alert>
    <BasicTable
      :striped="false"
      :columns="columns"
      :data-source="dataSource"
      :rowSelection="rowSelection"
      :pagination="pagination"
      size="middle"
      :showIndexColumn="false"
      @change="handleTableChange"
      rowKey="username"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'mobile'">
          {{ record.mobile ? record.country + record.mobile : '' }}
        </template>
        <template v-if="column.key === 'actions'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.org.move'),
                color: 'text',
                ifShow: hasPermission(BasicAction.Delete),
                popConfirm: {
                  title:
                    props.type === 'platform'
                      ? t('sys.org.platSeatMoveTip')
                      : t('sys.org.suiteSeatMoveTip'),
                  confirm: () => handleAction(record.username),
                  placement: 'topRight',
                },
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
      <template #headerTop>
        <div class="flex title">
          <a-input
            v-model:value="searchParams"
            :placeholder="t('sys.org.seatPlaceholder')"
            style="width: 220px"
            @pressEnter="search()"
          >
            <template #suffix>
              <SearchOutlined style="color: #212528; cursor: pointer" @click="getTableData()" />
            </template>
          </a-input>
          <div>
            <a-popconfirm
              v-if="allSelectedRowKeys.length && hasPermission(BasicAction.Delete)"
              :title="
                props.type === 'platform'
                  ? t('sys.org.platSeatMoveTip')
                  : t('sys.org.suiteSeatMoveTip')
              "
              @confirm="handleAction(allSelectedRowKeys)"
            >
              <a-button v-if="allSelectedRowKeys.length" type="primary">
                {{ t('sys.batchMove') }}
              </a-button>
            </a-popconfirm>

            <a-button
              v-if="hasPermission(BasicAction.Insert)"
              type="primary"
              class="ml-8px"
              @click="addUsers"
            >
              {{ t('sys.component.userCmp.addUser') }}
            </a-button>
          </div>
        </div>
      </template>
    </BasicTable>
  </div>
  <add-user @register="register" @reload="reload" />
</template>
<script setup lang="ts" name="user-seat">
  import { computed, onMounted, reactive, ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import AddUser from './add-user.vue';
  import {
    getSeatListAuthed,
    postSeatRemoveAuth,
    getSeatTotalinfos,
  } from '/@/apis/gct-platform/SeatController';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { BasicAction } from '/@/enums/authActionEnum';

  const props = defineProps(['type', 'tenantId']);

  const { hasPermission } = usePermission();

  const { t } = useI18n();

  const [register, { openModal }] = useModal();

  const dataSource = ref<Array<any>>([]);

  const searchParams = ref();

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const seatInfo = ref({
    suite_total: 0,
    suite_remain: 0,
    platform_total: 0,
    platform_remain: 0,
  });

  // 关键：存储所有选中的行key（跨页）
  const allSelectedRowKeys = ref<string[]>([]);
  // 存储所有选中的完整数据（跨页）
  const allSelectedRowsMap = ref<Map<string, any>>(new Map());

  const columns = [
    {
      title: t('sys.fullname'),
      dataIndex: 'fullname',
      key: 'fullname',
    },
    {
      title: t('sys.userName'),
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: t('sys.empNo'),
      dataIndex: 'empNo',
      key: 'empNo',
    },
    {
      title: t('sys.mobile'),
      dataIndex: 'mobile',
      key: 'mobile',
      width: 136,
    },
    {
      title: t('sys.pageDesigner.dept'),
      dataIndex: 'orgNames',
      key: 'orgNames',
    },

    {
      title: t('sys.addTime'),
      dataIndex: 'modifyTime',
      key: 'modifyTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.addUser'),
      dataIndex: 'modifyUserName',
      key: 'modifyUserName',
    },
    {
      title: t('sys.operation'),
      width: 100,
      dataIndex: 'actions',
      key: 'actions',
      fixed: 'right',
    },
  ];

  const selectedRowKeys = ref<Array<string>>([]);

  const selectedRowUserName = ref<Array<string>>([]);

  const handleRowChange = (selectedKeys: string[], selectedRows) => {
    // 这个事件通常由全选操作触发，但我们已经有onSelectAll处理了
    // 这里主要为了兼容性
    const currentPageKeys = dataSource.value.map((item) => item.username);

    // 更新当前页的选中状态
    currentPageKeys.forEach((key) => {
      if (selectedKeys.includes(key) && !allSelectedRowKeys.value.includes(key)) {
        // 添加到全局选中
        allSelectedRowKeys.value.push(key);
        const record = dataSource.value.find((item) => item.username === key);
        if (record) {
          allSelectedRowsMap.value.set(key, record);
        }
      } else if (!selectedKeys.includes(key) && allSelectedRowKeys.value.includes(key)) {
        // 从全局选中移除
        const index = allSelectedRowKeys.value.indexOf(key);
        if (index > -1) {
          allSelectedRowKeys.value.splice(index, 1);
          allSelectedRowsMap.value.delete(key);
        }
      }
    });
  };

  // 处理单行选择/取消选择
  const handleSelect = (record: any, selected: boolean) => {
    const key = record.username;

    if (selected) {
      // 选中 - 添加到全局选中列表
      if (!allSelectedRowKeys.value.includes(key)) {
        allSelectedRowKeys.value.push(key);
        allSelectedRowsMap.value.set(key, record);
      }
    } else {
      // 取消选中 - 从全局选中列表移除
      const index = allSelectedRowKeys.value.indexOf(key);
      if (index > -1) {
        allSelectedRowKeys.value.splice(index, 1);
        allSelectedRowsMap.value.delete(key);
      }
    }
  };

  // 处理全选/取消全选当前页
  const handleSelectAll = (selected: boolean, selectedRows: any[], changeRows: any[]) => {
    const currentPageKeys = dataSource.value.map((item) => item.username);

    if (selected) {
      // 全选当前页
      currentPageKeys.forEach((key) => {
        if (!allSelectedRowKeys.value.includes(key)) {
          allSelectedRowKeys.value.push(key);
        }
      });

      // 更新选中的数据
      dataSource.value.forEach((record) => {
        if (!allSelectedRowsMap.value.has(record.username)) {
          allSelectedRowsMap.value.set(record.username, record);
        }
      });
    } else {
      // 取消全选当前页
      allSelectedRowKeys.value = allSelectedRowKeys.value.filter(
        (key) => !currentPageKeys.includes(key),
      );

      // 移除当前页的数据
      currentPageKeys.forEach((key) => {
        allSelectedRowsMap.value.delete(key);
      });
    }
  };

  // 当前页选中的key（用于rowSelection）
  const currentPageSelectedKeys = computed(() => {
    const currentPageKeys = dataSource.value.map((item) => item.username);
    // 返回在当前页且被选中的key
    return allSelectedRowKeys.value.filter((key) => currentPageKeys.includes(key));
  });

  const rowSelection = computed(() => {
    return {
      type: 'checkbox',
      fixed: true,
      selectedRowKeys: currentPageSelectedKeys.value,
      onChange: handleRowChange,
      onSelect: handleSelect,
      onSelectAll: handleSelectAll,
    };
  });

  /** 获取表格数据 */
  const getTableData = (pageNum?: number) => {
    getSeatListAuthed({
      type: props.type,
      pageNo: pageNum ?? pagination.current,
      pageSize: pagination.pageSize,
      username: searchParams.value,
      tenantId: props.tenantId,
    }).then((res) => {
      if (!res?.data.length && res?.totalCount > 0) {
        getTableData(Math.ceil(res?.totalCount / pagination.pageSize));
      } else {
        dataSource.value = res?.data || [];
        dataSource.value?.forEach((item) => {
          if (item.tenantList) {
            item.orgNames = item.tenantList
              .map((i) => {
                return i.orgNames;
              })
              .join(',');
          }
        });
        pagination.total = res?.totalCount || 0;
      }
    });
  };

  /** 移除 */
  const handleAction = (id) => {
    postSeatRemoveAuth(Array.isArray(id) ? id : [id], { type: props.type }).then(() => {
      selectedRowUserName.value = [];
      selectedRowKeys.value = [];
      reload();
    });
  };

  /** 获取席位数信息 */
  const getSeatInfo = () => {
    getSeatTotalinfos().then((res) => {
      seatInfo.value = res as any;
    });
  };

  /** 添加用户 */
  function addUsers() {
    openModal(true, {
      type: props.type,
      tenantId: props.tenantId,
    });
  }

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData();
  };

  const reload = () => {
    getTableData();
    getSeatInfo();
  };
  const search = () => {
    allSelectedRowKeys.value = [];
    allSelectedRowsMap.value = new Map();
    getTableData();
  };
  watch(
    () => searchParams.value,
    (val) => {
      if (!val) {
        search();
      }
    },
  );
  onMounted(() => {
    reload();
  });
</script>
<style lang="less" scoped>
  .title {
    padding: 16px;
    justify-content: space-between;
    border-left: 1px solid #eaedf1;
    border-right: 1px solid #eaedf1;
  }

  :deep(.vben-basic-table .ant-table-wrapper .ant-table-title) {
    padding: 0 !important;
  }
</style>
