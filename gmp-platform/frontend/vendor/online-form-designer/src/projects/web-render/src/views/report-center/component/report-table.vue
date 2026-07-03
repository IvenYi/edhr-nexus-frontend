<template>
  <BasicTable
    :dataSource="props.tableData"
    :columns="columns"
    :pagination="pagination"
    :striped="false"
    :bordered="true"
    @change="handleTableChange"
  >
    <template #bodyCell="{ column, record, index }">
      <template v-if="column.key === 'name'">
        <a @click="handleRowEdit(record)">
          <IconNext :color="themeSetting.themeColor" :value="returnIconType(record)" :size="15" />
          {{ record.name }}
        </a>
      </template>
      <template v-if="column.key === 'publish'">
        <a-badge v-if="record.publish" status="success" />
        <a-badge v-else status="default" />
        <span
          class="status"
          :style="{
            '--status-color': record.publish ? '#52c41a' : '#8f8f8f',
          }"
        >
          {{ record.publish ? t('sys.bpmn.versionStatus.PUBLISHED') : t('sys.report.disPublish') }}
        </span>
      </template>
      <template v-if="column.key === 'visibleRange'">
        <a-tooltip color="#ffffff">
          <template #title>
            <div v-if="record.visibleRange">
              <span v-for="(item, index) in record.userRoleGroupMap" class="mr4px">
                <IconNext
                  :value="returnIconExtra(item).icon"
                  :color="returnIconExtra(item).iconColor"
                  :size="15"
                />
                <span style="color: #000">
                  {{ item.value }}
                  {{ record.userRoleGroupMap.length - 1 !== index ? ',' : '' }}
                </span>
              </span>
            </div>
            <span v-else-if="record.publish && !record.visibleRange" style="color: #000">
              所有人
            </span>
          </template>
          <div v-if="record.visibleRange" class="ell">
            <span v-for="(item, index) in record.userRoleGroupMap" class="mr4px">
              <IconNext
                :value="returnIconExtra(item).icon"
                :color="returnIconExtra(item).iconColor"
                :size="15"
              />
              {{ item.value }}
              {{ record.userRoleGroupMap.length - 1 !== index ? ',' : '' }}
            </span>
          </div>
          <span v-else-if="record.publish && !record.visibleRange"> 所有人 </span>
        </a-tooltip>
      </template>
      <template v-if="column.key === 'action'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.edit'),
              ifShow: userActions.Update,
              onClick: handleRowEdit.bind(null, record),
            },
            {
              label: t('sys.component.userCmp.move'),
              ifShow: userActions.Move,
              onClick: handleRowMove.bind(null, record),
            },
            {
              label: t('sys.publish'),
              ifShow: userActions.Publish && !record.publish,
              onClick: handleRowPublish.bind(null, record),
            },
            {
              label: t('sys.report.unPublish'),
              color: 'text',
              ifShow: userActions.Publish && record.publish,
              onClick: handleRowUnPublish.bind(null, record),
            },
            {
              label: t('sys.delete'),
              color: 'text',
              ifShow: userActions.Delete && !record.publish,
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
  <move-report @register="register" @ok="reload" />
  <publish-report @register="registerPublish" @ok="reload" />
  <!-- <create-comp @register="register" @ok="() => getTableData(1)" />
    <comp-detail @ok="() => getTableData()" ref="detailRef" :compId="compId" />
    <edit-comp @register="registerEdit" @ok="() => getTableData()" /> -->
</template>
<script setup lang="ts" name="custom-table">
  import { ref, reactive, onMounted, createVNode, h, watch, computed } from 'vue';
  import { BasicTable, TableActionAuto, BasicColumn } from '/@/components/Table';
  import { useI18n } from 'vue-i18n';
  import MoveReport from '../modals/move-report.vue';
  import PublishReport from '../modals/publish-roport.vue';
  import { message, Modal } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { putReportUndeployById, deleteReport } from '/@/apis/gct-apaas/ReportController';
  import { openReportDesign } from '@gct/runtime-web';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import { chartType } from '../constant/chart';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';

  const { themeSetting } = useThemeSetting();

  const props = defineProps<{ tableData?: any; pagination: any }>();
  const emit = defineEmits(['reload']);
  const { t } = useI18n();

  const [register, { openModal }] = useModal();
  const [registerPublish, { openModal: openModalPublish }] = useModal();

  const userActions = computed(() => {
    const page = 'ReportDesign';
    return {
      Update: !!getPermissionByKey(page, 'Update'),
      Publish: !!getPermissionByKey(page, 'Publish'),
      Delete: !!getPermissionByKey(page, 'Delete'),
      Move: !!getPermissionByKey(page, 'Move'),
    };
  });

  const columns: BasicColumn[] = [
    {
      title: t('sys.reportName'),
      key: 'name',
      dataIndex: 'name',
      width: 200,
      fixed: 'left',
    },
    {
      title: t('sys.status'),
      dataIndex: 'publish',
      key: 'publish',
      width: 150,
    },
    {
      title: t('sys.description'),
      key: 'description',
      dataIndex: 'description',
      width: 150,
    },
    {
      title: t('sys.report.viewerRange'),
      dataIndex: 'visibleRange',
      key: 'visibleRange',
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

  // 查看范围图标展示
  const returnIconExtra = (option) => {
    if (!option) return {};
    const { key } = option;
    let icon, iconColor;
    if (key.includes('ROLE:')) {
      icon = 'icon-jiaose1';
      iconColor = '#00B2F8';
    } else if (key.includes('ORG:')) {
      icon = 'icon-bumen1';
      iconColor = '#FF6937';
    } else if (key.includes('USER:')) {
      icon = 'icon-renyuan2';
      iconColor = '#2C71FC';
    } else {
      icon = 'icon-dongtai';
      iconColor = '#B445F5';
    }
    return {
      icon,
      iconColor,
      textColor: '',
    };
  };

  // 表格类型图标
  const returnIconType = (option) => {
    if (!option) return {};
    const { reportType } = option;
    let icon;
    if (reportType === chartType.CROSS_TABLE) {
      icon = 'icon-jiaochabiao';
    } else if (reportType === chartType.SCHEDULE_TABLE) {
      icon = 'icon-a-biaoge_table-file4';
    } else {
      icon = '';
    }
    return icon;
  };

  const handleRowMove = (record) => {
    openModal(true, {
      ...record,
    });
  };

  const handleTableChange = (paginationInfo) => {
    emit('reload', paginationInfo);
  };

  const reload = () => {
    emit('reload', {});
  };

  /** 删除行数据 */
  const handleRowDelete = (record) => {
    deleteReport({ ids: record.id }).then(() => {
      message.success(t('sys.deleteSuccess'));
      reload();
    });
  };

  /** 编辑行数据 */
  const handleRowEdit = async (record) => {
    const res = await openReportDesign(record.id);
    if (res && res.ok) {
      reload();
    }
  };

  /** 发布 */
  const handleRowPublish = (record) => {
    openModalPublish(true, {
      ...record,
    });
  };

  /** 取消发布 */
  const handleRowUnPublish = (record) => {
    Modal.confirm({
      icon: h(ExclamationCircleOutlined),
      title: t('sys.report.unPublishTitle'),
      content: t('sys.report.unPublishContent', { sth: record.name }),
      okText: t('sys.okText'),
      onOk() {
        putReportUndeployById({ id: record.id }).then(() => {
          reload();
          message.success(t('sys.report.unPublish') + t('sys.success'));
        });
      },
    });
  };
</script>
<style lang="less" scoped>
  :deep(.ant-drawer-title) {
    text-align: center;
  }
  .vben-basic-table .ant-table-cell .ant-tag {
    margin-right: 4px;
  }
  .status {
    color: var(--status-color);
  }
</style>
