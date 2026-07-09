export const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 100,
    fixed: 'left',
    align: 'left',
  },
  {
    title: '工单名称',
    dataIndex: 'name_',
    key: 'name_',
    align: 'left',
  },
  {
    title: '工单类型',
    dataIndex: 'type_',
    key: 'type_',
    align: 'left',
  },
  {
    title: '工单状态',
    dataIndex: 'status_',
    key: 'status_',
    align: 'left',
  },
  {
    title: '产品',
    dataIndex: 'product_id_',
    key: 'product_id_',
    align: 'left',
  },
  {
    title: '创建时间',
    dataIndex: 'create_time_',
    key: 'create_time_',
    align: 'left',
  },
  {
    title: '创建人',
    dataIndex: 'create_user_id_',
    key: 'create_user_id_',
    align: 'left',
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    align: 'left',
    width: 250,
  },
];

export const designData = [
  {
    key: '1',
    name_: '示例工单',
    type_: '示例工单类型',
    status_: '待开始',
    product_id_: '示例产品',
    create_time_: '2023-01-01 00:00:00',
    create_user_id_: '管理员',
  },
];

export const tableInlineActions = [
  {
    key: 'edit',
    name: '编辑',
    type: 'primary',
  },
  {
    key: 'createLot',
    name: '拆分批次',
    type: 'primary',
  },
  {
    key: 'delete',
    name: '删除',
    type: 'danger',
  },
  // {
  //   key: 'view',
  //   name: '详情',
  //   type: 'primary'
  // },
];
