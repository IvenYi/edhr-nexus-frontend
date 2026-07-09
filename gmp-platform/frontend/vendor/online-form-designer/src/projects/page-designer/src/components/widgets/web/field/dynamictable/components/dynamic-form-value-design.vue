<template>
  <!-- <a-select v-model:value="value"></a-select> -->
  <tagelabel
    v-if="rowReadonly || readonly"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="true"
  />
  <a-input v-else v-model:value="value" :placeholder="widget.props.placeholder" class="w100%" />
</template>
<script name="gct-dynamic-form-value" setup lang="ts">
  import { ref, toRefs } from 'vue';
  import tagelabel from '../../../__components__/formcomponent/field-label/taglabel.vue';
  import { Select } from '/@page-designer/types/web';

  const props = defineProps<{ widget: Select; rowReadonly?: boolean }>();
  const { readonly, fieldType } = toRefs(props.widget.props);
  const value = ref();
</script>

<style lang="less" scoped></style>
