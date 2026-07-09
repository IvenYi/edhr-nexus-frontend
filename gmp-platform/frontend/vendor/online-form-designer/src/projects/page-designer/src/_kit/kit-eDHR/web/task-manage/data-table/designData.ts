export const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    key: 'index',
    width: 100,
    fixed: 'left',
    align: 'center',
  }, 
  {
    title: '名称',
    dataIndex: 'name_',
    key: 'name_',
    align: 'center',
  },
  {
    title: '工单',
    dataIndex: 'mfg_order_id_',
    key: 'mfg_order_id_',
    align: 'center',
  },
  {
    title: '产品',
    dataIndex: 'product_id_',
    key: 'product_id_',
    align: 'center'
  },
  {
    title: '工艺路线',
    dataIndex: 'routing_id_',
    key: 'routing_id_',
    align: 'center',
  },
  {
    title: '数量',
    dataIndex: 'qty_',
    key: 'qty_',
    align: 'center',
  },
  {
    title: '单位',
    dataIndex: 'uom_id_',
    key: 'uom_id_',
    align: 'center',
  },
  {
    title: '当前工序',
    dataIndex: 'current_routing_operation_names_',
    key: 'current_routing_operation_names_',
    align: 'center',
  },
  {
    title: '开始时间',
    dataIndex: 'start_date_',
    key: 'start_date_',
    align: 'center',
  },
  {
    title: '结束时间',
    dataIndex: 'completion_date_',
    key: 'completion_date_',
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'create_time_',
    key: 'create_time_',
    align: 'center',
  },
  {
    title: '创建人',
    dataIndex: 'create_user_id_',
    key: 'create_user_id_',
    align: 'center',
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    align: 'center',
  },
]

export const designData = [
  {
    key: '1',
    name_: '示例批次',
    product_id_: '示例产品',
    create_time_: '2023-01-01 00:00:00',
    create_user_id_: '管理员'
  }
];

export const tableInlineActions = [
  // {
  //   key: 'print',
  //   name: '打印',
  //   type: 'primary'
  // },
  {
    key: 'view',
    name: '详情',
    type: 'primary'
  },
  {
    key: 'task',
    name: '作业执行',
    type: 'primary'
  },
  {
    key: 'delete',
    name: '删除',
    type: 'danger'
  },
]
