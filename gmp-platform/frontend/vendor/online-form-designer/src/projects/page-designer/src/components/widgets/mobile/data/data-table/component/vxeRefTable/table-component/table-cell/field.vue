<template>
  <span v-if="value === '**'">**</span>
  <component
    v-else
    :widget="fieldWidget"
    :is="defComponet"
    :modelValue="value"
    :formData="formRowData"
    @click="clickRow"
    class="gct-table-cell gct-table-cell-render"
    :class="{ 'hidden!': isEmpty }"
  />
  <RenderEmptyValue v-if="isEmpty" />
</template>

<script setup lang="ts">
  import { ColumnTable } from '/@page-designer/types/web';
  import { ref, onMounted, reactive, toRaw, toRef } from 'vue';
  import { useDependency } from '/@web-render/render/Event/Dependency/useDependency';
  import { getRenderComponentByType } from '/@page-designer/components/widgets/mobile/field/render';
  import { emptyValueDisplay } from '/@page-designer/components/widgets/web/__components__/formcomponent/field-emptyValue';
  import { FormComponents } from '/@page-designer/enum';

  const props = defineProps<{
    widget: ColumnTable;
    rowValue: {
      _DICT: object;
      _STYLE: object;
      [key: string]: string | number | undefined | object;
    };
    index: number;
  }>();
  const fieldWidget = ref({
    ...props.widget,
    props: { ...props.widget.props, readonly: true, displayLabelText: false },
  });

  const { value, formRowData } = useDependency(fieldWidget.value, props.rowValue, true);

  const { RenderEmptyValue, isEmpty } = emptyValueDisplay(fieldWidget.value, value);
  const defComponet = toRef(() =>
    getRenderComponentByType(
      fieldWidget.value?.type as FormComponents,
      fieldWidget.value.props.fieldType!,
      !!fieldWidget.value.props.readonly,
      'table',
    ),
  );
  function clickRow(e: Event) {
    if (!fieldWidget.value.props.readonly) {
      //编辑场景不考虑点击行事件
      e.stopPropagation();
    }
  }
</script>
<style lang="less">
.gct-table-cell-render {
  .van-cell__value > .van-field__body{
    .van-field__control {
      div {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
