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
    :show-arrow="false"
    class="w100% h100%"
  />
</template>
<script name="gct-range-user" setup lang="ts">
  import { ref, toRefs } from 'vue';
  import { RangeUser } from '/@page-designer/types/web';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';

  const props = defineProps<{ widget: RangeUser; rowReadonly?: boolean }>();
  const { readonly, fieldType } = toRefs(props.widget.props);
  const value = ref();
</script>

<style lang="less" scoped></style>
