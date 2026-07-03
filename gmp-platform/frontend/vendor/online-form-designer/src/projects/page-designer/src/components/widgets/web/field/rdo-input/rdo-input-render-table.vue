<template>
  <div class="ell ks-row">
    <tagelabel
      :tagWidgetStyle="widget.style"
      :type="fieldType"
      :isDesign="false"
      :label="label"
      class="mr10px ell"
    />
    <a-tag v-if="formData.default_ && widget.props._preset" class="rdo-tag">{{ t('sys.default') }}</a-tag></div
  >
</template>

<script name="gct-rdo-input" setup lang="ts">
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';
  import { Input } from '/@page-designer/types/web';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const props = defineProps<{
    modelValue?: string;
    widget: Input;
    rowReadonly?: boolean;
    formData: any;
  }>();
  const { fieldType, field, rdoUniqueFieldKey } = props.widget.props;
  const filedKey = rdoUniqueFieldKey ? field : 'name_';
  const label = props.formData.base_id_ ? props.formData.version_ : props.formData[filedKey];
  props.formData._DICT[field] = { [props.modelValue]: label };
  props.formData[field] = props.formData[filedKey];
</script>

<style lang="less" scoped>
  .rdo-tag {
    border: none;
    background-color: rgba(from var(--ant-primary-color) r g b / 8%) !important;
    color: var(--ant-primary-color);
  }
</style>
