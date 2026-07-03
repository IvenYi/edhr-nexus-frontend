<template>
  <tagelabel
    :tagWidgetStyle="widget.style"
    :type="fieldType"
    :isDesign="true"
    :label="label"
    class="mr10px"
  />
  <a-tag v-if="formData.parent_id_ && widget.props._preset" class="rdo-tag">默认</a-tag>
</template>

<script name="gct-rdo-input" setup lang="ts">
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';
  import { Input } from '/@page-designer/types/web';

  const props = defineProps<{ widget: Input; rowReadonly?: boolean; formData: any }>();
  const { fieldType } = props.widget.props;
  const label = props.formData.parent_id_ ? props.formData.name : '版本' + props.formData.name;
</script>

<style lang="less" scoped>
  .rdo-tag {
    border: none;
    background-color: rgba(from var(--ant-primary-color) r g b / 8%) !important;
    color: var(--ant-primary-color);
  }
</style>
