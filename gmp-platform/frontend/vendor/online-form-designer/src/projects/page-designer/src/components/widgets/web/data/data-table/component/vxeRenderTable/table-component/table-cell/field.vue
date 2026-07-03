<template>
  <span v-if="value === '**'">**</span>
  <a-form-item
    v-else-if="tableFieldId && !fieldWidget.props.readonly"
    :id="widget.id"
    :rules="getValidRules"
    :name="[tableFieldId, index, widget.props.field]"
    class="table-form-item"
  >
    <div class="h100%">
      <component
        @click.native="clickRow"
        :widget="fieldWidget"
        :is="defComponet"
        v-model="value"
        :formData="formRowData"
        :disabled="fieldWidget.props.disabled"
        :index="index"
        :getPopupContainer="getPopupContainer"
        @saveTableRow="emit('saveTableRow')"
        :class="{ 'cursor-pointer primary-gct hover:underline': isOnClick }"
      />
    </div>
  </a-form-item>
  <div v-else :class="[props.rowReadonly ? 'pt5px pb5px' : 'pt4px pb4px']">
    <component
      @click.capture="clickRow"
      :widget="fieldWidget"
      :is="defComponet"
      v-model="value"
      :formData="formRowData"
      :disabled="fieldWidget.props.disabled"
      :index="index"
      :getPopupContainer="getPopupContainer"
      :isTooltip="isTooltip"
      :class="{ 'cursor-pointer primary-gct hover:underline': isOnClick, hidden: isEmpty }"
    />
    <RenderEmptyValue v-if="isEmpty" :is-empty="isEmpty" />
  </div>
</template>

<script setup lang="ts">
  import { ColumnTable } from '/@page-designer/types/web';
  import { computed, ref, toRef, nextTick, watch } from 'vue';
  import { getRenderComponentByType } from '/@page-designer/components/widgets/web/field/index';

  import { useDependency } from '/@web-render/render/Event/Dependency/useDependency';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { emptyValueDisplay } from '/@page-designer/components/widgets/web/__components__/formcomponent/field-emptyValue';

  const NO_TOOLTIP = [FIELD_TYPE.IMAGE, FIELD_TYPE.ATTACHMENT, FIELD_TYPE.SIGNATURE];
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
    getPopupContainer?: any;
  }>();
  const Event = getPageEvent();
  /**拷贝下 */
  const fieldWidget = ref({ ...props.widget, props: { ...props.widget.props } });

  const getValidRules = computed(() => {
    fieldWidget.value.props.required = props.widget.props.required;
    return props.getValidRules(fieldWidget.value, props.rowValue);
  });
  if (props.rowDisabled) {
    fieldWidget.value.props.disabled = true;
  }
  if (props.rowReadonly) {
    fieldWidget.value.props.readonly = true;
  }

  watch(
    () => props.rowReadonly,
    (val) => {
      fieldWidget.value.props.readonly = val;
    },
  );
  const defComponet = toRef(() =>
    getRenderComponentByType(
      fieldWidget.value.type,
      fieldWidget.value.props.fieldType!,
      !!fieldWidget.value.props.readonly,
    ),
  );

  const isTooltip = computed(() => {
    return !!(
      fieldWidget.value.props.readonly &&
      value.value &&
      !NO_TOOLTIP.includes(fieldWidget.value.props.fieldType!)
    );
  });
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
      // padding: 6px 0;
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
