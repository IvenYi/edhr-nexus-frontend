<template>
  <div class="model-ext-field-container-designer">
    {{ $t('sys.edhr.model') }}：{{ widget.props?.refModel }}{{ $t('sys.edhr.otherExtField') }}
  </div>
</template>

<script lang="ts" setup>
  import { IModelExtFieldContainer } from './schema';
  import { useStyle } from '/@page-designer/hooks/useStyle';

  const props = defineProps<{
    widget: IModelExtFieldContainer;
  }>();

  const { labelFont } = useStyle(props.widget);
</script>

<style lang="less" scoped>
  :deep(.ant-form-item-label > label) {
    color: v-bind('labelFont.color');
    font-size: v-bind('labelFont.fontSize');
  }
</style>
