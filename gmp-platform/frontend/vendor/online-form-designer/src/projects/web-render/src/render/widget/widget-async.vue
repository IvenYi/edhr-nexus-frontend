<template>
  <component
    :formData="formRowData"
    :is="defComponet"
    :widget="widget"
    v-model:modelValue="value"
    :ref="onload"
    :class="{ 'hidden!': isEmpty }"
    :CTX="Event.context"
    v-bind="$attrs"
    :utils="{
      runEventByName: Event.runEventByName.bind(Event),
    }"
  >
    <template v-for="(_value, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}"></slot>
    </template>
  </component>
  <RenderEmptyValue v-if="isEmpty" />
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { AsyncGctComponents } from '/@page-designer/components/pcModule';
  import { useDependency } from '../Event/Dependency/useDependency';
  import { emptyValueDisplay } from '/@page-designer/components/widgets/web/__components__/formcomponent/field-emptyValue';

  const props = defineProps<{
    widget: LowCodeWidget.BasicSchema;
    formData?: { [key: string]: any; _NOSUBMIT?: object };
  }>();

  const defComponet = computed(() => {
    if (props.widget && props.widget._plugin) {
      return AsyncGctComponents.getComponentByPluginTag(props.widget._plugin.key);
    }
    return AsyncGctComponents.getComponentByType(props.widget.type);
  });
  const Event = getPageEvent();
  const { isField, id, type } = props.widget;
  const { field, notSubmitInHide } = props.widget.props;
  const { value, formRowData } = useDependency(props.widget, props.formData);
  const { RenderEmptyValue, isEmpty } = emptyValueDisplay(props.widget, value);
  const onload = async (el) => {
    //隐藏不提交的字段 notSubmitInHide开启表示隐藏提交
    if (isField && field && notSubmitInHide === false) {
      if (!formRowData.value._NOSUBMIT) {
        formRowData.value._NOSUBMIT = {};
      }
      //开启隐藏不提交的需要再formData提交的时候打上标识，方便提交的时候删除字段
      formRowData.value._NOSUBMIT[id] = !el ? field : undefined;
    }
    if (el) {
      Event?.initNode?.(id, { elRef: el, type });
    } else {
      Event?.destroyNode?.(id);
    }
  };
</script>
<style lang="less" scoped>
  :deep(.ant-form-item) {
    margin-bottom: 0;
    padding: 8px 0;
  }

  :deep(.ant-form-item-explain) {
    // height: 0;
    min-height: 0;
    margin-top: 2px;
    line-height: 16px;
  }
</style>
