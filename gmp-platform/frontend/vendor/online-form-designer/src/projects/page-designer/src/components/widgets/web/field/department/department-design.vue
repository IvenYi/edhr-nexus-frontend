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
    :class="{ 'h100%': fieldType === FIELD_TYPE.ORG_MULTI }"
    :showArrow="true"
  />
</template>
<script name="gct-department" setup lang="ts">
  import { ref, toRefs } from 'vue';
  import { Select } from '/@page-designer/types/web';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';
  import { FIELD_TYPE } from '@/enums/appEnum';

  const props = defineProps<{ widget: Select; rowReadonly?: boolean }>();
  const { readonly, fieldType } = toRefs(props.widget.props);

  const value = ref();
</script>

<style lang="less" scoped></style>
