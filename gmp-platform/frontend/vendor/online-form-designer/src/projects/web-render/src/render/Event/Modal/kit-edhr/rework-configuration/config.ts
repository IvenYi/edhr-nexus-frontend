export const formFieldsConfigs = {
  container: {
    common: {
      title: $t('sys.edhr.lotInfo'),
      fields: [
        {
          label: $t('sys.edhr.productionLot'),
          field: 'container_id_',
          component: 'Select',
          componentProps: {
            readonly: true,
            required: false,
            placeholder: $t('sys.edhr.autoFill'),
            options: [],
          },
          colProps: {
            span: 12,
          },
        },
        {
          label: $t('sys.edhr.field.productCode'),
          field: 'code_',
          component: 'Select',
          componentProps: {
            readonly: true,
            required: false,
            placeholder: $t('sys.edhr.autoFill'),
            options: [],
          },
          colProps: {
            span: 12,
          },
        },
        {
          label: $t('sys.edhr.field.productName'),
          field: 'product_id_',
          component: 'Select',
          componentProps: {
            readonly: true,
            required: false,
            placeholder: $t('sys.edhr.autoFill'),
            options: [],
          },
          colProps: {
            span: 12,
          },
        },
        {
          label: $t('sys.edhr.field.productSpec'),
          field: 'spec_',
          component: 'Select',
          componentProps: {
            readonly: true,
            required: false,
            placeholder: $t('sys.edhr.autoFill'),
            options: [],
          },
          colProps: {
            span: 12,
          },
        },
      ],
    },
    task: {
      title: $t('sys.edhr.reworkInfo'),
      fields: [
        {
          label: $t('sys.titleOfSth'),
          field: 'rework_name_',
          component: 'Input',
          componentProps: {
            placeholder: $t('sys.inputText'),
            maxlength: 64,
            showCount: true,
          },
          required: true,
          colProps: {
            span: 24,
          },
        },
        {
          label: $t('sys.quantity'),
          field: 'qty_',
          component: 'InputNumber',
          componentProps: {
            placeholder: $t('sys.inputText'),
            min: 1,
          },
          required: true,
          colProps: {
            span: 24,
          },
        },
        {
          label: $t('sys.description'),
          field: 'description_',
          component: 'TextArea',
          componentProps: {
            placeholder: $t('sys.inputText'),
            maxlength: 120,
            showCount: true,
          },
          required: false,
          colProps: {
            span: 24,
          },
        },
      ],
    },
  },

  sn: {
    common: {
      title: $t('sys.edhr.snInfo'),
      fields: [
        {
          label: 'SN',
          field: 'sn_id_',
          component: 'Select',
          componentProps: {
            readonly: true,
            required: false,
            placeholder: $t('sys.edhr.autoFill'),
            options: [],
          },
          colProps: {
            span: 12,
          },
        },
        {
          label: $t('sys.edhr.field.productCode'),
          field: 'code_',
          component: 'Select',
          componentProps: {
            readonly: true,
            required: false,
            placeholder: $t('sys.edhr.autoFill'),
            options: [],
          },
          colProps: {
            span: 12,
          },
        },
        {
          label: $t('sys.edhr.field.productName'),
          field: 'product_id_',
          component: 'Select',
          componentProps: {
            readonly: true,
            required: false,
            placeholder: $t('sys.edhr.autoFill'),
            options: [],
          },
          colProps: {
            span: 12,
          },
        },
        {
          label: $t('sys.edhr.field.productSpec'),
          field: 'spec_',
          component: 'Select',
          componentProps: {
            readonly: true,
            required: false,
            placeholder: $t('sys.edhr.autoFill'),
            options: [],
          },
          colProps: {
            span: 12,
          },
        },
      ],
    },
    task: {
      title: $t('sys.edhr.reworkInfo'),
      fields: [
        {
          label: $t('sys.titleOfSth'),
          field: 'rework_name_',
          component: 'Input',
          componentProps: {
            placeholder: $t('sys.inputText'),
            maxlength: 64,
            showCount: true,
          },
          required: true,
          colProps: {
            span: 24,
          },
        },
        {
          label: $t('sys.description'),
          field: 'description_',
          component: 'TextArea',
          componentProps: {
            placeholder: $t('sys.inputText'),
            maxlength: 120,
            showCount: true,
          },
          required: false,
          colProps: {
            span: 24,
          },
        },
        {
          label: $t('sys.edhr.withReworkSn'),
          field: 'sn_ids_',
          component: 'Select',
          componentProps: {
            visible: true,
            mode: 'multiple',
            placeholder: $t('sys.chooseText'),
            options: [],
            getOptions: async function (widget, extParams, callback) {
              if (callback && typeof callback === 'function') {
                const options = await callback();
                widget.componentProps.options = [...(options || [])];
              }
            },
          },
          setDynamicProps: (w, field = 'visible', value: boolean) => {
            w.componentProps[field] = value;
          },
          required: false,
          colProps: {
            span: 24,
          },
        },
      ],
    },
  },
};

export const taskTableColumns = {
  container: {
    columns: [
      {
        title: $t('sys.index'),
        dataIndex: 'index',
        key: 'index',
        width: 40,
        align: 'center',
      },
      {
        title: $t('sys.titleOfSth'),
        dataIndex: 'rework_name_',
        key: 'rework_name_',
        width: 200,
        ellipsis: true,
      },
      {
        title: $t('sys.quantity'),
        dataIndex: 'qty_',
        key: 'qty_',
        width: 100,
        ellipsis: true,
      },
      {
        title: $t('sys.operation'),
        dataIndex: 'action',
        key: 'action',
        width: 100,
        ellipsis: true,
        scopedSlots: {
          customRender: 'action',
        },
      },
    ],
  },

  sn: {
    columns: [
      {
        title: $t('sys.index'),
        dataIndex: 'index',
        key: 'index',
        width: 40,
        align: 'center',
      },
      {
        title: $t('sys.titleOfSth'),
        dataIndex: 'rework_name_',
        key: 'rework_name_',
        width: 200,
        ellipsis: true,
      },
      {
        title: $t('sys.operation'),
        dataIndex: 'action',
        key: 'action',
        width: 100,
        ellipsis: true,
        scopedSlots: {
          customRender: 'action',
        },
      },
    ],
  },
};

export const workflowSchema = {
  id: 'master_slave_237842605',
  platform: 'web',
  name: 'sys.pageDesigner.fieldCmp.master_slave',
  alias: '工艺路线节点',
  type: 'workflow-nodes',
  children: [],
  props: {
    workflowModalInfo: {},
    bindModelKey: 'em_routing_operation',
    specModalInfo: {},
    field: 'operations_',
    fieldId: 'em_routing$operations_',
    label: null,
    modelKey: 'em_routing',
    fieldType: 'master_slave',
    disabled: false,
    explain: '',
    showExplain: false,
    displayLabelText: true,
    readonly: false,
    fieldReadonly: false,
    notSubmitInHide: true,
    hidden: false,
    componentDependency: {},
    fieldCodeChain: '{"modelKey":"em_routing"}',
    isFieldModel: false,
    isCustomField: false,
    fieldName: '工艺路线节点',
    modeldata: {
      modelCategory: 'entity',
      modelType: 'WORKFLOW',
    },
    required: false,
    fieldRequired: 0,
  },
  style: {},
  events: {},
  formItem: true,
  i18n: {},
  isField: true,
  materialType: 'formField',
};

export const operationEntryColumns = {
  form_entries_: [
    {
      title: $t('sys.edhr.formTmpl'),
      dataIndex: 'form_tmpl_id_',
      align: 'left',
      ellipsis: true,
      required: true,
    },
    {
      title: $t('sys.edhr.endBeforeCompletion'),
      dataIndex: 'force_submit_',
      align: 'center',
    },
    {
      title: $t('sys.edhr.formSharing'),
      dataIndex: 'form_shared_',
      align: 'center',
      tooltip: $t('sys.edhr.formSharingTooltips'),
    },
    {
      title: $t('sys.operation'),
      dataIndex: 'operation_',
      align: 'center',
      width: 150,
    },
  ],

  document_entries_: [
    {
      title: 'SOP' + $t('sys.file'),
      dataIndex: 'document_id_',
      align: 'left',
      ellipsis: true,
      required: true,
    },
    {
      title: $t('sys.edhr.startPage'),
      dataIndex: 'start_page_',
      align: 'center',
      width: 250,
    },
    {
      title: $t('sys.edhr.endPage'),
      dataIndex: 'end_page_',
      align: 'center',
      width: 250,
    },
    {
      title: $t('sys.operation'),
      dataIndex: 'operation_',
      align: 'center',
      width: 150,
    },
  ],

  trigger_txn_entries_: [
    {
      title: $t('sys.edhr.event'),
      dataIndex: 'event_',
      align: 'left',
      ellipsis: true,
    },
    {
      title: $t('sys.edhr.action'),
      dataIndex: 'action_',
      align: 'center',
    },
    {
      title: $t('sys.edhr.value'),
      dataIndex: 'value_',
      align: 'center',
    },
    {
      title: $t('sys.operation'),
      dataIndex: 'operation_',
      align: 'center',
      width: 150,
    },
  ],

  before_txn_check_entries_: [
    {
      title: $t('sys.edhr.txnName'),
      dataIndex: 'txn_definition_id_',
      align: 'left',
      ellipsis: true,
      required: true,
    },
    {
      title: $t('sys.edhr.txnCode'),
      dataIndex: 'txn_code_',
      align: 'center',
    },
    {
      title: $t('sys.operation'),
      dataIndex: 'operation_',
      align: 'center',
      width: 150,
    },
  ],
  operation_advance_execution_entries_: [
    {
      title: $t('sys.edhr.preOperation'),
      dataIndex: 'before_operation_id_',
      align: 'left',
      ellipsis: true,
      required: true,
    },
    {
      title: $t('sys.edhr.event'),
      dataIndex: 'event_',
      align: 'center',
      required: true,
    },
    {
      title: $t('sys.operation'),
      dataIndex: 'operation_',
      align: 'center',
      width: 150,
    },
  ],
};

export const EntryKeys = [
  'form_entries_',
  'document_entries_',
  // 'trigger_txn_entries_',
  'before_txn_check_entries_',
  'operation_advance_execution_entries_',
];
