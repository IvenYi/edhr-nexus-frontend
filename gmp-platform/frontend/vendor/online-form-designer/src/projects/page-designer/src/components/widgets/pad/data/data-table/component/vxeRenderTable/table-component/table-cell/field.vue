<template>
  <span v-if="value === '**'">**</span>
  <div v-else class="pt4px pb4px">
    <component
      @click.capture="clickRow"
      :widget="fieldWidget"
      :is="defComponet"
      v-model="value"
      :formData="formRowData"
      :disabled="fieldWidget.props.disabled"
      :index="index"
      class="gct-table-cell"
      :class="{ 'primary-gct hover:underline': isOnClick, 'hidden!': isEmpty }"
    />
    <RenderEmptyValue v-if="isEmpty" />
  </div>
</template>

<script setup lang="ts">
  import { ColumnTable } from '/@page-designer/types/web';
  import { computed, ref, toRef, nextTick } from 'vue';
  import { getRenderComponentByType } from '/@page-designer/components/widgets/pad/field/render';
  import { useDependency } from '/@web-render/render/Event/Dependency/useDependency';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { emptyValueDisplay } from '/@page-designer/components/widgets/web/__components__/formcomponent/field-emptyValue';

  const emit = defineEmits(['saveTableRow']);
  const props = defineProps<{
    widget: ColumnTable;
    rowValue: {
      _DICT: object;
      _STYLE: object;
      [key: string]: string | number | undefined | object;
    };
    tableFieldId?: string;
    index: number;
    rowReadonly?: boolean;
    rowDisabled?: boolean;
    getValidRules?: any;
  }>();
  const Event = getPageEvent();
  /**拷贝下 */
  const fieldWidget = ref({
    ...props.widget,
    props: { ...props.widget.props, readonly: true, displayLabelText: false },
  });

  if (props.rowDisabled) {
    fieldWidget.value.props.disabled = true;
  }
  if (props.rowReadonly) {
    fieldWidget.value.props.readonly = true;
  }
  const defComponet = toRef(() =>
    getRenderComponentByType(
      fieldWidget.value.type,
      fieldWidget.value.props.fieldType!,
      !!fieldWidget.value.props.readonly,
      'table',
    ),
  );

  const { value, formRowData } = useDependency(fieldWidget.value, props.rowValue, true);
  const { RenderEmptyValue, isEmpty } = emptyValueDisplay(fieldWidget.value, value);
  const isOnClick = computed(
    () => fieldWidget.value.props.readonly && !!fieldWidget.value?.events?.['onClick'],
  );
  function clickRow(...arg) {
    if (!fieldWidget.value.props.readonly) {
      //编辑场景不考虑点击行事件
      const e = arg.at(-1);
      e.stopPropagation();
    } else if (isOnClick.value) {
      Event.runEventByName('onClick', props.widget.events, value.value, props.rowValue);
      const e = arg.at(-1);
      e.stopPropagation();
    }
  }
</script>

<style scoped lang="less">
  .table-form-item {
    width: 100%;
    padding: 0;

    &.ant-form-item-has-error {
      padding: 6px 0;
    }

    :deep(.ant-select-selection-item) {
      div {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    :deep(.ant-form-item-explain-error) {
      font-size: 12px;
    }
  }

  .table-form-item {
    margin-bottom: 0 !important;
  }
</style>
