<template>
  <a-form-item
    :name="nameProp"
    :rules="rules"
    v-if="showEditor"
    :key="editorKey"
    :class="propClass"
  >
    <template #label v-if="label">
      <div class="ks-row-middle w100%">
        <div class="ks-col flex items-center">
          <div>
            <slot name="label">{{ label }}</slot>
          </div>
          <a-tooltip placement="top" v-if="tooltip || tooltips.length > 0">
            <template #title>
              <div v-if="tooltip && tooltips.length === 0">{{ tooltip }}</div>
              <template v-else-if="tooltips.length > 0">
                <div v-for="(item, i) in tooltips" :key="i">
                  {{ item }}
                </div>
              </template>
            </template>
            <span class="iconfont icon-assist ml5px text-[#bfbfbf]"></span>
          </a-tooltip>
        </div>
        <a-checkbox v-if="showFormItemCheckbox" v-model:checked="checked" @click.stop>
          {{ $t(formItemCheckbox.label) }}</a-checkbox
        >
      </div>
    </template>
    <slot name="prop"></slot>
  </a-form-item>
</template>

<script setup lang="ts">
  import { computed, toRef } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { LowCodeModal } from '/@page-designer/types/modal-types';
  import { inRowEditor } from '/@page-designer/constant/editor';

  const { t } = useI18n();
  const props = defineProps({
    /**tip 显示文本 */
    prop: {
      type: [String, Object],
      default: '',
    },
    /**formitem label文本 */
    label: {
      type: String,
      default: '',
    },
    /**form校验 部分组件需要校验 */
    rules: {
      type: Array<any>,
    },
    config: {
      type: Object,
      default: undefined,
    },
    widget: {
      type: Object as PropType<Partial<LowCodeWidget.BasicSchema | LowCodeModal.Modal>>,
    },
    dependentProps: {
      type: Array<string>,
      default: undefined,
    },
    editor: {
      type: Object as PropType<LowCodeWidget.PropEditor>,
    },
  });

  const formItemCheckbox = props.config?.formItemCheckbox;
  const showFormItemCheckbox = computed(() => {
    if (!formItemCheckbox) return false;
    if (!formItemCheckbox.hidden) return true;
    return !formItemCheckbox.hidden(props.widget);
  });
  const checked = computed({
    get() {
      return !!props!.widget?.props?.[formItemCheckbox.propsKey];
    },
    set(v) {
      if (!props?.widget?.props) return;
      props.widget.props[formItemCheckbox.propsKey] = v;
    },
  });
  const tooltip = computed(() => {
    let tool = props.config?.tooltip;
    if (tool && typeof tool === 'string') {
      return t(tool);
    }
    return '';
  });
  const tooltips = computed(() => {
    let tool = props.config?.tooltip;
    if (tool && Array.isArray(tool)) {
      return tool.map((str) => t(str));
    }
    return [];
  });
  const showEditor = toRef(() => {
    if (!props.dependentProps?.length) return true;
    return props.dependentProps.map((key) => props!.widget?.props?.[key]).every((i) => i);
  });
  const editorKey = toRef(() => {
    if (!props.dependentProps?.length) return '';
    return props.dependentProps.map((key) => props!.widget?.props?.[key]).join('');
  });
  const nameProp = toRef(() => {
    if (typeof props.prop === 'string' || !props.prop) {
      return props.prop;
    }
  });
  const propClass = toRef(() => {
    return {
      'in-row-reverse-editor': inRowEditor.includes(props.editor!.component),
      'in-row-editor-new': props.config?.isInRow,
      'in-row-float-right': props.config?.isInRow && props.config?.isRight,
      'in-row-no-bottom': props.config?.noBottom,
      mb0: props.config?.tips && inRowEditor.includes(props.editor!.component),
      // 'in-row-editor': ['displayType'].includes(props.editor?.name as string),
    };
  });

  if (typeof props.editor?.onMounted === 'function') {
    props.editor.onMounted(props.widget);
  }
</script>

<style lang="less" scoped>
  :deep(.ant-form-item-label) {
    .ant-form-item-no-colon {
      width: 100%;
    }
  }

  :deep(.ant-form-item-control-input) {
    min-height: auto !important;
  }
</style>
