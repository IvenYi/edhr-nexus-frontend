<template>
  <tagelabel
    v-if="rowReadonly || readonly"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="true"
  />
  <a-date-picker v-else :placeholder="widget.props.placeholder" style="width: 100%" />
</template>

<script setup lang="ts" name="gct-datetimepicker">
  import { toRefs } from 'vue';
  import { DateTimepicker } from '/@page-designer/types/web';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';

  const props = defineProps<{ widget: DateTimepicker; rowReadonly?: boolean }>();
  const { readonly, fieldType } = toRefs(props.widget.props);
  // const value = ref('');
</script>
<style scoped lang="less"></style>
