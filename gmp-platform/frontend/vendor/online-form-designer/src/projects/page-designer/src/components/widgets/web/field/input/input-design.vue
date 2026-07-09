<template>
  <tagelabel
    v-if="rowReadonly || props.readonly"
    :tagWidgetStyle="style"
    :type="props.fieldType"
    :isDesign="true"
  />
  <a-input v-else v-model:value="value" :placeholder="widget.props.placeholder" />
</template>

<script name="gct-input" setup lang="ts">
  import { useWidget } from '/@page-designer/hooks/useWidget';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';
  import { reactive } from 'vue';
  import { Input } from '/@page-designer/types/web';

  const defProps = defineProps<{ widget: Input; rowReadonly?: boolean }>();

  const { value } = useWidget(defProps);
  const { style, props } = reactive(defProps.widget);
</script>

<style lang="less" scoped></style>
