import { computed, type Ref } from 'vue';
import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
import { getEnumModelFieldPageList } from '/@/apis/gct-apaas/EnumModelFieldController';
import { IOperationNodeConfig, FileTypeEnum } from '../../types';
import { Switch as ASwitch } from 'ant-design-vue';
import FormTemplateCell from '../table-cell/form-template-cell.vue';
import DocumentSelectCell from '../table-cell/document-select-cell.vue';
import PageInputCell from '../table-cell/page-input-cell.vue';
import ReadonlyCell from '../table-cell/readonly-cell.vue';
import CellSelection from '/@page-designer/_kit/kit-eDHR/web/operation-config/field/cell-selection.vue';
import CellPreOperation from '/@page-designer/_kit/kit-eDHR/web/operation-config/field/cell-pre-operation.vue';
import CellActionValue from '/@page-designer/_kit/kit-eDHR/web/operation-config/field/cell-action-value.vue';
// import CellReadonly from '/@/projects/page-designer/src/_kit/kit-eDHR/web/operation-config/field/cell-readonly.vue';

interface FieldConfig {
  component: any;
  getProps?: (context: FieldContext) => Record<string, any>;
  getEvents?: (context: FieldContext) => Record<string, Function>;
}

interface FieldContext {
  record: any;
  column: any;
  index: number;
  entryKey: string;
  dataSource?: any[];
  handlers?: {};
}

async function loadTxnDefinitionOptions() {
  const res: any = await postBizServiceByModelKeyByBsKey(
    {
      bsKey: 'listAll',
      modelKey: 'em_txn_definition',
    },
    {
      query: {
        'attr_.ne': 'system',
        'operating_state_.eq': true,
        'txn_module_.eq': 'PRODUCTION',
      },
    } as any,
  );

  return res?.data?.map((it) => {
    return {
      ...it,
      label: it.name_,
      value: it.id_,
    };
  });
}

async function loadEnumOptions({
  modelKey = 'enu_operation_advance_execution_event',
  modelId = 'enu_operation_advance_execution_event',
}) {
  const res = await getEnumModelFieldPageList({
    enumModelId: modelId,
    enumModelKey: modelKey,
  });
  const enums = (res?.data ?? []).map((it) => {
    return {
      ...it,
      label: it.text,
      value: it.value,
    };
  });
  return enums;
}

/** 获取已发布的事务列表 */
async function loadTxnOptions(val?) {
  const res =
    (await postBizServiceByModelKeyByBsKey(
      {
        bsKey: 'biz_txn_def_list_published_search',
        modelKey: 'em_txn_definition',
      },
      {
        name: val ?? undefined,
        txnModule: 'PRODUCTION',
      } as any,
      {
        name: val ?? undefined,
        txnModule: 'PRODUCTION',
      } as any,
    )) ?? [];

  return res?.map((it) => {
    return {
      ...it,
      label: it.name,
      value: it.id,
      code: it.code,
    };
  });
}

/**
 * 管理工序下配置表格字段的组件映射、属性和事件
 */
export function useFieldConfig(
  formData: Ref<IOperationNodeConfig>,
  currentEntryKey: Ref<string>,
  isDetail: Ref<boolean>,
  props: any,
) {
  const currentDataSource = computed(() => {
    return (formData.value[currentEntryKey.value] || [])?.filter((item: any) => !item.deleted_);
  });

  // const currentEntryDict = computed(() => {
  //   const entryDictKey = currentEntryKey.value + 'dict_';
  //   return formData.value[entryDictKey] || {};
  // });

  const currentOperation = computed(() => {
    return props.workflowData?.find((item) => item.node_id_ === props.nodeConfig?.node_id_);
  });

  const createFieldHandlers = () => {
    return {
      // 文档选择联动
      onDocumentChange: (value: any, option: any, record: any) => {
        const info = option?.triggerNode?.props?._info ?? {};
        const { f_type_mryi: fileType } = info;
        // 业务规则：非 PDF 禁用页码
        const pageDisabled = !!(!fileType || fileType.toLowerCase() !== FileTypeEnum.PDF);
        record.page_no_disabled_ = pageDisabled;
        record.start_page_ = null;
        record.end_page_ = null;
      },
      // 页码联动
      onPageChange: (type: 'start' | 'end', value: any, record: any) => {
        if (type === 'start') {
          if (record.start_page_ && record.end_page_ && record.start_page_ > record.end_page_) {
            record.end_page_ = null;
          }
        } else {
          if (record.start_page_ && record.end_page_ && record.end_page_ < record.start_page_) {
            record.start_page_ = null;
          }
        }
      },
      onFormTempObjValueChange: (rowData, payload) => {
        console.log('handleValueObjChange', rowData, payload);
        Object.assign(rowData, {
          // 切换表单以后重置权限
          field_permission_: null,
          operation_: null,
          form_type_: payload?.formType,
        });
      },
      onTxnDefineChange: (val: any, option: any, record: any) => {
        console.log('onTxnDefineChange', val, option, record);
        record.txn_code_ = option.code_;
      },
      onTxnDefineLoaded: (value, options, record) => {
        const item = options.find((it) => it.value === value);
        if (item) {
          record.txn_code_ = item.code_;
        }
      },
    };
  };

  const fieldHandlers = createFieldHandlers();

  // 字段配置映射表
  const fieldConfigMap: Record<string, FieldConfig> = {
    form_tmpl_id_: {
      component: FormTemplateCell,
      getProps: ({ record, index, entryKey }) => ({
        name: [entryKey, index, 'form_tmpl_id_'],
        formData: record,
        tableData: currentDataSource.value,
      }),
      getEvents: ({ record }) => ({
        valueObjChange: (payload: any) => fieldHandlers.onFormTempObjValueChange(record, payload),
      }),
    },
    force_submit_: {
      component: ASwitch,
    },
    form_shared_: {
      component: ASwitch,
    },
    document_id_: {
      component: DocumentSelectCell,
      getProps: ({ index, entryKey }) => ({
        name: [entryKey, index, 'document_id_'],
        tableData: currentDataSource.value,
      }),
      getEvents: ({ record }) => ({
        change: (val, opt) => fieldHandlers.onDocumentChange(val, opt, record),
      }),
    },
    start_page_: {
      component: PageInputCell,
      getProps: ({ record }) => ({
        isPageNoDisabled: record.page_no_disabled_,
      }),
      getEvents: ({ record }) => ({
        change: (val, opt) => fieldHandlers.onPageChange(val, opt, record),
      }),
    },
    end_page_: {
      component: PageInputCell,
      getProps: ({ record }) => ({
        isPageNoDisabled: record.page_no_disabled_,
      }),
      getEvents: ({ record }) => ({
        change: (val) => fieldHandlers.onPageChange('end', val, record),
      }),
    },
    txn_definition_id_: {
      component: CellSelection,
      getProps: ({ record, index, entryKey }) => ({
        formItem: true,
        rowData: record,
        name: [entryKey, index, 'txn_definition_id_'],
        rules: [
          {
            required: true,
            message: $t('sys.pleaseSelectSth', { sth: $t('sys.edhr.txnName') }),
          },
        ],
        queryApi: async () => await loadTxnDefinitionOptions(),
      }),
      getEvents: ({ record }) => ({
        change: (val, opt) => fieldHandlers.onTxnDefineChange(val, opt, record),
        loaded: (val, opts) => fieldHandlers.onTxnDefineLoaded(val, opts, record),
      }),
    },
    txn_code_: {
      component: ReadonlyCell,
    },
    before_operation_id_: {
      component: CellPreOperation,
      getProps: ({ index, entryKey, record }) => ({
        formItem: true,
        name: [entryKey, index, 'before_operation_id_'],
        rules: [
          {
            required: true,
            message: $t('sys.pleaseSelectSth', { sth: $t('sys.edhr.preOperation') }),
          },
          {
            message: $t('sys.edhr.preOperationCannotRepeat'),
            validator: async (_, fieldValue) => {
              const allSelections = currentDataSource.value
                ?.filter((it) => !it.deleted_)
                ?.map((item) => item.before_operation_id_);
              const isDuplicated = allSelections?.filter((key) => key === fieldValue)?.length > 1;
              if (isDuplicated) {
                return Promise.reject($t('sys.edhr.preOperationCannotRepeat'));
              }
            },
          },
        ],
        rowData: record,
        workflowData: props.workflowData,
        currentOperation: currentOperation.value,
      }),
    },
    event_: {
      component: CellSelection,
      getProps: ({ index, entryKey }) => ({
        formItem: true,
        name: [entryKey, index, 'event_'],
        rules: [
          { required: true, message: $t('sys.pleaseSelectSth', { sth: $t('sys.edhr.event') }) },
        ],
        queryApi: async () => {
          const enumKey =
            currentEntryKey.value === 'operation_advance_execution_entries_'
              ? 'enu_operation_advance_execution_event'
              : 'enu_trigger_txn_event';

          const options = await loadEnumOptions({
            modelKey: enumKey,
            modelId: enumKey,
          });
          return options
            ?.filter((it) => {
              if (props.isRework) {
                return it.value !== 'after_work_complete_partially';
              }
              return true;
            })
            ?.reverse();
        },
      }),
    },
    action_: {
      component: CellSelection,
      getProps: ({ index, entryKey }) => ({
        formItem: true,
        name: [entryKey, index, 'action_'],
        rules: [
          {
            required: true,
            message: $t('sys.pleaseSelectSth', { sth: $t('sys.edhr.action') }),
          },
        ],
        queryApi: async () =>
          await loadEnumOptions({
            modelKey: 'enu_trigger_txn_action',
            modelId: 'enu_trigger_txn_action',
          }),
      }),
    },
    value_: {
      component: CellActionValue,
      getProps: ({ record }) => {
        return {
          rowData: record,
          queryApi: loadTxnOptions,
        };
      },
    },
  };

  /**
   * 获取指定字段的组件
   */
  const getComponent = (dataIndex: string) => {
    return fieldConfigMap[dataIndex]?.component || null;
  };

  /**
   * 获取指定字段的 Props
   */
  const getComponentProps = (record: any, column: any, index: number) => {
    const config = fieldConfigMap[column.dataIndex];
    if (!config) return { disabled: isDetail.value };

    const baseProps = {
      disabled: isDetail.value,
    };

    const dynamicProps = config.getProps
      ? config.getProps({
          record,
          column,
          index,
          entryKey: currentEntryKey.value,
        })
      : {};

    return { ...baseProps, ...dynamicProps };
  };

  /**
   * 获取指定字段的事件监听器
   */
  const getComponentEvents = (record: any, column: any) => {
    // 如果行禁用，不返回任何事件
    if (record.disabled) return {};

    const config = fieldConfigMap[column.dataIndex];
    if (!config || !config.getEvents) return {};

    return config.getEvents({
      record,
      column,
      index: 0,
      entryKey: currentEntryKey.value,
    });
  };

  return {
    getComponent,
    getComponentProps,
    getComponentEvents,
  };
}

/**
 *
 * @param entries 行数据数组
 * @param isShowTruly 是否使用真实值
 * @returns
 */
export function convertPreOperationEntries(entries: any[], isShowTruly = true) {
  if (!entries || !entries.length) return [];
  if (isShowTruly) {
    return entries?.map((item) => ({
      ...item,
      before_operation_id_: item?.before_operation_id_?.split('$_$')?.[0],
    }));
  }
  return entries?.map((item) => ({
    ...item,
    before_operation_id_: item?.before_operation_id_ + '$_$' + item?.before_operation_name_,
  }));
}
