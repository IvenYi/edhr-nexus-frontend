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
    class="w100%"
    :class="{ 'h100%': fieldType === FIELD_TYPE.USER_MULTI }"
    :showArrow="true"
  />
</template>
<script name="gct-userpicker" setup lang="ts">
  import { ref, toRefs } from 'vue';
  import { Select } from '/@page-designer/types/web';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';
  import { FIELD_TYPE } from '@/enums/appEnum';

  const props = defineProps<{ widget: Select; rowReadonly?: boolean }>();
  const { readonly, fieldType } = toRefs(props.widget.props);
  const value = ref();
</script>

<style scoped lang="less">
  :deep(.ant-select-selector) {
    height: 100% !important;
  }
</style>
