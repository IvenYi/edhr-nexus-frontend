<template>
  <div>
    <!-- 此slot是btn-container -->
    <div class="ks-row-middle mb5px">
      <div class="mr10px w-full flex" v-if="displayLabelText">
        <span class="required-gct" v-show="required">*</span>
        <span class="sub-table-title">
          <span> {{ widget.props.label }}</span>
          <info-circle-outlined class="ml5px explain-icon" v-if="!!showExplain" />
        </span>
      </div>
      <deviceIcon
        v-if="widget.props.deviceConnectivity"
        class="mr4px"
        isMaster
        :bindModelKey="widget.props.bindModelKey"
        :widget="widget"
        @change="setValue"
        :formData="formData"
      />
      <RenderTableButtons
        v-if="!readonly"
        reverse
        class="ks-col"
        :buttons="btnContainer.children"
        :visibleButtons="btnContainer.visibleButtons"
      />
    </div>
    <vxeRefTable
      :isTree="isTree"
      :tree-config="isTree ? treeConfig : null"
      :tableFieldId="widget.props.field"
      :loading="loading"
      v-model="showTableData"
      :rowDragSort="rowDragSort"
      :operateColumn="operateColumn"
      :tableColumns="tableColumns"
      :editMethods="editMethods"
      :serialNumber="serialNumber"
      :rowReadonly="rowReadonly"
      :rowDisabled="rowDisabled"
      :validateRule="validateRule"
      :subTableShowPagination="showPagination"
      :customValidateRules="customValidateRules"
      :seqMethod="seqMethod"
      :dragOptions="{ move }"
      :headerSort="false"
      @cellClickEvent="cellClickEvent"
      :tableRowHeightNum="tableRowHeightNum"
      ref="vxeTable"
    >
      <template #operate="{ row, rowIndex, operateColumn }">
        <ope-buttons
          :tableForm="row"
          :rowIndex="rowIndex"
          :buttonOptions="operateColumn.children"
          :rowDisabled="rowDisabled"
          :visibleButtons="operateColumn.props.visibleButtons"
        />
      </template>
      <template #pager v-if="showPagination">
        <a-pagination
          v-bind="pagination"
          class="pagination-total-left"
          @change="showSizeChange"
          :page-size-options="['10', '20', '30', '40', '50']"
        />
      </template>
    </vxeRefTable>
    <add-table-data-modal
      ref="addModal"
      :modalInfo="widget.children[0]"
      :id="widget?.id"
      :customValidateRules="customValidateRules"
      :validateRule="validateRule"
  /></div>
</template>

<script setup lang="ts" name="gct-sub-table">
  import {
    toRef,
    provide,
    onMounted,
    ref,
    computed,
    toRefs,
    toRaw,
    watch,
    reactive,
    nextTick,
  } from 'vue';
  import { SubTable } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { SUB_TABLE_EDIT_MODE, sortTypeEnum } from '/@page-designer/enum';
  import {
    vxeRefTable,
    RenderTableButtons,
  } from '/@page-designer/components/widgets/web/data/data-table/component/vxeRenderTable';
  import vxeRenderTable from '../../data/data-table/component/vxeRenderTable/index.vue';
  import { getQuerySort } from '/@page-designer/components/widgets/hooks/listhook';
  import { useI18n } from '/@/hooks/web/useI18n';
  import AddTableDataModal from './modals/add-table-data-modal.vue';
  import OpeButtons from './components/ope-buttons.vue';
  import { Modal, Form, message } from 'ant-design-vue';
  import { transformSourceData } from '../../../hooks/utils';
  import { cloneDeep, differenceBy, orderBy } from 'lodash-es';
  import { isObject } from '/@/utils/is';
  import { UniqueConstraintType, FIELD_TYPE } from '/@/enums/appEnum';
  import { getTriggerBycom, useValidator } from '/@page-designer/hooks/useValidator';
  import { ISubTableComponentExpose } from '/@/projects/page-designer/src/interface/web';
  import { transformButtons } from './components/transform';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { FieldDefaultValueTypeEnum } from '@/projects/app-designer/src/enum';
  import { deviceIcon } from '/@/components/DeviceIntegration';
  import { TABLE_CELL_HEIGHT_MODE } from '@gct/runtime';

  const formItemContext = Form.useInjectFormItemContext();
  const { t } = useI18n();

  const addModal = ref();
  const vxeTable = ref<InstanceType<typeof vxeRenderTable> | null>(null);
  const props = defineProps<{
    modelValue: Array<any> | undefined;
    widget: SubTable;
    formData: any;
  }>();
  const {
    field,
    editMode,
    editMethods,
    rowLimitOpen,
    rowLimit,
    serialNumber,
    rowDragSort,
    displayLabelText,
    required,
    showExplain,
    isTree,
    cellHeightMode,
    cellHeight,
  } = toRefs(props.widget.props);
  const { validateRule } = props.widget.props;
  const formData = ref(props.formData);
  const { customdataSource, datasourceConfig, collation } = toRaw(props.widget.props);

  const tableCellHeight = reactive({
    cellHeightMode: cellHeightMode?.value,
    cellHeight: cellHeight?.value,
  });
  provide('tableCellHeight', tableCellHeight);
  const emit = defineEmits(['update:modelValue']);
  const Event = getPageEvent();
  const readonly = toRef(() => props.widget.props.readonly);
  const rowReadonly = computed(() => {
    return editMode.value === SUB_TABLE_EDIT_MODE.MODAL || readonly.value;
  });

  const { labelFont } = useStyle(props.widget);

  const rowDisabled = toRef(() => props.widget.props.disabled);
  /**排序字段 */
  const querySort = getQuerySort(
    rowDragSort?.value
      ? {
          collationField: 'sort_num_',
          collationSort: sortTypeEnum.ASC,
        }
      : {
          collationField: 'create_time_',
          collationSort: sortTypeEnum.DESC,
          collation: collation,
        },
  );
  const lastQueryData = ref({ query: {}, sorts: querySort || [], includeSubModel: 1 });
  const tableColumns = computed(() => {
    return props.widget.children![3].children;
  });
  watch(
    () => tableColumns.value,
    (val) => {
      if (!props.formData._NOSUBMIT) {
        props.formData._NOSUBMIT = {} as any;
      }
      val.forEach((i) => {
        if (i.props.notSubmitInHide === false && i.props.hidden) {
          props.formData._NOSUBMIT[`${i.id}`] = `${field.value}:${i.props.field}`;
        } else {
          props.formData._NOSUBMIT[`${i.id}`] = undefined;
        }
      });
    },
    {
      deep: true,
    },
  );

  const btnContainer = toRef(() => {
    props.widget?.children[2].children.forEach((btn) => {
      btn.props.disabled = rowDisabled.value;
    });
    return props.widget?.children[2] || {};
  });

  const operateColumn = toRef(() => {
    if (props.widget.children![1].children.length && !readonly.value) {
      props.widget.children![1].children.forEach((btn) => {
        btn.props.disabled = rowDisabled.value;
      });
      return props.widget.children![1];
    }
  });
  if (operateColumn.value?.id) {
    transformButtons(operateColumn.value?.children);
  }
  const loading = ref(false);

  const showPagination = ref<boolean>(props.widget.props.showPagination);

  const pagination = reactive({
    showSizeChanger: true,
    current: 1,
    pageSize: props.widget.props.pageSize || 20,
    total: 0,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  /**序号计算逻辑 */
  function seqMethod({ rowIndex }) {
    if (!showPagination.value) return rowIndex + 1;
    const start = rowIndex + 1;
    return (pagination.current - 1) * pagination.pageSize + start;
  }

  function showSizeChange(current, pageSize) {
    pagination.current = current;
    pagination.pageSize = pageSize;
    getTableData();
  }

  onMounted(() => {
    getTableData(true);
  });

  const getTableData = async (isReload: boolean = false) => {
    try {
      loading.value = true;
      if (props.formData.id_) {
        await Event.runEventByName('beforeDataLoad', props.widget.events, props.formData);
        if (showPagination.value === true) {
          const items = tableData.value;
          const modelValue = props.modelValue || [];
          if (items.length < pagination.current * pagination.pageSize) {
            const res = await getDataSourceByType(props.formData.id_);
            pagination.total = res.totalCount;
            const values = transformSourceData(res.data, res.dict);
            if (isReload) {
              emit('update:modelValue', values);
            } else {
              const keys = modelValue.map((item) => item.id_);
              const filterValues = values.filter((item) => {
                return !keys.includes(item.id_);
              });
              emit('update:modelValue', modelValue.concat(filterValues));
            }
          }
        } else {
          const res = await getDataSourceByType(props.formData.id_);
          if (res) {
            emit('update:modelValue', transformSourceData(res.data, res.dict));
          } else {
            emit('update:modelValue', []);
          }
        }
      } else {
        emit('update:modelValue', props.modelValue || []);
      }
    } catch {
      emit('update:modelValue', props.modelValue || []);
    } finally {
      loading.value = false;
    }
  };
  /**
   *
   *
   * @author zhanghanrui
   * @date 2024-09-26 10:09:21
   * @param {boolean} isBefore 插入到位置的前后
   * @param {*} toData 插入到位置
   * @param {*} dragData 拖拽数据
   */
  function move(isBefore: boolean, toData: any, dragData: any): void {
    if (!props.modelValue || props.modelValue.length === 0) {
      return;
    }
    const items = props.modelValue;
    const toIndex = items.indexOf(toData);
    const fromIndex = items.indexOf(dragData);
    if (fromIndex === toIndex) {
      return;
    }
    const i = isBefore ? toIndex : toIndex + 1;
    const data = items[fromIndex];
    items.splice(i, 0, data);
    if (fromIndex < i) {
      items.splice(fromIndex, 1);
    } else {
      items.splice(fromIndex + 1, 1);
    }
    formItemContext.onFieldChange();
  }

  const treeConfig = {
    transform: true,
    rowField: 'front_id_',
    parentField: 'front_parent_id_',
    expandAll: true,
    showLine: true,
  };

  const frontTableData = ref();

  const showTableData = computed(() => {
    if (frontTableData.value) {
      return frontTableData.value;
    } else if (showPagination.value) {
      return tableData.value.slice(
        (pagination.current - 1) * pagination.pageSize,
        pagination.current * pagination.pageSize,
      );
    } else {
      return tableData.value;
    }
  });

  const tableData = computed(() => {
    const items = props.modelValue?.filter((d) => !d.deleted_) || [];
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    pagination.total = items.length;
    return items;
  });

  /**
   * 支持自定义数据源
   */
  async function getDataSourceByType(id) {
    const { modelKey, field } = props.widget.props;
    lastQueryData.value.query['ref_master_id_.eq'] = id;
    lastQueryData.value.query['ref_model_key_.eq'] = modelKey;
    lastQueryData.value.query['ref_field_key_.eq'] = field;
    if (customdataSource && datasourceConfig?.name) {
      return Event.runExportByName(
        datasourceConfig?.name,
        lastQueryData.value,
        datasourceConfig.extraParams,
      );
    } else {
      return Event.context.$httpBizService(
        {
          action: 'listAll',
          key: props.widget.props.bindModelKey,
        },
        lastQueryData.value,
      );
    }
  }

  /**
   * 行点击事件
   * @param rows
   */
  function cellClickEvent(rows) {
    Event.runEventByName('cellClickEvent', props.widget.events, cloneDeep(rows), formData.value);
  }
  watch(
    () => pagination.total,
    (length) => {
      if (length) {
        const descvalue = orderBy(
          props.modelValue,
          (item) => {
            if (item.deleted_) {
              return 0;
            } else {
              return 1;
            }
          },
          'desc',
        );
        emit('update:modelValue', descvalue);
      }
    },
  );

  watch(
    () => props.modelValue,
    async () => {
      if (props.modelValue === null || props.modelValue === undefined) {
        if (props.formData.id_) {
          getTableData(true);
        } else {
          emit('update:modelValue', []);
        }
      }
      if (isTree?.value) {
        await nextTick();
        await vxeTable.value?.getXtable()?.setAllTreeExpand(true);
      }
    },
  );

  watch(
    () => props.formData.id_,
    (v) => {
      if (props.formData.id_) {
        getTableData(true);
      }
    },
  );

  function getRowIndex(stId, fId, fieldStr) {
    var regex = new RegExp(`${stId}\\.([^.]*)\\.${fId}`);
    var match = fieldStr.match(regex);
    if (match) {
      return Number(match[1]);
    }
  }

  function customValidateRules({ field: _field, type, uniqueConstraintType, formData }) {
    const ruleProps: any = [];
    if (uniqueConstraintType === UniqueConstraintType.GLOBAL) {
      ruleProps.push({
        trigger: getTriggerBycom(type),
        message: t('sys.pageDesigner.theCurrentValueAlreadyExists'),
        async validator(_, fieldValue) {
          if (!fieldValue) return;
          let rows = tableData.value || [];
          let callback;
          if (editMode.value === SUB_TABLE_EDIT_MODE.MODAL) {
            callback = (i) => i[_field] === fieldValue && i._X_ROW_KEY !== formData._X_ROW_KEY;
          } else {
            const rowIndex = getRowIndex(field?.value, _field, _.field);
            callback = (i, index) => i[_field] === fieldValue && index !== rowIndex;
          }
          if (rows.length) {
            const checkedRows = rows.filter(callback);
            if (checkedRows.length > 0) {
              return Promise.reject();
            }
          }
        },
      });
    }
    return ruleProps;
  }
  function getTableValidRules(formData: object) {
    return tableColumns.value.reduce((total, widget) => {
      if (widget?.isField) {
        const { rules } = useValidator({
          type: widget.type,
          widgetProps: widget.props,
          formData,
          subTableCustomValidateRules: customValidateRules,
          validateRules: validateRule,
          Event,
        });
        total[widget.props.field] = rules.value;
      }
      return total;
    }, {});
  }

  provide('tableEvent', {
    edit: async (rowData) => {
      const id_ = rowData.id_;
      const newData = cloneDeep(rowData);
      /**子表编辑子表 不需要重新加载 */
      const idx = props.modelValue?.findIndex((i) => i._X_ROW_KEY === newData._X_ROW_KEY)!;
      const data = await addModal.value!.open(toRaw({ ...newData, id_: null }), 'edit');
      data._X_ROW_KEY = undefined;
      props.modelValue.splice(idx, 1, { ...data, id_ });
    },
    copy: (rowData) => {
      if (rowLimitOpen.value && props.modelValue.length >= rowLimit.value) {
        Modal.warning({
          title: t('sys.tip'),
          content: t('sys.pageDesigner.subTableRowLimit'),
        });
        return;
      }
      const data = cloneDeep(rowData);
      data._X_ROW_KEY = undefined;
      data.id_ = undefined;
      props.modelValue.push({ ...data });
      message.success($t('sys.operatingTitle'));
    },
    delete: (rowData) => {
      if (rowData.id_) {
        rowData.deleted_ = true;
      } else {
        const idx = props.modelValue?.findIndex((i) => i._X_ROW_KEY === rowData._X_ROW_KEY)!;
        props.modelValue.splice(idx, 1);
      }
    },
    getImportParames: () => {
      return { ref_field_key_: field, ref_master_id_: props.formData.id_ };
    },
    afterImport: (getChildData) => {
      const data = getChildData(props.modelValue || []);
      emit('update:modelValue', data);
    },
    getParameters: () => {
      if (lastQueryData.value.query['ref_master_id_.eq']) {
        return cloneDeep(lastQueryData.value);
      } else {
        return Promise.reject('ref_master_id_不能为空');
      }
    },
  });
  provide('sub-table-add-method', async (widget) => {
    if (rowLimitOpen.value && props.modelValue.length >= rowLimit.value) {
      Modal.warning({
        title: t('sys.tip'),
        content: t('sys.pageDesigner.subTableRowLimit'),
      });
      return;
    }

    if (editMode.value === SUB_TABLE_EDIT_MODE.INLINE) {
      const formState = {};
      for (const i of tableColumns.value) {
        try {
          await setDefaultValue(i, formState);
        } catch (error) {}
      }
      props.modelValue.push(formState);
    } else {
      const data = await addModal.value!.open({}, 'create');
      props.modelValue.push({ ...data });
    }
    formItemContext.onFieldChange();
  });

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
    }
  }
  function setValue(data: any[], dict?: object) {
    const options = transformSourceData(data, dict);
    const diff = differenceBy(props.modelValue, options, 'id_').map((i) => {
      return { ...i, deleted_: true };
    });
    emit('update:modelValue', [...options, ...diff]);
  }

  const tableRowHeightNum = computed(() => {
    const { cellHeightMode, cellHeight } = props.widget.props;
    if (!cellHeightMode) return 1;
    if (cellHeightMode === TABLE_CELL_HEIGHT_MODE.ONE_ROW) return 1;
    if (cellHeightMode === TABLE_CELL_HEIGHT_MODE.CUSTOM_ROW) return cellHeight || 10;
    return -1;
  });

  defineExpose<ISubTableComponentExpose>({
    getValue() {
      const tData = cloneDeep(tableData.value);
      return tData;
    },
    setValue,
    addValue(data: any[], dict) {
      isObject(data) && (data = [data]);
      const options = transformSourceData(data, dict);
      emit('update:modelValue', [...(props.modelValue || []), ...options]);
    },
    reload() {
      getTableData(true);
    },
    /**
     强制加载
     */
    async forceReload(id?: string) {
      const res = await getDataSourceByType(id);
      pagination.total = res.totalCount;
      const values = transformSourceData(res.data, res.dict);
      emit('update:modelValue', values);
    },
    async validateByIndex(index) {
      const formId = props.widget.preLocation as string;
      const nameList = tableColumns.value
        .filter((i) => i.props.field)
        .map((i) => {
          return [field.value, index, i.props.field];
        });

      const formEl = await Event.getSyncComponent(formId);
      await formEl!.validate(nameList);
    },
    async clearValidate() {
      const formId = props.widget.preLocation as string;
      const formEl = await Event.getSyncComponent(formId);
      await formEl!.clearValidate();
    },
    async validate() {
      const formId = props.widget.preLocation as string;
      const formEl = await Event.getSyncComponent(formId);
      await formEl!.validate();
    },
    async tableFormValidate() {
      const data = tableData.value;

      if (!data?.length) {
        return Promise.resolve('ok');
      }
      const promises = data.map(async (item, index) => {
        const rules = getTableValidRules(item);
        for (const key in rules) {
          const val = item[key];
          const fieldRules = rules[key];
          for (const rule of fieldRules) {
            if (rule.required && (val === undefined || val === null || val === '')) {
              throw new Error(rule.message || `${key} is required`);
            }

            if (rule.pattern && !rule.pattern.test(val)) {
              throw new Error(rule.message || `${key} does not match pattern`);
            }

            if (rule.validator) {
              try {
                await rule.validator(
                  {
                    field: props.widget.props.field + '.' + index + '.' + key,
                    fullField: props.widget.props.field + '.' + index + '.' + key,
                    ...rule,
                  },
                  val,
                );
              } catch (err) {
                throw new Error(rule.message || err || `${key} failed verification`);
              }
            }
          }
        }
      });

      try {
        await Promise.all(promises);
        return Promise.resolve('ok');
      } catch (err) {
        message.error(err?.message || '未知错误');
        return Promise.reject(err?.message || '未知错误');
      }
    },
    revertDeletedData(id) {
      const data = props.modelValue?.map((i) => {
        if (i.id_ === id) {
          i.deleted_ = undefined;
        }
        return i;
      });
      if (data) {
        emit('update:modelValue', data);
      }
    },
    async setFrontTableData(data, dict?) {
      frontTableData.value = dict ? transformSourceData(data, dict) : data;
      if (isTree?.value) {
        await nextTick();
        await vxeTable.value?.getXtable()?.setAllTreeExpand(true);
      }
    },
    async setTableAllTreeExpand(expand) {
      if (isTree?.value) {
        await nextTick();
        if (expand) {
          await vxeTable.value?.getXtable()?.setAllTreeExpand(true);
        } else {
          await vxeTable.value?.getXtable()?.clearTreeExpand();
        }
      }
    },
  });
</script>

<style lang="less" scoped>
  .sub-table {
    margin-top: 12px;

    :deep(.ant-form-item) {
      margin-bottom: 0;
    }
  }

  :deep(.ant-pagination) {
    margin-top: 10px;
    text-align: right;
  }

  .required-gct {
    margin-right: 4px;
    color: #ff4d4f;
    font-family: SimSun, sans-serif;
  }

  .sub-table-title {
    flex: 1;
    color: v-bind('labelFont.color');
    font-size: v-bind('labelFont.fontSize');
    font-style: v-bind('labelFont.fontStyle');
    font-weight: v-bind('labelFont.fontWeight');
    text-align: v-bind('labelFont.textAlign');
    text-align-last: v-bind('labelFont.textAlign');
    text-decoration-line: v-bind('labelFont.textDecorationLine');

    .explain-icon {
      color: var(--ant-primary-color) !important;
    }
  }
</style>
