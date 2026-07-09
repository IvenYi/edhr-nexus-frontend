<template>
  <tagelabel
    v-if="rowReadonly || wProps.readonly"
    :type="wProps.fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="true"
  />
  <a-textarea
    v-else
    v-model:value="value"
    :auto-size="{ minRows: 2, maxRows: 5 }"
    :placeholder="widget.props.placeholder"
  />
</template>

<script name="gct-textarea" setup lang="ts">
  import { ref, reactive } from 'vue';
  import { Textarea } from '/@page-designer/types/web';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';

  const props = defineProps<{ widget: Textarea; rowReadonly?: boolean }>();
  const wProps = reactive(props.widget.props);
  const value = ref('');
</script>

<style lang="less" scoped></style>
