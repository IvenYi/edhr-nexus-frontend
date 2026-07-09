<template>
  <div>
    <!-- <a-form-item :name="widget.props.field" :rules="rules" :autoLink="false"> -->
    <!-- <div>{{ formData }} </div> -->
    <!-- 此slot是btn-container -->
    <div class="ks-row-middle mb5px">
      <div class="mr10px w-full flex" v-if="displayLabelText">
        <span class="required-gct" v-show="required">*</span>
        <span class="sub-table-title">
          <span> {{ widget.props.label }}</span>
          <info-circle-outlined class="ml5px explain-icon" v-if="!!showExplain" />
        </span>
      </div>
      <RenderTableButtons
        v-if="!readonly"
        reverse
        class="ks-col"
        :buttons="btnContainer.children"
        :visibleButtons="btnContainer.visibleButtons"
      />
    </div>
    <vxeRefTable
      class="dynamic-table"
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
      :dragOptions="{ move }"
      ref="vxeTable"
      :tableFieldId="widget.props.field"
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
    />
    <!-- <dynamic-form-modal ref="dynamicModal" :widget="widget"></dynamic-form-modal> -->
    <!-- </a-form-item> -->
  </div>
</template>

<script setup lang="ts" name="gct-dynamic-table">
  import { toRef, provide, onMounted, ref, computed, toRefs, toRaw, watch, reactive } from 'vue';
  import { DynamicTable } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { SUB_TABLE_EDIT_MODE, SUB_TABLE_OPE_EVENT_TYPE } from '/@page-designer/enum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import AddTableDataModal from './modals/add-table-data-modal.vue';
  import OpeButtons from './components/ope-buttons.vue';
  import { Modal } from 'ant-design-vue';
  import { transformSourceData } from '../../../hooks/utils';
  import { cloneDeep, orderBy, isNil } from 'lodash-es';
  import {
    vxeRefTable,
    RenderTableButtons,
  } from '/@page-designer/components/widgets/web/data/data-table/component/vxeRenderTable';
  import { getTriggerBycom } from '/@page-designer/hooks/useValidator';
  import { UniqueConstraintType } from '/@/enums/appEnum';
  import { IDynamicTableComponentExpose } from '/@/projects/page-designer/src/interface/web';

  import { transformButtons } from './components/transform';

  const { t } = useI18n();
  const addModal = ref();
  const vxeTable = ref<InstanceType<typeof vxeRenderTable> | null>(null);
  const props = defineProps<{
    modelValue: Array<any>;
    widget: DynamicTable;
    formData: any;
  }>();

  const {
    field,
    editMode,
    editMethods,
    rowLimitOpen,
    rowLimit,
    visibleButtons,
    serialNumber,
    customdataSource,
    datasourceConfig,
    validateRule,
    rowDragSort,
    displayLabelText,
    required,
    showExplain,
  } = toRefs(props.widget.props);

  const showPagination = ref<boolean>(props.widget.props.showPagination ?? false);
  const pagination = reactive({
    showSizeChanger: true,
    current: 1,
    pageSize: props.widget.props.pageSize || 20,
    total: 0,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const emit = defineEmits(['update:modelValue']);
  const Event = getPageEvent();

  const readonly = toRef(() => props.widget.props.readonly);

  const rowReadonly = computed(() => {
    return editMode.value === SUB_TABLE_EDIT_MODE.MODAL || readonly.value;
  });

  const rowDisabled = toRef(() => props.widget.props.disabled);

  const children = props.widget.children![3].children;

  const tableColumns = toRef(() => {
    return children.map((d) => {
      d.props.dynamicTableField = props.widget.props.field;
      // d.props.bindModelKey = props.widget.props.bindModelKey;
      return d;
    });
  });

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

  const showTableData = computed(() => {
    if (showPagination.value) {
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
    pagination.total = items.length;
    return items;
  });

  /**
   * 支持自定义数据源
   */
  async function getDataSourceByType(id) {
    const querykey = 'ref_master_id_';
    const queryData = { query: { [querykey + '.eq']: id } };
    if (customdataSource.value && datasourceConfig.value?.name) {
      return Event.runExportByName(
        datasourceConfig.value.name,
        queryData,
        datasourceConfig.value.extraParams,
      );
    } else {
      return Event.context.$httpBizService(
        { action: 'listAll', key: props.widget.props.bindModelKey },
        queryData,
      );
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
  function getRowIndex(stId, fId, fieldStr) {
    var regex = new RegExp(`${stId}\\.([^.]*)\\.${fId}`);
    var match = fieldStr.match(regex);
    if (match) {
      return Number(match[1]);
    }
  }
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
    () => {
      if (props.modelValue === null || props.modelValue === undefined) {
        if (props.formData.id_) {
          getTableData(true);
        } else {
          emit('update:modelValue', []);
        }
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
  // const runButtonEvent = async (prop, index, rowData) => {
  //   const newData = cloneDeep(rowData);
  //   const idx = props.modelValue?.findIndex((i) => i._X_ROW_KEY === newData._X_ROW_KEY);
  //   if (prop.innerEvent && prop.sysMethedType === SUB_TABLE_OPE_EVENT_TYPE.DELETE) {
  //     if (rowData.id_) {
  //       rowData.deleted_ = true;
  //     } else {
  //       props.modelValue.splice(idx, 1);
  //     }
  //   } else if (prop.innerEvent && prop.sysMethedType === SUB_TABLE_OPE_EVENT_TYPE.EDIT) {
  //     const data = await addModal.value!.open(toRaw(newData), 'edit');
  //     data._X_ROW_KEY = undefined;
  //     props.modelValue[idx] = { ...data };
  //   } else if (prop.innerEvent && prop.sysMethedType === SUB_TABLE_OPE_EVENT_TYPE.COPY) {
  //     const data = await addModal.value!.open(
  //       { ...cloneDeep(rowData), id_: undefined, name_: 'copy_of_' + rowData.name_ },
  //       t('sys.copy'),
  //     );
  //     data._X_ROW_KEY = undefined;
  //     props.modelValue.push({ ...data });
  //   } else if (!prop.innerEvent) {
  //     Event.runExportByName(prop.eventName, newData, index);
  //   }
  // };
  provide('tableEvent', {
    edit: async (rowData) => {
      const idx = props.modelValue?.findIndex((i) => i._X_ROW_KEY === rowData._X_ROW_KEY)!;
      const data = await addModal.value!.open(cloneDeep(rowData), 'edit');
      data._X_ROW_KEY = undefined;
      props.modelValue[idx] = { ...data };
    },
    copy: async (rowData) => {
      const data = await addModal.value!.open(
        { ...cloneDeep(rowData), id_: undefined, name_: 'copy_of_' + rowData.name_ },
        t('sys.copy'),
      );
      data._X_ROW_KEY = undefined;
      props.modelValue.push({ ...data });
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
      if (props.formData.id_) {
        return { query: { ['ref_master_id_.eq']: props.formData.id_ } };
      } else {
        return Promise.reject(`ref_master_id_ ${t('sys.pageDesigner.cannotBeEmpty')}`);
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
      props.modelValue.push({});
    } else {
      const data = await addModal.value!.open({}, 'create');
      if (data.type !== 'decimal') {
        data.digits_ = undefined;
      }
      props.modelValue.push({ ...data });
    }
  });
  defineExpose<IDynamicTableComponentExpose>({
    getValue() {
      return cloneDeep(props.modelValue);
    },
    setValue(arr: any[]) {
      emit('update:modelValue', arr);
    },
    addValue(data: any[]) {
      emit('update:modelValue', [...props.modelValue, ...data]);
    },
    reload() {
      getTableData(true);
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

  .dynamic-table {
    :deep(.ant-form-item-has-error) {
      padding: 6px 0 20px;
    }
  }
</style>
