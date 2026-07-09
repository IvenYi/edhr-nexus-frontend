<template>
  <tagelabel
    v-if="rowReadonly || readonly"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="true"
  />
  <a-input v-else v-model:value="value" :placeholder="widget.props.placeholder" />
</template>
<script name="gct-expression-condition" setup lang="ts">
  import { ref, toRefs } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';

  const props = defineProps(widgetProps);
  const { readonly, fieldType } = toRefs(props.widget.props);

  const value = ref();
</script>

<style lang="less" scoped></style>
