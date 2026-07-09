<template>
  <template v-if="rowReadonly || readonly">
    <span
      v-if="field === 'parent_id_' && formData?.tree_first_field_type && !formData?.parent_id_"
    ></span>
    <refCardLabelDesugn
      :type="formData?.tree_first_field_type ?? fieldType"
      :tagWidgetStyle="widget.style"
      :refCardId="refCardId"
      :modelKey="bindModelKey"
      :trigger="cardTrigger"
      v-else-if="showRefCardLabel"
    />
    <tagelabel
      v-else
      :type="formData?.tree_first_field_type ?? fieldType"
      :tagWidgetStyle="widget.style"
      :isDesign="true"
    />
  </template>
  <a-select
    v-else
    v-model:value="value"
    :placeholder="widget.props.placeholder"
    mode="tags"
    class="w100%"
    :class="{ 'h100%': multiFieldType.includes(fieldType) }"
    :showArrow="true"
  />
</template>
<script name="gct-select" setup lang="ts">
  import { ref, toRefs, toRef } from 'vue';
  import { Select } from '/@page-designer/types/web';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';
  import refCardLabelDesugn from '../../__components__/formcomponent/field-label/ref-card-label-design.vue';
  import { FIELD_TYPE } from '@/enums/appEnum';

  const multiFieldType = [FIELD_TYPE.ENUM_MULTI, FIELD_TYPE.REF_MULTI];

  const props = defineProps<{ widget: Select; rowReadonly?: boolean; formData?: any }>();
  const { readonly, fieldType, field, refCard, refCardId, bindModelKey, cardTrigger } = toRefs(
    props.widget.props,
  );

  const value = ref();

  const showRefCardLabel = toRef(() => {
    return !!refCard?.value && !!refCardId?.value;
  });
</script>

<style lang="less" scoped></style>
