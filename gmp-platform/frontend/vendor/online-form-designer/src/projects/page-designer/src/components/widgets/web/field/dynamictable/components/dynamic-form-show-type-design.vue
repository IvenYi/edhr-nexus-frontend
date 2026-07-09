<template>
  <!-- <a-select v-model:value="value"></a-select> -->
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
<script name="gct-dynamic-form-show-type" setup lang="ts">
  import { ref, toRefs } from 'vue';
  import tagelabel from '../../../__components__/formcomponent/field-label/taglabel.vue';
  import { Select } from '/@page-designer/types/web';

  const props = defineProps<{ widget: Select; rowReadonly?: boolean }>();
  const { readonly, fieldType } = toRefs(props.widget.props);
  const value = ref();
</script>

<style lang="less" scoped></style>
