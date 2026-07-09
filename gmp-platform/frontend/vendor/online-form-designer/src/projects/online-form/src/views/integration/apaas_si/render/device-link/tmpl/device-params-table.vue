<template>
  <vxe-grid
    :class="['device-params-table default vxetable', readonly && 'device-params-table--readonly']"
    :data="tableData"
    v-bind="gridOptions"
  >
    <template #code_default="{ row }">
      <a-popover placement="bottomLeft" overlayClassName="dhr-custom-popover">
        <template #content>
          <DeviceFieldStatus :deviceParams="row.deviceLinkParams" />
        </template>
        <span class="device-params-table__link-col">{{ row.code }}</span>
      </a-popover>
    </template>
    <template #field_header="{ column }">
      <div class="field-header">
        <div class="field-header__left">{{ $t('sys.onlineForm.formFields') }}</div>
        <div class="field-header__right">{{
          readonly ? $t('sys.FieldName') : $t('sys.operation')
        }}</div>
      </div>
    </template>
    <template #field_default="{ row }">
      <template v-if="readonly">
        <div class="field-row" v-for="key in row.formFields || [row.formField]" :key="key">
          <div class="field-key">{{ key.split('.')?.[1] }}</div>
          <FormFieldSelect
            class="field-name"
            :readonly="readonly"
            :subModelKey="row.subModelKey"
            :modelValue="key"
          />
        </div>
        <div class="field-row" v-if="row.formFields">
          {{ $t('sys.edhr.writeBackMode') }}：{{
            row.writeBackMode === DeviceLink.WriteBackModeEnum.ROUTINE
              ? $t('sys.edhr.routine')
              : $t('sys.edhr.MouseFocus')
          }}
        </div>
      </template>
      <template v-else>
        <template v-if="row.isSubField">
          <FormItem class="field-select" :name="calcFormName(row)" :isFirst="true">
            <FormFieldSelect
              :readonly="readonly"
              :onlySubFields="row.isSubField"
              :subModelKey="row.subModelKey"
              :modelValue="row.formField"
              @update:modelValue="(val) => onFieldChange(row, val)"
            />
          </FormItem>
        </template>
        <template v-else>
          <FieldsEditor :map="row" :hiddenActions="row.isChild" :readonly="readonly" />
        </template>
      </template>
    </template>
    <template #empty>
      <a-empty :description="$t('sys.noData')" :image="EmptyImg" />
    </template>
  </vxe-grid>
</template>

<script lang="ts" setup name="device-params-table">
  import { DeviceLink, useFormModel } from '@gct/nocode-base';
  import { FormFieldSelect } from '/@online-form/components/form-field';
  import { VxeGridProps } from 'vxe-table';
  import { computed, reactive } from 'vue';
  import { DeviceFieldStatus } from '/@online-form/components/device';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import EmptyImg from '/@/assets/svg/pic_nodata.svg';
  import FieldsEditor from './fields-editor.vue';

  const c = useFormModel().injectController();

  const rules = [
    {
      required: true,
      message: $t('sys.onlineForm.pleaseSelectFormField'),
      trigger: ['change', 'blur'],
    },
  ];

  const props = withDefaults(
    defineProps<{
      value?: DeviceLink.Device2FormFieldMap[];
      readonly?: boolean;
    }>(),
    {
      readonly: false,
      value: () => [],
    },
  );

  /** 包装代理类 */
  class TreeNode {
    children?: TreeNode[];
    constructor(
      public data: DeviceLink.Device2FormFieldMap,
      public parent?: TreeNode,
    ) {
      if (data.isSubField && data.children?.length) {
        this.children = data.children.map((child) => new TreeNode(child, this));
      }
    }

    get isSubField() {
      return this.data.isSubField;
    }

    get code() {
      return this.data.deviceLinkParams?.code;
    }

    get name() {
      return this.data.deviceLinkParams?.name;
    }

    get deviceLinkParams() {
      return this.data.deviceLinkParams;
    }

    get formField() {
      return this.data.formField;
    }
    set formField(value: string | undefined) {
      this.data.formField = value;
    }

    get formFields() {
      return this.data.formFields;
    }
    set formFields(value: string[] | undefined) {
      this.data.formFields = value;
    }

    get writeBackMode() {
      return this.data.writeBackMode;
    }
    set writeBackMode(value: any) {
      this.data.writeBackMode = value;
    }

    get isChild() {
      return !!this.parent;
    }

    get subModelKey() {
      const parentFieldKey = this.parent?.formField;
      return parentFieldKey ? c.getSubFieldModelKey(parentFieldKey.split('.')[1]) : undefined;
    }
  }

  const tableData = computed(() => props.value.map((item) => new TreeNode(item)));

  function calcFormName(node: TreeNode) {
    if (!node.parent) {
      const index = tableData.value.findIndex((i) => i.code === node.code);
      return ['fieldMaps', index, 'formField'];
    }
    const index = tableData.value.findIndex((i) => i.code === node.parent!.code);
    const index2 = node.parent.children!.findIndex((i) => i.code === node.code);
    return ['fieldMaps', index, 'children', index2, 'formField'];
  }

  const gridOptions = reactive<VxeGridProps<TreeNode>>({
    border: true,
    round: true,
    rowConfig: {
      resizable: true,
    },
    treeConfig: {
      rowField: 'deviceField',
      childrenField: 'children',
      expandAll: true,
    },
    editConfig: { trigger: 'manual', mode: 'row' },
    columns: [
      {
        field: 'code',
        title: $t('sys.edhr.field.code'),
        treeNode: true,
        width: 190,
        showOverflow: 'ellipsis',
        slots: {
          default: 'code_default',
        },
      },
      {
        field: 'name',
        title: $t('sys.bi.param.name'),
        width: 190,
        showOverflow: 'tooltip',
      },
      {
        field: 'formField',
        title: $t('sys.onlineForm.formFields'),
        slots: { default: 'field_default', header: 'field_header' },
        className: 'form-field-cell',
      },
    ],
  });

  const onFieldChange = (row: TreeNode, value: string) => {
    row.formField = value;
    // 子表字段变更的时候重置子表字段
    if (row.isSubField) {
      row.children?.forEach((child) => {
        child.formField = undefined;
      });
    }
    console.log(row);
  };
</script>

<style lang="less" scoped>
  .device-params-table {
    :deep(.vxe-table) {
      --vxe-table-cell-padding-left: 16px;
      --vxe-table-cell-padding-right: 16px;
    }

    :deep(.ant-empty) {
      height: 353px;
      width: 100%;
      border-radius: 4px 4px 4px 4px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin: 0;
      .ant-empty-image {
        height: 66px;
      }
      .ant-empty-description {
        font-weight: 400;
        font-size: 12px;
        color: #a6a6a6;
      }
    }

    &__link-col {
      color: var(--ant-primary-color);
      cursor: pointer;
    }

    :deep(.form-item) {
      margin-top: 0 !important;
    }

    .field-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      &__left {
        flex: 1 1 0;
      }
      &__right {
        width: 104px;
        padding-left: 16px;
      }
    }
    :deep(.form-field-cell) {
      .vxe-cell {
        padding: 0;
      }
    }

    .field-select {
      padding: 0 120px 0 16px;
      margin-bottom: 0;
    }

    // 只读的样式
    &--readonly {
      .field-header__left,
      .field-header__right {
        width: 50%;
        flex: 0 0 auto;
      }
    }

    .field-row {
      display: flex;
      align-items: center;
      padding: 0 16px;
      height: 45px;
      border-bottom: 1px solid #e8ebf0;
      font-weight: 400;
      font-size: 14px;
      color: #1a1d23;
      .field-key,
      .field-name {
        width: 50%;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .field-name {
        padding-left: 16px;
      }
    }
  }
</style>
