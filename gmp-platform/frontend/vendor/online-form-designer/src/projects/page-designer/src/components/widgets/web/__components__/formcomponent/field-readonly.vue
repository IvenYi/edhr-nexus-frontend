<template>
  <!-- <a-tooltip placement="topLeft" :visible="visible">
    <template #title> {{ showLabel }}</template> -->
  <span v-if="props.type === FIELD_TYPE.RDO_REF" class="w100% ell">
    <FieldLabel v-bind="$attrs" :label="label" />
    <span
      v-if="
        props.type === FIELD_TYPE.RDO_REF && props.modelValue && !props.modelValue?.includes(':')
      "
      class="gct-custom-tag ml8px"
    >
      默认
    </span>
  </span>
  <FieldLabel v-else v-bind="$attrs" :label="label" :title="title" />
  <!-- </a-tooltip> -->
</template>

<script setup lang="ts">
  import { ref, onMounted, useAttrs, computed, h } from 'vue';
  import refCardlabel from './field-label/ref-card-label-render.vue';
  import taglabel from './field-label/taglabel.vue';
  import { useGetRefCard } from '/@page-designer/components/widgets/hooks/refCardList';
  import { FIELD_TYPE } from '@gct/runtime';

  const props = defineProps<{
    isTooltip?: boolean;
    label?: string | Array<string | number>;
    type?: string;
    modelValue?: string;
  }>();
  const visible = ref(false);
  const showLabel = computed(() => {
    if (Array.isArray(props.label)) {
      return props.label.join(',');
    } else {
      return props.label;
    }
  });
  const { refCardValues, trigger, getCardData, modelKey, refCardId } = useGetRefCard();

  const FieldLabel = computed(() => {
    if (refCardValues?.value?.length) {
      return h(refCardlabel, {
        values: refCardValues.value,
        trigger,
        getCardData,
        modelKey,
        refCardId,
      });
    } else {
      return taglabel;
    }
  });
  /**超出内容出现tip显示全部 */
  function onMouseenter(e) {
    if (!props.isTooltip) return;
    const el = e.target.parentNode!;
    console.log();
    if (el.scrollWidth > el.clientWidth) {
      visible.value = true;
    }
    if (el.scrollHeight > el.clientHeight) {
      visible.value = true;
    }
  }
  function onMouseleave() {
    visible.value = false;
  }
</script>
<style scoped lang="less"></style>
