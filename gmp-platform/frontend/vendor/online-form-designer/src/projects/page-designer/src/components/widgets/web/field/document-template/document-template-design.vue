<template>
  <tagelabel
    v-if="rowReadonly || readonly"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="true"
  />
  <a-select
    v-else
    v-model:value="value"
    :placeholder="widget.props.placeholder"
    mode="tags"
    class="w100%"
    :showArrow="true"
  />
</template>
<script name="gct-document-template" setup lang="ts">
  import { ref, toRefs } from 'vue';
  import { widgetProps } from '/@page-designer/hooks/useWidget';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';

  const props = defineProps(widgetProps);
  const { readonly, fieldType } = toRefs(props.widget.props);

  const value = ref();
</script>

<style lang="less" scoped></style>
