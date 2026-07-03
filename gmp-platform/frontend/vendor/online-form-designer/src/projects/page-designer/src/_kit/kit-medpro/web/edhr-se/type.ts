import type { TableColumnsType } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const modulesList = [
  {
    label: '物料分发信息',
    value: 'txnMaterialIssue',
  },
  {
    label: '过站信息',
    value: 'passingStation',
  },
  {
    label: '批次不良信息',
    value: 'txnScrap',
  },
  {
    label: '检验信息',
    value: 'check',
  },
];

export const passingStationColumns: TableColumnsType = [
  {
    title: t('序号'),
    dataIndex: 'index',
    key: 'index',
    width: 62,
  },
  {
    title: t('批次名称'),
    dataIndex: 'container_name',
    key: 'container_name',
  },
  {
    title: t('工站'),
    dataIndex: 'operation_name',
    key: 'operation_name',
  },
  {
    title: t('工艺'),
    dataIndex: 'workflow_step_name',
    key: 'workflow_step_name',
  },
  {
    title: t('设备'),
    dataIndex: 'device_names',
    key: 'device_names',
  },
  {
    title: t('治具'),
    dataIndex: 'fixture_names',
    key: 'fixture_names',
  },
  {
    title: t('进站'),
    dataIndex: 'move_in_info',
    key: 'move_in_info',
  },
  {
    title: t('出站'),
    dataIndex: 'move_info',
    key: 'move_info',
  },
  {
    title: t('合格数'),
    dataIndex: 'qualified_qty',
    key: 'qualified_qty',
  },
  {
    title: t('不合格数'),
    dataIndex: 'unqualified_qty',
    key: 'unqualified_qty',
  },
  {
    title: t('进站签名'),
    dataIndex: 'move_in_sign',
    key: 'move_in_sign',
  },
  {
    title: t('出站签名'),
    dataIndex: 'move_sign',
    key: 'move_sign',
  },
  {
    title: t('操作'),
    dataIndex: 'action',
    fixed: 'right',
    width: 100,
  },
];

export const checkColumns: TableColumnsType = [
  {
    title: t('序号'),
    dataIndex: 'index',
    key: 'index',
    width: 62,
  },
  {
    title: t('检验单'),
    dataIndex: 'checklist_name_',
    key: 'checklist_name_',
  },
  {
    title: t('状态'),
    dataIndex: 'status_',
    key: 'status_',
  },
  {
    title: t('创建时间'),
    dataIndex: 'create_time_',
    key: 'create_time_',
  },
  {
    title: t('检验员'),
    dataIndex: 'inspectors_',
    key: 'inspectors_',
  },
  {
    title: t('完成时间'),
    dataIndex: 'complete_time_',
    key: 'complete_time_',
  },
  {
    title: t('操作'),
    dataIndex: 'action',
    fixed: 'right',
    width: 100,
  },
];

export const txnMaterialIssueColumns: TableColumnsType = [
  {
    title: t('序号'),
    dataIndex: 'index',
    key: 'index',
    width: 62,
  },
  {
    title: t('物料批次'),
    dataIndex: 'container_name',
    key: 'container_name',
  },
  {
    title: t('物料名称'),
    dataIndex: 'product_name',
    key: 'product_name',
  },
  {
    title: t('需求数量'),
    dataIndex: 'qty_required',
    key: 'qty_required',
  },
  {
    title: t('分发数量'),
    dataIndex: 'qty',
    key: 'qty',
  },
];

export const txnScrapColumns: TableColumnsType = [
  {
    title: t('序号'),
    dataIndex: 'index',
    key: 'index',
    width: 62,
  },
  {
    title: t('不良分类名称'),
    dataIndex: 'not_good_group_name',
    key: 'not_good_group_name',
  },
  {
    title: t('不良原因名称'),
    dataIndex: 'not_good_reason_name',
    key: 'not_good_reason_name',
  },
  {
    title: t('不良数量'),
    dataIndex: 'qty_',
    key: 'qty_',
  },
  {
    title: t('归咎工站'),
    dataIndex: 'blamed_operation_name',
    key: 'blamed_operation_name',
  },
  {
    title: t('归咎工艺'),
    dataIndex: 'blamed_workflow_step_name',
    key: 'blamed_workflow_step_name',
  },
];

export const entriesColumns: TableColumnsType = [
  {
    title: t('序号'),
    dataIndex: 'index',
    key: 'index',
    width: 62,
  },
  {
    title: t('名称'),
    dataIndex: 'name_',
    key: 'name_',
  },
  {
    title: t('值'),
    dataIndex: 'value_',
    key: 'value_',
  },
];

export const containerColumns: TableColumnsType = [
  {
    title: t('批次'),
    dataIndex: 'name_',
    key: 'name_',
  },
  {
    title: t('批次数量'),
    dataIndex: 'qty_',
    key: 'qty_',
  },
  {
    title: t('产品'),
    dataIndex: 'product_id_',
    key: 'product_id_',
  },
  {
    title: t('工单'),
    dataIndex: 'mfg_order_id_',
    key: 'mfg_order_id_',
  },
  {
    title: t('工作流程'),
    dataIndex: 'workflow_id_',
    key: 'workflow_id_',
  },
  {
    title: t('合格数'),
    dataIndex: 'qty_',
    key: 'qty_',
  },
];

const sharedOnCell = (_, index) => {
  if (!_?.index) {
    return { colSpan: 0 };
  }
};

export const productionColumns: TableColumnsType = [
  {
    title: t('序号'),
    dataIndex: 'index',
    key: 'index',
    width: 62,
  },
  {
    title: t('工艺'),
    dataIndex: 'workflow_step_name',
    key: 'workflow_step_name',

    customCell: (_, index) => {
      if (!_?.index) {
        return { colSpan: 9 };
      }
    },
  },
  {
    title: t('设备'),
    dataIndex: 'device_names',
    key: 'device_names',
    customCell: sharedOnCell,
  },
  {
    title: t('治具'),
    dataIndex: 'fixture_names',
    key: 'fixture_names',
    customCell: sharedOnCell,
  },
  {
    title: t('合格数'),
    dataIndex: 'qualified_qty',
    key: 'qualified_qty',
    customCell: sharedOnCell,
  },
  {
    title: t('不合格'),
    dataIndex: 'unqualified_qty',
    key: 'unqualified_qty',
    customCell: sharedOnCell,
  },
  {
    title: t('进站'),
    dataIndex: 'move_in_info',
    key: 'move_in_info',
    customCell: sharedOnCell,
  },
  {
    title: t('出站'),
    dataIndex: 'move_info',
    key: 'move_info',
    customCell: sharedOnCell,
  },
  {
    title: t('进站签名'),
    dataIndex: 'move_in_sign',
    key: 'move_in_sign',
    customCell: sharedOnCell,
  },
  {
    title: t('出站签名'),
    dataIndex: 'move_sign',
    key: 'move_sign',

    customCell: sharedOnCell,
  },
];

export const txnScrapDetailColumns: TableColumnsType = [
  {
    title: t('序号'),
    dataIndex: 'index',
    key: 'index',
    width: 62,
  },
  {
    title: t('不良分类'),
    dataIndex: 'not_good_group_name',
    key: 'not_good_group_name',
  },
  {
    title: t('不良原因'),
    dataIndex: 'not_good_reason_name',
    key: 'not_good_reason_name',
  },
  {
    title: t('不良数量'),
    dataIndex: 'qty_',
    key: 'qty_',
  },
];
