import { computed, onMounted, provide, reactive, ref, toRef } from 'vue';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
import { FieldDefaultValueTypeEnum } from '@/projects/app-designer/src/enum';
import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
import { useBusinessSetting } from '/@web-render/views/system-config/hooks/useBusinessSetting';

export function setAllAsDeleted<T extends { deleted_?: boolean }>(entries: T[] | undefined): T[] {
  if (!entries || !Array.isArray(entries)) return [];
  return entries.map((item) => ({
    ...item,
    deleted_: true,
  }));
}

export function useTableEntry(props, { formData, entriesKey }) {
  const { refTxnForm, refTxnField, stepSettings } = reactive(props.widget.props);

  const tableWidget = computed(() => {
    const children = props.widget.children;
    const currentStep = stepSettings.findIndex((item) => item === entriesKey.value) ?? 0;

    return children?.[currentStep];
  });

  const validateRule = computed(() => {
    const { validateRule } = tableWidget.value.props;
    return validateRule || [];
  });

  const customValidateRules = ({ field }) => {
    if (field === 'doc_outline_id_') {
      return [
        {
          field: field,
          trigger: 'change',
          message: $t('sys.edhr.formTempCannotRepeat'),
          async validator(_, fieldValue) {
            const allDocIds = formData.value?.[entriesKey.value]
              ?.filter((it) => !it.deleted_ && it.doc_outline_id_)
              ?.map((item) => item.doc_outline_id_);
            const isDuplicated = allDocIds?.filter((item) => item === fieldValue)?.length > 1;
            if (isDuplicated) {
              return Promise.reject();
            }
          },
        },
      ];
    }
    if (field === 'document_id_') {
      return [
        {
          field: field,
          message: 'SOP' + $t('sys.edhr.fileCannotRepeat'),
          trigger: 'change',
          async validator(_, fieldValue) {
            const allDocIds = formData.value?.[entriesKey.value]
              ?.filter((it) => !it.deleted_ && it.document_id_)
              ?.map((item) => item.document_id_);
            const isDuplicated =
              (allDocIds.filter((item) => item.includes(fieldValue)) ?? []).length > 1;
            if (isDuplicated) {
              return Promise.reject();
            }
          },
        },
      ];
    }
    if (field === 'value_') {
      return [
        {
          field: field,
          required: true,
          message: $t('sys.notEmptySth', { sth: $t('sys.edhr.value') }),
        },
      ];
    }
    if (field === 'before_operation_id_') {
      return [
        {
          field: field,
          required: true,
          message: $t('sys.notEmptySth', { sth: $t('sys.edhr.preOperation') }),
        },
        {
          message: $t('sys.edhr.preOperationCannotRepeat'),
          validator: async (_, fieldValue) => {
            const allSelections = formData.value?.[entriesKey.value]
              ?.filter((it) => !it.deleted_)
              ?.map((item) => item.before_operation_id_);
            const isDuplicated = allSelections?.filter((key) => key === fieldValue)?.length > 1;
            if (isDuplicated) {
              return Promise.reject();
            }
          },
        },
      ];
    }
    return [];
  };

  const tableLoading = ref(false);
  const tableColumns = computed(() => {
    const columns = tableWidget.value.children?.[1]?.children || [];
    return columns;
  });

  const operateColumn = toRef(() => {
    if (tableWidget.value.children?.[0]?.children?.length) {
      return tableWidget.value.children?.[0];
    }
  });

  const refTxnFormData = toRef(() => {
    const data: any = {};
    refTxnField?.forEach((key) => {
      if (key) {
        data[key] = formMap.value[refTxnForm]?.[key];
      }
    });
    return data;
  });

  const copyOfEntryValue = ref(formData.value?.[entriesKey.value] || []);
  const editedFields = ref(new Set());
  function markAsEdited(field, force = false) {
    if (!editedFields.value.has(field)) {
      editedFields.value.add(field);
    } else {
      force && editedFields.value.delete(field);
    }
  }
  function initEditTracking() {
    editedFields.value.clear();
  }

  async function setDefaultValue(widget, formState) {
    const { field, fieldType, modelKey } = widget.props;
    const { isField } = widget;
    if (
      isField &&
      ![
        FIELD_TYPE.USER,
        FIELD_TYPE.USER_MULTI,
        FIELD_TYPE.ORG,
        FIELD_TYPE.ORG_MULTI,
        FIELD_TYPE.DATE,
        FIELD_TYPE.DATE_TIME,
        FIELD_TYPE.TIME,
        FIELD_TYPE.MASTERSLAVE,
      ].includes(fieldType)
    ) {
      /**异步问题可能会因为默认值赋值晚了引起bug */
      const fieldInfo = await FieldSchema.getConfigByField(modelKey, field);
      if (fieldInfo?.defaultValue?.type === FieldDefaultValueTypeEnum.FIXED) {
        formState[field] = fieldInfo.defaultValue.value;
      }
      // 表单字段》填报字段特殊处理
      if (isField && field === 'force_submit_') {
        const { businessSetting } = useBusinessSetting();
        formState[field] = !!businessSetting.validateForm;
      }
    }
  }

  async function handleAddRow(tableData) {
    const formState = {} as any;
    for (const i of tableColumns.value) {
      try {
        await setDefaultValue(i, formState);
        // fixme: 在子表entries添加数据时，制程关联的processId和routingOperationId从关联工序配置表单带入&&兼容存在id_数据的情况
        Object.assign(formState, refTxnFormData.value, { id_: undefined });
      } catch (error) {
        /* empty */
      }
    }
    tableData.push(formState);
    markAsEdited(entriesKey.value);
  }
  function handleDeleteRow(rowData, tableData) {
    if (rowData.id_) {
      rowData.deleted_ = true;
    } else {
      const idx = tableData.findIndex((i) => i._X_ROW_KEY === rowData._X_ROW_KEY)!;
      tableData.splice(idx, 1);
    }
  }

  const txnOptions = ref([]);
  const filterOption = (input: string, option: any) => {
    return option.label.includes(input);
  };
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

    txnOptions.value = res?.map((it) => {
      return {
        ...it,
        label: it.name,
        value: it.id,
        code: it.code,
      };
    });
  }
  function handleSearchTxn(val) {
    loadTxnOptions(val);
  }

  provide('tableEvent', {
    delete: (rowData) => {
      if (rowData.id_) {
        rowData.deleted_ = true;
      } else {
        const idx = formData.value[entriesKey.value].findIndex(
          (i) => i._X_ROW_KEY === rowData._X_ROW_KEY,
        )!;
        formData.value[entriesKey.value]?.splice(idx, 1);
        const isForce =
          !formData.value[entriesKey.value]?.length ||
          (copyOfEntryValue.value ?? []).every((i) => i.id_);
        markAsEdited(entriesKey.value, isForce);
      }
    },
  });

  onMounted(() => {
    loadTxnOptions();
  });

  return {
    tableLoading,
    tableWidget,
    tableColumns,
    operateColumn,
    validateRule,
    customValidateRules,
    refTxnFormData,

    handleAddRow,
    handleDeleteRow,

    editedFields,
    initEditTracking,
    markAsEdited,

    txnOptions,
    filterOption,
    handleSearchTxn,
  };
}
