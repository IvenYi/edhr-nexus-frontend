<template>
  <tagelabel
    v-if="rowReadonly || readonly"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="true"
  />
  <a-time-picker
    v-else
    :placeholder="widget.props.placeholder"
    v-model:value="value"
    style="width: 100%"
    :style="style"
  />
</template>

<script setup lang="ts" name="gct-timepicker">
  import { computed, ref, toRefs } from 'vue';
  import { DateTimepicker } from '/@page-designer/types/web';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';

  const props = defineProps<{ widget: DateTimepicker; rowReadonly?: boolean }>();
  const { readonly, fieldType } = toRefs(props.widget.props);
  const style = computed(() => {
    const styleProp = props.widget.style;
    return {
      textAlign: styleProp.contentFont?.align || 'left',
      textAlignLast: styleProp.contentFont?.align || 'left',
    };
  });
  const value = ref('');
</script>
<style scoped lang="less"></style>
