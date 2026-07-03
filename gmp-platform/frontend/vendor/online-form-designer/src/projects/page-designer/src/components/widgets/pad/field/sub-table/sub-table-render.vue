<template>
  <vantField
    v-model="tableData"
    class="gct-pad-sub-table-field"
    :widget="widget"
    :widgetType="widget.type"
    :props="widget.props"
    :formData="formData"
    :required="widget.props.required && displayLabelText"
  >
    <template #label>
      <div class="ks-row w100%">
        <span class="w6.6em gct-sub-table--label" v-if="displayLabelText">{{
          widget.props.label || globFieldLabel
        }}</span>
        <!-- <div class="ks-col"> <slot :children="btnContainer.children"></slot> </div> -->
      </div>
      <div v-if="btnGroupWidget?.children?.length && !readonly">
        <groupButtons
          :children="btnGroupWidget.children"
          :rowDisabled="disabled"
          :visibleButtons="btnGroupWidget.visibleButtons"
        />
      </div>
    </template>
    <template #input>
      <div class="w100%">
        <!-- 表格 -->
        <SubVTable
          ref="vTableRef"
          :formData="formData"
          :widget="widget"
          @rowClick="cellClickEvent"
          @rowEdit="rowEdit"
          @rowCopy="rowCopy"
          @sortChange="updateModelValue"
          @dataChange="updateModelValue"
        />
      </div>
    </template>
  </vantField>
  <add-table-data-modal ref="addModal" :modalInfo="widget.children[0]" :id="widget?.id" />
</template>

<script setup lang="ts" name="gct-sub-table">
  import {
    provide,
    ref,
    onBeforeMount,
    reactive,
    toRef,
    toRefs,
    onMounted,
    computed,
    watch,
    nextTick,
  } from 'vue';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { SubTable } from '/@page-designer/types/web';
  import { useDisplayRuleOptions } from '/@web-render/render/Event/utils/displayRule';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { SUB_TABLE_EDIT_MODE, sortTypeEnum, TableEditingMethodEnum } from '/@page-designer/enum';
  import { showDialog, showToast } from 'vant';
  import { useI18n } from '@mobile/utils/useI18n';
  import AddTableDataModal from './modals/add-table-data-modal.vue';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';
  import { cloneDeep, differenceBy, isObject, orderBy } from 'lodash-es';
  import vantField from '../../__components__/vantField.vue';
  import { IMobSubTableComponentExpose } from '/@/projects/page-designer/src/interface/mobile';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import groupButtons from '/@page-designer/components/widgets/pad/__components__/group-buttons/group-buttons-render.vue';
  import { SubVTable } from './components';
  import type { IGctVTableExpose } from '@gct/universal-component/gct-v-table';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { FieldDefaultValueTypeEnum } from '@/projects/app-designer/src/enum';

  const { t } = useI18n();

  const Event = getPageEvent();

  const props = defineProps<{ modelValue: Array<any>; widget: SubTable; formData: any }>();

  const emit = defineEmits(['update:modelValue']);

  const { labelFont } = useStyle(props.widget);

  const {
    label,
    modelKey,
    field,
    customdataSource,
    datasourceConfig,
    collation,
    displayLabelText,
    rowDragSort,
    serialNumber,
  } = reactive(props.widget.props);

  const {
    editMode,
    rowLimitOpen,
    rowLimit,
    disabled,
    validateRule,
    layout,
    hasLabelWidth,
    labelType,
    labelWidth,
    overLabelDisplay,
  } = toRefs(props.widget.props);

  const vTableRef = ref<IGctVTableExpose>();

  const globFieldLabel = ref();

  const loading = ref(false);

  const addModal = ref();

  const formData = ref(props.formData);

  const readonly = toRef(() => props.widget.props.readonly);

  const rowDisabled = toRef(() => props.widget.props.disabled);

  const labelLayout = toRef(() => {
    const width =
      layout?.value.label === 'left' && !!hasLabelWidth?.value
        ? labelWidth?.value + (labelType?.value == 'percent' ? '%' : 'px')
        : '';
    return {
      width,
      layout: layout?.value,
      hasLabelWidth: hasLabelWidth?.value,
      overLabelDisplay: overLabelDisplay?.value,
    };
  });

  const btnGroupWidget = computed(() => {
    props.widget?.children[2].children.forEach((btn) => {
      btn.props.disabled = rowDisabled.value;
    });
    return props.widget?.children[2] || {};
  });

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
          props.formData._NOSUBMIT[`${i.id}`] = `${field}:${i.props.field}`;
        } else {
          props.formData._NOSUBMIT[`${i.id}`] = undefined;
        }
      });
    },
    {
      deep: true,
    },
  );

  function updateModelValue(): void {
    const items = vTableRef.value?.getSourceItems() || [];
    const deleteItems = vTableRef.value?.getRemovedSourceItems() || [];
    const allItems = [...items, ...deleteItems];
    emit('update:modelValue', allItems);
    console.log('allItems', allItems);

    console.debug('sub-table updateModelValue', allItems);
  }

  /**
   * 行点击事件
   * @param rows
   */
  function cellClickEvent(rows) {
    Event.runEventByName('cellClickEvent', props.widget.events, cloneDeep(rows), formData.value);
  }

  function getRowIndex(stId, fId, fieldStr) {
    var regex = new RegExp(`${stId}\\.([^.]*)\\.${fId}`);
    var match = fieldStr.match(regex);
    if (match) {
      return Number(match[1]);
    }
  }

  function customValidateRules({ field: _field, value }) {
    let rows = vTableRef.value?.getItems() || [];
    if (!rows.length) return;
    const checkedRows = rows.filter((i) => {
      return i[_field] === value;
    });

    if (checkedRows.length > 0) {
      return t('sys.pageDesigner.theCurrentValueAlreadyExists');
    }
  }
  provide('subTableCustomValidateRules', customValidateRules);
  provide('labelLayout', labelLayout);
  provide('editMode', editMode.value);
  provide('subTableReadonly', readonly);
  provide('subTableDisabled', disabled);
  provide('subTableValidateRule', validateRule.value);

  function isAddRow(): boolean {
    const items = vTableRef.value?.getItems() || [];
    if (rowLimitOpen.value && items.length >= rowLimit.value) {
      showDialog({
        title: t('sys.tip'),
        message: t('sys.pageDesigner.subTableRowLimit'),
      });
      return false;
    }
    return true;
  }

  function rowEdit(rowData): void {
    addModal.value!.open(cloneDeep(rowData), 'edit', false).then((data) => {
      vTableRef.value.updateRow(cloneDeep(data));
      updateModelValue();
    });
  }

  function rowCopy(rowData): void {
    if (isAddRow() === false) {
      return;
    }
    const data = cloneDeep(rowData);
    data.id_ = undefined;
    data._id = undefined;
    vTableRef.value.addRow(data);
    showToast($t('sys.operatingTitle'));
  }

  async function addRow(): void {
    if (isAddRow() === false) {
      return;
    }
    if (editMode.value === SUB_TABLE_EDIT_MODE.INLINE) {
      const formState = {};
      for (const i of tableColumns.value) {
        try {
          await setDefaultValue(i, formState);
        } catch (error) {}
      }
      vTableRef.value.addRow({ ...formState });
      setTimeout(() => {
        updateModelValue();
      }, 50);
    } else {
      addModal.value!.open({}, 'create').then((data) => {
        vTableRef.value.addRow(cloneDeep(data));
        setTimeout(() => {
          updateModelValue();
        }, 50);
      });
    }
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
    }
  }

  provide('sub-table-add-method', addRow);

  onBeforeMount(async () => {
    if (!label) {
      const fieldInfo = await FieldSchema.getConfigByField(modelKey, field);
      globFieldLabel.value = fieldInfo.name;
    }
  });

  defineExpose<IMobSubTableComponentExpose>({
    getValue() {
      const items = vTableRef.value?.getSourceItems() || [];
      return cloneDeep(items);
    },
    async setValue(data: any[], dict?: object) {
      vTableRef.value?.setValue(data, dict || {});
    },
    addValue(data: any[], dict) {
      vTableRef.value?.addValue(data, dict || {});
    },
    reload() {
      getTableData();
    },
  });
</script>
<style lang="scss">
  .gct-pad-sub-table-field {
    overflow: visible;

    > .van-cell__value.van-field__value {
      overflow: visible;
    }
  }
</style>
<style lang="less" scoped>
  .gct-sub-table-render-item {
    --van-cell-font-size: 14px;

    transition: height 0.5s ease-in-out;
    border-radius: 4px;
    // background-color: #fff;
    color: #797a7d;

    .van-icon {
      font-size: 18px;
    }
  }

  .gct-sub-table-render-item.is-choose {
    height: 44px;
    padding: 0 16px;
    overflow: hidden;
    border: 1px solid #3168ec;
    border-radius: 4px;
    background-color: #d6e1fb;
    font-size: 14px;

    .van-icon {
      color: #3168ec;
    }
  }

  .sub-table-item-ghost {
    opacity: 0;
  }

  .gct-sub-table-render-item__choose-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
  }

  .gct-sub-table-drag-action {
    font-size: 16px;
    cursor: pointer;
  }

  .gct-pad-sub-table-field {
    width: 100%;

    .gct-sub-table--label {
      color: v-bind('labelFont.color');
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-align: v-bind('labelFont?.textAlign');
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }
  }

  :deep(.van-dialog) {
    margin: 0;
    padding: 0;
  }

  :deep(.van-cell) {
    padding: 8px 0;
    background-color: transparent;
  }
</style>
