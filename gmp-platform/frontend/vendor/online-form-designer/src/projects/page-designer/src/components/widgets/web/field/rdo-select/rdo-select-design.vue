<template>
  <template v-if="rowReadonly || readonly">
    <refCardLabelDesugn
      :type="fieldType"
      :tagWidgetStyle="widget.style"
      :refCardId="refCardId"
      :modelKey="bindModelKey"
      :trigger="cardTrigger"
      v-if="showRefCardLabel"
    />
    <tagelabel :type="fieldType" :tagWidgetStyle="widget.style" isDesign v-else />
  </template>

  <!-- <a-input-group v-else compact> -->
  <a-select
    v-else
    :disabled="disabled"
    v-model:value="value"
    :placeholder="placeholder"
    style="width: calc(100%)"
  />
  <!-- <a-input style="width: 100px" :placeholder="t('版本')" :disabled="disabled" /> -->
  <!-- </a-input-group> -->
</template>
<script name="gct-rdo-select" setup lang="ts">
  import { toRef, ref, toRefs } from 'vue';
  import { Select } from '/@page-designer/types/web';
  import { useI18n } from '/@/hooks/web/useI18n';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';
  import refCardLabelDesugn from '../../__components__/formcomponent/field-label/ref-card-label-design.vue';

  const props = defineProps<{ widget: Select; rowReadonly?: boolean }>();
  const {
    placeholder,
    disabled,
    readonly,
    fieldType,
    refCard,
    refCardId,
    bindModelKey,
    cardTrigger,
  } = toRefs(props.widget.props);
  const { t } = useI18n();
  const value = ref();
  const showRefCardLabel = toRef(() => {
    return !!refCard?.value && !!refCardId?.value;
  });
</script>

<style lang="less" scoped></style>
